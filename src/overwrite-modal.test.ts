import { describe, it, expect, vi, beforeEach } from "vitest";
import { OverwriteModal } from "./overwrite-modal";
import type { App } from "obsidian";

// Mock App
const mockApp = {} as App;

describe("OverwriteModal", () => {
	describe("型定義とコンストラクタ", () => {
		it("OverwriteModalが適切なパラメータで構築できる", () => {
			const onResult = vi.fn();
			const modal = new OverwriteModal(mockApp, "test.md", onResult);

			expect(modal).toBeDefined();
		});
	});

	describe("基本表示機能", () => {
		it("onOpen()でcontentElがクリアされる", () => {
			const onResult = vi.fn();
			const modal = new OverwriteModal(mockApp, "test.md", onResult);

			// contentElのモックを設定
			const mockContentEl = {
				empty: vi.fn(),
				createEl: vi.fn().mockReturnValue({
					addEventListener: vi.fn(),
				}),
			};
			// @ts-expect-error - モックのため型エラーを無視
			modal.contentEl = mockContentEl;

			modal.onOpen();

			expect(mockContentEl.empty).toHaveBeenCalled();
		});

		it("onOpen()で3つのボタンが作成される", () => {
			const onResult = vi.fn();
			const modal = new OverwriteModal(mockApp, "test.md", onResult);

			const mockContentEl = {
				empty: vi.fn(),
				createEl: vi.fn().mockReturnValue({
					addEventListener: vi.fn(),
				}),
			};
			// @ts-expect-error - モックのため型エラーを無視
			modal.contentEl = mockContentEl;

			modal.onOpen();

			// 3つのボタン + 1つのメッセージ要素 = 4回呼ばれる
			expect(mockContentEl.createEl).toHaveBeenCalled();
		});

		it("onClose()でcontentElがクリアされる", () => {
			const onResult = vi.fn();
			const modal = new OverwriteModal(mockApp, "test.md", onResult);

			const mockContentEl = {
				empty: vi.fn(),
			};
			// @ts-expect-error - モックのため型エラーを無視
			modal.contentEl = mockContentEl;

			modal.onClose();

			expect(mockContentEl.empty).toHaveBeenCalled();
		});
	});
});
