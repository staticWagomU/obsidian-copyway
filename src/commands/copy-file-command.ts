import type { App, Notice } from "obsidian";
import type { CopyDestination } from "../types";
import type { ICopyService, CopyResult } from "../copy-service";
import { DestinationModal } from "../destination-modal";
import { OverwriteModal } from "../overwrite-modal";
import type { OverwriteResult } from "../overwrite-modal";

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

		// ファイル内容の読み込み
		const content = await this.app.vault.read(activeFile);

		// コピー先が1件の場合は直接コピー
		if (destinations.length === 1) {
			const destination = destinations[0];
			if (destination) {
				await this.performCopy(content, activeFile.name, destination);
			}
			return;
		}

		// コピー先が2件以上の場合はモーダルで選択
		await this.showDestinationModal(content, activeFile.name, destinations);
	}

	private async showDestinationModal(
		content: string,
		fileName: string,
		destinations: CopyDestination[],
	): Promise<void> {
		return new Promise<void>((resolve) => {
			const modal = new DestinationModal(
				this.app,
				destinations,
				(selectedDestination) => {
					void this.performCopy(content, fileName, selectedDestination).then(() => {
						resolve();
					});
				},
			);
			modal.open();
		});
	}

	private async performCopy(
		content: string,
		fileName: string,
		destination: CopyDestination,
	): Promise<void> {
		// overwrite=trueの場合は直接コピー
		if (destination.overwrite) {
			const result = await this.copyService.copy(content, fileName, destination);
			this.handleCopyResult(result, fileName, destination);
			return;
		}

		// overwrite=falseの場合、ファイル存在チェック
		const exists = await this.copyService.fileExists(destination.path, fileName);

		if (!exists) {
			// ファイルが存在しない場合は直接コピー
			const result = await this.copyService.copy(content, fileName, destination);
			this.handleCopyResult(result, fileName, destination);
			return;
		}

		// ファイルが存在する場合はOverwriteModalを表示
		await this.showOverwriteModal(content, fileName, destination);
	}

	private async showOverwriteModal(
		content: string,
		fileName: string,
		destination: CopyDestination,
	): Promise<void> {
		return new Promise<void>((resolve) => {
			const modal = new OverwriteModal(
				this.app,
				fileName,
				(result: OverwriteResult) => {
					if (result === "cancel") {
						resolve();
						return;
					}

					if (result === "overwrite") {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						void this.copyService.copy(content, fileName, destination).then((copyResult: any) => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
							this.handleCopyResult(copyResult, fileName, destination, true);
							resolve();
						});
					} else if (result === "rename") {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						void this.copyService.copyWithRename(content, fileName, destination).then((copyResult: any) => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
							this.handleCopyResult(copyResult, fileName, destination, false, true);
							resolve();
						});
					}
				},
			);
			modal.open();
		});
	}

	private handleCopyResult(
		result: CopyResult,
		fileName: string,
		destination: CopyDestination,
		isOverwrite = false,
		isRename = false,
	): void {
		if (result.success) {
			// 成功通知（3パターン）
			if (isRename) {
				const newFileName = result.path.split("/").pop() || fileName;
				this.notice(
					`Copied as "${newFileName}" to "${destination.description}"`,
				);
			} else if (isOverwrite) {
				this.notice(`Overwrote "${fileName}" in "${destination.description}"`);
			} else {
				this.notice(`Copied "${fileName}" to "${destination.description}"`);
			}
		} else {
			// エラー通知（5パターン）
			if (result.error === "dir_not_found") {
				this.notice(`Destination folder does not exist: ${destination.path}`);
			} else if (result.error === "io_error") {
				// I/Oエラーと権限エラーを区別
				if (
					result.message.includes("Permission") ||
					result.message.includes("EACCES")
				) {
					this.notice(`Permission denied: ${destination.path}`);
				} else {
					this.notice(`Failed to copy file: ${result.message}`);
				}
			}
		}
	}
}
