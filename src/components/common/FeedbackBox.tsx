import React from 'react';

interface FeedbackBoxProps {
  isAnswered: boolean;         // 是否已經作答
  isCorrect: boolean | null;   // 答題是否正確
  correctIndex?: number;       // 正確答案的選項索引 (0-3)
  correctText?: string;        // 正確答案的選項文字
}

// 將原本選項前方的數字圖示定義為常數
const LETTERS = ['1', '2', '3', '4'];

const FeedbackBox: React.FC<FeedbackBoxProps> = ({ 
  isAnswered, 
  isCorrect, 
  correctIndex, 
  correctText 
}) => {
  // 如果尚未作答，React 會直接不渲染此元件 (相當於 display: none)
  if (!isAnswered || isCorrect === null) {
    return null;
  }

  // 答對時的 UI
  if (isCorrect) {
    return (
      <div className="feedback show good">
        <span className="fb-icon">🎉</span>
        <span>答對了！非常棒！</span>
      </div>
    );
  }

  // 答錯時的 UI
  return (
    <div className="feedback show bad">
      <span className="fb-icon">💡</span>
      <span>
        答錯了，別擔心！
        <span className="fb-sub">
          正確答案：{correctIndex !== undefined ? LETTERS[correctIndex] : ''} {correctText}
        </span>
      </span>
    </div>
  );
};

export default FeedbackBox;