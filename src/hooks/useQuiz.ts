import { useState, useCallback } from "react";
import type { Question, StatsCache } from "../types";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../utils/storage";

// 洗牌演算法 (Fisher-Yates Shuffle)
export const shuffleArray = <T>(arr: T[]): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const useQuiz = () => {
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongList, setWrongList] = useState<Question[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // 初始化並開始測驗
  const startQuiz = useCallback((questions: Question[], limit?: number) => {
    // 進行陣列洗牌並截取所需題數
    const shuffled = shuffleArray(questions);
    const selectedQuestions = limit ? shuffled.slice(0, limit) : shuffled;

    setQuizQuestions(selectedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setWrongList([]);
    setIsAnswered(false);
    setSelectedOption(null);
  }, []);

  // 處理作答邏輯
  const handleAnswer = async (selectedIndex: number): Promise<boolean> => {
    if (isAnswered || quizQuestions.length === 0) return false;

    setIsAnswered(true);
    setSelectedOption(selectedIndex);

    const currentQ = quizQuestions[currentIndex];
    const isCorrect = selectedIndex === currentQ.answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setWrongList((prev) => [...prev, currentQ]);
    }

    // 非同步寫入作答統計至 localStorage
    const statsCache = await loadJSON<StatsCache>(STORAGE_KEYS.STATS, {
      counts: {},
    });
    const id = currentQ._qid;
    const currentStats = statsCache.counts[id] || { c: 0, w: 0, last: null };

    if (isCorrect) {
      currentStats.c += 1;
      currentStats.last = "correct";
    } else {
      currentStats.w += 1;
      currentStats.last = "wrong";
    }
    statsCache.counts[id] = currentStats;
    await saveJSON(STORAGE_KEYS.STATS, statsCache);

    return isCorrect;
  };

  // 切換至下一題
  const nextQuestion = (): boolean => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      return true; // 還有下一題
    }
    return false; // 測驗結束
  };

  return {
    quizQuestions,
    currentIndex,
    currentQuestion: quizQuestions[currentIndex],
    score,
    wrongList,
    isAnswered,
    selectedOption,
    startQuiz,
    handleAnswer,
    nextQuestion,
  };
};
