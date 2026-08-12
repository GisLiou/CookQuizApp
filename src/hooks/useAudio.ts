import { useState, useEffect, useCallback } from 'react';
import type { PrefsCache } from '../types';
import { loadJSON, saveJSON, STORAGE_KEYS } from '../utils/storage';
import { setMuteState, setDesiredTrack, playSfx, unlockAudioOnce } from '../utils/audioEngine';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // 初始化時讀取使用者的靜音設定
  useEffect(() => {
    const initPrefs = async () => {
      const prefs = await loadJSON<PrefsCache>(STORAGE_KEYS.PREFS, { musicOn: true });
      const muted = !prefs.musicOn;
      setIsMuted(muted);
      setMuteState(muted);
    };
    initPrefs();
  }, []);

  // 切換靜音狀態並儲存至 LocalStorage
  const toggleMute = useCallback(async () => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      setMuteState(newMuted);
      // 非同步儲存設定
      saveJSON<PrefsCache>(STORAGE_KEYS.PREFS, { musicOn: !newMuted });
      return newMuted;
    });
  }, []);

  // 播放背景音樂
  const playBgm = useCallback((trackKey: 'menu' | 'quiz' | 'result') => {
    setDesiredTrack(trackKey);
  }, []);

  // 播放答對音效
  const playCorrectSfx = useCallback(() => {
    playSfx('correct');
  }, []);

  // 播放答錯音效
  const playWrongSfx = useCallback(() => {
    playSfx('wrong');
  }, []);

  // 使用者首次互動時解鎖 AudioContext
  const initAudio = useCallback(() => {
    unlockAudioOnce();
  }, []);

  return {
    isMuted,
    toggleMute,
    playBgm,
    playCorrectSfx,
    playWrongSfx,
    initAudio
  };
};