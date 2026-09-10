(() => {
  const button = document.getElementById('videoBtn');
  if (!button) return;

  const enhancedButton = button.cloneNode(true);
  button.replaceWith(enhancedButton);
  const status = document.getElementById('videoStatus');
  const state = document.getElementById('projectState');
  const preview = document.getElementById('videoPreview');
  const download = document.getElementById('downloadVideo');
  const audioPreview = document.getElementById('audioPreview');
  let outputUrl = null;

  const scenes = () => [...document.querySelectorAll('.scene')].map((node, i) => ({
    title: node.querySelector('.scene-title')?.value || `Scene ${i + 1}`,
    narration: node.querySelector('.scene-narration')?.value || '',
    visual: node.querySelector('.scene-visual')?.value || ''
  }));

  const wrap = (ctx, text, width) => {
    const words = String(text).trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > width && line) { lines.push(line); line = word; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };

  const roundedRect = (ctx, x, y, w, h, r) => {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  };

  const drawArrow = (ctx, x1, y1, x2, y2) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 18 * Math.cos(angle - Math.PI / 6), y2 - 18 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - 18 * Math.cos(angle + Math.PI / 6), y2 - 18 * Math.sin(angle + Math.PI / 6));
    ctx.closePath(); ctx.fill();
  };

  const drawDiagram = (ctx, scene, index, progress, w, h) => {
    const lower = `${scene.title} ${scene.visual}`.toLowerCase();
    const mode = lower.includes('step') || lower.includes('process') || lower.includes('how') ? 'steps'
      : lower.includes('example') || lower.includes('real-world') ? 'example'
      : lower.includes('recap') || lower.includes('takeaway') || lower.includes('key') ? 'recap'
      : index % 3 === 0 ? 'steps' : index % 3 === 1 ? 'example' : 'recap';

    const x = 760, y = 215, boxW = 400, boxH = 330;
    ctx.save();
    ctx.globalAlpha = Math.min(1, progress * 4);
    ctx.fillStyle = 'rgba(255,255,255,.055)';
    roundedRect(ctx, x, y, boxW, boxH, 28); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 2; roundedRect(ctx, x, y, boxW, boxH, 28); ctx.stroke();

    if (mode === 'steps') {
      const labels = ['Start', 'Understand', 'Apply'];
      labels.forEach((label, i) => {
        const bx = x + 38 + i * 118;
        const by = y + 120 + Math.sin((progress * Math.PI) + i) * 7;
        ctx.fillStyle = i === 1 ? '#8b5cf6' : '#27304d';
        roundedRect(ctx, bx, by, 92, 70, 18); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '700 17px system-ui'; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), bx + 46, by + 29);
        ctx.font = '600 13px system-ui'; ctx.fillText(label, bx + 46, by + 51);
        if (i < 2) { ctx.strokeStyle = '#66708a'; ctx.fillStyle = '#66708a'; ctx.lineWidth = 3; drawArrow(ctx, bx + 94, by + 35, bx + 112, by + 35); }
      });
      ctx.textAlign = 'left'; ctx.fillStyle = '#aeb7d1'; ctx.font = '600 18px system-ui'; ctx.fillText('Simple learning path', x + 38, y + 70);
    } else if (mode === 'example') {
      ctx.fillStyle = '#22d3ee'; ctx.globalAlpha = .8;
      ctx.beginPath(); ctx.arc(x + 112, y + 175, 52 + progress * 5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = '#0a1327'; ctx.font = '800 28px system-ui'; ctx.textAlign = 'center'; ctx.fillText('IDEA', x + 112, y + 184);
      ctx.strokeStyle = '#77819a'; ctx.fillStyle = '#77819a'; ctx.lineWidth = 3;
      drawArrow(ctx, x + 170, y + 175, x + 245, y + 175);
      ctx.fillStyle = '#8b5cf6'; roundedRect(ctx, x + 260, y + 122, 105, 105, 22); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '800 22px system-ui'; ctx.fillText('REAL', x + 312, y + 167); ctx.font = '600 16px system-ui'; ctx.fillText('EXAMPLE', x + 312, y + 193);
      ctx.textAlign = 'left'; ctx.fillStyle = '#aeb7d1'; ctx.font = '600 18px system-ui'; ctx.fillText('Concept → practical example', x + 38, y + 70);
    } else {
      const cards = ['Remember', 'Use', 'Explain'];
      cards.forEach((label, i) => {
        const bx = x + 34 + i * 116;
        const by = y + 125 + (i % 2) * 6;
        ctx.fillStyle = ['#27304d','#3a2c63','#164a58'][i];
        roundedRect(ctx, bx, by, 98, 96, 18); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '800 16px system-ui'; ctx.textAlign = 'center'; ctx.fillText(label, bx + 49, by + 54);
        ctx.font = '500 12px system-ui'; ctx.fillStyle = '#c7cddd'; ctx.fillText(`Point ${i + 1}`, bx + 49, by + 75);
      });
      ctx.textAlign = 'left'; ctx.fillStyle = '#aeb7d1'; ctx.font = '600 18px system-ui'; ctx.fillText('Three quick takeaways', x + 34, y + 70);
    }
    ctx.restore();
  };

  const draw = (ctx, canvas, scene, index, total, progress) => {
    const w = canvas.width, h = canvas.height;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#080d1c'); grad.addColorStop(1, '#1a1437');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

    const motion = Math.sin(progress * Math.PI);
    ctx.globalAlpha = .12;
    ctx.fillStyle = '#7c5cff'; ctx.beginPath(); ctx.arc(w * .84 + motion * 60, h * .16, 155, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(w * .10 - motion * 40, h * .86, 120, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;

    const slide = (1 - Math.min(1, progress * 5)) * 45;
    ctx.save(); ctx.translate(-slide, 0);
    ctx.fillStyle = '#a3afff'; ctx.font = '700 26px system-ui'; ctx.fillText('ANTENEH AI STUDIO', 70, 70);
    ctx.fillStyle = '#77819a'; ctx.font = '600 20px system-ui'; ctx.fillText(`SCENE ${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, 70, 112);

    ctx.globalAlpha = Math.min(1, progress * 4);
    ctx.fillStyle = '#fff'; ctx.font = '800 54px system-ui';
    wrap(ctx, scene.title, 610).slice(0, 2).forEach((line, i) => ctx.fillText(line, 70, 205 + i * 64));
    ctx.fillStyle = '#c7cddd'; ctx.font = '400 25px system-ui';
    wrap(ctx, scene.narration, 610).slice(0, 7).forEach((line, i) => ctx.fillText(line, 75, 365 + i * 36));
    ctx.restore();

    drawDiagram(ctx, scene, index, progress, w, h);

    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(70, h - 55, w - 140, 5);
    ctx.fillStyle = '#8b5cf6'; ctx.fillRect(70, h - 55, (w - 140) * ((index + progress) / total), 5);
    ctx.fillStyle = '#69738c'; ctx.font = '400 17px system-ui'; ctx.fillText(scene.visual, 70, h - 78);
  };

  const estimateDurations = (items, audioDuration) => {
    const weights = items.map(s => Math.max(1, s.narration.trim().split(/\s+/).filter(Boolean).length));
    if (audioDuration > 0) {
      const total = weights.reduce((a, b) => a + b, 0);
      return weights.map(w => Math.max(1800, audioDuration * w / total));
    }
    return weights.map(w => Math.max(2200, Math.min(10000, (w / 2.5) * 1000)));
  };

  async function render() {
    const items = scenes();
    if (!items.length) { status.textContent = 'Create a storyboard first.'; return; }
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
      status.textContent = 'This browser does not support in-browser video recording.'; return;
    }

    enhancedButton.disabled = true; state.textContent = 'Rendering'; status.textContent = 'Preparing educational visuals…';
    preview.hidden = true; download.hidden = true;
    if (outputUrl) URL.revokeObjectURL(outputUrl);

    const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
    const ctx = canvas.getContext('2d'); const videoStream = canvas.captureStream(24);
    let audioElement = null, audioStream = null, audioDuration = 0;

    if (audioPreview?.src && !audioPreview.hidden) {
      audioElement = new Audio(audioPreview.src); audioElement.preload = 'auto';
      try {
        await new Promise((resolve, reject) => { audioElement.onloadedmetadata = resolve; audioElement.onerror = reject; });
        audioDuration = Number.isFinite(audioElement.duration) ? audioElement.duration * 1000 : 0;
        audioStream = audioElement.captureStream ? audioElement.captureStream() : (audioElement.mozCaptureStream ? audioElement.mozCaptureStream() : null);
      } catch (_) { audioElement = null; audioStream = null; }
    }

    const durations = estimateDurations(items, audioDuration);
    const totalMs = durations.reduce((a, b) => a + b, 0);
    status.textContent = `Automatic timing ready: ${(totalMs / 1000).toFixed(1)} seconds.`;

    const combined = new MediaStream();
    videoStream.getVideoTracks().forEach(track => combined.addTrack(track));
    if (audioStream) audioStream.getAudioTracks().forEach(track => combined.addTrack(track));
    const mime = ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(t => MediaRecorder.isTypeSupported(t)) || '';
    let recorder;
    try { recorder = new MediaRecorder(combined, mime ? { mimeType:mime, videoBitsPerSecond:1800000, audioBitsPerSecond:128000 } : { videoBitsPerSecond:1800000 }); }
    catch (_) { status.textContent = 'Video recording could not start on this browser.'; enhancedButton.disabled = false; return; }

    const chunks = []; recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const finished = new Promise(resolve => { recorder.onstop = resolve; });
    recorder.start(500);
    if (audioElement) { try { await audioElement.play(); } catch (_) {} }

    let elapsedBefore = 0;
    for (let i = 0; i < items.length; i++) {
      const start = performance.now(), duration = durations[i];
      while (performance.now() - start < duration) {
        const progress = Math.min(1, (performance.now() - start) / duration);
        draw(ctx, canvas, items[i], i, items.length, progress);
        const elapsed = elapsedBefore + performance.now() - start;
        status.textContent = `Rendering scene ${i + 1} of ${items.length} — ${Math.min(100, Math.round(elapsed / totalMs * 100))}%`;
        await new Promise(requestAnimationFrame);
      }
      elapsedBefore += duration;
    }

    if (audioElement) { audioElement.pause(); audioElement.currentTime = 0; }
    recorder.stop(); await finished;
    combined.getTracks().forEach(track => track.stop()); videoStream.getTracks().forEach(track => track.stop());

    const blob = new Blob(chunks, { type:mime || 'video/webm' });
    outputUrl = URL.createObjectURL(blob); preview.src = outputUrl; preview.hidden = false; preview.load();
    const hasAudio = Boolean(audioStream);
    download.href = outputUrl; download.download = hasAudio ? 'anteneh-ai-studio-video-with-narration.webm' : 'anteneh-ai-studio-video.webm';
    download.textContent = `Download video${hasAudio ? ' with narration' : ''} (${Math.max(1, Math.round(blob.size / 1024 / 1024 * 10) / 10)} MB)`; download.hidden = false;
    state.textContent = 'Video ready'; status.textContent = hasAudio ? 'Video ready with narration, automatic timing, and animated educational visuals. Format: WebM.' : 'Video ready with automatic timing and animated educational visuals. Format: WebM.';
    enhancedButton.disabled = false;
  }

  enhancedButton.addEventListener('click', render);
})();
