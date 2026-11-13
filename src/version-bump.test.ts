import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { expect, it } from "vitest";

it("records each release even when the minimum app version is unchanged", () => {
	const directory = mkdtempSync(join(tmpdir(), "copyway-version-"));
	try {
		writeFileSync(
			join(directory, "manifest.json"),
			JSON.stringify({ version: "0.1.0", minAppVersion: "0.15.0" }),
		);
		writeFileSync(join(directory, "versions.json"), JSON.stringify({ "0.1.0": "0.15.0" }));
		execFileSync(process.execPath, [resolve("version-bump.mjs")], {
			cwd: directory,
			env: { ...process.env, npm_package_version: "1.0.1" },
		});
		expect(JSON.parse(readFileSync(join(directory, "manifest.json"), "utf8"))).toMatchObject({
			version: "1.0.1",
		});
		expect(JSON.parse(readFileSync(join(directory, "versions.json"), "utf8"))).toEqual({
			"0.1.0": "0.15.0",
			"1.0.1": "0.15.0",
		});
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});
