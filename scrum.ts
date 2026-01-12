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
      status: "draft",
      acceptance_criteria: [
        "設定画面でコピー先を追加できる",
        "設定画面でコピー先を編集できる（パス、ディスクリプション）",
        "設定画面でコピー先を削除できる",
        "フォルダ選択ダイアログでパスを選択できる",
        "上書きモードのトグルが機能する",
        "設定が永続化される",
      ],
    },
    {
      id: "PBI-003",
      title: "CopyService",
      description:
        "ユーザーとして、ファイルコピー処理が確実に実行されることで、安心してファイルを管理できる",
      status: "draft",
      acceptance_criteria: [
        "指定したパスにファイルがコピーされる",
        "同名ファイル存在時に上書きコピーができる",
        "同名ファイル存在時にリネームコピーができる（_1, _2形式）",
        "コピー先ディレクトリが存在しない場合はエラーを返す",
        "I/Oエラー時は適切なエラーを返す",
      ],
    },
    {
      id: "PBI-004",
      title: "コピー先選択モーダル",
      description:
        "ユーザーとして、複数のコピー先から選択できることで、目的に応じた場所にコピーできる",
      status: "draft",
      acceptance_criteria: [
        "ディスクリプションのみが表示される（パス非表示）",
        "キーボード操作（↑↓選択、Enter決定、Esc閉じる）が動作する",
        "クリックで選択できる",
        "選択後にコピー処理が実行される",
      ],
    },
    {
      id: "PBI-005",
      title: "上書き確認ダイアログ",
      description:
        "ユーザーとして、同名ファイル存在時に選択肢が表示されることで、誤ってファイルを失わない",
      status: "draft",
      acceptance_criteria: [
        "Overwriteボタンで上書きコピーが実行される",
        "Renameボタンでリネームコピーが実行される",
        "Cancelボタンでコピーがキャンセルされる",
        "ファイル名が表示される",
      ],
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
    goal: "Obsidianプラグインとして動作する基盤を構築し、設定の永続化機能を実装する",
    status: "done",
    pbi_id: "PBI-001",
    subtasks: [
      {
        id: "ST-001",
        title: "types.tsにCopyDestination型を定義する",
        status: "done",
        test_file: "src/types.test.ts",
      },
      {
        id: "ST-002",
        title: "types.tsにCopywaySettings型を定義する",
        status: "done",
        test_file: "src/types.test.ts",
      },
      {
        id: "ST-003",
        title: "main.tsでプラグインクラスを実装する(onload/onunload)",
        status: "done",
        test_file: "src/main.test.ts",
      },
      {
        id: "ST-004",
        title: "設定の読み込み機能を実装する(loadSettings)",
        status: "done",
        test_file: "src/main.test.ts",
      },
      {
        id: "ST-005",
        title: "設定の保存機能を実装する(saveSettings)",
        status: "done",
        test_file: "src/main.test.ts",
      },
      {
        id: "ST-006",
        title: "manifest.jsonにコマンドを登録する",
        status: "done",
        test_file: "manifest.json",
      },
    ],
  },

  retrospective_insights: [
    "TDDサイクル(RED-GREEN-REFACTOR)を厳密に守ることで、品質の高いコードが書けた",
    "Obsidian APIのモック環境を整備したことで、テストが効率的に書けるようになった",
    "型定義を先に定義することで、実装時の方向性が明確になった",
    "各サブタスク完了時に即座にコミットすることで、変更履歴が追いやすくなった",
    "Definition of Doneの自動チェック(lint, typecheck, test, build)により品質が担保された",
  ],
};

// =============================================================================
// Output
// =============================================================================

console.log(JSON.stringify(dashboard, null, 2));
