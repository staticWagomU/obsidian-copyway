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

	describe("ST-002: 設定画面の基本構造を実装（display()メソッド）", () => {
		test("displayメソッドがcontainerElをクリアしてから要素を追加する", () => {
			const settingTab = new CopywaySettingTab(mockApp, plugin);
			settingTab.containerEl = document.createElement("div");
			const existingParagraph = document.createElement("p");
			existingParagraph.textContent = "Existing content";
			settingTab.containerEl.appendChild(existingParagraph);

			settingTab.display();

			// empty()が呼ばれて既存のコンテンツが削除されたことを確認
			expect(settingTab.containerEl.querySelector("p")).toBeNull();
			// 新しい設定要素が追加されていることを確認
			expect(settingTab.containerEl.querySelector(".setting-item")).not.toBeNull();
		});

		test("displayメソッドが見出し設定を作成する", () => {
			const settingTab = new CopywaySettingTab(mockApp, plugin);
			settingTab.containerEl = document.createElement("div");

			settingTab.display();

			const headingSetting = settingTab.containerEl.querySelector(".setting-item");
			expect(headingSetting).not.toBeNull();
			expect(headingSetting?.classList.contains("setting-item-heading")).toBe(true);
		});
	});

	describe("ST-003: コピー先追加UI実装（Add destinationボタン）", () => {
		test("Add destinationボタンが表示される", () => {
			const settingTab = new CopywaySettingTab(mockApp, plugin);
			settingTab.containerEl = document.createElement("div");

			settingTab.display();

			const settings = settingTab.containerEl.querySelectorAll(".setting-item");
			// 見出しとAdd destinationボタンの2つの設定項目がある
			expect(settings.length).toBe(2);
		});

		test("Add destinationボタンをクリックすると新しいdestinationが追加される", () => {
			const settingTab = new CopywaySettingTab(mockApp, plugin);
			settingTab.containerEl = document.createElement("div");

			settingTab.display();

			expect(plugin.settings.destinations.length).toBe(0);

			// Add destinationボタンをクリック
			const addButton = settingTab.containerEl.querySelector("button");
			expect(addButton).not.toBeNull();
			addButton?.click();

			expect(plugin.settings.destinations.length).toBe(1);
			expect(plugin.settings.destinations[0]).toEqual({
				path: "",
				description: "",
				overwrite: false,
			});
		});
	});
});
