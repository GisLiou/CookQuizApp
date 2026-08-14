// 定義單一題目的資料結構
export interface Question {
  q: string;
  image_url?: string; // 題目圖片的相對路徑 (可選)
  options: string[];
  option_images?: string[]; // 選項圖片的相對路徑 (可選)
  answer: number;
  _qid: string; // 用於追蹤作答紀錄的唯一識別碼 (格式：分類名稱#題目索引)
}

// 定義單一分類的資料結構
export interface QuizCategory {
  category: string;
  questions: Question[];
}

// 定義單題作答統計的資料結構
export interface QuestionStats {
  c: number; // 答對次數 (correctCount)
  w: number; // 答錯次數 (wrongCount)
  last: "correct" | "wrong" | null; // 最後一次的作答結果
}

// 定義寫入 localStorage 的整體統計快取結構
export interface StatsCache {
  counts: Record<string, QuestionStats>;
}

// 定義寫入 localStorage 的使用者偏好設定
export interface PrefsCache {
  musicOn: boolean; // 是否開啟背景音樂與音效
}

// 定義應用程式支援的畫面狀態
export type ScreenType = "menu" | "count" | "quiz" | "result";

// 定義測驗群組 (包含原始三大類別、綜合考題、以及錯題複習)
export type GroupType = "main" | "safety" | "aux" | "mixed" | "wrong";
