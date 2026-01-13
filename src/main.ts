import { Notice, Plugin } from "obsidian";
import type { CopywaySettings } from "./types";
import { CopywaySettingTab } from "./settings-tab";
import { CopyFileCommand } from "./commands/copy-file-command";
import { CopyService } from "./copy-service";

/**
 * デフォルト設定
 */
const DEFAULT_SETTINGS: CopywaySettings = {
	destinations: [],
};

/**
 * Copywayプラグインのメインクラス
 */
export default class CopywayPlugin extends Plugin {
	settings: CopywaySettings;

	async onload() {
		// プラグインの初期化処理
		console.log("Loading Copyway plugin");

		await this.loadSettings();

		// 設定タブを追加
		this.addSettingTab(new CopywaySettingTab(this.app, this));

		// コピーコマンドのコールバックを共通化
		const copyFileCallback = async () => {
			const copyService = new CopyService();
			const command = new CopyFileCommand(
				this.app,
				copyService,
				() => this.settings.destinations,
				(message: string) => new Notice(message),
			);
			await command.execute();
		};

		// コピーコマンドを登録
		this.addCommand({
			id: "copy-file",
			name: "Copy file to destination",
			callback: copyFileCallback,
		});

		// リボンにコピーコマンドのアイコンを追加
		this.addRibbonIcon("copy", "Copy file to destination", copyFileCallback);
	}

	onunload() {
		// プラグインのクリーンアップ処理
		console.log("Unloading Copyway plugin");
	}

	/**
	 * 設定を読み込む
	 */
	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<CopywaySettings>,
		);
	}

	/**
	 * 設定を保存する
	 */
	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
