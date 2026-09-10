(() => {
  const videoPanel = document.querySelector('.video-panel');
  if (!videoPanel || document.getElementById('diagnostics')) return;

  const box = document.createElement('div');
  box.id = 'diagnostics';
  box.className = 'diagnostics';
  box.innerHTML = '<div class="diagnostics-head"><strong>Device readiness</strong><button type="button" id="diagnosticsRefresh">Check again</button></div><div id="diagnosticsList" class="diagnostics-list"></div><p class="diagnostics-note">These checks run locally on this device. No data is uploaded.</p>';
  videoPanel.appendChild(box);

  const list = box.querySelector('#diagnosticsList');
  const ok = value => value ? '<span class="diag-ok">Ready</span>' : '<span class="diag-no">Unavailable</span>';
  const row = (label, value, detail='') => `<div class="diag-row"><span><b>${label}</b><small>${detail}</small></span>${ok(value)}</div>`;

  function check() {
    const recorder = 'MediaRecorder' in window;
    const canvas = !!(HTMLCanvasElement.prototype && HTMLCanvasElement.prototype.captureStream);
    const audio = !!(window.AudioContext || window.webkitAudioContext);
    const mic = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const mp4 = recorder && typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported('video/mp4');
    const webm = recorder && typeof MediaRecorder.isTypeSupported === 'function' && (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') || MediaRecorder.isTypeSupported('video/webm'));
    let output = mp4 ? 'MP4' : webm ? 'WebM' : 'None';
    list.innerHTML = row('Video capture', canvas, 'Canvas → video stream') +
      row('Video recorder', recorder, 'Browser MediaRecorder') +
      row('Audio routing', audio, 'Narration → final video') +
      row('Microphone', mic, 'Optional voice recording') +
      row('MP4 output', mp4, mp4 ? 'Supported by this browser' : 'WebM fallback may be used') +
      row('WebM output', webm, 'Recommended fallback') +
      `<div class="diag-output">Current output: <b>${output}</b></div>`;
  }

  box.querySelector('#diagnosticsRefresh').addEventListener('click', check);
  check();
})();
