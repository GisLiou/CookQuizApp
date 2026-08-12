import React from 'react';
import TopBar from '../common/TopBar';

interface ResultScreenProps {
  score: number;
  total: number;
  wrongCount: number;
  onRetryWrong: () => void;
  onRetrySame: () => void;
  onHomeClick: () => void;
  showBack?: boolean;
  backLabel?: string;
  onBackClick?: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  score,
  total,
  wrongCount,
  onRetryWrong,
  onRetrySame,
  onHomeClick,
  showBack = false,
  backLabel = '‹ 返回',
  onBackClick
}) => {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  let emoji = '🙂';
  let title = '完成囉！辛苦了！';

  if (pct === 100) {
    emoji = '🏆';
    title = '太厲害了！全部答對！';
  } else if (pct >= 80) {
    emoji = '🎉';
    title = '表現非常好！';
  } else if (pct >= 60) {
    emoji = '👍';
    title = '不錯喔，再練習會更好！';
  } else {
    emoji = '💪';
    title = '沒關係，多練習幾次會進步！';
  }

  return (
    <div className="screen">
      {/* 支援返回上一層與回主選單 */}
      <TopBar 
        showHome={true} 
        showBack={showBack}
        backLabel={backLabel}
        onBackClick={onBackClick}
        onHomeClick={onHomeClick} 
      />
      
      <div className="panel result-panel">
        <div className="result-emoji">{emoji}</div>
        <div className="result-title">{title}</div>
        
        <div className="result-score">
          您答對了 <b>{score}</b> / {total} 題（{pct}%）
        </div>

        {wrongCount > 0 && (
          <div className="hint-box">
            📝 答錯了 {wrongCount} 題，可以只複習答錯的題目。
          </div>
        )}

        <div className="action-row">
          {wrongCount > 0 && (
            <button className="big-action primary" onClick={onRetryWrong}>
              🔁 只練答錯的 {wrongCount} 題
            </button>
          )}
          
          <button 
            className={`big-action ${wrongCount > 0 ? 'secondary' : 'primary'}`} 
            onClick={onRetrySame}
          >
            🔄 再玩一次（同科目）
          </button>
          
          <button className="big-action secondary" onClick={onHomeClick}>
            🏠 回主選單選別科
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;