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
});
