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

	describe("Overwriteボタン動作", () => {
		it("OverwriteボタンクリックでonResultが'overwrite'で呼ばれる", () => {
			const onResult = vi.fn();
			const modal = new OverwriteModal(mockApp, "test.md", onResult);

			let overwriteClickHandler: (() => void) | null = null;

			const mockContentEl = {
				empty: vi.fn(),
				createEl: vi.fn((tag: string, options?: { text?: string }) => {
					const mockEl = {
						addEventListener: vi.fn((event: string, handler: () => void) => {
							if (options?.text === "Overwrite") {
								overwriteClickHandler = handler;
							}
						}),
					};
					return mockEl;
				}),
			};
			// @ts-expect-error - モックのため型エラーを無視
			modal.contentEl = mockContentEl;
			// @ts-expect-error - モックのため型エラーを無視
			modal.close = vi.fn();

			modal.onOpen();

			// Overwriteボタンのクリックハンドラを実行
			expect(overwriteClickHandler).toBeDefined();
			overwriteClickHandler?.();

			expect(onResult).toHaveBeenCalledWith("overwrite");
		});

		it("Overwriteボタンクリック後にモーダルが閉じられる", () => {
			const onResult = vi.fn();
			const modal = new OverwriteModal(mockApp, "test.md", onResult);

			let overwriteClickHandler: (() => void) | null = null;

			const mockContentEl = {
				empty: vi.fn(),
				createEl: vi.fn((tag: string, options?: { text?: string }) => {
					const mockEl = {
						addEventListener: vi.fn((event: string, handler: () => void) => {
							if (options?.text === "Overwrite") {
								overwriteClickHandler = handler;
							}
						}),
					};
					return mockEl;
				}),
			};
			// @ts-expect-error - モックのため型エラーを無視
			modal.contentEl = mockContentEl;
			const closeSpy = vi.fn();
			// @ts-expect-error - モックのため型エラーを無視
			modal.close = closeSpy;

			modal.onOpen();
			overwriteClickHandler?.();

			expect(closeSpy).toHaveBeenCalled();
		});
	});

	describe("Renameボタン動作", () => {
		it("RenameボタンクリックでonResultが'rename'で呼ばれる", () => {
			const onResult = vi.fn();
			const modal = new OverwriteModal(mockApp, "test.md", onResult);

			let renameClickHandler: (() => void) | null = null;

			const mockContentEl = {
				empty: vi.fn(),
				createEl: vi.fn((tag: string, options?: { text?: string }) => {
					const mockEl = {
						addEventListener: vi.fn((event: string, handler: () => void) => {
							if (options?.text === "Rename") {
								renameClickHandler = handler;
							}
						}),
					};
					return mockEl;
				}),
			};
			// @ts-expect-error - モックのため型エラーを無視
			modal.contentEl = mockContentEl;
			// @ts-expect-error - モックのため型エラーを無視
			modal.close = vi.fn();

			modal.onOpen();

			// Renameボタンのクリックハンドラを実行
			expect(renameClickHandler).toBeDefined();
			renameClickHandler?.();

			expect(onResult).toHaveBeenCalledWith("rename");
		});

		it("Renameボタンクリック後にモーダルが閉じられる", () => {
			const onResult = vi.fn();
			const modal = new OverwriteModal(mockApp, "test.md", onResult);

			let renameClickHandler: (() => void) | null = null;

			const mockContentEl = {
				empty: vi.fn(),
				createEl: vi.fn((tag: string, options?: { text?: string }) => {
					const mockEl = {
						addEventListener: vi.fn((event: string, handler: () => void) => {
							if (options?.text === "Rename") {
								renameClickHandler = handler;
							}
						}),
					};
					return mockEl;
				}),
			};
			// @ts-expect-error - モックのため型エラーを無視
			modal.contentEl = mockContentEl;
			const closeSpy = vi.fn();
			// @ts-expect-error - モックのため型エラーを無視
			modal.close = closeSpy;

			modal.onOpen();
			renameClickHandler?.();

			expect(closeSpy).toHaveBeenCalled();
		});
	});

	describe("Cancelボタン動作", () => {
		it("CancelボタンクリックでonResultが'cancel'で呼ばれる", () => {
			const onResult = vi.fn();
			const modal = new OverwriteModal(mockApp, "test.md", onResult);

			let cancelClickHandler: (() => void) | null = null;

			const mockContentEl = {
				empty: vi.fn(),
				createEl: vi.fn((tag: string, options?: { text?: string }) => {
					const mockEl = {
						addEventListener: vi.fn((event: string, handler: () => void) => {
							if (options?.text === "Cancel") {
								cancelClickHandler = handler;
							}
						}),
					};
					return mockEl;
				}),
			};
			// @ts-expect-error - モックのため型エラーを無視
			modal.contentEl = mockContentEl;
			// @ts-expect-error - モックのため型エラーを無視
			modal.close = vi.fn();

			modal.onOpen();

			// Cancelボタンのクリックハンドラを実行
			expect(cancelClickHandler).toBeDefined();
			cancelClickHandler?.();

			expect(onResult).toHaveBeenCalledWith("cancel");
		});

		it("Cancelボタンクリック後にモーダルが閉じられる", () => {
			const onResult = vi.fn();
			const modal = new OverwriteModal(mockApp, "test.md", onResult);

			let cancelClickHandler: (() => void) | null = null;

			const mockContentEl = {
				empty: vi.fn(),
				createEl: vi.fn((tag: string, options?: { text?: string }) => {
					const mockEl = {
						addEventListener: vi.fn((event: string, handler: () => void) => {
							if (options?.text === "Cancel") {
								cancelClickHandler = handler;
							}
						}),
					};
					return mockEl;
				}),
			};
			// @ts-expect-error - モックのため型エラーを無視
			modal.contentEl = mockContentEl;
			const closeSpy = vi.fn();
			// @ts-expect-error - モックのため型エラーを無視
			modal.close = closeSpy;

			modal.onOpen();
			cancelClickHandler?.();

			expect(closeSpy).toHaveBeenCalled();
		});
	});

	describe("ファイル名表示機能", () => {
		it("onOpen()でファイル名を含むメッセージが表示される", () => {
			const onResult = vi.fn();
			const filename = "my-note.md";
			const modal = new OverwriteModal(mockApp, filename, onResult);

			let messageText = "";
			const mockContentEl = {
				empty: vi.fn(),
				createEl: vi.fn((tag: string, options?: { text?: string }) => {
					if (tag === "p" && options?.text) {
						messageText = options.text;
					}
					return {
						addEventListener: vi.fn(),
					};
				}),
			};
			// @ts-expect-error - モックのため型エラーを無視
			modal.contentEl = mockContentEl;

			modal.onOpen();

			// ファイル名がメッセージに含まれていることを確認
			expect(messageText).toContain(filename);
			expect(messageText).toContain("already exists");
		});

		it("異なるファイル名でも正しく表示される", () => {
			const onResult = vi.fn();
			const filename = "another-file.txt";
			const modal = new OverwriteModal(mockApp, filename, onResult);

			let messageText = "";
			const mockContentEl = {
				empty: vi.fn(),
				createEl: vi.fn((tag: string, options?: { text?: string }) => {
					if (tag === "p" && options?.text) {
						messageText = options.text;
					}
					return {
						addEventListener: vi.fn(),
					};
				}),
			};
			// @ts-expect-error - モックのため型エラーを無視
			modal.contentEl = mockContentEl;

			modal.onOpen();

			expect(messageText).toContain(filename);
		});
	});
});
