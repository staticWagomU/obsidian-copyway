import { Modal } from "obsidian";
import type { App } from "obsidian";
import type { CopyDestination } from "./types";

/**
 * コピー先を選択するモーダル
 */
export class DestinationModal extends Modal {
	private destinations: CopyDestination[];
	private onSelect: (destination: CopyDestination) => void;

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
		// 実装は後のタスクで追加
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
