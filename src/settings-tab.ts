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

		new Setting(containerEl)
			.setName("Add destination")
			.setDesc("Add a new copy destination")
			.addButton((button) => {
				button.setButtonText("Add").onClick(() => {
					this.plugin.settings.destinations.push({
						path: "",
						description: "",
						overwrite: false,
					});
					this.display();
				});
			});
	}
}
