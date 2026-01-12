import { Plugin } from "obsidian";
import type { CopywaySettings } from "./types";

/**
 * Copywayプラグインのメインクラス
 */
export default class CopywayPlugin extends Plugin {
	settings: CopywaySettings;

	async onload() {
		// プラグインの初期化処理
		console.log("Loading Copyway plugin");
	}

	onunload() {
		// プラグインのクリーンアップ処理
		console.log("Unloading Copyway plugin");
	}
}
