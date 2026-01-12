import { vi } from "vitest";

export class Plugin {
	app: unknown;
	manifest: unknown;

	constructor(app: unknown, manifest: unknown) {
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
	app: unknown;
	constructor(app: unknown) {
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
	app: unknown;
	plugin: unknown;
	constructor(app: unknown, plugin: unknown) {
		this.app = app;
		this.plugin = plugin;
	}
	display(): void {}
	hide(): void {}
}

export class MarkdownView {}

export class Setting {
	constructor(_containerEl: HTMLElement) {}
	setName(_name: string): this {
		return this;
	}
	setDesc(_desc: string): this {
		return this;
	}
	addText(_cb: (text: unknown) => unknown): this {
		return this;
	}
}
