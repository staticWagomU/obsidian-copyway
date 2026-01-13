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

	private handleKeyDown(event: KeyboardEvent): void {
		const { contentEl } = this;
		const items = contentEl.querySelectorAll(".destination-item");

		switch (event.key) {
			case "ArrowDown":
				if (this.selectedIndex < this.destinations.length - 1) {
					items[this.selectedIndex].classList.remove("is-selected");
					this.selectedIndex++;
					items[this.selectedIndex].classList.add("is-selected");
				}
				break;

			case "ArrowUp":
				if (this.selectedIndex > 0) {
					items[this.selectedIndex].classList.remove("is-selected");
					this.selectedIndex--;
					items[this.selectedIndex].classList.add("is-selected");
				}
				break;

			case "Enter":
				this.onSelect(this.destinations[this.selectedIndex]);
				this.close();
				break;

			case "Escape":
				this.close();
				break;
		}
	}
}
