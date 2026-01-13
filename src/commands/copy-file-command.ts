import type { App, TFile, Notice } from "obsidian";
import type { CopyDestination } from "../types";
import type { ICopyService } from "../copy-service";

/**
 * ファイルコピーコマンド
 */
export class CopyFileCommand {
	constructor(
		private app: App,
		private copyService: ICopyService,
		private getDestinations: () => CopyDestination[],
		private notice: (message: string) => Notice,
	) {}

	async execute(): Promise<void> {
		// アクティブファイルの取得
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			this.notice("No active file to copy");
			return;
		}

		// コピー先の取得
		const destinations = this.getDestinations();
		if (destinations.length === 0) {
			this.notice(
				"No copy destinations configured. Please add destinations in settings.",
			);
			return;
		}
	}
}
