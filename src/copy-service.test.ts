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

	beforeEach(async () => {
		vault = new Vault();
		service = new CopyService(vault);
		destination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
		};
		// ディレクトリを事前に作成
		await vault.adapter.write("dest/.keep", "");
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

describe("CopyService - 上書きモード", () => {
	let vault: Vault;
	let service: CopyService;
	let destination: CopyDestination;

	beforeEach(() => {
		vault = new Vault();
		service = new CopyService(vault);
		destination = {
			path: "dest",
			description: "Destination folder",
			overwrite: true,
		};
	});

	it("上書きモードが有効な場合、同名ファイルが存在していても上書きできる", async () => {
		// 既存ファイルを作成
		await vault.adapter.write("dest/existing.md", "Old Content");

		// 上書きコピー
		const result = await service.copy(
			"New Content",
			"existing.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe("dest/existing.md");
		}

		const content = await vault.adapter.read("dest/existing.md");
		expect(content).toBe("New Content");
	});

	it("上書きモードが無効で同名ファイルが存在する場合、file_existsエラーを返す", async () => {
		// 上書き無効に設定
		destination.overwrite = false;

		// 既存ファイルを作成
		await vault.adapter.write("dest/existing.md", "Old Content");

		// コピー試行
		const result = await service.copy(
			"New Content",
			"existing.md",
			destination,
		);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("file_exists");
			expect(result.message).toContain("existing.md");
		}

		// 元のファイルが変更されていないことを確認
		const content = await vault.adapter.read("dest/existing.md");
		expect(content).toBe("Old Content");
	});
});

describe("CopyService - リネームモード（連番付与）", () => {
	let vault: Vault;
	let service: CopyService;
	let destination: CopyDestination;

	beforeEach(async () => {
		vault = new Vault();
		service = new CopyService(vault);
		destination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
		};
		// ディレクトリを事前に作成
		await vault.adapter.write("dest/.keep", "");
	});

	it("同名ファイルが存在する場合、_1を付与してコピーできる", async () => {
		// 既存ファイルを作成
		await vault.adapter.write("dest/file.md", "Original");

		// リネームコピー
		const result = await service.copyWithRename(
			"New Content",
			"file.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe("dest/file_1.md");
		}

		// 両方のファイルが存在することを確認
		expect(await vault.adapter.exists("dest/file.md")).toBe(true);
		expect(await vault.adapter.exists("dest/file_1.md")).toBe(true);
	});

	it("_1が存在する場合、_2を付与してコピーできる", async () => {
		// 既存ファイルを作成
		await vault.adapter.write("dest/note.md", "Original");
		await vault.adapter.write("dest/note_1.md", "First Copy");

		// リネームコピー
		const result = await service.copyWithRename(
			"Second Copy",
			"note.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe("dest/note_2.md");
		}
	});

	it("_1, _2, _3まで存在する場合、_4を付与してコピーできる", async () => {
		// 既存ファイルを作成
		await vault.adapter.write("dest/doc.md", "Original");
		await vault.adapter.write("dest/doc_1.md", "Copy 1");
		await vault.adapter.write("dest/doc_2.md", "Copy 2");
		await vault.adapter.write("dest/doc_3.md", "Copy 3");

		// リネームコピー
		const result = await service.copyWithRename(
			"Copy 4",
			"doc.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe("dest/doc_4.md");
		}
	});

	it("同名ファイルが存在しない場合、元のファイル名でコピーできる", async () => {
		// リネームコピー（既存ファイルなし）
		const result = await service.copyWithRename(
			"Content",
			"new.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe("dest/new.md");
		}
	});

	it("拡張子が複数ドットを含む場合でも正しく処理できる", async () => {
		// 既存ファイルを作成
		await vault.adapter.write("dest/file.test.md", "Original");

		// リネームコピー
		const result = await service.copyWithRename(
			"New Content",
			"file.test.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe("dest/file.test_1.md");
		}
	});
});

describe("CopyService - ディレクトリ存在チェック", () => {
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

	it("コピー先ディレクトリが存在しない場合、dir_not_foundエラーを返す", async () => {
		// ディレクトリを作成しない状態でコピー試行
		const result = await service.copy("Content", "file.md", destination);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("dir_not_found");
			expect(result.message).toContain("dest");
		}
	});

	it("コピー先ディレクトリが存在する場合、正常にコピーできる", async () => {
		// ディレクトリを作成（ダミーファイルを置く）
		await vault.adapter.write("dest/.keep", "");

		// コピー試行
		const result = await service.copy("Content", "file.md", destination);

		expect(result.success).toBe(true);
	});

	it("copyWithRenameでもディレクトリ存在チェックが機能する", async () => {
		// ディレクトリを作成しない状態でコピー試行
		const result = await service.copyWithRename(
			"Content",
			"file.md",
			destination,
		);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("dir_not_found");
		}
	});
});

describe("CopyService - I/Oエラーハンドリング", () => {
	let vault: Vault;
	let service: CopyService;
	let destination: CopyDestination;

	beforeEach(async () => {
		vault = new Vault();
		service = new CopyService(vault);
		destination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
		};
		// ディレクトリを事前に作成
		await vault.adapter.write("dest/.keep", "");
	});

	it("write時にエラーが発生した場合、io_errorを返す", async () => {
		// write()をモックしてエラーをスロー
		const originalWrite = vault.adapter.write.bind(vault.adapter);
		vault.adapter.write = async () => {
			throw new Error("Disk full");
		};

		const result = await service.copy("Content", "file.md", destination);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("io_error");
			expect(result.message).toContain("I/O error");
		}

		// 元に戻す
		vault.adapter.write = originalWrite;
	});

	it("copyWithRename時にwrite エラーが発生した場合、io_errorを返す", async () => {
		// write()をモックしてエラーをスロー
		const originalWrite = vault.adapter.write.bind(vault.adapter);
		vault.adapter.write = async () => {
			throw new Error("Permission denied");
		};

		const result = await service.copyWithRename(
			"Content",
			"file.md",
			destination,
		);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("io_error");
		}

		// 元に戻す
		vault.adapter.write = originalWrite;
	});
});
