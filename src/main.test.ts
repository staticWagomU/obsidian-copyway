import { describe, expect, test, beforeEach, vi } from "vitest";
import CopywayPlugin from "./main";
import type { App } from "obsidian";

// Obsidian APIのモック
const createMockApp = (): App => {
	return {
		vault: {},
		workspace: {},
	} as App;
};

describe("CopywayPlugin", () => {
	let plugin: CopywayPlugin;
	let mockApp: App;

	beforeEach(() => {
		mockApp = createMockApp();
		plugin = new CopywayPlugin(mockApp, {
			id: "copyway",
			name: "Copyway",
			author: "Test Author",
			version: "1.0.0",
			minAppVersion: "0.15.0",
			description: "Test plugin",
			dir: "",
		});
	});

	describe("プラグインのライフサイクル", () => {
		test("プラグインがPluginクラスを継承している", () => {
			expect(plugin).toBeDefined();
			expect(typeof plugin.onload).toBe("function");
			expect(typeof plugin.onunload).toBe("function");
		});

		test("onloadメソッドが存在する", () => {
			expect(plugin.onload).toBeDefined();
			expect(typeof plugin.onload).toBe("function");
		});

		test("onunloadメソッドが存在する", () => {
			expect(plugin.onunload).toBeDefined();
			expect(typeof plugin.onunload).toBe("function");
		});
	});

	describe("設定の読み込み", () => {
		test("loadSettingsメソッドが存在する", () => {
			expect(plugin.loadSettings).toBeDefined();
			expect(typeof plugin.loadSettings).toBe("function");
		});

		test("loadSettingsがデータがない場合はデフォルト設定を返す", async () => {
			// loadDataがnullを返す場合
			vi.spyOn(plugin, "loadData").mockResolvedValue(null);

			await plugin.loadSettings();

			expect(plugin.settings).toEqual({
				destinations: [],
			});
		});

		test("loadSettingsが保存されたデータを読み込む", async () => {
			const savedData = {
				destinations: [
					{
						path: "/test/path",
						description: "Test destination",
						overwrite: false,
					},
				],
			};
			vi.spyOn(plugin, "loadData").mockResolvedValue(savedData);

			await plugin.loadSettings();

			expect(plugin.settings).toEqual(savedData);
		});

		test("loadSettingsが部分的なデータをマージする", async () => {
			// destinations以外のフィールドがない場合
			const partialData = {
				destinations: [
					{
						path: "/partial/path",
						description: "Partial destination",
						overwrite: true,
					},
				],
			};
			vi.spyOn(plugin, "loadData").mockResolvedValue(partialData);

			await plugin.loadSettings();

			expect(plugin.settings).toEqual({
				destinations: [
					{
						path: "/partial/path",
						description: "Partial destination",
						overwrite: true,
					},
				],
			});
		});
	});

	describe("設定の保存", () => {
		test("saveSettingsメソッドが存在する", () => {
			expect(plugin.saveSettings).toBeDefined();
			expect(typeof plugin.saveSettings).toBe("function");
		});

		test("saveSettingsが現在の設定を保存する", async () => {
			plugin.settings = {
				destinations: [
					{
						path: "/save/path",
						description: "Save test",
						overwrite: false,
					},
				],
			};

			const saveDataSpy = vi.spyOn(plugin, "saveData").mockResolvedValue();

			await plugin.saveSettings();

			expect(saveDataSpy).toHaveBeenCalledWith({
				destinations: [
					{
						path: "/save/path",
						description: "Save test",
						overwrite: false,
					},
				],
			});
		});

		test("saveSettingsが空の設定を保存する", async () => {
			plugin.settings = {
				destinations: [],
			};

			const saveDataSpy = vi.spyOn(plugin, "saveData").mockResolvedValue();

			await plugin.saveSettings();

			expect(saveDataSpy).toHaveBeenCalledWith({
				destinations: [],
			});
		});
	});
});
