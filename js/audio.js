// ===== 字変 共通サウンド管理（安定版） =====
// 全ページで <script src="js/audio.js"></script> を読み込むだけで
// BGM再生・音量設定・ミュート切替が自動的に反映されます。
//
// 注意：iOS(Safari)は仕様上、<audio>.volume をJSから細かく変更できません。
// そのため、iOSでは音量スライダーではなく「ミュート切替（ON/OFF）」で
// 対応することを推奨します（本体の音量ボタンで実際の大きさは調整可能）。

(function () {
  const bgmEl = document.getElementById('bgm');
  if (!bgmEl) return;

  function getSavedVolume() {
    const savedVol = localStorage.getItem('vol_bgm');
    return (savedVol !== null ? savedVol : 80) / 100;
  }
  function isMuted() {
    return localStorage.getItem('bgm_muted') === 'true';
  }

  function applyBgmState() {
    bgmEl.volume = getSavedVolume();
    bgmEl.muted = isMuted();
  }
  applyBgmState();

  // ブラウザの自動再生ブロック対策：最初のタップ/クリックで再生開始
  const tryPlayBgm = () => {
    bgmEl.play().catch(() => {});
    document.removeEventListener('click', tryPlayBgm);
    document.removeEventListener('touchstart', tryPlayBgm);
  };
  document.addEventListener('click', tryPlayBgm, { once: true });
  document.addEventListener('touchstart', tryPlayBgm, { once: true });

  // 他のタブ/ページで音量・ミュートが変更された場合にも追従
  window.addEventListener('storage', (e) => {
    if (e.key === 'vol_bgm' || e.key === 'bgm_muted') applyBgmState();
  });

  // ページがbfcacheから復元された時にも再適用
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) applyBgmState();
  });

  window.__applyBgmState = applyBgmState;
})();

// ===== 効果音（SE）再生用ヘルパー =====
// 使い方: playSE('images/se/card_place.mp3') のように呼び出す
function playSE(src) {
  if (localStorage.getItem('bgm_muted') === 'true') return;
  const savedVol = localStorage.getItem('vol_se');
  const vol = (savedVol !== null ? savedVol : 80) / 100;
  if (vol <= 0) return;
  const se = new Audio(src);
  se.volume = vol;
  se.play().catch(() => {});
}

// ===== 音量保存共通関数（setting.html の音量スライダーから） =====
function saveVolume(type, val) {
  localStorage.setItem('vol_' + type, val);
  if (type === 'bgm') {
    const bgmEl = document.getElementById('bgm');
    if (bgmEl) bgmEl.volume = val / 100;
  }
}

// ===== ミュート切替関数（setting.html のミュートボタンから） =====
function toggleBgmMute(muted) {
  localStorage.setItem('bgm_muted', muted ? 'true' : 'false');
  const bgmEl = document.getElementById('bgm');
  if (bgmEl) bgmEl.muted = muted;
}