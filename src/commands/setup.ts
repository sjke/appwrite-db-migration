import path from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

import DBConnection, { setupMigrationSchema } from "../client";
import { colored } from "../utils";

import { SetupFn, SetupOption } from "../types";

const setupFileSystem = ({ path: dir, debug }: SetupOption): void => {
	dir = path.join(process.cwd(), dir);

	debug("Checking migrations directory...");
	if (!existsSync(dir)) {
		debug("Creating migrations directory...");
		mkdirSync(dir);
		writeFileSync(dir + "/.keep", "");
		console.log(colored.green("Migrations directory created     ") + dir);
	} else {
		console.log(colored.yellow("Migrations directory existed     ") + dir);
	}
};

const setupDatabase = async ({ databaseId, endpoint, projectId, token, debug }: SetupOption): Promise<void> => {
	const db = DBConnection({ databaseId, endpoint, projectId, token });
	await setupMigrationSchema(db, databaseId, debug);
};

const setup: SetupFn = async (props) => {
	setupFileSystem(props);
	await setupDatabase(props);
};

export default setup;
