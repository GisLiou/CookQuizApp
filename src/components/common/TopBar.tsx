import React from 'react';
import { useAudio } from '../../hooks/useAudio';

interface TopBarProps {
  title?: string;
  showHome?: boolean;
  showBack?: boolean;
  backLabel?: string;
  onHomeClick?: () => void;
  onBackClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  title = '中餐丙級題庫', 
  showHome = false, 
  showBack = false,
  backLabel = '‹ 返回',
  onHomeClick,
  onBackClick
}) => {
  const { isMuted, toggleMute } = useAudio();

  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-badge">📚</div>
        <div className="brand-title">{title}</div>
      </div>
      <div className="topbar-actions">
        <button 
          className="mute-btn" 
          onClick={toggleMute} 
          aria-label="切換背景音樂"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        {/* 返回上一層按鈕 */}
        {showBack && (
          <button 
            className="home-btn" 
            onClick={onBackClick}
          >
            {backLabel}
          </button>
        )}

        {/* 主選單按鈕 */}
        {showHome && (
          <button 
            className="home-btn" 
            onClick={onHomeClick}
          >
            🏠 主選單
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;