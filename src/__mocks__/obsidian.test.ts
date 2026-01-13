import { describe, it, expect, beforeEach } from "vitest";
import { App, Vault, DataAdapter, FileStats } from "obsidian";

describe("Obsidian Mock - Vault Adapter", () => {
	let app: App;
	let vault: Vault;
	let adapter: DataAdapter;

	beforeEach(() => {
		app = {} as App;
		vault = new Vault();
		adapter = vault.adapter;
	});

	describe("exists", () => {
		it("存在しないパスに対してfalseを返す", async () => {
			const exists = await adapter.exists("nonexistent.md");
			expect(exists).toBe(false);
		});

		it("書き込み後のパスに対してtrueを返す", async () => {
			await adapter.write("test.md", "content");
			const exists = await adapter.exists("test.md");
			expect(exists).toBe(true);
		});
	});

	describe("write", () => {
		it("ファイルを書き込める", async () => {
			await adapter.write("test.md", "Hello World");
			const exists = await adapter.exists("test.md");
			expect(exists).toBe(true);
		});

		it("上書き書き込みができる", async () => {
			await adapter.write("test.md", "First");
			await adapter.write("test.md", "Second");
			const content = await adapter.read("test.md");
			expect(content).toBe("Second");
		});
	});

	describe("read", () => {
		it("書き込んだファイルを読み込める", async () => {
			await adapter.write("test.md", "Hello World");
			const content = await adapter.read("test.md");
			expect(content).toBe("Hello World");
		});

		it("存在しないファイルを読むとエラーが発生する", async () => {
			await expect(adapter.read("nonexistent.md")).rejects.toThrow();
		});
	});

	describe("stat", () => {
		it("存在するファイルの情報を返す", async () => {
			await adapter.write("test.md", "Hello");
			const stats = await adapter.stat("test.md");
			expect(stats).toBeDefined();
			expect(stats?.type).toBe("file");
			expect(stats?.size).toBe(5);
			expect(stats?.ctime).toBeGreaterThan(0);
			expect(stats?.mtime).toBeGreaterThan(0);
		});

		it("存在しないファイルに対してnullを返す", async () => {
			const stats = await adapter.stat("nonexistent.md");
			expect(stats).toBeNull();
		});
	});

	describe("ファイルシステムの状態管理", () => {
		it("複数のファイルを同時に管理できる", async () => {
			await adapter.write("file1.md", "Content 1");
			await adapter.write("file2.md", "Content 2");

			expect(await adapter.exists("file1.md")).toBe(true);
			expect(await adapter.exists("file2.md")).toBe(true);
			expect(await adapter.read("file1.md")).toBe("Content 1");
			expect(await adapter.read("file2.md")).toBe("Content 2");
		});

		it("パスに含まれるディレクトリも管理できる", async () => {
			await adapter.write("dir/subdir/file.md", "Content");
			expect(await adapter.exists("dir/subdir/file.md")).toBe(true);
			expect(await adapter.read("dir/subdir/file.md")).toBe("Content");
		});
	});
});
