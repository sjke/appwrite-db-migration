import { writeFileSync } from "fs";

import { colored, normalizeMigrationDirPath } from "../utils";

import { GenerateFn } from "../types";

const TEMPLATES = {
  js: `const migrate = async ({ db }) => {

};

exports.default = migrate;
  `,
  ts: `import { Databases } from "node-appwrite";

const migrate = async ({ db }: { db: Databases }) => {
  
};

export default migrate;
  `
}

const generateTimestamp = (): string => {
	const currentTimestamp = new Date();
	return [
		currentTimestamp.getFullYear(),
		currentTimestamp.getMonth().toString().padStart(2, "0"),
		currentTimestamp.getDate().toString().padStart(2, "0"),
		currentTimestamp.getHours().toString().padStart(2, "0"),
		currentTimestamp.getMinutes().toString().padStart(2, "0"),
		currentTimestamp.getSeconds().toString().padStart(2, "0"),
	].join("");
};

const normalizeName = (name: string): string => {
	return name
		.replaceAll(" ", "_")
		.split(/(?=[A-Z])/)
		.join("_")
		.toLowerCase();
};

const generate: GenerateFn = async (name, { path: dir, type, debug }) => {
	dir = normalizeMigrationDirPath(dir);
	const migrationFileName = `${generateTimestamp()}_${normalizeName(name)}.${type}`;

	debug("Generating a migration file: " + migrationFileName);
	writeFileSync(dir + "/" + migrationFileName, TEMPLATES[type]);
	console.log(colored.green("create     ") + migrationFileName);
};

export default generate;
