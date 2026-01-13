import { describe, it, expect, beforeEach } from "vitest";
import type {
	CopySuccess,
	CopyFailure,
	CopyResult,
	ICopyService,
} from "./copy-service";
import { CopyService } from "./copy-service";
import { Vault } from "obsidian";
import type { CopyDestination } from "./types";

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

describe("CopyService - 基本的なファイルコピー機能", () => {
	let vault: Vault;
	let service: CopyService;
	let destination: CopyDestination;

	beforeEach(() => {
		vault = new Vault();
		service = new CopyService(vault);
		destination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
		};
	});

	it("ファイルを指定されたパスにコピーできる", async () => {
		const result = await service.copy(
			"Hello World",
			"source.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe("dest/source.md");
		}
	});

	it("コピー後にファイルが存在することを確認できる", async () => {
		await service.copy("Content", "test.md", destination);

		const exists = await vault.adapter.exists("dest/test.md");
		expect(exists).toBe(true);
	});

	it("コピーしたファイルの内容が正しい", async () => {
		const content = "Test Content";
		await service.copy(content, "file.md", destination);

		const saved = await vault.adapter.read("dest/file.md");
		expect(saved).toBe(content);
	});
});
