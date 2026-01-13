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
}
