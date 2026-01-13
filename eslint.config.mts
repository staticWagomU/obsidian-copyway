import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import { globalIgnores } from "eslint/config";

// eslint-plugin-obsidianmd のみを有効化
// 一般的なルール（no-unused-vars等）は Oxlint で実行
export default tseslint.config(
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'eslint.config.mts',
						'manifest.json',
						'scrum.ts'
					]
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json']
			},
		},
	},
	...obsidianmd.configs.recommended,
	{
		// Oxlint に任せるルールを無効化（obsidianmd.configs.recommended の後に適用）
		// Obsidian は Electron 環境で動作するため Node.js モジュールは使用可能
		rules: {
			"no-undef": "off",
			"no-console": "off",
			"import/no-nodejs-modules": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
		},
	},
	globalIgnores([
		"node_modules",
		"dist",
		"vite.config.ts",
		"version-bump.mjs",
		"versions.json",
		"main.js",
	]),
);
