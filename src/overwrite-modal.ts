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

		// Overwriteボタン
		const overwriteBtn = contentEl.createEl("button", {
			text: "Overwrite",
		});
		overwriteBtn.addEventListener("click", () => {
			this.handleResult("overwrite");
		});

		// Renameボタン
		const renameBtn = contentEl.createEl("button", {
			text: "Rename",
		});
		renameBtn.addEventListener("click", () => {
			this.handleResult("rename");
		});

		// Cancelボタン
		const cancelBtn = contentEl.createEl("button", {
			text: "Cancel",
		});
		cancelBtn.addEventListener("click", () => {
			this.handleResult("cancel");
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}

	private handleResult(result: OverwriteResult): void {
		this.onResult(result);
		this.close();
	}
}
