import { describe, it, expect, beforeEach } from "vitest";
import type {
	CopySuccess,
	CopyFailure,
	CopyResult,
	IFileSystem,
} from "./copy-service";
import { CopyService, expandTilde, joinPath, normalizeExtension } from "./copy-service";
import type { CopyDestination } from "./types";
// テスト環境では Node.js モジュールを直接インポート可能
import os from "node:os";

/**
 * テスト用のモックファイルシステム
 * Node.js fs モジュールの代わりに使用
 */
class MockFileSystem implements IFileSystem {
	private existingDirs: Set<string> = new Set();
	private existingFiles: Map<string, string> = new Map();
	public writtenFiles: Map<string, string> = new Map();

	addDirectory(path: string): void {
		this.existingDirs.add(path);
	}

	addFile(path: string, content: string): void {
		this.existingFiles.set(path, content);
	}

	async directoryExists(path: string): Promise<boolean> {
		return this.existingDirs.has(path);
	}

	async fileExists(path: string): Promise<boolean> {
		return this.existingFiles.has(path) || this.writtenFiles.has(path);
	}

	async writeFile(path: string, content: string): Promise<void> {
		this.writtenFiles.set(path, content);
		// existingFilesにも追加して、後続のfileExistsで見つかるようにする
		this.existingFiles.set(path, content);
	}

	getWrittenContent(path: string): string | undefined {
		return this.writtenFiles.get(path) ?? this.existingFiles.get(path);
	}
}

describe("expandTilde - チルダ展開", () => {
	it("~ で始まるパスをホームディレクトリに展開する", () => {
		const homeDir = os.homedir();
		expect(expandTilde("~/dev")).toBe(`${homeDir}/dev`);
	});

	it("~ のみの場合、ホームディレクトリを返す", () => {
		const homeDir = os.homedir();
		expect(expandTilde("~")).toBe(homeDir);
	});

	it("~ で始まらないパスはそのまま返す", () => {
		expect(expandTilde("/usr/local/bin")).toBe("/usr/local/bin");
		expect(expandTilde("relative/path")).toBe("relative/path");
	});

	it("パス途中の ~ は展開しない", () => {
		expect(expandTilde("/home/user/~backup")).toBe("/home/user/~backup");
	});
});

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
	let service: CopyService;
	let destination: CopyDestination;
	let mockFs: MockFileSystem;

	beforeEach(async () => {
		mockFs = new MockFileSystem();
		mockFs.addDirectory("dest");
		service = new CopyService(mockFs);
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
			expect(result.path).toBe(joinPath("dest", "source.md"));
		}
	});

	it("コピー後にファイルが存在することを確認できる", async () => {
		await service.copy("Content", "test.md", destination);

		const exists = await mockFs.fileExists(joinPath("dest", "test.md"));
		expect(exists).toBe(true);
	});

	it("コピーしたファイルの内容が正しい", async () => {
		const content = "Test Content";
		await service.copy(content, "file.md", destination);

		const saved = mockFs.getWrittenContent(joinPath("dest", "file.md"));
		expect(saved).toBe(content);
	});
});

describe("CopyService - 上書きモード", () => {
	let service: CopyService;
	let destination: CopyDestination;
	let mockFs: MockFileSystem;

	beforeEach(() => {
		mockFs = new MockFileSystem();
		mockFs.addDirectory("dest");
		service = new CopyService(mockFs);
		destination = {
			path: "dest",
			description: "Destination folder",
			overwrite: true,
		};
	});

	it("上書きモードが有効な場合、同名ファイルが存在していても上書きできる", async () => {
		// 既存ファイルを作成
		mockFs.addFile(joinPath("dest", "existing.md"), "Old Content");

		// 上書きコピー
		const result = await service.copy(
			"New Content",
			"existing.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe(joinPath("dest", "existing.md"));
		}

		const content = mockFs.getWrittenContent(joinPath("dest", "existing.md"));
		expect(content).toBe("New Content");
	});

	it("上書きモードが無効で同名ファイルが存在する場合、file_existsエラーを返す", async () => {
		// 上書き無効に設定
		destination.overwrite = false;

		// 既存ファイルを作成
		mockFs.addFile(joinPath("dest", "existing.md"), "Old Content");

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
		const content = mockFs.getWrittenContent(joinPath("dest", "existing.md"));
		expect(content).toBe("Old Content");
	});
});

describe("CopyService - リネームモード（連番付与）", () => {
	let service: CopyService;
	let destination: CopyDestination;
	let mockFs: MockFileSystem;

	beforeEach(async () => {
		mockFs = new MockFileSystem();
		mockFs.addDirectory("dest");
		service = new CopyService(mockFs);
		destination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
		};
	});

	it("同名ファイルが存在する場合、_1を付与してコピーできる", async () => {
		// 既存ファイルを作成
		mockFs.addFile(joinPath("dest", "file.md"), "Original");

		// リネームコピー
		const result = await service.copyWithRename(
			"New Content",
			"file.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe(joinPath("dest", "file_1.md"));
		}

		// 両方のファイルが存在することを確認
		expect(await mockFs.fileExists(joinPath("dest", "file.md"))).toBe(true);
		expect(await mockFs.fileExists(joinPath("dest", "file_1.md"))).toBe(true);
	});

	it("_1が存在する場合、_2を付与してコピーできる", async () => {
		// 既存ファイルを作成
		mockFs.addFile(joinPath("dest", "note.md"), "Original");
		mockFs.addFile(joinPath("dest", "note_1.md"), "First Copy");

		// リネームコピー
		const result = await service.copyWithRename(
			"Second Copy",
			"note.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe(joinPath("dest", "note_2.md"));
		}
	});

	it("_1, _2, _3まで存在する場合、_4を付与してコピーできる", async () => {
		// 既存ファイルを作成
		mockFs.addFile(joinPath("dest", "doc.md"), "Original");
		mockFs.addFile(joinPath("dest", "doc_1.md"), "Copy 1");
		mockFs.addFile(joinPath("dest", "doc_2.md"), "Copy 2");
		mockFs.addFile(joinPath("dest", "doc_3.md"), "Copy 3");

		// リネームコピー
		const result = await service.copyWithRename(
			"Copy 4",
			"doc.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe(joinPath("dest", "doc_4.md"));
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
			expect(result.path).toBe(joinPath("dest", "new.md"));
		}
	});

	it("拡張子が複数ドットを含む場合でも正しく処理できる", async () => {
		// 既存ファイルを作成
		mockFs.addFile(joinPath("dest", "file.test.md"), "Original");

		// リネームコピー
		const result = await service.copyWithRename(
			"New Content",
			"file.test.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe(joinPath("dest", "file.test_1.md"));
		}
	});
});

describe("CopyService - ディレクトリ存在チェック", () => {
	let service: CopyService;
	let destination: CopyDestination;
	let mockFs: MockFileSystem;

	beforeEach(() => {
		mockFs = new MockFileSystem();
		// ディレクトリは追加しない（存在しない状態でテスト）
		service = new CopyService(mockFs);
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
		// ディレクトリを作成
		mockFs.addDirectory("dest");

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

/**
 * テスト用のエラーを発生させるファイルシステム
 */
class ErrorThrowingFileSystem implements IFileSystem {
	private existingDirs: Set<string> = new Set();
	private existingFiles: Set<string> = new Set();
	private errorMessage: string;

	constructor(errorMessage: string) {
		this.errorMessage = errorMessage;
	}

	addDirectory(path: string): void {
		this.existingDirs.add(path);
	}

	async directoryExists(path: string): Promise<boolean> {
		return this.existingDirs.has(path);
	}

	async fileExists(path: string): Promise<boolean> {
		return this.existingFiles.has(path);
	}

	async writeFile(_path: string, _content: string): Promise<void> {
		throw new Error(this.errorMessage);
	}
}

describe("CopyService - I/Oエラーハンドリング", () => {
	let destination: CopyDestination;

	beforeEach(async () => {
		destination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
		};
	});

	it("write時にエラーが発生した場合、io_errorを返す", async () => {
		const errorFs = new ErrorThrowingFileSystem("Disk full");
		errorFs.addDirectory("dest");
		const service = new CopyService(errorFs);

		const result = await service.copy("Content", "file.md", destination);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("io_error");
			expect(result.message).toContain("I/O error");
		}
	});

	it("copyWithRename時にwrite エラーが発生した場合、io_errorを返す", async () => {
		const errorFs = new ErrorThrowingFileSystem("Permission denied");
		errorFs.addDirectory("dest");
		const service = new CopyService(errorFs);

		const result = await service.copyWithRename(
			"Content",
			"file.md",
			destination,
		);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("io_error");
		}
	});
});

describe("CopyService - 拡張子変更機能", () => {
	let service: CopyService;
	let mockFs: MockFileSystem;

	beforeEach(() => {
		mockFs = new MockFileSystem();
		mockFs.addDirectory("dest");
		service = new CopyService(mockFs);
	});

	it("extensionが設定されている場合、ファイル名の拡張子を変更してコピーする", async () => {
		const destination: CopyDestination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
			extension: ".txt",
		};

		const result = await service.copy(
			"Hello World",
			"source.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe(joinPath("dest", "source.txt"));
		}
	});

	it("extensionがドットなしで設定されても正しく動作する", async () => {
		const destination: CopyDestination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
			extension: "txt",
		};

		const result = await service.copy(
			"Hello World",
			"source.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe(joinPath("dest", "source.txt"));
		}
	});

	it("extensionが空文字の場合は拡張子を削除する", async () => {
		const destination: CopyDestination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
			extension: "",
		};

		const result = await service.copy(
			"Hello World",
			"source.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe(joinPath("dest", "source"));
		}
	});

	it("extensionが未設定の場合は元の拡張子を維持する", async () => {
		const destination: CopyDestination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
		};

		const result = await service.copy(
			"Hello World",
			"source.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe(joinPath("dest", "source.md"));
		}
	});

	it("拡張子のないファイルにextensionが設定された場合、拡張子を追加する", async () => {
		const destination: CopyDestination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
			extension: ".md",
		};

		const result = await service.copy(
			"Hello World",
			"README",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe(joinPath("dest", "README.md"));
		}
	});

	it("copyWithRenameでも拡張子変更が機能する", async () => {
		const destination: CopyDestination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
			extension: ".txt",
		};

		// 既存ファイルを作成
		mockFs.addFile(joinPath("dest", "file.txt"), "Original");

		const result = await service.copyWithRename(
			"New Content",
			"file.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			// file.txt が存在するので file_1.txt になる
			expect(result.path).toBe(joinPath("dest", "file_1.txt"));
		}
	});

	it("複数ドットを含むファイル名の拡張子変更が正しく動作する", async () => {
		const destination: CopyDestination = {
			path: "dest",
			description: "Destination folder",
			overwrite: false,
			extension: ".txt",
		};

		const result = await service.copy(
			"Hello World",
			"file.test.md",
			destination,
		);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.path).toBe(joinPath("dest", "file.test.txt"));
		}
	});
});

describe("normalizeExtension - 拡張子の正規化", () => {
	it("ドットなしの拡張子にドットを付与する", () => {
		expect(normalizeExtension("txt")).toBe(".txt");
		expect(normalizeExtension("md")).toBe(".md");
	});

	it("ドット付きの拡張子はそのまま返す", () => {
		expect(normalizeExtension(".txt")).toBe(".txt");
		expect(normalizeExtension(".md")).toBe(".md");
	});

	it("空文字列はそのまま返す", () => {
		expect(normalizeExtension("")).toBe("");
	});

	it("undefinedはundefinedを返す", () => {
		expect(normalizeExtension(undefined)).toBeUndefined();
	});

	it("複数ドットの拡張子は最初のドットのみ考慮する", () => {
		expect(normalizeExtension(".test.md")).toBe(".test.md");
		expect(normalizeExtension("test.md")).toBe(".test.md");
	});
});
