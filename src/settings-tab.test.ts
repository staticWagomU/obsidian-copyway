import { describe, test, expect, beforeEach, vi } from "vitest";
import { App, PluginSettingTab } from "obsidian";
import CopywayPlugin from "./main";
import { CopywaySettingTab } from "./settings-tab";

describe("CopywaySettingTab", () => {
	let plugin: CopywayPlugin;
	let mockApp: App;

	beforeEach(() => {
		mockApp = {
			vault: {
				adapter: {
					list: vi.fn(),
				},
			},
		} as unknown as App;
		plugin = new CopywayPlugin(mockApp, {
			id: "copyway",
			name: "Copyway",
			author: "test",
			version: "1.0.0",
			minAppVersion: "1.0.0",
			description: "Test plugin",
		} as never);
		plugin.settings = { destinations: [] };
	});

	describe("ST-001: CopywaySettingTabクラスの型定義とモック準備", () => {
		test("CopywaySettingTabがPluginSettingTabを継承している", () => {
			const settingTab = new CopywaySettingTab(mockApp, plugin);
			expect(settingTab).toBeInstanceOf(PluginSettingTab);
		});

		test("CopywaySettingTabがappとpluginプロパティを持つ", () => {
			const settingTab = new CopywaySettingTab(mockApp, plugin);
			expect(settingTab.app).toBe(mockApp);
			expect(settingTab.plugin).toBe(plugin);
		});

		test("CopywaySettingTabがdisplayメソッドを持つ", () => {
			const settingTab = new CopywaySettingTab(mockApp, plugin);
			expect(typeof settingTab.display).toBe("function");
		});
	});
});
