/**
 * AI-Agentic Scrum Dashboard
 *
 * Single source of truth for all Scrum artifacts.
 * Run: deno run scrum.ts | jq
 */

// =============================================================================
// Types
// =============================================================================

type PbiStatus = "draft" | "ready" | "in_progress" | "done";
type SubtaskStatus = "red" | "green" | "refactor" | "done";
type SprintStatus = "planning" | "active" | "review" | "done";

interface ProductBacklogItem {
  id: string;
  title: string;
  description: string;
  status: PbiStatus;
  acceptance_criteria: string[];
  story_points?: number;
}

interface Subtask {
  id: string;
  title: string;
  status: SubtaskStatus;
  test_file?: string;
}

interface Sprint {
  goal: string;
  status: SprintStatus;
  pbi_id: string | null;
  subtasks: Subtask[];
}

interface DefinitionOfDone {
  automated_checks: string[];
  manual_checks: string[];
}

interface ScrumDashboard {
  product: {
    name: string;
    goal: string;
    tech_stack: string[];
    success_metrics: string[];
  };
  definition_of_done: DefinitionOfDone;
  product_backlog: ProductBacklogItem[];
  sprint: Sprint;
  retrospective_insights: string[];
}

// =============================================================================
// Dashboard Data
// =============================================================================

const dashboard: ScrumDashboard = {
  product: {
    name: "Copyway",
    goal: "Obsidianユーザーが、アクティブなファイルを事前設定したコピー先へ簡単にコピーできる",
    tech_stack: ["TypeScript", "Obsidian API", "Vite", "Vitest"],
    success_metrics: [
      "コマンド1回でファイルコピーが完了する",
      "コピー先設定が直感的に管理できる",
      "既存ファイルの誤上書きを防止できる",
    ],
  },

  definition_of_done: {
    automated_checks: [
      "pnpm lint",
      "pnpm typecheck",
      "pnpm test:run",
      "pnpm build",
    ],
    manual_checks: [
      "Obsidian上で正常に動作することを確認",
      "仕様書のエラーメッセージが正しく表示されることを確認",
    ],
  },

  product_backlog: [
    {
      id: "PBI-001",
      title: "プラグイン基盤・型定義",
      description:
        "開発者として、プラグインの基盤を構築することで、他の機能を実装できる",
      status: "done",
      acceptance_criteria: [
        "main.tsでプラグインが正常に読み込まれる",
        "types.tsにCopywaySettings, CopyDestination型が定義されている",
        "設定の読み込み/保存が正常に動作する",
        "manifest.jsonにコマンドが登録されている",
      ],
      story_points: 3,
    },
    {
      id: "PBI-002",
      title: "設定画面",
      description:
        "ユーザーとして、コピー先を追加・編集・削除できることで、自分のワークフローに合わせた設定ができる",
      status: "done",
      acceptance_criteria: [
        "設定画面でコピー先を追加できる",
        "設定画面でコピー先を編集できる（パス、ディスクリプション）",
        "設定画面でコピー先を削除できる",
        "フォルダ選択ダイアログでパスを選択できる",
        "上書きモードのトグルが機能する",
        "設定が永続化される",
      ],
      story_points: 5,
    },
    {
      id: "PBI-003",
      title: "CopyService",
      description:
        "ユーザーとして、ファイルコピー処理が確実に実行されることで、安心してファイルを管理できる",
      status: "done",
      acceptance_criteria: [
        "指定したパスにファイルがコピーされる",
        "同名ファイル存在時に上書きコピーができる",
        "同名ファイル存在時にリネームコピーができる（_1, _2形式）",
        "コピー先ディレクトリが存在しない場合はエラーを返す",
        "I/Oエラー時は適切なエラーを返す",
      ],
      story_points: 5,
    },
    {
      id: "PBI-004",
      title: "コピー先選択モーダル",
      description:
        "ユーザーとして、複数のコピー先から選択できることで、目的に応じた場所にコピーできる",
      status: "done",
      acceptance_criteria: [
        "ディスクリプションのみが表示される（パス非表示）",
        "キーボード操作（↑↓選択、Enter決定、Esc閉じる）が動作する",
        "クリックで選択できる",
        "選択後にコピー処理が実行される",
      ],
      story_points: 3,
    },
    {
      id: "PBI-005",
      title: "上書き確認ダイアログ",
      description:
        "ユーザーとして、同名ファイル存在時に選択肢が表示されることで、誤ってファイルを失わない",
      status: "done",
      acceptance_criteria: [
        "Overwriteボタンで上書きコピーが実行される",
        "Renameボタンでリネームコピーが実行される",
        "Cancelボタンでコピーがキャンセルされる",
        "ファイル名が表示される",
      ],
      story_points: 3,
    },
    {
      id: "PBI-006",
      title: "コピーコマンド統合",
      description:
        "ユーザーとして、コマンドパレットからコピーを実行できることで、素早くファイルをコピーできる",
      status: "ready",
      acceptance_criteria: [
        // コマンド登録
        "コマンドパレットに「Copy file to destination」コマンドが表示される",

        // 前提条件エラー
        "アクティブファイルがない場合、「No active file to copy」エラー通知が表示される",
        "コピー先が0件の場合、「No copy destinations configured. Please add destinations in settings.」エラー通知が表示される",

        // コピー先選択フロー
        "コピー先が1件の場合、DestinationModalを表示せず直接コピー処理へ進む",
        "コピー先が2件以上の場合、DestinationModalが表示される",
        "DestinationModalでコピー先を選択すると、選択したコピー先へのコピー処理が実行される",
        "DestinationModalでEscapeキーを押下すると、コピー処理がキャンセルされる",

        // 上書き確認フロー
        "overwrite=trueのコピー先で同名ファイルが存在する場合、OverwriteModalを表示せず直接上書きコピーが実行される",
        "overwrite=falseのコピー先で同名ファイルが存在する場合、OverwriteModalが表示される",
        "OverwriteModalでOverwriteボタンを押下すると、上書きコピーが実行される",
        "OverwriteModalでRenameボタンを押下すると、リネームコピーが実行される",
        "OverwriteModalでCancelボタンを押下すると、コピー処理がキャンセルされる",

        // 成功通知（3パターン）
        "新規ファイルコピー成功時に「Copied \"{filename}\" to \"{destination}\"」通知が表示される",
        "上書きコピー成功時に「Overwrote \"{filename}\" in \"{destination}\"」通知が表示される",
        "リネームコピー成功時に「Copied as \"{new_filename}\" to \"{destination}\"」通知が表示される",

        // エラー通知（5パターン）
        "アクティブファイルがない場合に「No active file to copy」エラー通知が表示される",
        "コピー先が0件の場合に「No copy destinations configured. Please add destinations in settings.」エラー通知が表示される",
        "コピー先ディレクトリが存在しない場合に「Destination folder does not exist: {path}」エラー通知が表示される",
        "I/Oエラー発生時に「Failed to copy file: {error message}」エラー通知が表示される",
        "権限エラー発生時に「Permission denied: {path}」エラー通知が表示される",
      ],
      story_points: 5,
    },
  ],

  sprint: {
    goal: "コマンドパレットからファイルコピーを実行できる統合機能を、エンドツーエンドのTDDサイクルで完成させる",
    status: "active",
    pbi_id: "PBI-006",
    subtasks: [
      // Phase 1: Command registration and basic structure
      {
        id: "ST-6.1",
        title: "コマンド登録とコールバック構造の実装（RED）",
        status: "done",
        test_file: "src/commands/copy-file-command.test.ts",
      },
      {
        id: "ST-6.2",
        title: "アクティブファイルなしエラーの実装（RED-GREEN-REFACTOR）",
        status: "done",
        test_file: "src/commands/copy-file-command.test.ts",
      },
      {
        id: "ST-6.3",
        title: "コピー先0件エラーの実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },

      // Phase 2: Destination selection flow
      {
        id: "ST-6.4",
        title: "コピー先1件時の直接コピー処理の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },
      {
        id: "ST-6.5",
        title: "コピー先2件以上時のDestinationModal表示の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },
      {
        id: "ST-6.6",
        title: "DestinationModalでの選択とコピー処理の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },
      {
        id: "ST-6.7",
        title: "DestinationModalキャンセル処理の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },

      // Phase 3: Overwrite confirmation flow
      {
        id: "ST-6.8",
        title: "overwrite=true時の直接上書きコピーの実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },
      {
        id: "ST-6.9",
        title: "overwrite=false時のOverwriteModal表示の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },
      {
        id: "ST-6.10",
        title: "OverwriteModalでのOverwriteボタン処理の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },
      {
        id: "ST-6.11",
        title: "OverwriteModalでのRenameボタン処理の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },
      {
        id: "ST-6.12",
        title: "OverwriteModalでのCancelボタン処理の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },

      // Phase 4: Notification system (8 patterns)
      {
        id: "ST-6.13",
        title: "新規ファイルコピー成功通知の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },
      {
        id: "ST-6.14",
        title: "上書きコピー成功通知の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },
      {
        id: "ST-6.15",
        title: "リネームコピー成功通知の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },
      {
        id: "ST-6.16",
        title: "コピー先ディレクトリ存在エラー通知の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },
      {
        id: "ST-6.17",
        title: "I/Oエラー通知の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },
      {
        id: "ST-6.18",
        title: "権限エラー通知の実装（RED-GREEN-REFACTOR）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.test.ts",
      },

      // Phase 5: Integration and E2E tests
      {
        id: "ST-6.19",
        title: "エンドツーエンドシナリオテストの実装（コマンド→モーダル→コピー完了）",
        status: "red",
        test_file: "src/commands/CopyFileCommand.integration.test.ts",
      },
      {
        id: "ST-6.20",
        title: "全通知パターン（成功3+エラー5）の統合テスト",
        status: "red",
        test_file: "src/commands/CopyFileCommand.integration.test.ts",
      },
    ],
  },

  retrospective_insights: [
    // === What went well (うまくいったこと) ===
    "[Process] TDDサイクル(RED-GREEN-REFACTOR)の厳密な実施により、4Sprint連続で100%の受入基準達成率を達成（Sprint 2-5）",
    "[Process] タスク完了基準（実装・テスト・コミット）の徹底により、「ゴーストdone」ゼロを維持",
    "[Process] 各サブタスク完了時の即座コミットにより、変更履歴の追跡が容易",
    "[Process] Definition of Doneの自動チェック(lint, typecheck, test, build)により品質が担保された",
    "[Tech] 型定義を先に定義することで、実装の方向性が明確になり、TypeScriptの型推論が効果的に機能",
    "[Tech] Result<T, E>型パターンとDependency Injectionにより、型安全かつテスタブルな設計を実現",
    "[Tech] Obsidian APIのモック環境整備により、外部依存なしで効率的なテスト実行が可能",
    "[Tech] Modalとコールバックパターンの再利用により、設計の一貫性を実現（Sprint 4→5）",
    "[Tech] テスト数の継続的な増加（Sprint 1-2: 31→Sprint 3: 59→Sprint 4: 72→Sprint 5: 84、総増加率271%）",
    "[Sprint 5] createButton()ヘルパーメソッドの抽出により、DRY原則を実現し、メンテナンス性が向上",
    "[Sprint 5] DestinationModalとOverwriteModalで同一の設計パターンを適用し、ユーザー体験が統一",

    // === What could be improved (改善できること) ===
    "[Quality] Definition of Doneの手動チェック項目（Obsidian上での実際の動作確認）が5Sprint連続で未実施",
    "[Quality] 個別コンポーネントのユニットテストは充実しているが、統合テストとE2Eシナリオテストが不足",
    "[Process] 振り返り項目の定期的な整理と統合が必要（情報の鮮度と関連性を維持）",

    // === Key learnings (学び) ===
    "[Process] 型定義とテストを先に書くことで、「テストを通すための最小限のコード」になり、過剰実装を防止",
    "[Tech] Obsidian Modal APIの活用（継承、onOpen/onCloseライフサイクル、コールバックパターン）が標準UIパターンとして確立",
    "[Tech] キーボードナビゲーション（ArrowUp/Down/Enter/Escape）の標準実装手法を習得",
    "[Tech] loadSettings()でObject.assign()とPartial<T>を組み合わせることで、設定の部分的更新と後方互換性を両立",
    "[Architecture] イベント駆動設計（コールバックパターン）により、コンポーネント間の結合度を低く保つ",
    "[Architecture] 明確な責務分離（CopyService、DestinationModal、OverwriteModal）により、統合が容易",

    // === Action items (アクションアイテム) ===
    "[Continuous] タスク完了基準（実装・テスト・コミット）とTDDサイクルの厳守を継続",
    "[Sprint 6] 統合テスト戦略を策定し、エンドツーエンドシナリオテスト（コマンド実行→モーダル→コピー完了）を実装",
    "[Sprint 6] 8パターンの通知（成功3パターン、エラー5パターン）の統合テストを実施",
    "[Sprint 6完了後] Definition of Doneの手動チェック項目を実施し、Obsidian上での動作確認手順を文書化",
    "[Future] 技術的負債の管理方法を検討（アーキテクチャ改善、パフォーマンス最適化など）",
  ],
};

// =============================================================================
// Output
// =============================================================================

console.log(JSON.stringify(dashboard, null, 2));
