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
    // All PBIs completed - Copyway v1.0 feature complete
    { id: "PBI-001", title: "プラグイン基盤・型定義", description: "プラグインの基盤構築", status: "done", acceptance_criteria: ["Sprint 1で完了"], story_points: 3 },
    { id: "PBI-002", title: "設定画面", description: "コピー先の追加・編集・削除", status: "done", acceptance_criteria: ["Sprint 2で完了"], story_points: 5 },
    { id: "PBI-003", title: "CopyService", description: "ファイルコピー処理", status: "done", acceptance_criteria: ["Sprint 3で完了"], story_points: 5 },
    { id: "PBI-004", title: "コピー先選択モーダル", description: "複数コピー先からの選択UI", status: "done", acceptance_criteria: ["Sprint 4で完了"], story_points: 3 },
    { id: "PBI-005", title: "上書き確認ダイアログ", description: "同名ファイル存在時の選択UI", status: "done", acceptance_criteria: ["Sprint 5で完了"], story_points: 3 },
    { id: "PBI-006", title: "コピーコマンド統合", description: "コマンドパレットからのコピー実行", status: "done", acceptance_criteria: ["Sprint 6で完了"], story_points: 5 },
  ],

  sprint: {
    // Sprint 6 completed - All PBIs done, product is feature complete
    goal: "",
    status: "planning",
    pbi_id: null,
    subtasks: [],
  },

  retrospective_insights: [
    // === Project Summary (Sprint 1-6) ===
    "[Summary] 6Sprint完走、全6PBI完了、110テスト（255%増）、5Sprint連続100%受入基準達成",
    // === Key Patterns Established ===
    "[Pattern] TDD(RED-GREEN-REFACTOR) + 即座コミット + Definition of Done自動チェック",
    "[Pattern] Result<T,E>型 + DI + Obsidian APIモック = 型安全かつテスタブルな設計",
    "[Pattern] Modal継承 + コールバック + Promise wrap = 非同期UIの統一パターン",
    // === Key Learnings ===
    "[Learning] 型定義→テスト→実装の順序で過剰実装を防止",
    "[Learning] 統合テストは実装フェーズ最終段階で集中追加が効果的",
    // === Future Actions ===
    "[Action] Obsidian上での手動動作確認を実施",
    "[Action] パフォーマンス最適化の検討（大容量ファイル、バッチ処理）",
  ],
};

// =============================================================================
// Output
// =============================================================================

console.log(JSON.stringify(dashboard, null, 2));
