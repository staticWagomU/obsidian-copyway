/**
 * コピー先の設定を表す型
 */
export interface CopyDestination {
	/** コピー先のパス */
	path: string;
	/** コピー先の説明 */
	description: string;
	/** 上書きを許可するかどうか */
	overwrite: boolean;
}
