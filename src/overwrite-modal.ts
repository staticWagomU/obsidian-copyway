import { Modal } from "obsidian";
import type { App } from "obsidian";

export type OverwriteResult = "overwrite" | "rename" | "cancel";

/**
 * 上書き確認モーダル
 */
export class OverwriteModal extends Modal {
	private filename: string;
	private onResult: (result: OverwriteResult) => void;

	constructor(
		app: App,
		filename: string,
		onResult: (result: OverwriteResult) => void,
	) {
		super(app);
		this.filename = filename;
		this.onResult = onResult;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		// メッセージを表示
		contentEl.createEl("p", {
			text: `File "${this.filename}" already exists.`,
		});

		// ボタンを作成
		this.createButton(contentEl, "Overwrite", "overwrite");
		this.createButton(contentEl, "Rename", "rename");
		this.createButton(contentEl, "Cancel", "cancel");
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}

	private createButton(
		container: HTMLElement,
		label: string,
		result: OverwriteResult,
	): void {
		const button = container.createEl("button", { text: label });
		button.addEventListener("click", () => {
			this.handleResult(result);
		});
	}

	private handleResult(result: OverwriteResult): void {
		this.onResult(result);
		this.close();
	}
}
