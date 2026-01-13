/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable obsidianmd/no-tfile-tfolder-cast */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CopyFileCommand } from "./copy-file-command";
import type { App, TFile } from "obsidian";
import type { CopyDestination } from "../types";
import { CopyService, joinPath } from "../copy-service";
import type { IFileSystem } from "../copy-service";

/**
 * テスト用のモックファイルシステム
 */
class MockFileSystem implements IFileSystem {
	private existingDirs: Set<string> = new Set();
	private existingFiles: Map<string, string> = new Map();
	public writtenFiles: Map<string, string> = new Map();
	public shouldThrowError: Error | null = null;

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
		if (this.shouldThrowError) {
			throw this.shouldThrowError;
		}
		this.writtenFiles.set(path, content);
		this.existingFiles.set(path, content);
	}

	getWrittenContent(path: string): string | undefined {
		return this.writtenFiles.get(path) ?? this.existingFiles.get(path);
	}
}

describe("CopyFileCommand - Integration Tests", () => {
	let mockApp: App;
	let copyService: CopyService;
	let mockGetDestinations: () => CopyDestination[];
	let mockNotice: (message: string) => any;
	let notificationMessages: string[];
	let mockFs: MockFileSystem;

	beforeEach(() => {
		notificationMessages = [];
		mockFs = new MockFileSystem();
		mockApp = {
			workspace: {
				getActiveFile: vi.fn(),
			},
			vault: {
				read: vi.fn(),
			},
		} as any;

		// 実際のCopyServiceを使用（モックファイルシステムを注入）
		copyService = new CopyService(mockFs);

		mockGetDestinations = vi.fn(() => []);
		mockNotice = vi.fn((message: string) => {
			notificationMessages.push(message);
		});
	});

	describe("ST-6.19: エンドツーエンドシナリオテスト（コマンド→モーダル→コピー完了）", () => {
		it("シナリオ1: アクティブファイル→コピー先1件→新規ファイルコピー→成功通知", async () => {
			// Setup
			mockFs.addDirectory("/archive");
			const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
			mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
			mockApp.vault.read = vi.fn().mockResolvedValue("# Test content");

			const dest: CopyDestination = {
				path: "/archive",
				description: "Archive Folder",
				overwrite: false,
			};
			mockGetDestinations = vi.fn(() => [dest]);

			const command = new CopyFileCommand(
				mockApp,
				copyService,
				mockGetDestinations,
				mockNotice,
			);

			// Execute
			await command.execute();

			// Assert
			expect(mockApp.vault.read).toHaveBeenCalledWith(mockFile);
			expect(mockFs.getWrittenContent(joinPath("/archive", "test.md"))).toBe("# Test content");
			expect(notificationMessages).toContain(
				'Copied "test.md" to "Archive Folder"',
			);
		});

		it("シナリオ2: アクティブファイル→コピー先1件→overwrite=true→上書きコピー→成功通知", async () => {
			// Setup
			mockFs.addDirectory("/archive");
			mockFs.addFile(joinPath("/archive", "test.md"), "Old content");
			const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
			mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
			mockApp.vault.read = vi.fn().mockResolvedValue("# Test content");

			const dest: CopyDestination = {
				path: "/archive",
				description: "Archive Folder",
				overwrite: true,
			};
			mockGetDestinations = vi.fn(() => [dest]);

			const command = new CopyFileCommand(
				mockApp,
				copyService,
				mockGetDestinations,
				mockNotice,
			);

			// Execute
			await command.execute();

			// Assert
			expect(mockFs.getWrittenContent(joinPath("/archive", "test.md"))).toBe("# Test content");
			expect(notificationMessages).toContain(
				'Copied "test.md" to "Archive Folder"',
			);
		});

		it("シナリオ3: ディレクトリ不在エラー→エラー通知", async () => {
			// Setup - mockFsにディレクトリを追加しない（存在しない状態）
			const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
			mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
			mockApp.vault.read = vi.fn().mockResolvedValue("# Test content");

			const dest: CopyDestination = {
				path: "/nonexistent",
				description: "Nonexistent Folder",
				overwrite: false,
			};
			mockGetDestinations = vi.fn(() => [dest]);

			const command = new CopyFileCommand(
				mockApp,
				copyService,
				mockGetDestinations,
				mockNotice,
			);

			// Execute
			await command.execute();

			// Assert
			expect(notificationMessages).toContain(
				"Destination folder does not exist: /nonexistent",
			);
		});
	});

	describe("ST-6.20: 全通知パターン（成功3+エラー5）の統合テスト", () => {
		describe("成功通知パターン", () => {
			it("通知1: 新規ファイルコピー成功", async () => {
				mockFs.addDirectory("/dest");
				const mockFile: TFile = { name: "new.md", path: "new.md" } as TFile;
				mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
				mockApp.vault.read = vi.fn().mockResolvedValue("content");

				const dest: CopyDestination = {
					path: "/dest",
					description: "Destination",
					overwrite: false,
				};
				mockGetDestinations = vi.fn(() => [dest]);

				const command = new CopyFileCommand(
					mockApp,
					copyService,
					mockGetDestinations,
					mockNotice,
				);
				await command.execute();

				expect(notificationMessages).toContain('Copied "new.md" to "Destination"');
			});

			it("通知2: 上書きコピー成功（overwrite=trueの場合は新規と同じメッセージ）", async () => {
				mockFs.addDirectory("/dest");
				mockFs.addFile(joinPath("/dest", "existing.md"), "old content");
				const mockFile: TFile = { name: "existing.md", path: "existing.md" } as TFile;
				mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
				mockApp.vault.read = vi.fn().mockResolvedValue("content");

				const dest: CopyDestination = {
					path: "/dest",
					description: "Destination",
					overwrite: true,
				};
				mockGetDestinations = vi.fn(() => [dest]);

				const command = new CopyFileCommand(
					mockApp,
					copyService,
					mockGetDestinations,
					mockNotice,
				);
				await command.execute();

				expect(notificationMessages).toContain('Copied "existing.md" to "Destination"');
			});

			it("通知3: リネームコピー成功（copyWithRename経由）", async () => {
				// copyWithRenameは実際のCopyServiceを使用してテスト
				mockFs.addDirectory("/dest");
				mockFs.addFile(joinPath("/dest", "file.md"), "original");

				const dest: CopyDestination = {
					path: "/dest",
					description: "Destination",
					overwrite: false,
				};

				// copyWithRenameを直接呼ぶ
				const result = await copyService.copyWithRename("content", "file.md", dest);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.path).toBe(joinPath("/dest", "file_1.md"));
				}
			});
		});

		describe("エラー通知パターン", () => {
			it("エラー1: アクティブファイルなし", async () => {
				mockApp.workspace.getActiveFile = vi.fn(() => null);

				const command = new CopyFileCommand(
					mockApp,
					copyService,
					mockGetDestinations,
					mockNotice,
				);
				await command.execute();

				expect(notificationMessages).toContain("No active file to copy");
			});

			it("エラー2: コピー先0件", async () => {
				const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
				mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
				mockGetDestinations = vi.fn(() => []);

				const command = new CopyFileCommand(
					mockApp,
					copyService,
					mockGetDestinations,
					mockNotice,
				);
				await command.execute();

				expect(notificationMessages).toContain(
					"No copy destinations configured. Please add destinations in settings.",
				);
			});

			it("エラー3: コピー先ディレクトリ存在エラー", async () => {
				// mockFsにディレクトリを追加しない（存在しない状態）
				const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
				mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
				mockApp.vault.read = vi.fn().mockResolvedValue("content");

				const dest: CopyDestination = {
					path: "/nonexistent",
					description: "Destination",
					overwrite: false,
				};
				mockGetDestinations = vi.fn(() => [dest]);

				const command = new CopyFileCommand(
					mockApp,
					copyService,
					mockGetDestinations,
					mockNotice,
				);
				await command.execute();

				expect(notificationMessages).toContain(
					"Destination folder does not exist: /nonexistent",
				);
			});

			it("エラー4: I/Oエラー", async () => {
				mockFs.addDirectory("/dest");
				mockFs.shouldThrowError = new Error("Disk full");
				const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
				mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
				mockApp.vault.read = vi.fn().mockResolvedValue("content");

				const dest: CopyDestination = {
					path: "/dest",
					description: "Destination",
					overwrite: false,
				};
				mockGetDestinations = vi.fn(() => [dest]);

				const command = new CopyFileCommand(
					mockApp,
					copyService,
					mockGetDestinations,
					mockNotice,
				);
				await command.execute();

				expect(notificationMessages.some((msg) => msg.includes("Failed to copy file"))).toBe(true);
			});

			it("エラー5: 権限エラー", async () => {
				mockFs.addDirectory("/dest");
				mockFs.shouldThrowError = new Error("EACCES: permission denied");
				const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
				mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
				mockApp.vault.read = vi.fn().mockResolvedValue("content");

				const dest: CopyDestination = {
					path: "/dest",
					description: "Destination",
					overwrite: false,
				};
				mockGetDestinations = vi.fn(() => [dest]);

				const command = new CopyFileCommand(
					mockApp,
					copyService,
					mockGetDestinations,
					mockNotice,
				);
				await command.execute();

				expect(notificationMessages.some((msg) => msg.includes("Permission denied"))).toBe(true);
			});
		});
	});
});
