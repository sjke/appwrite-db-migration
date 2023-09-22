import { Databases } from "node-appwrite";

const syncLogger = (db: Databases, method: string, verbose: boolean) => {
	const original_method = `_${method}`;
	// @ts-ignore
	if (!db[original_method]) db[original_method] = db[method];

	// @ts-ignore
	db[method] = async (...args: any[]) => {
		const start = Date.now();

		if (args[1] !== "schema_migrations") {
			const commandArgs = [...args].slice(1, verbose ? args.length : 3);
			console.log("--", method, "[", commandArgs.join(", "), "]");
		}

		// @ts-ignore
		const result = await db[original_method](...args);

		if (args[1] !== "schema_migrations") {
			console.log(`   -> ${(Date.now() - start) / 1000}s`);
		}

		return result;
	};
};

export const wrapWithExtenstions = (db: Databases, verbose: boolean): Databases => {
	const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(db)).filter(
		(name) => name.includes("create") || name.includes("update") || name.includes("delete")
	);

	for (const method of methods) {
		syncLogger(db, method, verbose);
	}

	return db;
};
