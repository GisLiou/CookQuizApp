import React from 'react';
import TopBar from '../common/TopBar';

interface CountScreenProps {
  groupId: string;
  poolLabel: string;
  poolSize: number;
  isMixed: boolean;
  onStartQuiz: (count: number) => void;
  onHomeClick: () => void;
  showBack?: boolean;
  backLabel?: string;
  onBackClick?: () => void;
}

const CountScreen: React.FC<CountScreenProps> = ({
  groupId,
  poolLabel,
  poolSize,
  isMixed,
  onStartQuiz,
  onHomeClick,
  showBack = false,
  backLabel = '‹ 返回',
  onBackClick
}) => {
  const options = [10, 50].filter((n) => n < poolSize);

  const subHint = isMixed
    ? '將依中餐烹飪60% · 食品安全20% · 輔助科目20%的比例隨機出題，這次想練習幾題？'
    : `共有 ${poolSize} 題，這次想練習幾題？`;

  // 根據不同類別套用對應的主題樣式類別 (group-main, group-safety 等)
  const panelClass = `panel intro-panel group-${groupId}`;

  return (
    <div className="screen">
      <TopBar 
        showHome={true} 
        showBack={showBack}
        backLabel={backLabel}
        onBackClick={onBackClick}
        onHomeClick={onHomeClick} 
      />
      
      <div className="panel fill-col">
        {/* 帶有各科目配色的提示面板 */}
        <div className={panelClass}>
          <h1 className="hero">
            {poolLabel}
          </h1>
          <p className="hero-sub">{subHint}</p>
        </div>
        
        <div className="section-label">
          <span className="num">2</span>請選擇題數
        </div>
        
        <div className="choice-grid">
          {options.map((n) => (
            <button 
              key={n} 
              className="choice-btn" 
              onClick={() => onStartQuiz(n)}
            >
              <span className="cb-main">
                <span>練習 {n} 題</span>
                <span className="cb-count">隨機出題，較快練完</span>
              </span>
              <span className="cb-arrow">›</span>
            </button>
          ))}
          
          <button 
            className="choice-btn" 
            onClick={() => onStartQuiz(poolSize)}
          >
            <span className="cb-main">
              <span>全部作答（{poolSize} 題）</span>
              <span className="cb-count">完整練習這個科目</span>
            </span>
            <span className="cb-arrow">›</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountScreen;