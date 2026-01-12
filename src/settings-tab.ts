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

		// 既存のdestinationを表示
		for (let i = 0; i < this.plugin.settings.destinations.length; i++) {
			const dest = this.plugin.settings.destinations[i];
			if (!dest) continue;

			new Setting(containerEl)
				.setName(`Destination ${i + 1}`)
				.addText((text) => {
					text
						.setPlaceholder("Path")
						.setValue(dest.path)
						.onChange((value) => {
							const d = this.plugin.settings.destinations[i];
							if (d) d.path = value;
						});
				})
				.addText((text) => {
					text
						.setPlaceholder("Description")
						.setValue(dest.description)
						.onChange((value) => {
							const d = this.plugin.settings.destinations[i];
							if (d) d.description = value;
						});
				})
				.addToggle((toggle) => {
					toggle.setValue(dest.overwrite).onChange((value) => {
						const d = this.plugin.settings.destinations[i];
						if (d) d.overwrite = value;
					});
				})
				.addButton((button) => {
					button
						.setButtonText("Delete")
						.setWarning()
						.onClick(() => {
							this.plugin.settings.destinations.splice(i, 1);
							this.display();
						});
				});
		}

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
