import React from 'react';

interface ProgressBarProps {
  current: number; // 目前題目的索引值 (0-based)
  total: number;   // 總題數
  score: number;   // 目前答對的題數
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, score }) => {
  // 計算進度百分比，並防止 total 為 0 時產生 NaN 錯誤
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="progress-wrap">
      <span>第 {current + 1}/{total} 題</span>
      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${pct}%` }}
        ></div>
      </div>
      <span className="score-pill">答對 {score}</span>
    </div>
  );
};

export default ProgressBar;