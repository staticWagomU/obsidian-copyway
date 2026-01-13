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
		// 実装は後のサブタスクで追加
	}
}
