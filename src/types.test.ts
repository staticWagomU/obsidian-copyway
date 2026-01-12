import { describe, expect, test } from "vitest";
import type { CopyDestination } from "./types";

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
});
