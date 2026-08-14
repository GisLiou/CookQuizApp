import React, { useState } from "react";
import TopBar from "../common/TopBar";
import type { Question, StatsCache } from "../../types";

interface StatsScreenProps {
  stats: StatsCache;
  overallStats: {
    total: number;
    accuracy: number;
    wrongCount: number;
    wrongIds: Set<string>;
  };
  groupStatsData: Array<{
    key: "main" | "safety" | "aux";
    label: string;
    total: number;
    accuracy: number;
    color: string;
    pool: Question[];
  }>;
  onStartReview: (wrongPool: Question[], label?: string) => void;
  onResetStats: () => void;
  onHomeClick: () => void;
}

const StatsScreen: React.FC<StatsScreenProps> = ({
  stats,
  overallStats,
  groupStatsData,
  onStartReview,
  onResetStats,
  onHomeClick,
}) => {
  // 用來在畫面中顯示暫時性的提示訊息，取代 alert
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice(null);
    }, 2500); // 2.5 秒後自動消失
  };

  return (
    <div className="screen">
      <TopBar showHome={true} title="練習紀錄" onHomeClick={onHomeClick} />

      <div className="panel fill-col">
        {/* 各科目練習情形 (上方) */}
        <div className="choice-grid">
          {groupStatsData.map((item) => {
            const itemWrongPool = item.pool.filter(
              (q) => stats.counts[q._qid]?.last === "wrong",
            );
            const subText =
              item.total > 0
                ? `共 ${item.pool.length} 題 · 累計作答 ${item.total} 題 · 正確率 ${item.accuracy}%${itemWrongPool.length > 0 ? ` · 待複習 ${itemWrongPool.length} 題` : ""}`
                : `共 ${item.pool.length} 題 · 尚無練習紀錄`;

            return (
              <button
                key={item.key}
                className={`choice-btn group-${item.key}`}
                onClick={() => {
                  if (itemWrongPool.length > 0) {
                    onStartReview(itemWrongPool, `複習：${item.label}`);
                  } else {
                    showNotice(`「${item.label}」目前沒有需要複習的錯題！`);
                  }
                }}
              >
                <span className="cb-main">
                  <span>
                    {item.label}
                  </span>
                  <span className="cb-count" style={{ fontSize: "0.85em" }}>
                    {subText}
                  </span>
                </span>
                <span className="cb-arrow">›</span>
              </button>
            );
          })}
        </div>

        {/* 畫面內動態提示橫幅 (取代 alert) */}
        {notice && (
          <div
            className="hint-box"
            style={{
              background: "#E7F6EC",
              borderColor: "#1E8A4C",
              color: "#1E8A4C",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {notice}
          </div>
        )}

        {/* 累計作答、正確率、待複習面板 (下方) */}
        {overallStats.total > 0 ? (
          <div className="panel stats-panel" style={{ flex: "0 0 auto" }}>
            <div className="stats-row" style={{ marginBottom: "10px" }}>
              <div className="stat-item">
                <span className="stat-num">{overallStats.total}</span>
                <span className="stat-label">累計作答</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{overallStats.accuracy}%</span>
                <span className="stat-label">正確率</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{overallStats.wrongCount}</span>
                <span className="stat-label">待複習</span>
              </div>
            </div>

            {overallStats.wrongCount > 0 && (
              <button
                className="big-action primary"
                style={{ marginBottom: "8px" }}
                onClick={() => {
                  const allWrongPool: Question[] = [];
                  groupStatsData.forEach((g) => {
                    g.pool.forEach((q) => {
                      if (stats.counts[q._qid]?.last === "wrong")
                        allWrongPool.push(q);
                    });
                  });
                  onStartReview(allWrongPool, "快速複習全部錯題");
                }}
              >
                🔁 快速複習尚未答對的 {overallStats.wrongCount} 題
              </button>
            )}

            <button className="big-action danger" onClick={onResetStats}>
              🗑️ 清除所有練習紀錄
            </button>
          </div>
        ) : (
          <div
            className="panel intro-panel"
            style={{ flex: "0 0 auto", textAlign: "center" }}
          >
            <p className="hero-sub">
              目前還沒有任何練習紀錄，開始作答後會自動記錄在這裡。
            </p>
          </div>
        )}

        <footer className="note">
          點擊上方各科目可直接進行該科的錯題複習。
        </footer>
      </div>
    </div>
  );
};

export default StatsScreen;
