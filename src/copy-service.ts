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
}
