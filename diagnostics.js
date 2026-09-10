(() => {
  const videoPanel = document.querySelector('.video-panel');
  if (!videoPanel || document.getElementById('diagnostics')) return;

  const box = document.createElement('div');
  box.id = 'diagnostics';
  box.className = 'diagnostics';
  box.innerHTML = '<div class="diagnostics-head"><div><strong>Device readiness</strong><small>Checks the tools needed to render locally.</small></div><button type="button" id="diagnosticsRefresh">Check again</button></div><div id="diagnosticsList" class="diagnostics-list"></div><p class="diagnostics-note">These checks run locally on this device. No data is uploaded.</p>';
  videoPanel.appendChild(box);

  const list = box.querySelector('#diagnosticsList');
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const badge = (value, yes='Ready', no='Unavailable') => value ? `<span class="diag-ok">${yes}</span>` : `<span class="diag-no">${no}</span>`;
  const row = (label, value, detail='', custom='') => `<div class="diag-row"><span><b>${esc(label)}</b><small>${esc(detail)}</small></span>${custom || badge(value)}</div>`;

  function supported(type) {
    try { return !!(window.MediaRecorder && typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(type)); }
    catch (_) { return false; }
  }

  async function check() {
    const recorder = 'MediaRecorder' in window;
    const canvas = !!(window.HTMLCanvasElement && HTMLCanvasElement.prototype && HTMLCanvasElement.prototype.captureStream);
    const audio = !!(window.AudioContext || window.webkitAudioContext);
    const audioDestination = audio && typeof (window.AudioContext || window.webkitAudioContext).prototype.createMediaStreamDestination === 'function';
    const mic = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const secure = window.isSecureContext;
    const mp4 = supported('video/mp4;codecs=avc1.42E01E,mp4a.40.2') || supported('video/mp4');
    const webm = supported('video/webm;codecs=vp9,opus') || supported('video/webm;codecs=vp8,opus') || supported('video/webm');
    let output = mp4 ? 'MP4' : webm ? 'WebM' : 'None';
    let performanceText = '';

    if (navigator.mediaCapabilities && typeof navigator.mediaCapabilities.encodingInfo === 'function') {
      try {
        const result = await navigator.mediaCapabilities.encodingInfo({
          type: 'record',
          video: { contentType: mp4 ? 'video/mp4;codecs="avc1.42E01E"' : 'video/webm;codecs="vp8"', width: 1280, height: 720, bitrate: 2200000, framerate: 24 },
          audio: { contentType: mp4 ? 'audio/mp4;codecs="mp4a.40.2"' : 'audio/webm;codecs="opus"', channels: 2, bitrate: 128000, samplerate: 48000 }
        });
        performanceText = result.smooth ? 'Likely smooth' : result.supported ? 'Supported; may be demanding' : 'Not confirmed';
      } catch (_) { performanceText = 'Not measured'; }
    }

    list.innerHTML =
      row('Secure connection', secure, secure ? 'Required for microphone access' : 'Open the site over HTTPS') +
      row('Video capture', canvas, 'Canvas → video stream') +
      row('Video recorder', recorder, 'Browser MediaRecorder') +
      row('Audio routing', audioDestination, 'Narration → final video stream') +
      row('Microphone', mic, 'Optional voice recording') +
      row('MP4 output', mp4, mp4 ? 'Supported by this browser' : 'Not supported; WebM will be used') +
      row('WebM output', webm, 'Fallback recording format') +
      row('Encoding load', !!performanceText, performanceText || 'Not measured') +
      `<div class="diag-output">Current output: <b>${output}</b><small>${output === 'None' ? 'This browser cannot render a downloadable video here.' : 'The renderer will choose the supported format automatically.'}</small></div>`;
  }

  box.querySelector('#diagnosticsRefresh').addEventListener('click', () => {
    box.querySelector('#diagnosticsRefresh').disabled = true;
    check().finally(() => { box.querySelector('#diagnosticsRefresh').disabled = false; });
  });
  check();
})();
