import React, { useLayoutEffect, useRef } from "react";
import { useAudio } from "../../hooks/useAudio";
import type { Question } from "../../types";
import quizImages from "../../utils/quizImages";
import ProgressBar from "../common/ProgressBar";
import TopBar from "../common/TopBar";

interface QuizScreenProps {
  poolLabel: string;
  quizQuestions: Question[];
  currentIndex: number;
  currentQuestion: Question;
  score: number;
  isAnswered: boolean;
  selectedOption: number | null;
  onAnswer: (index: number) => Promise<boolean>;
  onNext: () => boolean;
  onFinish: () => void;
  onHomeClick: () => void;
  showBack?: boolean;
  backLabel?: string;
  onBackClick?: () => void;
}

const LETTERS = ["1", "2", "3", "4"];

const QuizScreen: React.FC<QuizScreenProps> = ({
  poolLabel,
  quizQuestions,
  currentIndex,
  currentQuestion,
  score,
  isAnswered,
  selectedOption,
  onAnswer,
  onNext,
  onFinish,
  onHomeClick,
  showBack = false,
  backLabel = "‹ 返回",
  onBackClick,
}) => {
  const { playCorrectSfx, playWrongSfx } = useAudio();
  const qtextRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = qtextRef.current;
    if (!el) return;
    el.style.fontSize = "";
    let tries = 0;
    let size = parseFloat(window.getComputedStyle(el).fontSize);
    while (el.scrollHeight > el.clientHeight + 1 && tries < 14 && size > 12) {
      size -= 1;
      el.style.fontSize = `${size}px`;
      tries++;
    }
  }, [currentQuestion]);

  const handleOptionClick = async (index: number) => {
    if (isAnswered) return;
    const isCorrect = await onAnswer(index);
    if (isCorrect) playCorrectSfx();
    else playWrongSfx();
  };

  const handleNextClick = () => {
    const hasNext = onNext();
    if (!hasNext) onFinish();
  };

  const total = quizQuestions.length;
  const isLast = currentIndex === total - 1;

  return (
    <div className="screen">
      {/* 傳入返回上一層的屬性 */}
      <TopBar
        title={poolLabel}
        showHome={true}
        showBack={showBack}
        backLabel={backLabel}
        onBackClick={onBackClick}
        onHomeClick={onHomeClick}
      />

      <div className="panel quiz-grid">
        <ProgressBar current={currentIndex} total={total} score={score} />

        <div className="qhead">
          <div className="question-text" ref={qtextRef}>
            {currentQuestion.q}
          </div>
          {/* 新增：如果該題有圖片，則動態顯示 */}
          {currentQuestion.image_url && (
            <div className="question-image-wrap">
              <img
                src={quizImages[currentQuestion.image_url]}
                alt="題目圖示"
                className="quiz-img"
              />
            </div>
          )}
        </div>

        <div
          className={
            currentQuestion.option_images ? "options options-grid" : "options"
          }
        >
          {currentQuestion.options.map((opt, i) => {
            let btnClass = "opt-btn";
            if (currentQuestion.option_images) btnClass += " opt-btn-img";
            if (isAnswered) {
              btnClass += " disabled";
              if (i === currentQuestion.answer) btnClass += " correct";
              else if (i === selectedOption) btnClass += " wrong";
              else btnClass += " dim";
            }

            return (
              <button
                key={i}
                className={btnClass}
                onClick={() => handleOptionClick(i)}
                disabled={isAnswered}
              >
                <span className="opt-letter">{LETTERS[i]}</span>
                {/* 新增：如果該題選項是圖片（如標章辨識題），則顯示圖片 */}
                {currentQuestion.option_images ? (
                  <span className="opt-img-wrap">
                    <img
                      src={quizImages[currentQuestion.option_images[i]]}
                      alt="選項圖示"
                      className="opt-img"
                    />
                  </span>
                ) : (
                  <span className="opt-text">{opt}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="bottom-zone">
          {isAnswered && (
            <button className="next-btn show" onClick={handleNextClick}>
              {isLast ? "查看結果 →" : "下一題 →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;
