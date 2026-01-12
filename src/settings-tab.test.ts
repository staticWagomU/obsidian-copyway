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

	describe("ST-004: コピー先編集UI実装（パス、ディスクリプション、上書きトグル）", () => {
		test("destinationが存在する場合、編集UIが表示される", () => {
			plugin.settings.destinations = [
				{ path: "folder1", description: "First destination", overwrite: true },
			];

			const settingTab = new CopywaySettingTab(mockApp, plugin);
			settingTab.containerEl = document.createElement("div");

			settingTab.display();

			// 見出し + Add destination + destination編集 = 3つの設定項目
			const settings = settingTab.containerEl.querySelectorAll(".setting-item");
			expect(settings.length).toBe(3);
		});

		test("pathテキスト入力が機能する", () => {
			plugin.settings.destinations = [
				{ path: "", description: "", overwrite: false },
			];

			const settingTab = new CopywaySettingTab(mockApp, plugin);
			settingTab.containerEl = document.createElement("div");

			settingTab.display();

			const inputs = settingTab.containerEl.querySelectorAll("input[type='text']");
			expect(inputs.length).toBeGreaterThanOrEqual(1);

			// pathフィールドに値を入力
			const pathInput = inputs[0] as HTMLInputElement;
			pathInput.value = "test/path";
			pathInput.dispatchEvent(new Event("input", { bubbles: true }));

			expect(plugin.settings.destinations[0]?.path).toBe("test/path");
		});

		test("descriptionテキスト入力が機能する", () => {
			plugin.settings.destinations = [
				{ path: "", description: "", overwrite: false },
			];

			const settingTab = new CopywaySettingTab(mockApp, plugin);
			settingTab.containerEl = document.createElement("div");

			settingTab.display();

			const inputs = settingTab.containerEl.querySelectorAll("input[type='text']");
			expect(inputs.length).toBeGreaterThanOrEqual(2);

			// descriptionフィールドに値を入力
			const descInput = inputs[1] as HTMLInputElement;
			descInput.value = "Test description";
			descInput.dispatchEvent(new Event("input", { bubbles: true }));

			expect(plugin.settings.destinations[0]?.description).toBe(
				"Test description",
			);
		});

		test("overwriteトグルが機能する", () => {
			plugin.settings.destinations = [
				{ path: "", description: "", overwrite: false },
			];

			const settingTab = new CopywaySettingTab(mockApp, plugin);
			settingTab.containerEl = document.createElement("div");

			settingTab.display();

			const toggle = settingTab.containerEl.querySelector(".checkbox-container");
			expect(toggle).not.toBeNull();

			// トグルをクリック
			toggle?.dispatchEvent(new Event("click", { bubbles: true }));

			expect(plugin.settings.destinations[0]?.overwrite).toBe(true);
		});
	});

	describe("ST-005: コピー先削除UI実装（削除ボタン）", () => {
		test("destination編集UIに削除ボタンが表示される", () => {
			plugin.settings.destinations = [
				{ path: "test", description: "Test", overwrite: false },
			];

			const settingTab = new CopywaySettingTab(mockApp, plugin);
			settingTab.containerEl = document.createElement("div");

			settingTab.display();

			// 削除ボタンが存在する（Add destinationボタンと削除ボタン）
			const buttons = settingTab.containerEl.querySelectorAll("button");
			expect(buttons.length).toBeGreaterThanOrEqual(2);
		});

		test("削除ボタンをクリックするとdestinationが削除される", () => {
			plugin.settings.destinations = [
				{ path: "test1", description: "Test1", overwrite: false },
				{ path: "test2", description: "Test2", overwrite: true },
			];

			const settingTab = new CopywaySettingTab(mockApp, plugin);
			settingTab.containerEl = document.createElement("div");

			settingTab.display();

			expect(plugin.settings.destinations.length).toBe(2);

			// すべてのボタンを取得（最後のボタンはAdd destination）
			const buttons = Array.from(settingTab.containerEl.querySelectorAll("button"));
			// 最初のdestinationの削除ボタンをクリック（最初のボタン）
			const firstDeleteButton = buttons[0];
			expect(firstDeleteButton).toBeDefined();
			firstDeleteButton?.click();

			// 削除後は1つになる
			expect(plugin.settings.destinations.length).toBe(1);
			expect(plugin.settings.destinations[0]?.path).toBe("test2");
		});
	});

	describe("ST-007: 設定永続化の統合テスト（saveSettings呼び出し確認）", () => {
		test("destination追加後にsaveSettingsが呼ばれる", async () => {
			const saveSettingsSpy = vi.spyOn(plugin, "saveSettings");

			const settingTab = new CopywaySettingTab(mockApp, plugin);
			settingTab.containerEl = document.createElement("div");

			settingTab.display();

			// Add destinationボタンをクリック
			const addButton = settingTab.containerEl.querySelector("button");
			addButton?.click();

			// saveSettingsが呼ばれることを確認
			// display()内で非同期処理は行わないため、即座にチェック可能
			await vi.waitFor(() => {
				expect(saveSettingsSpy).toHaveBeenCalled();
			});
		});
	});
});
