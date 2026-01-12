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
});
