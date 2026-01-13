import type { CopyDestination } from "./types";
import type { Vault } from "obsidian";

/**
 * コピー成功時の結果型
 */
export interface CopySuccess {
	success: true;
	path: string;
}

/**
 * コピーエラーの種類
 */
export type CopyErrorType = "file_exists" | "dir_not_found" | "io_error";

/**
 * コピー失敗時の結果型
 */
export interface CopyFailure {
	success: false;
	error: CopyErrorType;
	message: string;
}

/**
 * コピー結果の型
 */
export type CopyResult = CopySuccess | CopyFailure;

/**
 * CopyServiceのインターフェース
 */
export interface ICopyService {
	copy(
		sourceContent: string,
		sourceName: string,
		destination: CopyDestination,
	): Promise<CopyResult>;
}

/**
 * ファイルコピーサービス
 */
export class CopyService implements ICopyService {
	constructor(private vault: Vault) {}

	async copy(
		sourceContent: string,
		sourceName: string,
		destination: CopyDestination,
	): Promise<CopyResult> {
		try {
			// ディレクトリ存在チェック
			const dirExists = await this.directoryExists(destination.path);
			if (!dirExists) {
				return {
					success: false,
					error: "dir_not_found",
					message: `Directory not found: ${destination.path}`,
				};
			}

			const targetPath = `${destination.path}/${sourceName}`;

			// ファイル存在チェック
			const exists = await this.vault.adapter.exists(targetPath);

			// 上書きモードが無効で、ファイルが既に存在する場合
			if (exists && !destination.overwrite) {
				return {
					success: false,
					error: "file_exists",
					message: `File already exists: ${sourceName}`,
				};
			}

			// ファイルを書き込み（上書きモードが有効な場合、または新規ファイルの場合）
			await this.vault.adapter.write(targetPath, sourceContent);

			return {
				success: true,
				path: targetPath,
			};
		} catch (error) {
			return {
				success: false,
				error: "io_error",
				message: `I/O error: ${error instanceof Error ? error.message : String(error)}`,
			};
		}
	}

	/**
	 * リネームモードでファイルをコピー
	 * 同名ファイルが存在する場合、連番（_1, _2, ...）を付与してコピーする
	 */
	async copyWithRename(
		sourceContent: string,
		sourceName: string,
		destination: CopyDestination,
	): Promise<CopyResult> {
		try {
			// ディレクトリ存在チェック
			const dirExists = await this.directoryExists(destination.path);
			if (!dirExists) {
				return {
					success: false,
					error: "dir_not_found",
					message: `Directory not found: ${destination.path}`,
				};
			}

			const { baseName, extension } = this.splitFileName(sourceName);
			let counter = 0;
			let targetPath = `${destination.path}/${sourceName}`;

			// 利用可能なファイル名を見つけるまでループ
			while (await this.vault.adapter.exists(targetPath)) {
				counter++;
				const newFileName = `${baseName}_${counter}${extension}`;
				targetPath = `${destination.path}/${newFileName}`;
			}

			// ファイルを書き込み
			await this.vault.adapter.write(targetPath, sourceContent);

			return {
				success: true,
				path: targetPath,
			};
		} catch (error) {
			return {
				success: false,
				error: "io_error",
				message: `I/O error: ${error instanceof Error ? error.message : String(error)}`,
			};
		}
	}

	/**
	 * ファイル名を基本名と拡張子に分割する
	 * 例: "file.md" -> { baseName: "file", extension: ".md" }
	 * 例: "file.test.md" -> { baseName: "file.test", extension: ".md" }
	 */
	private splitFileName(fileName: string): {
		baseName: string;
		extension: string;
	} {
		const lastDotIndex = fileName.lastIndexOf(".");
		if (lastDotIndex === -1) {
			return { baseName: fileName, extension: "" };
		}
		return {
			baseName: fileName.slice(0, lastDotIndex),
			extension: fileName.slice(lastDotIndex),
		};
	}

	/**
	 * ディレクトリが存在するかチェック
	 * Obsidianのvault.adapterでは、ディレクトリ内にファイルがあればディレクトリも存在する
	 */
	private async directoryExists(dirPath: string): Promise<boolean> {
		// stat()を使ってディレクトリの存在を確認
		const stats = await this.vault.adapter.stat(dirPath);

		// statsがnullの場合、ディレクトリは存在しない
		// （初回ファイル書き込み時にディレクトリが自動作成されるため）
		return stats !== null;
	}
}
