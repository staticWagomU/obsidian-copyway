import type { CopyDestination } from "./types";

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
	async copy(
		_sourceContent: string,
		_sourceName: string,
		_destination: CopyDestination,
	): Promise<CopyResult> {
		// 実装は後のサブタスクで追加
		throw new Error("Not implemented");
	}
}
