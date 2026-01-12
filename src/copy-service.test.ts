import { describe, it, expect } from "vitest";
import type {
	CopySuccess,
	CopyFailure,
	CopyResult,
	ICopyService,
} from "./copy-service";

describe("CopyService - 型定義", () => {
	it("CopySuccess型は成功フラグとパスを持つ", () => {
		const result: CopySuccess = {
			success: true,
			path: "path/to/file.md",
		};
		expect(result.success).toBe(true);
		expect(result.path).toBe("path/to/file.md");
	});

	it("CopyFailure型は失敗フラグとエラー情報を持つ", () => {
		const result: CopyFailure = {
			success: false,
			error: "file_exists",
			message: "File already exists",
		};
		expect(result.success).toBe(false);
		expect(result.error).toBe("file_exists");
		expect(result.message).toBe("File already exists");
	});

	it("CopyResult型は成功と失敗の両方を表現できる", () => {
		const success: CopyResult = {
			success: true,
			path: "path/to/file.md",
		};
		const failure: CopyResult = {
			success: false,
			error: "io_error",
			message: "I/O error",
		};

		if (success.success) {
			expect(success.path).toBe("path/to/file.md");
		}
		if (!failure.success) {
			expect(failure.error).toBe("io_error");
		}
	});
});
