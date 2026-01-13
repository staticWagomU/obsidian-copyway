import { Modal } from "obsidian";
import type { App } from "obsidian";
import type { CopyDestination } from "./types";

/**
 * コピー先を選択するモーダル
 */
export class DestinationModal extends Modal {
	private destinations: CopyDestination[];
	private onSelect: (destination: CopyDestination) => void;
	private selectedIndex = 0;

	constructor(
		app: App,
		destinations: CopyDestination[],
		onSelect: (destination: CopyDestination) => void,
	) {
		super(app);
		this.destinations = destinations;
		this.onSelect = onSelect;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		// レンダリング: descriptionのみを表示
		this.destinations.forEach((dest, index) => {
			const item = contentEl.createEl("div", {
				text: dest.description,
				cls: "destination-item",
			});
			if (index === this.selectedIndex) {
				item.classList.add("is-selected");
			}

			// クリックイベントリスナーを追加（視覚的な選択のみ）
			item.addEventListener("click", () => {
				this.updateSelection(index);
			});
		});

		// キーボードイベントリスナーを追加
		contentEl.addEventListener("keydown", this.handleKeyDown.bind(this));
		contentEl.setAttribute("tabindex", "0");
		contentEl.focus();
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}

	private updateSelection(index: number): void {
		const { contentEl } = this;
		const items = contentEl.querySelectorAll(".destination-item");

		// モーダルが閉じられている場合は処理しない
		if (items.length === 0) {
			return;
		}

		// 現在の選択を解除
		items[this.selectedIndex].classList.remove("is-selected");

		// 新しい項目を選択（視覚的な変更のみ）
		this.selectedIndex = index;
		items[this.selectedIndex].classList.add("is-selected");
	}

	private confirmSelection(): void {
		// コールバックを実行してモーダルを閉じる
		this.onSelect(this.destinations[this.selectedIndex]);
		this.close();
	}

	private handleKeyDown(event: KeyboardEvent): void {
		switch (event.key) {
			case "ArrowDown":
				if (this.selectedIndex < this.destinations.length - 1) {
					this.updateSelection(this.selectedIndex + 1);
				}
				break;

			case "ArrowUp":
				if (this.selectedIndex > 0) {
					this.updateSelection(this.selectedIndex - 1);
				}
				break;

			case "Enter":
				this.confirmSelection();
				break;

			case "Escape":
				this.close();
				break;
		}
	}
}
