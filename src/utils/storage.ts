// 擴充 global window 的型別，以支援特殊環境 (如 Claude.ai 內建) 的 window.storage API
declare global {
  interface Window {
    storage?: {
      get: (key: string, flag: boolean) => Promise<{ value: string } | null>;
      set: (key: string, value: string, flag: boolean) => Promise<void>;
    };
  }
}

// 統一管理存取 localStorage 時使用的 Key 值
export const STORAGE_KEYS = {
  STATS: 'qstats:v1',
  PREFS: 'qprefs:v1'
};

const hasCloudStorage = !!(window.storage && typeof window.storage.get === 'function' && typeof window.storage.set === 'function');

// 讀取本地端 localStorage
const loadFromLocalStorage = <T>(key: string, defVal: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defVal;
  } catch (e) {
    return defVal;
  }
};

// 寫入本地端 localStorage
const saveToLocalStorage = <T>(key: string, obj: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {
    // 忽略如無痕模式配額滿等寫入錯誤
  }
};

// 非同步讀取 JSON 資料 (支援 Cloud Storage 與 Local Storage 降級備援)
export const loadJSON = <T>(key: string, defVal: T): Promise<T> => {
  if (hasCloudStorage && window.storage) {
    return window.storage.get(key, false)
      .then((res) => {
        if (res && res.value) {
          try {
            return JSON.parse(res.value) as T;
          } catch (e) {
            return defVal;
          }
        }
        return defVal;
      })
      .catch(() => loadFromLocalStorage(key, defVal));
  }
  return Promise.resolve(loadFromLocalStorage(key, defVal));
};

// 非同步寫入 JSON 資料
export const saveJSON = <T>(key: string, obj: T): Promise<void | null> => {
  // 永遠同步寫入 localStorage，確保在純網頁環境下正常運作
  saveToLocalStorage(key, obj);

  if (hasCloudStorage && window.storage) {
    return window.storage.set(key, JSON.stringify(obj), false)
      .catch(() => null);
  }
  return Promise.resolve(null);
};