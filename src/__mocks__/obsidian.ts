/* eslint-disable @typescript-eslint/no-explicit-any */
export type App = any;

/**
 * ファイルの統計情報
 */
export interface FileStats {
	type: "file" | "folder";
	ctime: number;
	mtime: number;
	size: number;
}

/**
 * Vault Adapterのモック実装
 * ファイルシステムをメモリ上で管理する
 */
export class DataAdapter {
	private files: Map<string, string> = new Map();
	private stats: Map<string, FileStats> = new Map();

	async exists(path: string): Promise<boolean> {
		return this.files.has(path);
	}

	async write(path: string, data: string): Promise<void> {
		const now = Date.now();

		// 親ディレクトリを自動作成
		const dirPath = path.substring(0, path.lastIndexOf("/"));
		if (dirPath && !this.stats.has(dirPath)) {
			this.stats.set(dirPath, {
				type: "folder",
				ctime: now,
				mtime: now,
				size: 0,
			});
		}

		this.files.set(path, data);

		const existingStats = this.stats.get(path);
		this.stats.set(path, {
			type: "file",
			ctime: existingStats?.ctime ?? now,
			mtime: now,
			size: data.length,
		});
	}

	async read(path: string): Promise<string> {
		const content = this.files.get(path);
		if (content === undefined) {
			throw new Error(`ENOENT: no such file or directory, open '${path}'`);
		}
		return content;
	}

	async stat(path: string): Promise<FileStats | null> {
		return this.stats.get(path) ?? null;
	}
}

/**
 * Vaultのモック実装
 */
export class Vault {
	adapter: DataAdapter;

	constructor() {
		this.adapter = new DataAdapter();
	}
}

export class Plugin {
	app: App;
	manifest: unknown;

	constructor(app: App, manifest: unknown) {
		this.app = app;
		this.manifest = manifest;
	}

	async loadData(): Promise<unknown> {
		return {};
	}

	async saveData(_data: unknown): Promise<void> {}

	addSettingTab(_settingTab: PluginSettingTab): void {}

	onload(): void | Promise<void> {}
	onunload(): void {}
}

export class Modal {
	app: App;
	contentEl: HTMLElement;
	constructor(app: App) {
		this.app = app;
		this.contentEl = document.createElement("div");
	}
	open(): void {
		this.onOpen();
	}
	close(): void {
		this.onClose();
	}
	onOpen(): void {}
	onClose(): void {}
}

export class Notice {
	constructor(_message: string) {}
}

export class PluginSettingTab {
	app: App;
	plugin: Plugin;
	containerEl: HTMLElement;
	constructor(app: App, plugin: Plugin) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = document.createElement("div");
	}
	display(): void {}
	hide(): void {}
}

export class MarkdownView {}

export class ButtonComponent {
	buttonEl: HTMLButtonElement;
	constructor() {
		this.buttonEl = document.createElement("button");
	}
	setButtonText(text: string): this {
		this.buttonEl.textContent = text;
		return this;
	}
	setWarning(): this {
		this.buttonEl.classList.add("mod-warning");
		return this;
	}
	onClick(callback: () => void): this {
		this.buttonEl.addEventListener("click", callback);
		return this;
	}
}

export class TextComponent {
	inputEl: HTMLInputElement;
	constructor() {
		this.inputEl = document.createElement("input");
		this.inputEl.type = "text";
	}
	setPlaceholder(placeholder: string): this {
		this.inputEl.placeholder = placeholder;
		return this;
	}
	setValue(value: string): this {
		this.inputEl.value = value;
		return this;
	}
	onChange(callback: (value: string) => void): this {
		this.inputEl.addEventListener("input", (e) => {
			callback((e.target as HTMLInputElement).value);
		});
		return this;
	}
}

export class ToggleComponent {
	toggleEl: HTMLElement;
	checkboxEl: HTMLInputElement;
	private value: boolean;
	constructor() {
		this.value = false;
		this.toggleEl = document.createElement("div");
		this.toggleEl.classList.add("checkbox-container");
		this.checkboxEl = document.createElement("input");
		this.checkboxEl.type = "checkbox";
		this.toggleEl.appendChild(this.checkboxEl);
	}
	setValue(value: boolean): this {
		this.value = value;
		this.checkboxEl.checked = value;
		return this;
	}
	onChange(callback: (value: boolean) => void): this {
		this.toggleEl.addEventListener("click", () => {
			this.value = !this.value;
			this.checkboxEl.checked = this.value;
			callback(this.value);
		});
		return this;
	}
}

export class Setting {
	settingEl: HTMLElement;
	constructor(containerEl: HTMLElement) {
		this.settingEl = document.createElement("div");
		this.settingEl.classList.add("setting-item");
		containerEl.appendChild(this.settingEl);
	}
	setName(_name: string): this {
		return this;
	}
	setDesc(_desc: string): this {
		return this;
	}
	setHeading(): this {
		this.settingEl.classList.add("setting-item-heading");
		return this;
	}
	addText(cb: (text: TextComponent) => void): this {
		const text = new TextComponent();
		cb(text);
		this.settingEl.appendChild(text.inputEl);
		return this;
	}
	addToggle(cb: (toggle: ToggleComponent) => void): this {
		const toggle = new ToggleComponent();
		cb(toggle);
		this.settingEl.appendChild(toggle.toggleEl);
		return this;
	}
	addButton(cb: (button: ButtonComponent) => void): this {
		const button = new ButtonComponent();
		cb(button);
		this.settingEl.appendChild(button.buttonEl);
		return this;
	}
}

// Extend HTMLElement with Obsidian-specific methods
declare global {
	interface HTMLElement {
		empty(): void;
		createEl<K extends keyof HTMLElementTagNameMap>(
			tag: K,
			o?: string | { text?: string; cls?: string },
		): HTMLElementTagNameMap[K];
	}
}

// Add methods to HTMLElement prototype
if (typeof HTMLElement !== "undefined") {
	HTMLElement.prototype.empty = function () {
		this.innerHTML = "";
	};

	HTMLElement.prototype.createEl = function (tag, o) {
		const el = document.createElement(tag);
		if (typeof o === "string") {
			el.textContent = o;
		} else if (o) {
			if (o.text) el.textContent = o.text;
			if (o.cls) el.className = o.cls;
		}
		this.appendChild(el);
		return el;
	};
}
