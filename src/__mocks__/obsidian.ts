/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export type App = any;

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

	onload(): void | Promise<void> {}
	onunload(): void {}
}

export class Modal {
	app: App;
	constructor(app: App) {
		this.app = app;
	}
	open(): void {}
	close(): void {}
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
	addText(_cb: (text: unknown) => unknown): this {
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
