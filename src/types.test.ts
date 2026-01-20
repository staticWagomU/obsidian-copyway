import { describe, expect, test } from "vitest";
import type { CopyDestination, CopywaySettings } from "./types";

describe("CopyDestination型", () => {
	test("必須フィールドを持つCopyDestinationオブジェクトが作成できる", () => {
		const destination: CopyDestination = {
			path: "/path/to/destination",
			description: "テスト用のコピー先",
			overwrite: false,
		};

		expect(destination.path).toBe("/path/to/destination");
		expect(destination.description).toBe("テスト用のコピー先");
		expect(destination.overwrite).toBe(false);
	});

	test("overwriteがtrueのCopyDestinationオブジェクトが作成できる", () => {
		const destination: CopyDestination = {
			path: "/path/to/destination",
			description: "上書き許可のコピー先",
			overwrite: true,
		};

		expect(destination.overwrite).toBe(true);
	});

	test("オプショナルなextensionフィールドを持つCopyDestinationオブジェクトが作成できる", () => {
		const destination: CopyDestination = {
			path: "/path/to/destination",
			description: "拡張子変更付きコピー先",
			overwrite: false,
			extension: ".txt",
		};

		expect(destination.extension).toBe(".txt");
	});

	test("extensionフィールドが未指定のCopyDestinationオブジェクトが作成できる", () => {
		const destination: CopyDestination = {
			path: "/path/to/destination",
			description: "拡張子変更なしコピー先",
			overwrite: false,
		};

		expect(destination.extension).toBeUndefined();
	});
});

describe("CopywaySettings型", () => {
	test("空のdestinations配列を持つCopywaySettingsオブジェクトが作成できる", () => {
		const settings: CopywaySettings = {
			destinations: [],
		};

		expect(settings.destinations).toEqual([]);
		expect(Array.isArray(settings.destinations)).toBe(true);
	});

	test("複数のCopyDestinationを持つCopywaySettingsオブジェクトが作成できる", () => {
		const settings: CopywaySettings = {
			destinations: [
				{
					path: "/path/to/destination1",
					description: "コピー先1",
					overwrite: false,
				},
				{
					path: "/path/to/destination2",
					description: "コピー先2",
					overwrite: true,
				},
			],
		};

		expect(settings.destinations).toHaveLength(2);
		expect(settings.destinations[0]?.path).toBe("/path/to/destination1");
		expect(settings.destinations[1]?.path).toBe("/path/to/destination2");
	});
});
