import type { CopyDestination } from "./types";

/**
 * Electron/Node.js 環境で require を使用するためのヘルパー
 * Vite のビルド時に外部化されないように動的に読み込む
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodeOs = typeof require !== "undefined" ? require("os") : null;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodeFs = typeof require !== "undefined" ? require("fs") : null;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodePath = typeof require !== "undefined" ? require("path") : null;

/**
 * ファイルシステム操作のインターフェース
 * テスト時にモック可能にするための抽象化
 */
export interface IFileSystem {
	directoryExists(path: string): Promise<boolean>;
	fileExists(path: string): Promise<boolean>;
	writeFile(path: string, content: string): Promise<void>;
}

/**
 * 本番環境用のファイルシステム実装
 * Node.js fs モジュールを使用して外部パスにアクセス
 */
export class NodeFileSystem implements IFileSystem {
	async directoryExists(path: string): Promise<boolean> {
		if (!nodeFs) {
			return false;
		}
		return new Promise((resolve) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			nodeFs.stat(path, (err: Error | null, stats: { isDirectory: () => boolean } | null) => {
				if (err || !stats) {
					resolve(false);
				} else {
					resolve(stats.isDirectory());
				}
			});
		});
	}

	async fileExists(path: string): Promise<boolean> {
		if (!nodeFs) {
			return false;
		}
		return new Promise((resolve) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			nodeFs.stat(path, (err: Error | null, stats: { isFile: () => boolean } | null) => {
				if (err || !stats) {
					resolve(false);
				} else {
					resolve(stats.isFile());
				}
			});
		});
	}

	async writeFile(path: string, content: string): Promise<void> {
		if (!nodeFs) {
			throw new Error("Node.js fs module not available");
		}
		return new Promise((resolve, reject) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			nodeFs.writeFile(path, content, "utf8", (err: Error | null) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}

/**
 * チルダ (~) をホームディレクトリに展開する
 * シェルの Tilde Expansion と同等の機能を提供
 */
export function expandTilde(path: string): string {
	if (!nodeOs) {
		return path;
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
	const homeDir = nodeOs.homedir() as string;
	if (path === "~") {
		return homeDir;
	}
	if (path.startsWith("~/")) {
		return homeDir + path.slice(1);
	}
	return path;
}

/**
 * パスを安全に結合する
 * Node.js の path.join を使用
 */
export function joinPath(base: string, ...paths: string[]): string {
	if (!nodePath) {
		// フォールバック: 単純な文字列結合
		return [base, ...paths].join("/");
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
	return nodePath.join(base, ...paths) as string;
}

/**
 * 拡張子を正規化する
 * ドットがない場合は先頭にドットを付与する
 */
export function normalizeExtension(extension: string | undefined): string | undefined {
	if (extension === undefined) {
		return undefined;
	}
	if (extension === "") {
		return "";
	}
	if (extension.startsWith(".")) {
		return extension;
	}
	return `.${extension}`;
}

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
	copyWithRename(
		sourceContent: string,
		sourceName: string,
		destination: CopyDestination,
	): Promise<CopyResult>;
	fileExists(destPath: string, fileName: string): Promise<boolean>;
}

/**
 * ファイルコピーサービス
 */
export class CopyService implements ICopyService {
	private fileSystem: IFileSystem;

	constructor(fileSystem?: IFileSystem) {
		this.fileSystem = fileSystem ?? new NodeFileSystem();
	}

	async copy(
		sourceContent: string,
		sourceName: string,
		destination: CopyDestination,
	): Promise<CopyResult> {
		try {
			// チルダ展開
			const destPath = expandTilde(destination.path);

			// ディレクトリ存在チェック
			const dirExists = await this.directoryExists(destPath);
			if (!dirExists) {
				return {
					success: false,
					error: "dir_not_found",
					message: `Directory not found: ${destPath}`,
				};
			}

			const targetPath = joinPath(destPath, sourceName);

			// ファイル存在チェック（Node.js fs を使用）
			const exists = await this.fileSystem.fileExists(targetPath);

			// 上書きモードが無効で、ファイルが既に存在する場合
			if (exists && !destination.overwrite) {
				return {
					success: false,
					error: "file_exists",
					message: `File already exists: ${sourceName}`,
				};
			}

			// ファイルを書き込み（Node.js fs を使用）
			await this.fileSystem.writeFile(targetPath, sourceContent);

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
			// チルダ展開
			const destPath = expandTilde(destination.path);

			// ディレクトリ存在チェック
			const dirExists = await this.directoryExists(destPath);
			if (!dirExists) {
				return {
					success: false,
					error: "dir_not_found",
					message: `Directory not found: ${destPath}`,
				};
			}

			const { baseName, extension } = this.splitFileName(sourceName);
			let counter = 0;
			let targetPath = joinPath(destPath, sourceName);

			// 利用可能なファイル名を見つけるまでループ（Node.js fs を使用）
			while (await this.fileSystem.fileExists(targetPath)) {
				counter++;
				const newFileName = `${baseName}_${counter}${extension}`;
				targetPath = joinPath(destPath, newFileName);
			}

			// ファイルを書き込み（Node.js fs を使用）
			await this.fileSystem.writeFile(targetPath, sourceContent);

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
	 * 依存性注入されたファイルシステム実装を使用
	 */
	private async directoryExists(dirPath: string): Promise<boolean> {
		return this.fileSystem.directoryExists(dirPath);
	}

	/**
	 * ファイルが存在するかチェック
	 * コマンドからの呼び出し用に公開
	 */
	async fileExists(destPath: string, fileName: string): Promise<boolean> {
		const expandedPath = expandTilde(destPath);
		const targetPath = joinPath(expandedPath, fileName);
		return this.fileSystem.fileExists(targetPath);
	}
}
