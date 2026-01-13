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
		mockApp = {} as App;
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
});
