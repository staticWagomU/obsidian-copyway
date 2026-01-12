import { App, PluginSettingTab } from "obsidian";
import type CopywayPlugin from "./main";

/**
 * Copywayプラグインの設定タブ
 */
export class CopywaySettingTab extends PluginSettingTab {
	plugin: CopywayPlugin;

	constructor(app: App, plugin: CopywayPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		// 設定画面を表示する処理（後続のサブタスクで実装）
	}
}
