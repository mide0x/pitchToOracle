# Oracle Vision App

An interactive web application where users pitch their ideas through audio recording and receive an animated verdict (VISIONARY or DELUSIONAL) from an Oracle character.

## Features

- **Audio Recording**: Capture user pitches using browser microphone
- **Animated Character**: WebM video animations that respond to user interaction
- **State Machine Flow**: Smooth transitions through idle, listening, processing, and result states
- **Mystical UI**: Particle effects and gradient backgrounds for an immersive experience
- **Verdict Display**: Scroll-based popup revealing the Oracle's judgment with synchronized audio

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **TailwindCSS 4.x** for styling
- **Framer Motion** for animations
- **tsParticles** for particle effects
- **WebM video** with Audio API for character animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── VisionPage.tsx         # Main state machine controller
│   ├── CharacterLayer.tsx     # Video animation manager
│   ├── BackgroundLayer.tsx    # Gradient background
│   ├── ParticleLayer.tsx      # Particle effects
│   ├── VerdictPopup.tsx       # Result scroll display
│   └── VerdictOverlay.tsx     # Verdict overlay component
├── hooks/
│   └── useAudioRecorder.ts    # Audio recording hook
├── assets/                     # Video, audio, and image files
└── types/
    └── assets.d.ts            # TypeScript asset declarations
```

## API Integration

The app connects to a backend API for idea analysis:

**Endpoint**: `https://is-api-jywq.onrender.com/api/idea/audio`

**Request**: POST with audio file (WebM format, max 10MB)

**Response**:
```json
{
  "category": "VISIONARY" | "DELUSIONAL",
  "feedback": "string"
}
```

## Development

```bash
# Run linter
npm run lint

# Type check
npm run build  # TypeScript compilation is part of build
```

## Video Assets

Character animations are WebM videos with transparency:
- `idle.webm` - Looping idle animation
- `listening.webm` - Recording state animation
- `impressed.webm` - Positive verdict animation
- `disappointed.webm` - Negative verdict animation

### Converting Assets

Use ffmpeg to convert GIFs or videos to WebM:

```bash
ffmpeg -i input.gif -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 output.webm
```

## License

MIT
