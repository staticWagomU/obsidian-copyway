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

		await this.vault.adapter.write(targetPath, sourceContent);

		return {
			success: true,
			path: targetPath,
		};
	}
}
