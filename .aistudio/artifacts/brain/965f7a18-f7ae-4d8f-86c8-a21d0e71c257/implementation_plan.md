# Multilingual Wake Word & Emotion-Aware Voice Modulation

A precision voice architecture upgrade for JARVIS Mark VII introducing dual-language wake word recognition (English and Telugu), automatic session language locking, wake sensitivity threshold tuning, and dynamic emotion-guided vocal modulation (pitch, speaking rate, intonation) with user intensity controls.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during the alignment phase:
> - **Dual Wake Word Trigger**: Speech recognition listens for both English "Jarvis" / "Hey Jarvis" and Telugu "జార్విస్" (Telugu script & phonetic Tanglish variants: "jarvis", "jaarvis", "jaaarvis").
> - **Language Auto-Locking**: Detecting the wake word in English locks the active conversation stream to English/Tanglish; detecting the wake word in Telugu immediately locks the voice recognizer, system instruction, and speech synthesizer to Telugu until Sir switches or resets.
> - **Balanced Emotion Voice Modulation**: A dedicated modulation slider (0% to 100%) scales vocal dynamics:
>   - **Urgency**: +20% speed, slightly elevated pitch, crisp staccato cadence.
>   - **Frustration / Confusion**: -15% speed, reassuring lower pitch, extended pauses.
>   - **Excitement / Happiness**: +10% speed, melodic pitch lift, brighter vocal resonance.
>   - **Stress**: -10% speed, calm centered pitch.
>   - **Calm**: Standard British Stark butler baseline (1.0x rate, 1.0 pitch).
> - **Wake Sensitivity Presets**: Low (strict verification), Medium (balanced standard), High (quick trigger).

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades JARVIS's voice pipeline so Sir can activate the system hands-free in either English or Telugu. The instant "జార్విస్" or "Jarvis" is perceived, the Arc Reactor bursts into its wake flare, and the entire cognitive stack locks to that language. Furthermore, as Sir speaks, the Human-Emotion Awareness Engine modulates the synthetic speech output (pitch, speed, prosodic emphasis) in real time according to Sir's emotional state, balanced by a user-controlled intensity slider in the HUD and Diagnostics panel.
- **Target Audience / Persona**: Sir, demanding frictionless hands-free bilingual interaction with empathetic, cinema-grade audio feedback.
- **Key Value**: Eliminates language friction between English and Telugu while providing authentic vocal empathy that mirrors human conversational subtleties without sacrificing the iconic Stark aesthetic.

---

## 2. User Experience & Visual Design

- **HUD Controls & Visual Indicators**:
  - **Wake Word Sensitivity Selector**: Segmented HUD toggle (`Low` | `Medium` | `High`) mounted directly in the Left HUD Panel and Diagnostics Modal.
  - **Active Language Lock Badge**: Luminous indicator on the Arc Reactor readout showing `LOCKED: ENGLISH` or `LOCKED: TELUGU (తెలుగు)`.
  - **Emotion Modulation Slider & Toggle**: Located in the Diagnostics modal and Left HUD panel, allowing Sir to enable/disable emotion modulation and scale intensity (`0% - Subtle` to `100% - Expressive`).
  - **Reactor Aura Sync**: When Telugu wake word is recognized, the outer Arc ring pulses with a warm golden-cyan resonance before settling into active listening.
- **Voice Flow**:
  1. Sir says "జార్విస్" (or "Jarvis").
  2. The multilingual phoneme parser triggers `WAKE_WORD_DETECTED`.
  3. Language switches to Telugu (STT lang `te-IN`, TTS voice profile selects Telugu/Indian regional voice if available, fallback Tanglish synthesis).
  4. Sir says: "నమస్కారం, రేపు మన ప్రాజెక్ట్ డెడ్ లైన్ ఎప్పుడు?"
  5. The emotion engine detects `Urgency` + `Telugu`.
  6. JARVIS speeds up delivery slightly (+15%), tightens phrasing, and delivers a respectful, rapid response: "సర్, రేపు మధ్యాహ్నం 3 గంటలకు Stark Lab రివ్యూ షెడ్యూల్ చేయబడింది."

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Phoneme Pattern Matching over Cloud Wake Word Model**
  - *Chosen Approach*: Client-side streaming pattern matching across Web Speech API interim tokens supporting both Unicode Telugu script (`జార్విస్`, `జార్విజ్`) and Romanized phonetic variations (`jarvis`, `jaarvis`, `zharvis`).
  - *Why*: Instant zero-latency detection without requiring a 50MB background neural model or additional external cloud streaming bandwidth.
  - *Alternatives Considered*: Server-side audio stream streaming—rejected due to excessive latency (>600ms round-trip) and mobile network constraints.

- **Decision 2: Prosodic Audio Modulation Mapping**
  - *Chosen Approach*: Algorithmic mathematical mapping of emotion vectors to `SpeechSynthesisUtterance.rate` and `SpeechSynthesisUtterance.pitch`, scaled by `modulationIntensity` (0.0 to 1.0).
  - *Why*: Universal compatibility across iOS Safari, Chromium, Edge, and Android without requiring proprietary external TTS subscriptions.
  - *Alternatives Considered*: Pre-rendered cloud TTS audio generation—considered as an optional server fallback, but Web Speech Synthesis provides zero-latency barge-in and immediate client response.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SIR'S VOICE INPUT STREAM                        │
│                   (English / Telugu / Tanglish Audio)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              MULTILINGUAL WAKE-WORD DETECTION ENGINE                   │
│  - Sensitivity Threshold Filter: [Low | Med | High]                   │
│  - Dual Recognizer Regexes:                                            │
│      English: /^(hey |hi )?jarvis\b/i                                  │
│      Telugu:  /(జార్విస్|జార్విజ్|jaarvis|jarvis)/i                    │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
    [English Wake Word Detected]       [Telugu Wake Word Detected]
                    │                                │
                    ▼                                ▼
┌───────────────────────────────────┐ ┌──────────────────────────────────┐
│   LOCK SESSION: ENGLISH/TANGLISH  │ │       LOCK SESSION: TELUGU       │
│   • STT Lang: en-US               │ │   • STT Lang: te-IN              │
│   • Target TTS: UK Butler Voice   │ │   • Target TTS: Telugu / Indic   │
│   • Prompt Context: English       │ │   • Prompt Context: Pure Telugu  │
└───────────────────┬───────────────┘ └──────────────┬───────────────────┘
                    │                                │
                    └───────────────┬────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   HUMAN-EMOTION AWARENESS ENGINE                       │
│  - Evaluates Sentiment Markers, Pitch Volatility & Phrasing           │
│  - Outputs Emotion Vector: [Calm | Urgency | Frustration | Excitement] │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│           EMOTION-AWARE TEXT-TO-SPEECH (TTS) MODULATOR                 │
│  - User Intensity Scale: 0% to 100% (Subtle -> Expressive)             │
│  - Target Rate = BaseRate * (1 + EmotionRateDelta * Intensity)         │
│  - Target Pitch = BasePitch * (1 + EmotionPitchDelta * Intensity)      │
│  - Real-time Barge-In Audio Interruption Handler                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    ARC REACTOR HUD & AUDIO OUTPUT                      │
│        (Pulsing Cyan-Gold Reactor, Reactive Waveform, Vocal TTS)       │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

1. **`src/hooks/useVoiceEngine.ts`**:
   - Add `wakeWordLanguage`: `'auto' | 'en' | 'te'`.
   - Add `wakeSensitivity`: `'low' | 'medium' | 'high'`.
   - Add `emotionModulationEnabled`: boolean (default: `true`).
   - Add `emotionModulationIntensity`: number (0 to 1, default: `0.7`).
   - Upgrade recognition stream to process Telugu unicode and romanized phonemes.
   - Implement `calculateEmotionModulation(emotion, baseRate, basePitch, intensity)` computing adjusted pitch, rate, and punctuation pauses.
2. **`src/components/DiagnosticsModal.tsx` & `src/components/LeftHUDPanel.tsx`**:
   - Add Wake Sensitivity buttons (`Low`, `Med`, `High`).
   - Add Emotion Modulation switch and slider with real-time audio test button.
   - Add Language Lock indicator.
3. **`server.ts`**:
   - Enhance `/api/chat` to enforce strict Telugu language responses when `currentLanguage === 'Telugu'`.
