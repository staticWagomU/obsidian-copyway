# Copyway - Obsidian Plugin 仕様書

## 概要

**Copyway** は、現在アクティブなファイルを事前に設定したコピー先ディレクトリへ簡単にコピーするためのObsidianプラグインです。

## 機能概要

### コア機能

1. **ファイルコピー機能**
   - コマンドパレットから実行可能
   - 現在アクティブなファイル（開いているファイル）をコピー対象とする
   - コピー先が複数登録されている場合は選択モーダルを表示
   - コピー先が1つの場合は直接コピーを実行（モーダルなし）

2. **コピー先選択モーダル**
   - 複数のコピー先から1つを選択（単一選択）
   - **ディスクリプションのみ表示**（パスは非表示）

3. **上書き制御**
   - グローバル設定で上書きモードを切り替え可能
   - 上書きモードOFF時は確認ダイアログを表示
   - 確認ダイアログでは「上書き」「リネームして保存」「キャンセル」を選択可能

4. **完了通知**
   - コピー成功時にObsidian通知を表示

## コマンド

| コマンドID | コマンド名 | 説明 |
|-----------|-----------|------|
| `copyway:copy-file` | Copy file to destination | アクティブファイルをコピー先へコピー |

## 設定項目

### 設定画面構成

```
┌─────────────────────────────────────────────────────────────┐
│ Copyway Settings                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ☐ Overwrite existing files                                  │
│   既存ファイルを確認なしで上書きする                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Copy Destinations                                           │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Path: [/Users/xxx/Daily/Archive                   ] [📁]│ │
│ │ Description: [日報アーカイブ用フォルダ             ]     │ │
│ │                                          [🗑️ Delete]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Path: [/Users/xxx/Backup                          ] [📁]│ │
│ │ Description: [外部バックアップ                    ]     │ │
│ │                                          [🗑️ Delete]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                              [+ Add destination]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 設定データ構造

```typescript
interface CopywaySettings {
  /** 上書きモード: trueなら確認なしで上書き */
  overwrite: boolean;

  /** コピー先リスト */
  destinations: CopyDestination[];
}

interface CopyDestination {
  /** 一意識別子 */
  id: string;

  /** コピー先パス（絶対パス） */
  path: string;

  /** 説明文（モーダル表示用） */
  description: string;
}
```

### デフォルト設定

```typescript
const DEFAULT_SETTINGS: CopywaySettings = {
  overwrite: false,
  destinations: []
};
```

## UI仕様

### コピー先選択モーダル

コピー先が **2つ以上** 登録されている場合に表示。
**ディスクリプションのみ**を表示し、パスは表示しない。

```
┌─────────────────────────────────────────┐
│ Select copy destination                 │
├─────────────────────────────────────────┤
│                                         │
│  ▸ 日報アーカイブ用フォルダ               │
│                                         │
│  ▸ 外部バックアップ                      │
│                                         │
└─────────────────────────────────────────┘
```

- キーボード操作対応（↑↓で選択、Enterで決定、Escでキャンセル）
- クリックで選択も可能

### 上書き確認ダイアログ

`overwrite: false` の場合で、同名ファイルが存在する場合に表示。

```
┌─────────────────────────────────────────┐
│ File already exists                     │
├─────────────────────────────────────────┤
│                                         │
│ "example.md" already exists in the      │
│ destination folder.                     │
│                                         │
│ What would you like to do?              │
│                                         │
│  [Overwrite] [Rename] [Cancel]          │
│                                         │
└─────────────────────────────────────────┘
```

- **Overwrite**: 既存ファイルを上書き
- **Rename**: 自動リネーム（例: `example_1.md`, `example_2.md`）
- **Cancel**: コピーをキャンセル

## 処理フロー

### メインフロー

```
コマンド実行
    │
    ▼
アクティブファイル取得
    │
    ├─ ファイルなし → エラー通知「No active file」
    │
    ▼
コピー先の数を確認
    │
    ├─ 0件 → エラー通知「No destinations configured」
    │
    ├─ 1件 → そのままコピー処理へ
    │
    └─ 2件以上 → 選択モーダル表示
                    │
                    ├─ キャンセル → 終了
                    │
                    └─ 選択 → コピー処理へ
                              │
                              ▼
                    コピー先に同名ファイルが存在するか確認
                              │
                              ├─ 存在しない → コピー実行
                              │
                              └─ 存在する
                                    │
                                    ├─ overwrite: true → 上書きコピー実行
                                    │
                                    └─ overwrite: false → 確認ダイアログ表示
                                                            │
                                                            ├─ Overwrite → 上書きコピー実行
                                                            ├─ Rename → リネームしてコピー実行
                                                            └─ Cancel → 終了
                              │
                              ▼
                    成功通知を表示
```

### リネームロジック

同名ファイルが存在する場合のリネーム規則：

1. 元のファイル名: `example.md`
2. リネーム候補: `example_1.md`, `example_2.md`, ...
3. 存在しない番号が見つかるまでインクリメント

## エラーハンドリング

| 状況 | エラーメッセージ | 通知タイプ |
|------|-----------------|-----------|
| アクティブファイルなし | No active file to copy | Error |
| コピー先未設定 | No copy destinations configured. Please add destinations in settings. | Error |
| コピー先ディレクトリが存在しない | Destination folder does not exist: {path} | Error |
| コピー失敗（I/Oエラー等） | Failed to copy file: {error message} | Error |
| 書き込み権限なし | Permission denied: {path} | Error |

## 成功通知

| 状況 | メッセージ |
|------|-----------|
| 通常コピー成功 | Copied "{filename}" to "{destination}" |
| 上書きコピー成功 | Overwrote "{filename}" in "{destination}" |
| リネームコピー成功 | Copied as "{new_filename}" to "{destination}" |

## 技術仕様

### 対応Obsidianバージョン

- 最小バージョン: 1.0.0

### ファイル構成

```
obsidian-copyway/
├── src/
│   ├── main.ts              # プラグインエントリポイント
│   ├── settings.ts          # 設定画面
│   ├── modals/
│   │   ├── DestinationModal.ts    # コピー先選択モーダル
│   │   └── OverwriteModal.ts      # 上書き確認ダイアログ
│   ├── services/
│   │   └── CopyService.ts   # コピー処理ロジック
│   └── types.ts             # 型定義
├── manifest.json
├── package.json
├── tsconfig.json
├── vite.config.ts           # Vite設定（Rolldownバンドラー）
└── docs/
    └── SPECIFICATION.md     # この仕様書
```

### 依存関係

- TypeScript
- Obsidian API
- Vite + Rolldown（ビルド用）

## 将来の拡張候補（スコープ外）

以下は現在のスコープ外ですが、将来的な拡張候補として記録：

- [ ] ファイルエクスプローラーからの右クリックメニュー対応
- [ ] 複数ファイルの一括コピー
- [ ] コピー先ごとの個別上書き設定
- [ ] コピー履歴の表示
- [ ] テンプレート変数によるファイル名変換（例: `{{date}}_{{filename}}`）
