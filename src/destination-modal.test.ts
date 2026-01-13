import { describe, it, expect, vi } from "vitest";
import { DestinationModal } from "./destination-modal";
import type { CopyDestination } from "./types";

describe("DestinationModal", () => {
	describe("基本構造", () => {
		it("Modalクラスを継承している", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Destination 1", overwrite: false },
			];
			const onSelect = () => {};
			const modal = new DestinationModal({} as any, destinations, onSelect);

			expect(modal).toBeDefined();
			expect(modal.open).toBeDefined();
			expect(modal.close).toBeDefined();
		});

		it("destinationsとonSelectコールバックを受け取る", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Destination 1", overwrite: false },
				{ path: "/path/to/dest2", description: "Destination 2", overwrite: true },
			];
			let selectedDestination: CopyDestination | null = null;
			const onSelect = (dest: CopyDestination) => {
				selectedDestination = dest;
			};

			const modal = new DestinationModal({} as any, destinations, onSelect);

			expect(modal).toBeDefined();
		});
	});

	describe("レンダリング", () => {
		it("onOpen()でdescriptionのみを表示するリストをレンダリングする", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Work notes", overwrite: false },
				{ path: "/path/to/dest2", description: "Personal vault", overwrite: true },
			];
			const modal = new DestinationModal({} as any, destinations, () => {});

			modal.open();

			const items = modal.contentEl.querySelectorAll(".destination-item");
			expect(items).toHaveLength(2);
			expect(items[0].textContent).toBe("Work notes");
			expect(items[1].textContent).toBe("Personal vault");

			// パスは表示されない
			expect(modal.contentEl.textContent).not.toContain("/path/to/dest1");
			expect(modal.contentEl.textContent).not.toContain("/path/to/dest2");
		});

		it("最初の項目が選択状態になる", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Work notes", overwrite: false },
				{ path: "/path/to/dest2", description: "Personal vault", overwrite: true },
			];
			const modal = new DestinationModal({} as any, destinations, () => {});

			modal.open();

			const items = modal.contentEl.querySelectorAll(".destination-item");
			expect(items[0].classList.contains("is-selected")).toBe(true);
			expect(items[1].classList.contains("is-selected")).toBe(false);
		});
	});

	describe("キーボード操作", () => {
		it("↓キーで次の項目を選択する", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Work notes", overwrite: false },
				{ path: "/path/to/dest2", description: "Personal vault", overwrite: true },
				{ path: "/path/to/dest3", description: "Archive", overwrite: false },
			];
			const modal = new DestinationModal({} as any, destinations, () => {});

			modal.open();

			const items = modal.contentEl.querySelectorAll(".destination-item");

			// 最初は0番目が選択
			expect(items[0].classList.contains("is-selected")).toBe(true);

			// ↓キーで1番目に移動
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
			expect(items[0].classList.contains("is-selected")).toBe(false);
			expect(items[1].classList.contains("is-selected")).toBe(true);

			// さらに↓キーで2番目に移動
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
			expect(items[1].classList.contains("is-selected")).toBe(false);
			expect(items[2].classList.contains("is-selected")).toBe(true);
		});

		it("↑キーで前の項目を選択する", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Work notes", overwrite: false },
				{ path: "/path/to/dest2", description: "Personal vault", overwrite: true },
				{ path: "/path/to/dest3", description: "Archive", overwrite: false },
			];
			const modal = new DestinationModal({} as any, destinations, () => {});

			modal.open();

			const items = modal.contentEl.querySelectorAll(".destination-item");

			// まず↓キーで2番目に移動
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
			expect(items[2].classList.contains("is-selected")).toBe(true);

			// ↑キーで1番目に戻る
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
			expect(items[2].classList.contains("is-selected")).toBe(false);
			expect(items[1].classList.contains("is-selected")).toBe(true);

			// さらに↑キーで0番目に戻る
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
			expect(items[1].classList.contains("is-selected")).toBe(false);
			expect(items[0].classList.contains("is-selected")).toBe(true);
		});

		it("最後の項目で↓キーを押しても変化しない", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Work notes", overwrite: false },
				{ path: "/path/to/dest2", description: "Personal vault", overwrite: true },
			];
			const modal = new DestinationModal({} as any, destinations, () => {});

			modal.open();

			const items = modal.contentEl.querySelectorAll(".destination-item");

			// 1番目に移動
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
			expect(items[1].classList.contains("is-selected")).toBe(true);

			// さらに↓キーを押しても1番目のまま
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
			expect(items[1].classList.contains("is-selected")).toBe(true);
		});

		it("最初の項目で↑キーを押しても変化しない", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Work notes", overwrite: false },
				{ path: "/path/to/dest2", description: "Personal vault", overwrite: true },
			];
			const modal = new DestinationModal({} as any, destinations, () => {});

			modal.open();

			const items = modal.contentEl.querySelectorAll(".destination-item");

			// 最初は0番目が選択
			expect(items[0].classList.contains("is-selected")).toBe(true);

			// ↑キーを押しても0番目のまま
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
			expect(items[0].classList.contains("is-selected")).toBe(true);
		});

		it("Enterキーで選択された項目のコールバックが実行され、モーダルが閉じる", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Work notes", overwrite: false },
				{ path: "/path/to/dest2", description: "Personal vault", overwrite: true },
			];
			const onSelect = vi.fn();
			const modal = new DestinationModal({} as any, destinations, onSelect);
			const closeSpy = vi.spyOn(modal, "close");

			modal.open();

			// 1番目に移動
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));

			// Enterキーで選択
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

			expect(onSelect).toHaveBeenCalledWith(destinations[1]);
			expect(closeSpy).toHaveBeenCalled();
		});

		it("Escapeキーでコールバックを実行せずにモーダルが閉じる", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Work notes", overwrite: false },
			];
			const onSelect = vi.fn();
			const modal = new DestinationModal({} as any, destinations, onSelect);
			const closeSpy = vi.spyOn(modal, "close");

			modal.open();

			// Escapeキーで閉じる
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

			expect(onSelect).not.toHaveBeenCalled();
			expect(closeSpy).toHaveBeenCalled();
		});
	});

	describe("クリック操作", () => {
		it("項目をクリックすると選択される", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Work notes", overwrite: false },
				{ path: "/path/to/dest2", description: "Personal vault", overwrite: true },
				{ path: "/path/to/dest3", description: "Archive", overwrite: false },
			];
			const modal = new DestinationModal({} as any, destinations, () => {});

			modal.open();

			const items = modal.contentEl.querySelectorAll(".destination-item");

			// 最初は0番目が選択
			expect(items[0].classList.contains("is-selected")).toBe(true);

			// 2番目をクリック
			items[2].dispatchEvent(new MouseEvent("click"));

			// 2番目が選択される
			expect(items[0].classList.contains("is-selected")).toBe(false);
			expect(items[2].classList.contains("is-selected")).toBe(true);
		});

		it("項目をクリックするとコールバックが実行され、モーダルが閉じる", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Work notes", overwrite: false },
				{ path: "/path/to/dest2", description: "Personal vault", overwrite: true },
			];
			const onSelect = vi.fn();
			const modal = new DestinationModal({} as any, destinations, onSelect);
			const closeSpy = vi.spyOn(modal, "close");

			modal.open();

			const items = modal.contentEl.querySelectorAll(".destination-item");

			// 1番目をクリック
			items[1].dispatchEvent(new MouseEvent("click"));

			expect(onSelect).toHaveBeenCalledWith(destinations[1]);
			expect(closeSpy).toHaveBeenCalled();
		});

		it("クリックとキーボード操作を組み合わせて使える", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Work notes", overwrite: false },
				{ path: "/path/to/dest2", description: "Personal vault", overwrite: true },
				{ path: "/path/to/dest3", description: "Archive", overwrite: false },
			];
			const onSelect = vi.fn();
			const modal = new DestinationModal({} as any, destinations, onSelect);

			modal.open();

			const items = modal.contentEl.querySelectorAll(".destination-item");

			// 1番目をクリック
			items[1].dispatchEvent(new MouseEvent("click"));
			expect(items[1].classList.contains("is-selected")).toBe(true);

			// ↓キーで2番目に移動
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
			expect(items[1].classList.contains("is-selected")).toBe(false);
			expect(items[2].classList.contains("is-selected")).toBe(true);

			// Enterキーで選択
			modal.contentEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

			expect(onSelect).toHaveBeenCalledWith(destinations[2]);
		});
	});
});
