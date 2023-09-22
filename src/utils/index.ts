import { existsSync } from "fs";
import path from "path";

export const normalizeMigrationDirPath = (dir: string): string => {
	if (!path.isAbsolute(dir)) {
		dir = path.join(process.cwd(), dir);
		if (!existsSync(dir)) throw new Error(`Migrations directory at "${dir}" not found`);
		return dir;
	}
	return dir;
};

export const colored = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
}
