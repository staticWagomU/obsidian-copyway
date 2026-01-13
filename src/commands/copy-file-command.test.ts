import { describe, it, expect, beforeEach, vi } from "vitest";
import { CopyFileCommand } from "./copy-file-command";
import type { App, TFile, Vault, Notice } from "obsidian";
import type { CopyDestination } from "../types";
import type { ICopyService } from "../copy-service";

describe("CopyFileCommand - Phase 1: コマンド登録と基本構造", () => {
	let mockApp: App;
	let mockCopyService: ICopyService;
	let mockGetDestinations: () => CopyDestination[];
	let mockNotice: (message: string) => any;

	beforeEach(() => {
		mockApp = {
			workspace: {
				getActiveFile: vi.fn(() => null),
			},
		} as any;
		mockCopyService = {} as ICopyService;
		mockGetDestinations = vi.fn(() => []);
		mockNotice = vi.fn();
	});

	describe("ST-6.1: コマンド登録とコールバック構造", () => {
		it("CopyFileCommandクラスがインスタンス化できる", () => {
			const command = new CopyFileCommand(
				mockApp,
				mockCopyService,
				mockGetDestinations,
				mockNotice,
			);

			expect(command).toBeDefined();
			expect(command).toBeInstanceOf(CopyFileCommand);
		});

		it("execute()メソッドが存在する", () => {
			const command = new CopyFileCommand(
				mockApp,
				mockCopyService,
				mockGetDestinations,
				mockNotice,
			);

			expect(command.execute).toBeDefined();
			expect(typeof command.execute).toBe("function");
		});

		it("execute()が呼び出せる", async () => {
			const command = new CopyFileCommand(
				mockApp,
				mockCopyService,
				mockGetDestinations,
				mockNotice,
			);

			await expect(command.execute()).resolves.toBeUndefined();
		});
	});

	describe("ST-6.2: アクティブファイルなしエラー", () => {
		it("アクティブファイルがない場合、エラー通知を表示する", async () => {
			// アクティブファイルがnullの場合
			mockApp.workspace = {
				getActiveFile: vi.fn(() => null),
			} as any;

			const command = new CopyFileCommand(
				mockApp,
				mockCopyService,
				mockGetDestinations,
				mockNotice,
			);

			await command.execute();

			// エラー通知が呼ばれることを確認
			expect(mockNotice).toHaveBeenCalledWith("No active file to copy");
		});

		it("アクティブファイルがある場合、アクティブファイルなしエラーは表示されない", async () => {
			// アクティブファイルが存在する場合
			const mockFile: TFile = {
				name: "test.md",
				path: "test.md",
			} as TFile;

			mockApp.workspace = {
				getActiveFile: vi.fn(() => mockFile),
			} as any;

			// コピー先が0件なので、別のエラーが出るが、アクティブファイルなしエラーは出ない
			const command = new CopyFileCommand(
				mockApp,
				mockCopyService,
				mockGetDestinations,
				mockNotice,
			);

			await command.execute();

			// "No active file to copy"は呼ばれない
			expect(mockNotice).not.toHaveBeenCalledWith("No active file to copy");
		});
	});

	describe("ST-6.3: コピー先0件エラー", () => {
		it("コピー先が0件の場合、エラー通知を表示する", async () => {
			// アクティブファイルが存在する
			const mockFile: TFile = {
				name: "test.md",
				path: "test.md",
			} as TFile;

			mockApp.workspace = {
				getActiveFile: vi.fn(() => mockFile),
			} as any;

			// コピー先が0件
			mockGetDestinations = vi.fn(() => []);

			const command = new CopyFileCommand(
				mockApp,
				mockCopyService,
				mockGetDestinations,
				mockNotice,
			);

			await command.execute();

			// エラー通知が呼ばれることを確認
			expect(mockNotice).toHaveBeenCalledWith(
				"No copy destinations configured. Please add destinations in settings.",
			);
		});

		it("コピー先が1件以上の場合、このエラーは表示されない", async () => {
			// アクティブファイルが存在する
			const mockFile: TFile = {
				name: "test.md",
				path: "test.md",
			} as TFile;

			mockApp.workspace = {
				getActiveFile: vi.fn(() => mockFile),
			} as any;

			// コピー先が1件存在
			const mockDestination: CopyDestination = {
				path: "/test/path",
				description: "Test destination",
				overwrite: false,
			};
			mockGetDestinations = vi.fn(() => [mockDestination]);

			// vault mock追加（コピー処理用）
			mockApp.vault = {
				read: vi.fn().mockResolvedValue("file content"),
			} as any;

			const command = new CopyFileCommand(
				mockApp,
				mockCopyService,
				mockGetDestinations,
				mockNotice,
			);

			await command.execute();

			// "No copy destinations configured"は呼ばれない
			expect(mockNotice).not.toHaveBeenCalledWith(
				"No copy destinations configured. Please add destinations in settings.",
			);
		});
	});
});
