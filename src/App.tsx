import React, { useState, useEffect, useMemo } from "react";
import MenuScreen from "./components/screens/MenuScreen";
import StatsScreen from "./components/screens/StatsScreen";
import CountScreen from "./components/screens/CountScreen";
import QuizScreen from "./components/screens/QuizScreen";
import ResultScreen from "./components/screens/ResultScreen";

import { useQuiz, shuffleArray } from "./hooks/useQuiz";
import { useAudio } from "./hooks/useAudio";
import type { Question, StatsCache, ScreenType } from "./types";
import { loadJSON, saveJSON, STORAGE_KEYS } from "./utils/storage";
import rawQuizData from "./data/quizData.json";

const GROUPS = {
  main: { label: "中餐烹飪", categories: ["中餐烹調-葷食(丙級)"] },
  safety: { label: "食品安全", categories: ["食品安全衛生及營養"] },
  aux: {
    label: "輔助科目",
    categories: ["職業安全衛生", "工作倫理與職業道德", "環境保護", "節能減碳"],
  },
};

// 最新版綜合考題比例：中餐烹飪 60% / 食品安全 20% / 輔助科目 20%[cite: 2]
const MIXED_RATIOS = { main: 48 / 80, safety: 16 / 80, aux: 16 / 80 };
const GROUP_COLORS = { main: "#E8A93C", safety: "#4FA98A", aux: "#B7B199" };

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType | "stats">(
    "menu",
  );
  const [poolLabel, setPoolLabel] = useState("");
  const [pool, setPool] = useState<Question[]>([]);
  const [isMixed, setIsMixed] = useState(false);
  const [stats, setStats] = useState<StatsCache>({ counts: {} });
  // 記錄上一個畫面的來源：'menu' (主選單), 'count' (題數選擇), 'stats' (練習紀錄)
  const [fromPage, setFromPage] = useState<"menu" | "count" | "stats">("menu");
  const quiz = useQuiz();
  const { initAudio, playBgm } = useAudio();

  // 初始化題庫並注入唯一識別碼 _qid
  const quizData = useMemo(() => {
    return rawQuizData.map((cat) => ({
      ...cat,
      questions: cat.questions.map((q, i) => ({
        ...q,
        _qid: `${cat.category}#${i}`,
      })) as Question[],
    }));
  }, []);

  // 載入作答紀錄，並在每次切換回主選單或練習紀錄時自動重新讀取最新數據
  useEffect(() => {
    if (currentScreen === "menu" || currentScreen === "stats") {
      loadJSON<StatsCache>(STORAGE_KEYS.STATS, { counts: {} }).then(setStats);
    }
  }, [currentScreen]);

  // 移動端瀏覽器高度適應
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty(
        "--app-h",
        `${window.innerHeight}px`,
      );
    };
    setAppHeight();
    window.addEventListener("resize", setAppHeight);
    window.addEventListener("orientationchange", setAppHeight);
    return () => {
      window.removeEventListener("resize", setAppHeight);
      window.removeEventListener("orientationchange", setAppHeight);
    };
  }, []);

  // 背景音樂切換
  useEffect(() => {
    if (
      currentScreen === "menu" ||
      currentScreen === "count" ||
      currentScreen === "stats"
    ) {
      playBgm("menu");
    } else if (currentScreen === "quiz") {
      playBgm("quiz");
    } else if (currentScreen === "result") {
      playBgm("result");
    }
  }, [currentScreen, playBgm]);

  // 計算整體統計數據
  const overallStats = useMemo(() => {
    let totalC = 0,
      totalW = 0;
    const wrongIds = new Set<string>();
    Object.entries(stats.counts).forEach(([id, s]) => {
      totalC += s.c;
      totalW += s.w;
      if (s.last === "wrong") wrongIds.add(id);
    });
    return {
      total: totalC + totalW,
      accuracy:
        totalC + totalW > 0
          ? Math.round((totalC / (totalC + totalW)) * 100)
          : 0,
      wrongCount: wrongIds.size,
      wrongIds,
    };
  }, [stats]);

  // 計算各科目統計卡片資料
  const groupStatsData = useMemo(() => {
    return (Object.keys(GROUPS) as Array<keyof typeof GROUPS>).map((key) => {
      let qs: Question[] = [];
      GROUPS[key].categories.forEach((name) => {
        const cat = quizData.find((c) => c.category === name);
        if (cat) qs = qs.concat(cat.questions);
      });
      let c = 0,
        w = 0;
      qs.forEach((q) => {
        const s = stats.counts[q._qid];
        if (s) {
          c += s.c;
          w += s.w;
        }
      });
      return {
        key,
        label: GROUPS[key].label,
        total: c + w,
        accuracy: c + w > 0 ? Math.round((c / (c + w)) * 100) : 0,
        color: GROUP_COLORS[key],
      };
    });
  }, [quizData, stats]);

  // 依照最新比例隨機建立綜合考題
  const buildMixedQuizQuestions = (n: number) => {
    const getGroupQs = (key: keyof typeof GROUPS) => {
      let qs: Question[] = [];
      GROUPS[key].categories.forEach((name) => {
        const cat = quizData.find((c) => c.category === name);
        if (cat) qs = qs.concat(cat.questions);
      });
      return qs;
    };

    const mainQs = getGroupQs("main");
    const safetyQs = getGroupQs("safety");
    const auxQs = getGroupQs("aux");

    const nMain = Math.round(n * MIXED_RATIOS.main);
    const nSafety = Math.round(n * MIXED_RATIOS.safety);
    const nAux = Math.max(0, n - nMain - nSafety);

    let picked = shuffleArray(mainQs)
      .slice(0, Math.min(nMain, mainQs.length))
      .concat(
        shuffleArray(safetyQs).slice(0, Math.min(nSafety, safetyQs.length)),
      )
      .concat(shuffleArray(auxQs).slice(0, Math.min(nAux, auxQs.length)));

    if (picked.length < n) {
      const pickedIds: Record<string, boolean> = {};
      picked.forEach((q) => {
        pickedIds[q._qid] = true;
      });
      const leftover = mainQs
        .concat(safetyQs, auxQs)
        .filter((q) => !pickedIds[q._qid]);
      picked = picked.concat(
        shuffleArray(leftover).slice(0, n - picked.length),
      );
    }
    return shuffleArray(picked);
  };

  const handleHomeClick = () => setCurrentScreen("menu");

  // 1. 從主選單選擇科目 -> 進入題數選擇
  const handleSelectCategory = (
    groupId: string,
    label: string,
    selectedPool: Question[],
  ) => {
    initAudio();
    setPoolLabel(label);
    setPool(selectedPool);
    setIsMixed(groupId === "mixed");
    setFromPage("menu"); // 來源是主選單
    setCurrentScreen("count");
  };

  // 2. 從題數選擇 -> 開始測驗
  const handleStartQuiz = (count: number) => {
    if (isMixed) {
      const mixedQuestions = buildMixedQuizQuestions(count);
      quiz.startQuiz(mixedQuestions);
    } else {
      quiz.startQuiz(pool, count);
    }
    setFromPage("count"); // 測驗的上一層是題數選擇
    setCurrentScreen("quiz");
  };

  // 3. 從練習紀錄點擊特定科目錯題
  const handleStartReview = (wrongPool?: Question[], customLabel?: string) => {
    initAudio();
    if (wrongPool && wrongPool.length > 0) {
      setPoolLabel(customLabel || "複習尚未答對的題目");
      setPool(wrongPool);
      setIsMixed(false);
      quiz.startQuiz(wrongPool);
      setFromPage("stats");
      setCurrentScreen("quiz");
      return;
    }

    const allWrongPool: Question[] = [];
    quizData.forEach((cat) => {
      cat.questions.forEach((q) => {
        if (overallStats.wrongIds.has(q._qid)) allWrongPool.push(q);
      });
    });

    if (allWrongPool.length === 0) {
      alert("目前沒有需要複習的錯題！");
      return;
    }

    setPoolLabel("複習尚未答對的題目");
    setPool(allWrongPool);
    setIsMixed(false);
    quiz.startQuiz(allWrongPool);
    setFromPage("stats");
    setCurrentScreen("quiz");
  };

  const handleResetStats = async () => {
    if (window.confirm("確定要清除所有練習紀錄嗎？此動作無法復原。")) {
      const emptyStats = { counts: {} };
      await saveJSON(STORAGE_KEYS.STATS, emptyStats);
      setStats(emptyStats);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "menu":
        return (
          <MenuScreen
            quizData={quizData}
            stats={stats}
            onSelectCategory={handleSelectCategory}
            onGoStats={() => {
              setFromPage("menu");
              setCurrentScreen("stats");
            }}
          />
        );
      case "stats":
        return (
          <StatsScreen
            stats={stats}
            overallStats={overallStats}
            groupStatsData={groupStatsData.map((g) => {
              let qs: Question[] = [];
              GROUPS[g.key].categories.forEach((name) => {
                const cat = quizData.find((c) => c.category === name);
                if (cat) qs = qs.concat(cat.questions);
              });
              return { ...g, pool: qs };
            })}
            onStartReview={handleStartReview}
            onResetStats={handleResetStats}
            onHomeClick={handleHomeClick}
          />
        );
      case "count":
        return (
          <CountScreen
            groupId={
              isMixed
                ? "mixed"
                : poolLabel.includes("中餐")
                  ? "main"
                  : poolLabel.includes("食品")
                    ? "safety"
                    : "aux"
            }
            poolLabel={poolLabel}
            poolSize={pool.length}
            isMixed={isMixed}
            onStartQuiz={handleStartQuiz}
            onHomeClick={handleHomeClick}
            // 這裡明確顯示返回主選單
            showBack={false}
            backLabel="🏠 返回主選單"
            onBackClick={handleHomeClick}
          />
        );
      case "quiz":
        return (
          <QuizScreen
            poolLabel={poolLabel}
            quizQuestions={quiz.quizQuestions}
            currentIndex={quiz.currentIndex}
            currentQuestion={quiz.currentQuestion}
            score={quiz.score}
            isAnswered={quiz.isAnswered}
            selectedOption={quiz.selectedOption}
            onAnswer={quiz.handleAnswer}
            onNext={quiz.nextQuestion}
            onFinish={() => setCurrentScreen("result")}
            onHomeClick={handleHomeClick}
            // 核心：根據進入測驗前的來源決定返回按鈕文字與行為
            showBack={true}
            backLabel={
              fromPage === "stats" ? "📊 返回練習紀錄" : "🔢 返回題數選擇"
            }
            onBackClick={() => {
              if (fromPage === "stats") {
                setCurrentScreen("stats");
              } else {
                setCurrentScreen("count");
              }
            }}
          />
        );
      case "result":
        return (
          <ResultScreen
            score={quiz.score}
            total={quiz.quizQuestions.length}
            wrongCount={quiz.wrongList.length}
            onRetryWrong={() => {
              quiz.startQuiz(shuffleArray(quiz.wrongList));
              setCurrentScreen("quiz");
            }}
            onRetrySame={() => {
              handleStartQuiz(quiz.quizQuestions.length);
            }}
            onHomeClick={handleHomeClick}
            showBack={true}
            backLabel={
              fromPage === "stats" ? "📊 返回練習紀錄" : "🔢 返回題數選擇"
            }
            onBackClick={() => {
              if (fromPage === "stats") {
                setCurrentScreen("stats");
              } else {
                setCurrentScreen("count");
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderScreen()}</>;
};

export default App;
