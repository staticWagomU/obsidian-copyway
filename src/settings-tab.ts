import { App, PluginSettingTab, Setting } from "obsidian";
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
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl).setName("Copy destinations").setHeading();
	}
}
