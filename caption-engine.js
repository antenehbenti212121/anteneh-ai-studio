(() => {
  const old = document.getElementById('videoBtn');
  if (!old) return;
  const button = old.cloneNode(true);
  old.replaceWith(button);
  const $ = id => document.getElementById(id);
  const status = $('videoStatus');
  const state = $('projectState');
  const preview = $('videoPreview');
  const download = $('downloadVideo');
  const audioPreview = $('audioPreview');
  const styleSelect = $('style');
  let outputUrl = null;

  const getScenes = () => [...document.querySelectorAll('.scene')].map((n, i) => ({
    title: n.querySelector('.scene-title')?.value || `Scene ${i + 1}`,
    narration: n.querySelector('.scene-narration')?.value || '',
    visual: n.querySelector('.scene-visual')?.value || ''
  }));
  const words = s => String(s).trim().split(/\s+/).filter(Boolean);
  const wrap = (ctx, text, width) => { const out = []; let line = ''; for (const word of words(text)) { const next = line ? `${line} ${word}` : word; if (ctx.measureText(next).width > width && line) { out.push(line); line = word; } else line = next; } if (line) out.push(line); return out; };
  const round = (c, x, y, w, h, r = 18) => { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t * t * (3 - 2 * t);
  const mode = s => { const t = `${s.title} ${s.visual} ${s.narration}`.toLowerCase(); if (/timeline|history|year|century|era|past|future/.test(t)) return 'timeline'; if (/cycle|circular|repeat|water cycle|carbon cycle/.test(t)) return 'cycle'; if (/cause|effect|because|leads to|results in|impact/.test(t)) return 'cause'; if (/formula|equation|calculate|percentage|percent|math|number|rate|ratio/.test(t)) return 'formula'; if (/hierarchy|levels|types|categories|classification|layers/.test(t)) return 'hierarchy'; if (/before|after|transform|change|growth|improve/.test(t)) return 'before'; if (/compare|comparison|versus|difference|similar/.test(t)) return 'compare'; if (/mistake|misconception|avoid|warning|error|wrong/.test(t)) return 'warning'; if (/example|real-world|application|case study/.test(t)) return 'example'; if (/recap|takeaway|key point|remember|summary|closing/.test(t)) return 'recap'; if (/step|process|how it works|how to|method|stages/.test(t)) return 'steps'; return 'concept'; };
  const palette = style => style === 'Whiteboard' ? { bg: '#fffdf7', ink: '#111827', muted: '#526174', accent: '#2563eb', accent2: '#0ea5e9', line: '#d8e1ec', soft: '#eef4fb' } : style === 'Minimal motion graphics' ? { bg: '#f5f7fb', ink: '#101827', muted: '#526174', accent: '#5b5bd6', accent2: '#06b6d4', line: '#dfe4ee', soft: '#e9eafd' } : style === 'Modern presentation' ? { bg: '#090d1c', ink: '#ffffff', muted: '#b8c2d7', accent: '#9b7cff', accent2: '#22d3ee', line: 'rgba(255,255,255,.13)', soft: 'rgba(155,124,255,.13)' } : { bg: '#0b1224', ink: '#ffffff', muted: '#b9c3d8', accent: '#7c6cff', accent2: '#22d3ee', line: 'rgba(255,255,255,.13)', soft: 'rgba(124,108,255,.13)' };
  const captionChunks = text => { const ws = words(text), size = 8, out = []; for (let i = 0; i < ws.length; i += size) out.push(ws.slice(i, i + size).join(' ')); return out.length ? out : ['']; };

  function arrow(c, x1, y1, x2, y2, color, width = 5, progress = 1) {
    const q = clamp(progress); const x = x1 + (x2 - x1) * q; const y = y1 + (y2 - y1) * q;
    c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x, y); c.stroke();
    if (q > .82) { const a = Math.atan2(y2 - y1, x2 - x1); c.fillStyle = color; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - 14 * Math.cos(a - .5), y2 - 14 * Math.sin(a - .5)); c.lineTo(x2 - 14 * Math.cos(a + .5), y2 - 14 * Math.sin(a + .5)); c.closePath(); c.fill(); }
  }

  function drawDiagram(c, s, m, p, pal, style) {
    const x = 735, y = 130, w = 490, h = 415; c.save();
    const light = style === 'Whiteboard' || style === 'Minimal motion graphics';
    c.fillStyle = light ? 'rgba(255,255,255,.88)' : 'rgba(255,255,255,.045)'; c.strokeStyle = pal.line; c.lineWidth = 2; round(c, x, y, w, h, 28); c.fill(); c.stroke();
    c.fillStyle = pal.muted; c.font = '800 13px system-ui, sans-serif'; c.textAlign = 'left'; c.fillText(m.toUpperCase(), x + 28, y + 32);
    const pulse = .5 + .5 * Math.sin(p * Math.PI * 2);
    if (m === 'steps') {
      ['START', 'LEARN', 'APPLY'].forEach((v, i) => { const q = ease(clamp(p * 3 - i)); const bx = x + 30 + i * 145, by = y + 115 - (1 - q) * 12; c.globalAlpha = q; c.fillStyle = i === 1 ? pal.accent : pal.soft; round(c, bx, by, 112, 82, 18); c.fill(); c.strokeStyle = pal.line; c.stroke(); c.fillStyle = i === 1 ? '#fff' : pal.ink; c.textAlign = 'center'; c.font = '900 18px system-ui'; c.fillText(String(i + 1), bx + 56, by + 31); c.font = '800 12px system-ui'; c.fillText(v, bx + 56, by + 57); if (i < 2) arrow(c, bx + 114, by + 41, bx + 140, by + 41, pal.accent2, 4, clamp(p * 3 - i)); });
    } else if (m === 'timeline') {
      const yy = y + 215; arrow(c, x + 58, yy, x + 425, yy, pal.accent, 5, clamp(p * 1.2)); ['PAST', 'CHANGE', 'NOW'].forEach((v, i) => { const q = ease(clamp(p * 3 - i)); const cx = x + 75 + i * 165; c.globalAlpha = q; c.fillStyle = i === 2 ? pal.accent2 : pal.accent; c.beginPath(); c.arc(cx, yy, 15, 0, Math.PI * 2); c.fill(); c.fillStyle = pal.ink; c.font = '800 13px system-ui'; c.fillText(v, cx, yy + 45); });
    } else if (m === 'cycle') {
      const cx = x + 245, cy = y + 218, r = 115; c.strokeStyle = pal.line; c.lineWidth = 16; c.beginPath(); c.arc(cx, cy, r, -.9, Math.PI * 1.55); c.stroke(); c.strokeStyle = pal.accent; c.lineWidth = 9; c.beginPath(); c.arc(cx, cy, r, -.9, -.9 + Math.PI * 1.55 * ease(p)); c.stroke(); c.fillStyle = pal.ink; c.textAlign = 'center'; c.font = '900 23px system-ui'; c.fillText('CYCLE', cx, cy + 8); c.font = '700 12px system-ui'; c.fillStyle = pal.muted; c.fillText('repeat → improve → repeat', cx, cy + 34);
    } else if (m === 'cause') {
      const by = y + 150; c.fillStyle = pal.soft; round(c, x + 30, by, 145, 76, 16); c.fill(); c.fillStyle = pal.ink; c.textAlign = 'center'; c.font = '900 16px system-ui'; c.fillText('CAUSE', x + 102, by + 45); arrow(c, x + 180, by + 38, x + 305, by + 38, pal.accent, 5, clamp(p * 1.5)); c.fillStyle = pal.accent; round(c, x + 315, by, 145, 76, 16); c.fill(); c.fillStyle = '#fff'; c.fillText('EFFECT', x + 387, by + 45);
    } else if (m === 'formula') {
      c.fillStyle = pal.soft; round(c, x + 35, y + 135, 420, 125, 22); c.fill(); c.textAlign = 'center'; c.fillStyle = pal.muted; c.font = '800 12px system-ui'; c.fillText('INPUT → RULE → RESULT', x + 245, y + 164); c.fillStyle = pal.ink; c.font = '900 27px system-ui'; c.fillText('value  ×  rate  =  result', x + 245, y + 215); c.fillStyle = pal.accent; c.fillRect(x + 70, y + 237, 350 * ease(p), 5);
    } else if (m === 'hierarchy') {
      c.fillStyle = pal.accent; round(c, x + 150, y + 70, 190, 62, 16); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '900 15px system-ui'; c.fillText('MAIN IDEA', x + 245, y + 108); arrow(c, x + 245, y + 135, x + 245, y + 205, pal.accent2, 4, clamp(p * 1.6)); ['TYPE A', 'TYPE B', 'TYPE C'].forEach((v, i) => { const bx = x + 32 + i * 145; c.fillStyle = pal.soft; round(c, bx, y + 225, 112, 58, 14); c.fill(); c.fillStyle = pal.ink; c.font = '800 12px system-ui'; c.fillText(v, bx + 56, y + 260); });
    } else if (m === 'compare' || m === 'before') {
      const labels = m === 'before' ? ['BEFORE', 'AFTER'] : ['A', 'B']; const left = x + 30, top = y + 115; c.fillStyle = pal.soft; round(c, left, top, 185, 175, 20); c.fill(); c.fillStyle = pal.ink; c.textAlign = 'center'; c.font = '900 22px system-ui'; c.fillText(labels[0], left + 92, top + 96); arrow(c, left + 198, top + 87, left + 285, top + 87, pal.accent, 6, clamp(p * 1.3)); c.fillStyle = pal.accent; round(c, x + 275, top, 185, 175, 20); c.fill(); c.fillStyle = '#fff'; c.fillText(labels[1], x + 367, top + 96);
    } else {
      const label = m === 'warning' ? 'WATCH OUT' : m === 'example' ? 'REAL EXAMPLE' : m === 'recap' ? 'TAKEAWAY' : 'BIG IDEA'; c.fillStyle = m === 'warning' ? '#f59e0b' : pal.accent; c.globalAlpha = .16; c.beginPath(); c.arc(x + 245, y + 215, 115 + pulse * 8, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; c.fillStyle = m === 'warning' ? '#f59e0b' : pal.accent; c.beginPath(); c.arc(x + 245, y + 215, 78, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '900 20px system-ui'; c.fillText(label, x + 245, y + 222);
    }
    c.restore();
  }

  function draw(c, s, i, total, p, style, caption) {
    const pal = palette(style), w = c.canvas.width, h = c.canvas.height, m = mode(s), light = style === 'Whiteboard' || style === 'Minimal motion graphics';
    c.clearRect(0, 0, w, h); c.fillStyle = pal.bg; c.fillRect(0, 0, w, h);
    if (!light) { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#060b18'); g.addColorStop(.55, style === 'Modern presentation' ? '#1b1532' : '#101a34'); g.addColorStop(1, '#070b15'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.globalAlpha = .13; c.fillStyle = pal.accent; c.beginPath(); c.arc(1080, 90, 210 + 20 * Math.sin(p * 2), 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
    if (style === 'Whiteboard') { c.strokeStyle = pal.line; c.lineWidth = 1; for (let yy = 92; yy < h - 170; yy += 42) { c.beginPath(); c.moveTo(0, yy); c.lineTo(w, yy); c.stroke(); } c.strokeStyle = pal.accent; c.lineWidth = 4; c.globalAlpha = .65; c.beginPath(); c.moveTo(45, 102); c.lineTo(190, 102); c.stroke(); c.globalAlpha = 1; }
    if (style === 'Minimal motion graphics') { c.globalAlpha = .12; for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? pal.accent2 : pal.accent; const xx = 90 + k * 220 + Math.sin(p * 4 + k) * 18, yy = 105 + Math.cos(p * 3 + k) * 35; c.beginPath(); c.arc(xx, yy, 32 + (k % 3) * 15, 0, Math.PI * 2); c.fill(); } c.globalAlpha = 1; }
    c.fillStyle = pal.accent; c.font = '900 18px system-ui, sans-serif'; c.fillText('ANTENEH AI STUDIO', 55, 48); c.fillStyle = pal.muted; c.font = '800 13px system-ui'; c.fillText(`SCENE ${String(i + 1).padStart(2, '0')}  /  ${String(total).padStart(2, '0')}`, 55, 73);
    const intro = ease(clamp(p * 5)); const lift = (1 - intro) * 24; c.save(); c.globalAlpha = intro; c.translate(0, lift);
    c.fillStyle = pal.ink; c.font = '900 49px system-ui, sans-serif'; const titleLines = wrap(c, s.title, 620).slice(0, 2); titleLines.forEach((line, n) => c.fillText(line, 55, 170 + n * 56));
    c.fillStyle = pal.accent; c.fillRect(55, 285, 90 + 90 * intro, 5);
    c.fillStyle = pal.muted; c.font = '400 21px system-ui, sans-serif'; wrap(c, s.narration, 620).slice(0, 6).forEach((line, n) => c.fillText(line, 58, 330 + n * 31)); c.restore();
    drawDiagram(c, s, m, p, pal, style);
    if (caption) { const capIn = ease(clamp(p * 8)); c.globalAlpha = capIn; c.fillStyle = light ? 'rgba(17,24,39,.93)' : 'rgba(0,0,0,.82)'; round(c, 120, h - 128, 1040, 68, 18); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '800 21px system-ui'; wrap(c, caption, 940).slice(0, 2).forEach((line, n) => c.fillText(line, 640, h - 88 + n * 27)); c.globalAlpha = 1; }
    c.textAlign = 'left'; c.fillStyle = pal.muted; c.font = '500 12px system-ui'; wrap(c, s.visual, 1050).slice(0, 1).forEach(v => c.fillText(v, 55, h - 48));
    c.fillStyle = pal.line; c.fillRect(55, h - 22, w - 110, 4); c.fillStyle = pal.accent; c.fillRect(55, h - 22, (w - 110) * clamp((i + p) / total), 4);
  }

  const mime = () => ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)) || '';
  async function audioTrack() {
    if (!audioPreview?.src || audioPreview.hidden) return { stream: null, ms: 0, cleanup: () => {}, reason: 'none' };
    const a = new Audio(audioPreview.src); a.preload = 'auto'; await new Promise((ok, bad) => { a.onloadedmetadata = ok; a.onerror = bad; }); const ms = Number.isFinite(a.duration) ? a.duration * 1000 : 0;
    try { const C = window.AudioContext || window.webkitAudioContext; if (!C) throw Error('no audio context'); const ctx = new C(); const src = ctx.createMediaElementSource(a); const dest = ctx.createMediaStreamDestination(); src.connect(dest); src.connect(ctx.destination); await ctx.resume(); return { stream: dest.stream, ms, a, play: () => a.play(), cleanup: () => { try { src.disconnect(); dest.disconnect(); ctx.close(); } catch (_) {} }, reason: 'web-audio' }; }
    catch (_) { try { const fallback = a.captureStream ? a.captureStream() : a.mozCaptureStream ? a.mozCaptureStream() : null; return { stream: fallback, ms, a, play: () => a.play(), cleanup: () => {}, reason: fallback ? 'media-capture' : 'unavailable' }; } catch (__) { return { stream: null, ms, a, play: () => a.play(), cleanup: () => {}, reason: 'unavailable' }; } }
  }

  async function render() {
    const items = getScenes(); if (!items.length) { status.textContent = 'Create a project first.'; return; }
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) { status.textContent = 'Video recording is not supported by this browser.'; return; }
    button.disabled = true; state.textContent = 'Rendering'; preview.hidden = true; download.hidden = true; status.textContent = 'Preparing sharp educational frames…'; if (outputUrl) URL.revokeObjectURL(outputUrl);
    const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720; const c = canvas.getContext('2d', { alpha: false }); const stream = canvas.captureStream(24);
    let au = { stream: null, ms: 0, cleanup: () => {}, reason: 'none' }; try { au = await audioTrack(); } catch (_) {}
    const narrationExpected = !!audioPreview?.src && !audioPreview.hidden; if (narrationExpected && !au.stream) status.textContent = 'Narration found, but this browser cannot route it into the video. Rendering silently.';
    if (au.stream) au.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    const ws = items.map(s => Math.max(1, words(s.narration).length)), sum = ws.reduce((a, b) => a + b, 0); const durations = ws.map(x => au.ms ? Math.max(1400, au.ms * x / sum) : Math.max(2200, Math.min(9000, x / 2.4 * 1000))); const total = durations.reduce((a, b) => a + b, 0); const type = mime();
    if (!type) { status.textContent = 'This browser has no supported video recording format.'; button.disabled = false; state.textContent = 'Draft'; au.cleanup(); return; }
    let rec; try { rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 2800000, audioBitsPerSecond: 128000 }); } catch (_) { status.textContent = 'This browser could not start its video encoder.'; button.disabled = false; state.textContent = 'Draft'; au.cleanup(); return; }
    const chunks = []; let recordError = ''; rec.onerror = e => { recordError = e?.error?.message || 'encoder error'; }; rec.ondataavailable = e => e.data?.size && chunks.push(e.data); const stopped = new Promise(resolve => rec.onstop = resolve); rec.start(250); if (au.play) try { await au.play(); } catch (_) {}
    const selectedStyle = styleSelect?.value || 'Clean explainer';
    for (let i = 0; i < items.length; i++) {
      const d = durations[i], start = performance.now(), caps = captionChunks(items[i].narration);
      while (performance.now() - start < d) {
        const p = clamp((performance.now() - start) / d); const ci = Math.min(caps.length - 1, Math.floor(p * caps.length)); draw(c, items[i], i, items.length, p, selectedStyle, caps[ci]);
        const percent = Math.round(((durations.slice(0, i).reduce((a, b) => a + b, 0) + p * d) / total) * 100); status.textContent = `Rendering scene ${i + 1} of ${items.length} • ${percent}%`; await new Promise(r => requestAnimationFrame(r));
      }
      // Short visual settle frame between scenes for a cleaner cut.
      draw(c, items[i], i, items.length, 1, selectedStyle, caps[caps.length - 1]); await new Promise(r => requestAnimationFrame(r));
    }
    rec.stop(); await stopped; stream.getTracks().forEach(t => t.stop()); au.cleanup(); if (au.a) au.a.pause();
    const blob = new Blob(chunks, { type: rec.mimeType || type || 'video/webm' }); if (!blob.size || recordError) { status.textContent = recordError ? `Rendering stopped: ${recordError}. Please try again.` : 'No video data was produced. Please try again.'; button.disabled = false; state.textContent = 'Draft'; return; }
    outputUrl = URL.createObjectURL(blob); preview.src = outputUrl; preview.hidden = false; download.href = outputUrl; const ext = (rec.mimeType || type || '').includes('mp4') ? 'mp4' : 'webm'; download.download = `anteneh-ai-studio-${Date.now()}.${ext}`; download.textContent = `Download ${ext.toUpperCase()} video`; download.hidden = false; state.textContent = 'Video ready'; status.textContent = `Video ready • ${ext.toUpperCase()} • sharp diagrams + captions${au.stream ? ' • narration included' : ' • silent render'} • ${Math.round(total / 1000)} seconds`; button.disabled = false;
  }
  button.addEventListener('click', () => render().catch(e => { console.error(e); status.textContent = `Rendering failed: ${e?.message || 'Please try again.'}`; button.disabled = false; state.textContent = 'Draft'; }));
})();