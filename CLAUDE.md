# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite application that implements an interactive "Oracle" experience where users record audio to pitch their ideas and receive a verdict (VISIONARY or DELUSIONAL) through an animated character interface.

## Development Commands

```bash
npm run dev      # Start development server (uses Vite)
npm run build    # TypeScript compilation + production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

### State Machine Flow

The application follows a strict state machine pattern centered around the `VisionPage` component:

1. **idle** → User taps character to begin
2. **listening** → Audio recording in progress (uses `useAudioRecorder` hook)
3. **processing** → Audio sent to backend API
4. **result** → Character plays verdict animation + audio, shows popup

State transitions are unidirectional and managed in `VisionPage.tsx`.

### Component Hierarchy

```
VisionPage (state manager)
├── BackgroundLayer (static gradient)
├── ParticleLayer (tsparticles animations)
├── CharacterLayer (video playback + audio sync)
└── VerdictPopup (scroll overlay with verdict text)
```

### Character Animation System

The `CharacterLayer` component manages video playback based on status:
- **idle**: loops idle.webm
- **listening/processing**: plays listening.webm (shared video for both states)
- **result**: plays impressed.webm or disappointed.webm (one-shot)

**Critical timing logic:**
- Result videos trigger `onShowVerdict()` callback 3 seconds before video end
- Audio files (MP3) play in sync with result videos
- Video key stabilization prevents remounting between listening→processing transition

### Audio Recording

`useAudioRecorder` hook:
- Records audio as WebM format (audio/webm)
- Returns Blob on `stopRecording()`
- Automatically releases microphone resources

### Backend Integration

API endpoint: `https://is-api-jywq.onrender.com/api/idea/audio`

**Development proxy configuration:**
- Vite proxy redirects `/api/*` to the backend (vite.config.ts:8-14)
- This bypasses CORS issues in development
- Audio must be <10MB (validated in `getVerdict()`)

**Expected response shape:**
```typescript
{
  category: "VISIONARY" | "DELUSIONAL"
  feedback: string
  // Note: Backend may return additional fields
}
```

### Asset Management

Video assets (WebM):
- `idle.webm`, `listening.webm`, `impressed.webm`, `disappointed.webm`
- Located in `src/assets/`

Audio assets (MP3):
- Verdict audio files in subdirectories (`impressed_animation/`, `not_impressed_animation/`)
- Played via Audio API, not video soundtrack

Image assets:
- `scroll.png` - Used in VerdictPopup as backdrop for verdict text

**Converting assets:**
Use ffmpeg for video conversions (ffmpeg is installed):
```bash
ffmpeg -i input.gif -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 output.webm
```

### Styling

- TailwindCSS 4.x with custom cream color theme
- Mobile-first design with responsive breakpoints (md:)
- Framer Motion for all animations
- Custom vignette and particle effects for mystical aesthetic

### Type Definitions

Custom asset type declarations in `src/types/assets.d.ts` for importing media files.

## Important Patterns

**Viewport-based sizing:** The VerdictPopup scroll uses viewport width (`w-[40vw]`) with max-width constraints for responsive scaling.

**Safe area handling:** Mobile layouts account for notches/home indicators with `safe-area-inset-bottom`.

**Video stability:** The character video uses a stabilized key system (`getVideoKey()`) to prevent unnecessary remounts during state transitions.

**Animation coordination:** VerdictPopup appears 3 seconds before video end using `onTimeUpdate` polling in CharacterLayer.
