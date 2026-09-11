# ANTENEH AI STUDIO

A phone-first, browser-based educational video studio.

## Current MVP

- Explainer, Whiteboard, and Presentation styles
- Topic/script → automatic scene breakdown
- Visual diagrams and animated canvas scenes
- 16:9, 9:16, and 1:1 formats
- 30 sec, 60 sec, 90 sec, and 2 min recording options
- English and Amharic browser voice preview
- Local project save/restore with browser storage
- Browser video recording with MediaRecorder (WebM)
- No external GPU and no external AI API required for the current browser engine
- Responsive phone + desktop interface

## Architecture

The current MVP is intentionally lightweight: a single static `index.html` using browser Canvas, Web Speech, localStorage, and MediaRecorder. This keeps the first working version inexpensive and usable on a low-spec computer or Android browser.

## Roadmap

1. Scene editor and timeline
2. Captions and timing controls
3. More whiteboard assets and transitions
4. Better Amharic typography and voice controls
5. Project history and cloud storage
6. Optional server-side MP4 export
7. Supabase authentication/storage when needed
