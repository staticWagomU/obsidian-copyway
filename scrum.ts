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
      status: "ready",
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
      status: "draft",
      acceptance_criteria: [
        "コマンドパレットに「Copy file to destination」が表示される",
        "アクティブファイルがない場合、エラー通知が表示される",
        "コピー先が0件の場合、設定を促すエラー通知が表示される",
        "コピー先が1件の場合、直接コピーが実行される",
        "コピー先が2件以上の場合、選択モーダルが表示される",
        "コピー成功時に成功通知が表示される（3パターン）",
        "コピー失敗時にエラー通知が表示される（5パターン）",
      ],
    },
  ],

  sprint: {
    goal: "同名ファイル存在時のユーザー選択機能を実装し、誤上書きを防止する",
    status: "active",
    pbi_id: "PBI-005",
    subtasks: [
      {
        id: "ST-5.1",
        title: "OverwriteModal型定義とテスト環境構築（RED）",
        status: "green",
        test_file: "src/overwrite-modal.test.ts",
      },
      {
        id: "ST-5.2",
        title: "OverwriteModalの基本表示機能実装（GREEN）",
        status: "green",
        test_file: "src/overwrite-modal.test.ts",
      },
      {
        id: "ST-5.3",
        title: "Overwriteボタン動作のテストと実装（RED→GREEN）",
        status: "red",
        test_file: "src/overwrite-modal.test.ts",
      },
      {
        id: "ST-5.4",
        title: "Renameボタン動作のテストと実装（RED→GREEN）",
        status: "red",
        test_file: "src/overwrite-modal.test.ts",
      },
      {
        id: "ST-5.5",
        title: "Cancelボタン動作のテストと実装（RED→GREEN）",
        status: "red",
        test_file: "src/overwrite-modal.test.ts",
      },
      {
        id: "ST-5.6",
        title: "ファイル名表示機能のテストと実装（RED→GREEN）",
        status: "red",
        test_file: "src/overwrite-modal.test.ts",
      },
      {
        id: "ST-5.7",
        title: "コードのリファクタリングと最終調整（REFACTOR）",
        status: "red",
        test_file: "src/overwrite-modal.test.ts",
      },
    ],
  },

  retrospective_insights: [
    // === What went well (うまくいったこと) ===
    "[Process] TDDサイクル(RED-GREEN-REFACTOR)の厳密な実施により、3Sprint連続で100%の受入基準達成率を維持",
    "[Process] 各サブタスク完了時の即座コミットにより、変更履歴の追跡が容易になった",
    "[Process] Definition of Doneの自動チェック(lint, typecheck, test, build)により品質が担保された",
    "[Process] タスク完了基準（実装・テスト・コミット）の徹底により、「ゴーストdone」が0件に改善（Sprint 2→Sprint 3）",
    "[Tech] Obsidian APIのモック環境整備により、外部依存なしで効率的なテスト実行が可能",
    "[Tech] 型定義を先に定義することで、実装の方向性が明確になり、TypeScriptの型推論が効果的に機能",
    "[Tech] Result<T, E>型パターンにより、エラーハンドリングが型安全かつ明示的になった（Sprint 3）",
    "[Tech] Dependency Injection採用により、Obsidian固有API依存を排除し、テスタビリティが向上（Sprint 3）",
    "[Sprint 4] Obsidian Modal APIの活用（継承、onOpen/onCloseライフサイクル）により、標準的なUIパターンを実装",
    "[Sprint 4] コールバックパターンにより、UIと処理ロジックの関心を明確に分離（Modal=表示、callback=処理）",
    "[Sprint 4] テスト数が継続的に増加（Sprint 1-2: 31→Sprint 3: 59→Sprint 4: 72、総増加率232%）",

    // === What could be improved (改善できること) ===
    "[Quality] Definition of Doneの手動チェック項目（Obsidian上での実際の動作確認）が4Sprint連続で未実施",
    "[Quality] 個別コンポーネントのテストは充実しているが、コンポーネント間の統合テストが不足",
    "[Process] 長期的な技術的負債の管理方法（アーキテクチャ改善など）を検討する必要がある",

    // === Key learnings (学び) ===
    "[Tech] loadSettings()でObject.assign()とPartial<T>を組み合わせることで、設定の部分的更新と後方互換性を両立",
    "[Tech] Vitestのvi.spyOn()によるモック手法で、Plugin基底クラスのメソッドの振る舞いを効果的にテスト可能",
    "[Tech] Obsidian SettingクラスのDOMイベント処理では、クロージャでのインデックス保持と安全な参照チェック（if (d)）が重要",
    "[Tech] キーボードナビゲーション（ArrowUp/Down/Enter/Escape）の標準UIパターンの実装手法を習得（Sprint 4）",
    "[Process] 型定義とテストを先に書くことで、「テストを通すための最小限のコード」になり、過剰実装を防止",
    "[Architecture] イベント駆動設計（コールバックパターン）により、コンポーネント間の結合度を低く保つことができる（Sprint 4）",

    // === Action items (アクションアイテム) ===
    "[Continuous] タスク完了基準の徹底: すべてのサブタスクで実装・テスト・コミットの3点セットを確認してから'done'にする",
    "[Next Sprint] PBI-005でもModalとコールバックパターンを踏襲し、設計の一貫性を保つ",
    "[Next Sprint] Sprint Review時に、Acceptance Criteriaと実装の突き合わせチェックリストを使用",
    "[Future] 統合テスト戦略を検討し、エンドツーエンドのシナリオテストを追加する",
    "[Backlog] Definition of Doneの手動チェック項目を実施する専用タスクを計画する",
  ],
};

// =============================================================================
// Output
// =============================================================================

console.log(JSON.stringify(dashboard, null, 2));
