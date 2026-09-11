(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const voiceSelect = $('voiceSelect'), voiceRate = $('voiceRate'), speakBtn = $('speakBtn'), stopSpeakBtn = $('stopSpeakBtn');
  const recordBtn = $('recordBtn'), stopRecordBtn = $('stopRecordBtn'), recordStatus = $('recordStatus'), audioPreview = $('audioPreview'), voiceStatus = $('voiceStatus');
  if (!voiceSelect || !speakBtn || !recordBtn || !audioPreview) return;

  let voices = [], recorder = null, stream = null, chunks = [], recordingUrl = null;
  const activeScene = () => document.querySelector('.scene.active') || document.querySelector('.scene');
  const narration = () => activeScene()?.querySelector('.scene-narration')?.value?.trim() || '';

  function loadVoices() {
    if (!('speechSynthesis' in window)) {
      voiceSelect.innerHTML = '<option>Speech preview unavailable</option>';
      return;
    }
    voices = speechSynthesis.getVoices().filter(v => v && v.lang);
    if (!voices.length) return;
    voiceSelect.innerHTML = voices.map((v, i) => `<option value="${i}">${v.name} — ${v.lang}</option>`).join('');
  }
  loadVoices();
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = loadVoices;

  speakBtn.addEventListener('click', () => {
    const text = narration();
    if (!text) { voiceStatus.textContent = 'The active scene has no narration.'; return; }
    if (!('speechSynthesis' in window)) { voiceStatus.textContent = 'Speech preview is not available in this browser.'; return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const selected = Number(voiceSelect.value);
    if (voices[selected]) u.voice = voices[selected];
    u.rate = Number(voiceRate?.value || 1);
    u.onstart = () => voiceStatus.textContent = 'Speaking the active scene…';
    u.onend = () => voiceStatus.textContent = 'Voice preview finished.';
    u.onerror = () => voiceStatus.textContent = 'Voice preview could not start.';
    speechSynthesis.speak(u);
  });
  stopSpeakBtn?.addEventListener('click', () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); voiceStatus.textContent = 'Voice preview stopped.'; });

  function mime() {
    if (!window.MediaRecorder) return '';
    return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find(x => MediaRecorder.isTypeSupported(x)) || '';
  }
  function ext(type) { return type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm'; }

  recordBtn.addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      recordStatus.textContent = 'Microphone recording is not supported by this browser.'; return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const type = mime();
      recorder = new MediaRecorder(stream, type ? { mimeType: type, audioBitsPerSecond: 128000 } : undefined);
      chunks = [];
      recorder.ondataavailable = e => { if (e.data?.size) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || type || 'audio/webm' });
        if (recordingUrl) URL.revokeObjectURL(recordingUrl);
        recordingUrl = URL.createObjectURL(blob);
        audioPreview.src = recordingUrl; audioPreview.hidden = false; audioPreview.controls = true;
        window.antenehNarrationBlob = blob;
        window.antenehNarrationUrl = recordingUrl;
        recordStatus.textContent = `Narration recorded (${Math.max(1, Math.round(blob.size / 1024))} KB). It will be used for the next video render.`;
        recordBtn.disabled = false; stopRecordBtn.disabled = true;
        stream?.getTracks().forEach(t => t.stop()); stream = null;
      };
      recorder.start(250);
      recordBtn.disabled = true; stopRecordBtn.disabled = false;
      recordStatus.textContent = 'Recording… speak your narration now.';
    } catch (error) {
      recordStatus.textContent = error?.name === 'NotAllowedError' ? 'Microphone permission was denied.' : 'Could not access the microphone.';
      stream?.getTracks().forEach(t => t.stop()); stream = null;
    }
  });

  stopRecordBtn.addEventListener('click', () => {
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  });

  window.addEventListener('beforeunload', () => { if (stream) stream.getTracks().forEach(t => t.stop()); if ('speechSynthesis' in window) speechSynthesis.cancel(); });
})();
