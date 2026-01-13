/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable obsidianmd/no-tfile-tfolder-cast */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CopyFileCommand } from "./copy-file-command";
import type { App, TFile } from "obsidian";
import type { CopyDestination } from "../types";
import { CopyService } from "../copy-service";

describe("CopyFileCommand - Integration Tests", () => {
	let mockApp: App;
	let copyService: CopyService;
	let mockGetDestinations: () => CopyDestination[];
	let mockNotice: (message: string) => any;
	let notificationMessages: string[];

	beforeEach(() => {
		notificationMessages = [];
		mockApp = {
			workspace: {
				getActiveFile: vi.fn(),
			},
			vault: {
				read: vi.fn(),
				adapter: {
					exists: vi.fn(),
					write: vi.fn(),
					stat: vi.fn(),
				},
			},
		} as any;

		// 実際のCopyServiceを使用
		copyService = new CopyService(mockApp.vault as any);

		mockGetDestinations = vi.fn(() => []);
		mockNotice = vi.fn((message: string) => {
			notificationMessages.push(message);
		});
	});

	describe("ST-6.19: エンドツーエンドシナリオテスト（コマンド→モーダル→コピー完了）", () => {
		it("シナリオ1: アクティブファイル→コピー先1件→新規ファイルコピー→成功通知", async () => {
			// Setup
			const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
			mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
			mockApp.vault.read = vi.fn().mockResolvedValue("# Test content");
			mockApp.vault.adapter.exists = vi.fn().mockResolvedValue(false);
			mockApp.vault.adapter.stat = vi.fn().mockResolvedValue({ type: "folder" });
			mockApp.vault.adapter.write = vi.fn().mockResolvedValue(undefined);

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
			expect(mockApp.vault.adapter.exists).toHaveBeenCalledWith(
				"/archive/test.md",
			);
			expect(mockApp.vault.adapter.write).toHaveBeenCalledWith(
				"/archive/test.md",
				"# Test content",
			);
			expect(notificationMessages).toContain(
				'Copied "test.md" to "Archive Folder"',
			);
		});

		it("シナリオ2: アクティブファイル→コピー先1件→overwrite=true→上書きコピー→成功通知", async () => {
			// Setup
			const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
			mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
			mockApp.vault.read = vi.fn().mockResolvedValue("# Test content");
			mockApp.vault.adapter.stat = vi.fn().mockResolvedValue({ type: "folder" });
			mockApp.vault.adapter.write = vi.fn().mockResolvedValue(undefined);

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
			expect(mockApp.vault.adapter.write).toHaveBeenCalledWith(
				"/archive/test.md",
				"# Test content",
			);
			expect(notificationMessages).toContain(
				'Copied "test.md" to "Archive Folder"',
			);
		});

		it("シナリオ3: ディレクトリ不在エラー→エラー通知", async () => {
			// Setup
			const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
			mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
			mockApp.vault.read = vi.fn().mockResolvedValue("# Test content");
			mockApp.vault.adapter.stat = vi.fn().mockResolvedValue(null); // ディレクトリ不在

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
				const mockFile: TFile = { name: "new.md", path: "new.md" } as TFile;
				mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
				mockApp.vault.read = vi.fn().mockResolvedValue("content");
				mockApp.vault.adapter.exists = vi.fn().mockResolvedValue(false);
				mockApp.vault.adapter.stat = vi.fn().mockResolvedValue({ type: "folder" });
				mockApp.vault.adapter.write = vi.fn().mockResolvedValue(undefined);

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
				const mockFile: TFile = { name: "existing.md", path: "existing.md" } as TFile;
				mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
				mockApp.vault.read = vi.fn().mockResolvedValue("content");
				mockApp.vault.adapter.stat = vi.fn().mockResolvedValue({ type: "folder" });
				mockApp.vault.adapter.write = vi.fn().mockResolvedValue(undefined);

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
				const mockFile: TFile = { name: "file.md", path: "file.md" } as TFile;
				mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
				mockApp.vault.read = vi.fn().mockResolvedValue("content");
				mockApp.vault.adapter.exists = vi
					.fn()
					.mockResolvedValueOnce(true) // file.md exists
					.mockResolvedValueOnce(false); // file_1.md does not exist
				mockApp.vault.adapter.stat = vi.fn().mockResolvedValue({ type: "folder" });
				mockApp.vault.adapter.write = vi.fn().mockResolvedValue(undefined);

				const dest: CopyDestination = {
					path: "/dest",
					description: "Destination",
					overwrite: false,
				};

				// copyWithRenameを直接呼ぶ
				const result = await copyService.copyWithRename("content", "file.md", dest);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.path).toBe("/dest/file_1.md");
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
				const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
				mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
				mockApp.vault.read = vi.fn().mockResolvedValue("content");
				mockApp.vault.adapter.stat = vi.fn().mockResolvedValue(null);

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
				const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
				mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
				mockApp.vault.read = vi.fn().mockResolvedValue("content");
				mockApp.vault.adapter.stat = vi.fn().mockResolvedValue({ type: "folder" });
				mockApp.vault.adapter.write = vi
					.fn()
					.mockRejectedValue(new Error("Disk full"));

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
				const mockFile: TFile = { name: "test.md", path: "test.md" } as TFile;
				mockApp.workspace.getActiveFile = vi.fn(() => mockFile);
				mockApp.vault.read = vi.fn().mockResolvedValue("content");
				mockApp.vault.adapter.stat = vi.fn().mockResolvedValue({ type: "folder" });
				mockApp.vault.adapter.write = vi
					.fn()
					.mockRejectedValue(new Error("EACCES: permission denied"));

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
