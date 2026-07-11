// ===== 字変 共通サウンド管理（iOS音量調整対応版） =====
// 全ページで <script src="js/audio.js"></script> を読み込むだけで
// BGM再生・音量設定（設定画面での変更含む）が自動的に反映されます。
//
// iOS(Safari)は <audio>.volume をJSから変更できない制限がありますが、
// Web Audio API の GainNode 経由なら音量調整が可能です。
// ただしiOSではAudioContextを「ユーザー操作(タップ)の中」で
// 生成しないと正しく動作しないため、最初のタップの瞬間にセットアップします。

(function () {
  const bgmEl = document.getElementById('bgm');
  if (!bgmEl) return;

  let audioCtx = null;
  let gainNode = null;
  let useGain = false;
  let started = false;

  function getSavedVolume() {
    const savedVol = localStorage.getItem('vol_bgm');
    return (savedVol !== null ? savedVol : 80) / 100;
  }

  function applyBgmVolume() {
    const vol = getSavedVolume();
    if (useGain && gainNode) {
      gainNode.gain.value = vol;
    } else {
      bgmEl.volume = vol;
    }
  }

  // 起動前のフォールバック（Web Audio未セットアップ時点でも保存済み音量を反映）
  bgmEl.volume = getSavedVolume();

  // 最初のタップ/クリックの中でAudioContextを生成し、そのまま再生開始
  function startBgm() {
    if (started) return;
    started = true;

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(bgmEl);
      gainNode = audioCtx.createGain();
      gainNode.gain.value = getSavedVolume();
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      useGain = true;
    } catch (e) {
      useGain = false;
    }

    const playIt = () => bgmEl.play().catch(() => {});
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().then(playIt).catch(playIt);
    } else {
      playIt();
    }
  }

  const onGesture = () => {
    startBgm();
    document.removeEventListener('click', onGesture);
    document.removeEventListener('touchstart', onGesture);
  };
  document.addEventListener('click', onGesture, { once: true });
  document.addEventListener('touchstart', onGesture, { once: true });

  // 他のタブ/ページで音量が変更された場合にも追従（storageイベント）
  window.addEventListener('storage', (e) => {
    if (e.key === 'vol_bgm') applyBgmVolume();
  });

  // ページがbfcacheから復元された時にも音量を再適用
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) applyBgmVolume();
  });

  // グローバル公開（setting.htmlのスライダーから呼び出す）
  window.__applyBgmVolume = applyBgmVolume;
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
  if (type === 'bgm' && window.__applyBgmVolume) {
    window.__applyBgmVolume();
  }
}