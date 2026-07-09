// ===== 字変 共通サウンド管理 =====
// 全ページで <script src="js/audio.js"></script> を読み込むだけで
// BGM再生・音量設定（設定画面での変更含む）が自動的に反映されます。

(function () {
  const bgmEl = document.getElementById('bgm');
  if (!bgmEl) return;

  // 保存されている音量を反映（未設定なら80%）
  function applyBgmVolume() {
    const savedVol = localStorage.getItem('vol_bgm');
    bgmEl.volume = (savedVol !== null ? savedVol : 80) / 100;
  }
  applyBgmVolume();

  // ブラウザの自動再生ブロック対策：最初のタップ/クリックで再生開始
  const tryPlayBgm = () => {
    bgmEl.play().catch(() => {});
    document.removeEventListener('click', tryPlayBgm);
    document.removeEventListener('touchstart', tryPlayBgm);
  };
  document.addEventListener('click', tryPlayBgm, { once: true });
  document.addEventListener('touchstart', tryPlayBgm, { once: true });

  // 他のタブ/ページで音量が変更された場合にも追従（storageイベント）
  window.addEventListener('storage', (e) => {
    if (e.key === 'vol_bgm') applyBgmVolume();
  });

  // ===== ページ復元時に音量を再適用 =====
  // bfcache復元（戻る/進むボタン）で pageshow が発火
  window.addEventListener('pageshow', (e) => {
    applyBgmVolume();
    // bfcacheから復元された場合は再生も再開を試みる
    if (e.persisted) {
      bgmEl.play().catch(() => {});
    }
  });

  // タブが非表示→表示に戻った時にも再適用
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      applyBgmVolume();
    }
  });
})();

// ===== 効果音（SE）再生用ヘルパー =====
// 使い方: playSE('images/se/card_place.mp3') のように呼び出す
function playSE(src) {
  const savedVol = localStorage.getItem('vol_se');
  const vol = (savedVol !== null ? savedVol : 80) / 100;
  if (vol <= 0) return; // 音量0なら再生自体スキップ
  const se = new Audio(src);
  se.volume = vol;
  se.play().catch(() => {});
}

// ===== 音量保存共通関数（setting.html から呼び出し） =====
function saveVolume(type, val) {
  localStorage.setItem('vol_' + type, val);
  if (type === 'bgm') {
    const bgmEl = document.getElementById('bgm');
    if (bgmEl) bgmEl.volume = val / 100;
  }
}