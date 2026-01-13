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
      status: "ready",
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
    goal: "ユーザーが複数のコピー先から直感的に選択できるモーダルUIを実装し、キーボード操作とクリック操作の両方で快適に利用できるようにする",
    status: "active",
    pbi_id: "PBI-004",
    subtasks: [
      {
        id: "ST-004-1",
        title: "DestinationModalクラスの基本構造とテストファイルの作成（RED）",
        status: "done",
        test_file: "src/destination-modal.test.ts",
      },
      {
        id: "ST-004-2",
        title: "DestinationModalの基本的なレンダリング機能の実装（GREEN）",
        status: "done",
        test_file: "src/destination-modal.test.ts",
      },
      {
        id: "ST-004-3",
        title: "キーボード操作（↑↓選択、Enter決定、Esc閉じる）のテスト追加（RED）",
        status: "green",
        test_file: "src/destination-modal.test.ts",
      },
      {
        id: "ST-004-4",
        title: "キーボード操作の実装（GREEN）",
        status: "red",
        test_file: "src/destination-modal.test.ts",
      },
      {
        id: "ST-004-5",
        title: "クリック操作のテスト追加（RED）",
        status: "red",
        test_file: "src/destination-modal.test.ts",
      },
      {
        id: "ST-004-6",
        title: "クリック操作の実装（GREEN）",
        status: "red",
        test_file: "src/destination-modal.test.ts",
      },
      {
        id: "ST-004-7",
        title: "コールバック実行とモーダルクローズのテスト追加（RED）",
        status: "red",
        test_file: "src/destination-modal.test.ts",
      },
      {
        id: "ST-004-8",
        title: "コールバック実行とモーダルクローズの実装（GREEN）",
        status: "red",
        test_file: "src/destination-modal.test.ts",
      },
      {
        id: "ST-004-9",
        title: "コードのリファクタリングと最適化（REFACTOR）",
        status: "red",
        test_file: "src/destination-modal.test.ts",
      },
      {
        id: "ST-004-10",
        title: "Definition of Done実施と最終確認（DONE）",
        status: "red",
        test_file: "src/destination-modal.test.ts",
      },
    ],
  },

  retrospective_insights: [
    // === What went well (うまくいったこと) ===
    "[Process] TDDサイクル(RED-GREEN-REFACTOR)を厳密に守ることで、品質の高いコードが書けた",
    "[Process] 各サブタスク完了時に即座にコミットすることで、変更履歴が追いやすくなった",
    "[Process] Definition of Doneの自動チェック(lint, typecheck, test, build)により品質が担保された",
    "[Tech] Obsidian APIのモック環境を整備し、外部依存なしで効率的なテスト環境が実現できた（Vault Adapter拡張含む）",
    "[Tech] 型定義を先に定義することで、実装時の方向性が明確になり、TypeScriptの型推論が効果的に機能した",
    "[Sprint 2] Obsidian Settingクラスのメソッドチェーンパターンを効果的に活用し、設定画面機能が完全に動作した",
    "[Sprint 3] Sprint 2の学びを適用し、全サブタスクで実装・テスト・コミットの検証を実施。「ゴーストdone」が0件になった",
    "[Sprint 3] Acceptance Criteria達成率が100%（Sprint 2: 83%→Sprint 3: 100%）に向上し、品質が大幅に改善された",
    "[Sprint 3] Result型パターンの導入により、エラーハンドリングが型安全かつ明示的になった",
    "[Sprint 3] CopyServiceを純粋なサービスとして設計し、Dependency Injectionを採用したことでテスタビリティが向上した",
    "[Sprint 3] テスト数が31から59に増加（91%増）し、包括的なカバレッジを達成した",

    // === What could be improved (改善できること) ===
    "[Quality] Definition of Doneの手動チェック項目（Obsidian上での実際の動作確認）が実施されていない",
    "[Tech] エッジケースのテストカバレッジをさらに増やす余地がある",
    "[Process] 長期的な技術的負債の管理方法（アーキテクチャ改善など）を検討する",

    // === Key learnings (学び) ===
    "[Tech] loadSettings()でObject.assign()とPartial<T>を組み合わせることで、設定の部分的な更新と後方互換性を両立できる",
    "[Tech] Vitestのvi.spyOn()を使ったモック手法により、ObsidianのPlugin基底クラスのメソッドの振る舞いを効果的にテストできる",
    "[Tech] Obsidian SettingクラスのDOMイベント処理では、配列のインデックスがクロージャで保持されるため、イベントハンドラ内での安全な参照チェック（if (d)）が重要",
    "[Process] 型定義とテストを先に書くことで、実装が「テストを通すための最小限のコード」になり、過剰実装を防げる",
    "[Sprint 3] Result<T, E>型の導入により、成功・失敗の両方のパスを明示的に扱え、エラー処理の見落としが減少する",
    "[Sprint 3] 依存性注入パターンにより、Obsidian固有のAPIに依存せず単体テストが可能になり、テストの実行速度と信頼性が向上した",
    "[Sprint 3] タスク完了基準の明確化（実装・テスト・コミットの3点セット）が、品質向上に直接貢献することが証明された",

    // === Action items (アクションアイテム) ===
    "[Continuous] タスク完了基準の徹底: すべてのサブタスクに対し、実装・テスト・コミットの3点セットを確認してから'done'にする",
    "[Next Sprint] Sprint Planning時に、各サブタスクの受入基準を具体的に定義し、チーム内で合意を得る",
    "[Next Sprint] Sprint Review時に、Acceptance Criteriaと実装の突き合わせチェックリストを使用する",
    "[Backlog] PBI-007として「フォルダ選択ダイアログ」を新規作成（任意機能、UX改善）",
    "[Backlog] Definition of Doneの手動チェック項目を実施する専用タスクを次Sprint以降で計画する",
  ],
};

// =============================================================================
// Output
// =============================================================================

console.log(JSON.stringify(dashboard, null, 2));
