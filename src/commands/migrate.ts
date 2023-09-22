import path from "path";
import { readdirSync, statSync } from "fs";
import { AppwriteException, Databases } from "node-appwrite";

import { normalizeMigrationDirPath } from "../utils";
import DBConnection from "../client";
import { wrapWithExtenstions } from "../utils/db_client";

import { DebugLog, MigrateFn } from "../types";

interface MigrationData {
	filename: string;
	version: string;
	path: string;
	description: string;
}

const migrate: MigrateFn = async ({ path: dir, endpoint, projectId, token, databaseId, verbose }) => {
	dir = normalizeMigrationDirPath(dir);

	const migrations: MigrationData[] = [];
	for (const file of readdirSync(dir)) {
		if (!statSync(path.join(dir, file)).isDirectory()) {
			const [version, ...description] = file.split("_");

			if (version.length === 14 && file.match(/.(ts|js)/)) {
				migrations.push({
					filename: file,
					version,
					path: path.join(dir, file),
					description: description.join(" ").replace(/\.(js|ts)$/, ""),
				});
			}
		}
	}

	const db = wrapWithExtenstions(DBConnection({ databaseId, endpoint, projectId, token }), verbose ?? false);
	await db.get(databaseId);

	migrations.sort(({ version: firstVersion }, { version: secondVersion }) =>
		parseInt(firstVersion) > parseInt(secondVersion) ? 1 : -1
	);

	for (const migration of migrations) {
		await callMigration(db, databaseId, migration);
	}
};

const callMigration = async (db: Databases, databaseId: string, { version, description, path }: MigrationData) => {
	try {
		await db.getDocument(databaseId, "schema_migrations", version);
	} catch (e) {
		if ((e as { code: number }).code === 404) {
			console.log(`== ${version} ${description}: migrating `.padEnd(80, "="));
			const start = Date.now();

			try {
				await require(path).default({ db, databaseId });
			} catch (error) {
				console.error(error);
				throw new Error("Migration error: " + path);
			}
			await db.createDocument(databaseId, "schema_migrations", version, { description });

			const end = Date.now() - start;
			console.log(`== ${version} ${description}: migrated (${end / 1000}s) `.padEnd(80, "="));
		}
	}
};

export default migrate;
