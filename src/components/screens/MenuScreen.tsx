import React from 'react';
import TopBar from '../common/TopBar';
import type { Question, StatsCache, GroupType } from '../../types';

const GROUPS = {
  main: { label: '中餐烹飪', categories: ['中餐烹調-葷食(丙級)'] },
  safety: { label: '食品安全', categories: ['食品安全衛生及營養'] },
  aux: { label: '輔助科目', categories: ['職業安全衛生', '工作倫理與職業道德', '環境保護', '節能減碳'] }
};

const MIXED_RATIOS = { main: 48 / 80, safety: 16 / 80, aux: 16 / 80 };
const GROUP_COLORS = { main: '#E8A93C', safety: '#4FA98A', aux: '#B7B199' };

interface MenuScreenProps {
  quizData: Array<{ category: string; questions: Question[] }>;
  stats: StatsCache;
  onSelectCategory: (groupId: GroupType, poolLabel: string, pool: Question[]) => void;
  onGoStats: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ quizData, stats, onSelectCategory, onGoStats }) => {
  const totalAll = quizData.reduce((sum, c) => sum + c.questions.length, 0);

  const getGroupQuestions = (key: keyof typeof GROUPS) => {
    let qs: Question[] = [];
    GROUPS[key].categories.forEach((name) => {
      const cat = quizData.find((c) => c.category === name);
      if (cat) qs = qs.concat(cat.questions);
    });
    return qs;
  };

  const computeStatsForQuestions = (qs: Question[]) => {
    let c = 0, w = 0;
    qs.forEach((q) => {
      const s = stats.counts[q._qid];
      if (s) { c += s.c; w += s.w; }
    });
    return { c, w, total: c + w };
  };

  // 計算整體作答摘要供紀錄按鈕顯示
  let totalC = 0, totalW = 0;
  Object.values(stats.counts).forEach((s) => {
    totalC += s.c;
    totalW += s.w;
  });
  const overallTotal = totalC + totalW;
  const overallAcc = overallTotal > 0 ? Math.round((totalC / overallTotal) * 100) : 0;
  const statsSub = overallTotal > 0 ? `累計作答 ${overallTotal} 題 · 正確率 ${overallAcc}%` : '尚無練習紀錄';

  return (
    <div className="screen">
      <TopBar showHome={false} />
      
      <div className="fill-col">
        <div className="section-label">請選擇科目</div>
        
        <div className="choice-grid">
          {(Object.keys(GROUPS) as Array<keyof typeof GROUPS>).map((key) => {
            const qs = getGroupQuestions(key);
            const cs = computeStatsForQuestions(qs);
            const badge = cs.total > 0 ? ` · <span class="cat-badge">正確率 ${Math.round((cs.c / cs.total) * 100)}%</span>` : '';
            const pct = Math.round(MIXED_RATIOS[key] * 100);

            return (
              <button 
                key={key}
                className={`choice-btn group-${key}`} 
                onClick={() => onSelectCategory(key, GROUPS[key].label, qs)}
              >
                <span className="cb-main">
                  <span>
                    {GROUPS[key].label}
                  </span>
                  <span className="cb-count" dangerouslySetInnerHTML={{
                    __html: `共 ${qs.length} 題 · 綜合考題佔 ${pct}%${badge}`
                  }} />
                </span>
                <span className="cb-arrow">›</span>
              </button>
            );
          })}

          <button 
            className="choice-btn group-mixed" 
            onClick={() => {
              const mixedPool = [
                ...getGroupQuestions('main'),
                ...getGroupQuestions('safety'),
                ...getGroupQuestions('aux')
              ];
              onSelectCategory('mixed', '綜合考題', mixedPool);
            }}
          >
            <span className="cb-main">
              <span>綜合考題</span>
              <span className="cb-count">共 {totalAll} 題 · 依三科比重隨機出題</span>
              <span className="cb-ratio-bar">
                <span style={{ width: `${MIXED_RATIOS.main * 100}%`, background: GROUP_COLORS.main }}></span>
                <span style={{ width: `${MIXED_RATIOS.safety * 100}%`, background: GROUP_COLORS.safety }}></span>
                <span style={{ width: `${MIXED_RATIOS.aux * 100}%`, background: GROUP_COLORS.aux }}></span>
              </span>
            </span>
            <span className="cb-arrow">›</span>
          </button>

          <button className="choice-btn group-stats" onClick={onGoStats}>
            <span className="cb-main">
              <span>📊 練習紀錄</span>
              <span className="cb-count">{statsSub}</span>
            </span>
            <span className="cb-arrow">›</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default MenuScreen;