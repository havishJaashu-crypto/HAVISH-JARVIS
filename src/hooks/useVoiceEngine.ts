import { useState, useEffect, useRef, useCallback } from 'react';
import { ReactorState, EmotionType, WakeSensitivity, LanguageLock } from '../types';

interface VoiceEngineProps {
  onTranscriptReady?: (transcript: string, emotion: EmotionType, language: string) => void;
  wakeWordEnabled?: boolean;
  initialSensitivity?: WakeSensitivity;
}

export function useVoiceEngine({
  onTranscriptReady,
  wakeWordEnabled = true,
  initialSensitivity = 'medium',
}: VoiceEngineProps = {}) {
  const [reactorState, setReactorState] = useState<ReactorState>('IDLE');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('Calm');

  // Voice Tuning Controls
  const [speechRate, setSpeechRate] = useState<number>(1.05);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Multilingual Wake Word & Language Lock Settings
  const [wakeSensitivity, setWakeSensitivity] = useState<WakeSensitivity>(initialSensitivity);
  const [lockedLanguage, setLockedLanguage] = useState<LanguageLock>('auto');

  // Emotion-Aware Voice Modulation
  const [emotionModulationEnabled, setEmotionModulationEnabled] = useState<boolean>(true);
  const [emotionModulationIntensity, setEmotionModulationIntensity] = useState<number>(0.75); // 0.0 to 1.0

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isSpeakingRef = useRef<boolean>(false);

  // Emotion Modulation Offsets
  const emotionDeltas: Record<EmotionType, { rateDelta: number; pitchDelta: number }> = {
    Urgency: { rateDelta: 0.22, pitchDelta: 0.12 },
    Excited: { rateDelta: 0.14, pitchDelta: 0.16 },
    Happiness: { rateDelta: 0.06, pitchDelta: 0.08 },
    Confusion: { rateDelta: -0.15, pitchDelta: 0.06 },
    Frustration: { rateDelta: -0.12, pitchDelta: -0.08 },
    Stress: { rateDelta: -0.08, pitchDelta: -0.05 },
    Sadness: { rateDelta: -0.18, pitchDelta: -0.12 },
    Calm: { rateDelta: 0.0, pitchDelta: 0.0 },
  };

  // Initialize available browser voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Prefer English UK or US or high quality voice
        const preferred =
          voices.find(
            (v) =>
              v.name.includes('Daniel') ||
              v.name.includes('Oliver') ||
              v.name.includes('UK English') ||
              v.lang === 'en-GB'
          ) ||
          voices.find((v) => v.name.includes('Google UK English Male') || v.name.includes('Natural')) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        if (preferred && !selectedVoiceName) {
          setSelectedVoiceName(preferred.name);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    // Older iOS Safari Audio Unlocking listener
    const unlockIosAudio = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Warm up speech synthesis on older iOS
        try {
          const dummy = new SpeechSynthesisUtterance('');
          dummy.volume = 0;
          window.speechSynthesis.speak(dummy);
        } catch (e) {}
      }
    };
    window.addEventListener('touchstart', unlockIosAudio, { once: true });
    window.addEventListener('pointerdown', unlockIosAudio, { once: true });
    return () => {
      window.removeEventListener('touchstart', unlockIosAudio);
      window.removeEventListener('pointerdown', unlockIosAudio);
    };
  }, [selectedVoiceName]);

  // Audio Analyser Loop for mic (with older iOS & legacy mediaDevices fallback)
  const startAudioAnalyser = async () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (!micStreamRef.current) {
        // High-gain audio constraints for MAXIMUM capture sensitivity
        const audioConstraints = {
          echoCancellation: true,
          noiseSuppression: false, // Prevents clipping quiet or distant voice
          autoGainControl: true,   // Maximize input auto-gain
          channelCount: 1,
          sampleRate: 48000,
        };

        let stream: MediaStream;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
        } else {
          // Legacy getUserMedia fallback for older iOS and Android WebKit
          const legacyGUM =
            (navigator as any).getUserMedia ||
            (navigator as any).webkitGetUserMedia ||
            (navigator as any).mozGetUserMedia;
          if (!legacyGUM) throw new Error('Microphone capture not supported on this browser version.');
          stream = await new Promise<MediaStream>((res, rej) =>
            legacyGUM.call(navigator, { audio: audioConstraints }, res, rej)
          );
        }

        micStreamRef.current = stream;

        const source = audioContextRef.current.createMediaStreamSource(stream);

        // Voice Pre-Amplifier Gain (3.5x boost for maximum voice sensitivity)
        const preAmp = audioContextRef.current.createGain();
        preAmp.gain.setValueAtTime(3.5, audioContextRef.current.currentTime);

        // Dynamic Range Compressor to normalize low whisper vs high speech
        const compressor = audioContextRef.current.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-45, audioContextRef.current.currentTime);
        compressor.knee.setValueAtTime(20, audioContextRef.current.currentTime);
        compressor.ratio.setValueAtTime(8, audioContextRef.current.currentTime);
        compressor.attack.setValueAtTime(0.003, audioContextRef.current.currentTime);
        compressor.release.setValueAtTime(0.2, audioContextRef.current.currentTime);

        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.25;

        source.connect(preAmp);
        preAmp.connect(compressor);
        compressor.connect(analyser);
        analyserRef.current = analyser;
      }

      const updateLevel = () => {
        if (analyserRef.current && !isSpeakingRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          // Boosted 2x amplitude scaling so Arc Reactor responds with peak visual intensity
          const normalized = Math.min(100, Math.round((avg / 64) * 100));
          setAudioLevel(normalized);
        }
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err: any) {
      console.warn('Microphone audio context access:', err);
    }
  };

  const stopAudioAnalyser = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  // Emotion detector from conversational cues, sentiment, and pacing
  const analyzeEmotion = (text: string): EmotionType => {
    const lower = text.toLowerCase();
    if (
      lower.includes('urgent') ||
      lower.includes('emergency') ||
      lower.includes('fast') ||
      lower.includes('quick') ||
      lower.includes('tvaraga') ||
      lower.includes('jaldi') ||
      lower.includes('ventane') ||
      lower.includes('ipude')
    ) {
      return 'Urgency';
    }
    if (
      lower.includes('why') ||
      lower.includes('confused') ||
      lower.includes("don't understand") ||
      lower.includes('artham kale') ||
      lower.includes('ardham kaaledu') ||
      lower.includes('theliyadu')
    ) {
      return 'Confusion';
    }
    if (
      lower.includes('frustrated') ||
      lower.includes('angry') ||
      lower.includes('hate') ||
      lower.includes('irritating') ||
      lower.includes('chiraaku') ||
      lower.includes('kopam') ||
      lower.includes('kashtam')
    ) {
      return 'Frustration';
    }
    if (
      lower.includes('sad') ||
      lower.includes('unhappy') ||
      lower.includes('bad') ||
      lower.includes('depressed') ||
      lower.includes('baadha') ||
      lower.includes('edupu')
    ) {
      return 'Sadness';
    }
    if (
      lower.includes('awesome') ||
      lower.includes('great') ||
      lower.includes('excellent') ||
      lower.includes('love') ||
      lower.includes('super') ||
      lower.includes('bagundhi') ||
      lower.includes('kekaa') ||
      lower.includes('adbhutam')
    ) {
      return 'Excited';
    }
    if (
      lower.includes('happy') ||
      lower.includes('good') ||
      lower.includes('glad') ||
      lower.includes('santhosham') ||
      lower.includes('haayi')
    ) {
      return 'Happiness';
    }
    if (
      lower.includes('stressed') ||
      lower.includes('tired') ||
      lower.includes('overwhelmed') ||
      lower.includes('tension') ||
      lower.includes('alasata')
    ) {
      return 'Stress';
    }
    return 'Calm';
  };

  // Language detector
  const detectLanguage = (text: string): string => {
    if (lockedLanguage === 'Telugu') return 'Telugu';
    if (lockedLanguage === 'Tanglish') return 'Tanglish';
    if (lockedLanguage === 'Hindi') return 'Hindi';
    if (lockedLanguage === 'English') return 'English';

    // Check Telugu unicode range
    if (/[\u0C00-\u0C7F]/.test(text)) {
      return 'Telugu';
    }
    // Check Tanglish indicators (Telugu phonetic words in Latin script)
    const tanglishKeywords = [
      'ela',
      'undhi',
      'undi',
      'cheppu',
      'repu',
      'ivvala',
      'enti',
      'cheyyi',
      'chudu',
      'kavale',
      'kavali',
      'namaskaram',
      'baga',
      'lekapothe',
      'emiti',
      'cheppandi',
    ];
    const lower = text.toLowerCase();
    for (const kw of tanglishKeywords) {
      if (lower.includes(kw)) {
        return 'Tanglish';
      }
    }
    if (lower.includes('namaste') || lower.includes('kaise') || lower.includes('kya') || lower.includes('batao') || lower.includes('theek')) {
      return 'Hindi';
    }
    return 'English';
  };

  // Multilingual Wake Word Matcher
  const checkWakeWordMatch = (
    text: string
  ): { matched: boolean; language: 'English' | 'Telugu' | null } => {
    const lower = text.toLowerCase().trim();

    // 1. Telugu Wake Word Patterns
    // Unicode: జార్విస్, జార్విజ్, జావర్విస్
    const teluguUnicodeMatch = /(జార్విస్|జార్విజ్|జావర్విస్|జావిస్|నమస్కారం జార్విస్)/.test(text);

    // Phonetic Tanglish Telugu Wake Word
    const teluguPhoneticMatch =
      /\b(jaarvis|zharvis|jarvisu|jarvees)\b/i.test(lower) ||
      (/\bjarvis\b/i.test(lower) && /(నమస్కారం|చెప్పు|ఎలా|ఉంది|బాగున్నావా|repu|ela|undhi|cheppu|cheyyi|enti|emiti)/i.test(lower));

    if (teluguUnicodeMatch || teluguPhoneticMatch) {
      return { matched: true, language: 'Telugu' };
    }

    // 2. English Wake Word Patterns based on Sensitivity
    let englishMatch = false;
    if (wakeSensitivity === 'high') {
      // High: Any occurrence of jarvis
      englishMatch = /jarvis/i.test(lower);
    } else if (wakeSensitivity === 'medium') {
      // Medium: Word boundary match with optional hey/hi prefix
      englishMatch = /\b(hey |hi |hello |ok )?jarvis\b/i.test(lower);
    } else {
      // Low: Strict match requiring phrase at start or clean standalone
      englishMatch = /^(hey |hi |hello |ok )?jarvis(\b|[!?.,])/i.test(lower);
    }

    if (englishMatch) {
      return { matched: true, language: 'English' };
    }

    return { matched: false, language: null };
  };

  // Speech Recognition Setup
  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorStatus(
        'Speech Recognition not supported in this browser. Please use Chrome, Edge, or Safari with microphone permissions.'
      );
      return;
    }

    try {
      await startAudioAnalyser();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      // Adapt recognizer language based on current locked state
      recognition.lang = lockedLanguage === 'Telugu' ? 'te-IN' : lockedLanguage === 'Hindi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsMicActive(true);
        setReactorState('LISTENING');
        setErrorStatus(null);
      };

      recognition.onresult = (event: any) => {
        // Barge-in: if JARVIS was speaking, cancel speech instantly!
        if (isSpeakingRef.current) {
          stopSpeaking();
        }

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = (final || interim).trim();
        setLiveTranscript(currentText);

        // Multilingual Wake Word Detection
        if (wakeWordEnabled && currentText) {
          const wakeCheck = checkWakeWordMatch(currentText);
          if (wakeCheck.matched) {
            setReactorState('WAKE_WORD_DETECTED');

            // Auto-lock session language to detected wake word language
            if (wakeCheck.language === 'Telugu') {
              setLockedLanguage('Telugu');
            } else if (wakeCheck.language === 'English') {
              setLockedLanguage('English');
            }

            setTimeout(() => {
              setReactorState('LISTENING');
            }, 800);
          }
        }

        if (final) {
          const emotion = analyzeEmotion(final);
          const lang = lockedLanguage !== 'auto' ? lockedLanguage : detectLanguage(final);
          setCurrentEmotion(emotion);
          setReactorState('PROCESSING');

          if (onTranscriptReady) {
            onTranscriptReady(final, emotion, lang);
          }
          setLiveTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          setErrorStatus('Microphone permission denied. Tap to grant microphone access, Sir.');
          setReactorState('ERROR');
          setIsMicActive(false);
        }
      };

      recognition.onend = () => {
        if (isMicActive && !isSpeakingRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('Failed to start recognition:', err);
      setErrorStatus(err?.message || 'Failed to initialize microphone');
      setReactorState('ERROR');
    }
  }, [wakeWordEnabled, wakeSensitivity, lockedLanguage, onTranscriptReady, isMicActive]);

  const stopListening = useCallback(() => {
    setIsMicActive(false);
    stopAudioAnalyser();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (!isSpeakingRef.current) {
      setReactorState('IDLE');
    }
  }, []);

  // Request browser permission and immediately activate microphone
  const requestPermissionAndActivate = useCallback(async (onGranted?: () => void) => {
    try {
      setErrorStatus(null);
      await startListening();
      if (onGranted) onGranted();
    } catch (err: any) {
      setErrorStatus(err?.message || 'Microphone access could not be engaged');
      setReactorState('ERROR');
    }
  }, [startListening]);

  // Compute Emotion-Aware Vocal Parameters
  const computeVocalModulation = useCallback(
    (emotion: EmotionType) => {
      if (!emotionModulationEnabled) {
        return { rate: speechRate, pitch: speechPitch };
      }

      const delta = emotionDeltas[emotion] || emotionDeltas.Calm;
      const intensity = Math.max(0, Math.min(1, emotionModulationIntensity));

      const adjustedRate = speechRate * (1 + delta.rateDelta * intensity);
      const adjustedPitch = speechPitch * (1 + delta.pitchDelta * intensity);

      // Clamp within standard browser-safe boundaries
      const clampedRate = Math.max(0.65, Math.min(1.85, adjustedRate));
      const clampedPitch = Math.max(0.5, Math.min(1.6, adjustedPitch));

      return {
        rate: parseFloat(clampedRate.toFixed(2)),
        pitch: parseFloat(clampedPitch.toFixed(2)),
      };
    },
    [emotionModulationEnabled, emotionModulationIntensity, speechRate, speechPitch]
  );

  // Text To Speech with dynamic reactive amplitude and emotion-aware modulation
  const speakText = useCallback(
    (text: string, onEnd?: () => void, emotionOverride?: EmotionType) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || isMuted) {
        if (onEnd) onEnd();
        setReactorState('IDLE');
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      isSpeakingRef.current = true;
      setReactorState('SPEAKING');

      // Clean markdown tags like **bold** or URLs for speech
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/#+\s/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/https?:\/\/\S+/g, 'link attached')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Apply Emotion-Aware Voice Modulation
      const activeEmotion = emotionOverride || currentEmotion;
      const { rate: modRate, pitch: modPitch } = computeVocalModulation(activeEmotion);
      utterance.rate = modRate;
      utterance.pitch = modPitch;

      // Select Language-Appropriate Voice Profile
      const isTeluguText = /[\u0C00-\u0C7F]/.test(cleanText) || lockedLanguage === 'Telugu';
      const isHindiText = /[\u0900-\u097F]/.test(cleanText) || lockedLanguage === 'Hindi';

      if (isTeluguText) {
        utterance.lang = 'te-IN';
        const teVoice = availableVoices.find(
          (v) => v.lang === 'te-IN' || v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu')
        );
        const inVoice = availableVoices.find(
          (v) => v.lang === 'en-IN' || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('ravi')
        );
        if (teVoice) {
          utterance.voice = teVoice;
        } else if (inVoice) {
          utterance.voice = inVoice;
        } else if (selectedVoiceName) {
          const found = availableVoices.find((v) => v.name === selectedVoiceName);
          if (found) utterance.voice = found;
        }
      } else if (isHindiText) {
        utterance.lang = 'hi-IN';
        const hiVoice = availableVoices.find(
          (v) => v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
        );
        if (hiVoice) utterance.voice = hiVoice;
      } else if (selectedVoiceName && availableVoices.length > 0) {
        const found = availableVoices.find((v) => v.name === selectedVoiceName);
        if (found) utterance.voice = found;
      }

      // Dynamic amplitude simulation for speaking waveform & older iOS Keep-Alive
      let speakInterval: any = null;
      let resumeInterval: any = null;

      utterance.onstart = () => {
        speakInterval = setInterval(() => {
          const randomLevel = Math.floor(35 + Math.random() * 60);
          setAudioLevel(randomLevel);
        }, 110);

        // Keep iOS SpeechSynthesis alive on older devices
        resumeInterval = setInterval(() => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
            window.speechSynthesis.resume();
          }
        }, 2500);
      };

      utterance.onend = () => {
        if (speakInterval) clearInterval(speakInterval);
        if (resumeInterval) clearInterval(resumeInterval);
        isSpeakingRef.current = false;
        setAudioLevel(0);
        setReactorState('IDLE');
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('TTS error:', e);
        if (speakInterval) clearInterval(speakInterval);
        if (resumeInterval) clearInterval(resumeInterval);
        isSpeakingRef.current = false;
        setAudioLevel(0);
        setReactorState('IDLE');
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    },
    [availableVoices, selectedVoiceName, currentEmotion, lockedLanguage, computeVocalModulation, isMuted]
  );

  // Barge-in stop speaking
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
    setAudioLevel(0);
    setReactorState(isMicActive ? 'LISTENING' : 'IDLE');
  }, [isMicActive]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      if (!prev && isSpeakingRef.current) {
        stopSpeaking();
      }
      return !prev;
    });
  };

  // Reset Language Lock
  const resetLanguageLock = () => {
    setLockedLanguage('auto');
    if (recognitionRef.current) {
      recognitionRef.current.lang = 'en-US';
    }
  };

  // Audition Vocal Modulation Sample
  const testVocalModulation = (emotion: EmotionType, lang: 'English' | 'Telugu' = 'English') => {
    const sampleText =
      lang === 'Telugu'
        ? emotion === 'Urgency'
          ? 'సర్, అత్యవసర అప్‌డేట్ సిద్ధంగా ఉంది. దయచేసి పరిశీలించండి.'
          : emotion === 'Frustration'
          ? 'చింతించకండి సర్, మనం ఈ సమస్యను సులభంగా పరిష్కరించవచ్చు.'
          : 'నమస్కారం సర్. JARVIS వాయిస్ మాడ్యులేషన్ వ్యవస్థ సంసిద్ధంగా ఉంది.'
        : emotion === 'Urgency'
        ? 'Sir, high-priority telemetry alert requires your immediate directive.'
        : emotion === 'Frustration'
        ? 'Take your time, Sir. We will work through this problem methodically.'
        : emotion === 'Excited'
        ? 'Splendid breakthrough, Sir! All experimental markers have exceeded expectations.'
        : 'All systems are operating at peak efficiency, Sir.';

    speakText(sampleText, undefined, emotion);
  };

  return {
    reactorState,
    setReactorState,
    isMicActive,
    audioLevel,
    liveTranscript,
    currentEmotion,
    setCurrentEmotion,
    startListening,
    stopListening,
    requestPermissionAndActivate,
    speakText,
    stopSpeaking,
    isMuted,
    toggleMute,
    availableVoices,
    selectedVoiceName,
    setSelectedVoiceName,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    errorStatus,
    setErrorStatus,
    // Multilingual & Wake Sensitivity
    wakeSensitivity,
    setWakeSensitivity,
    lockedLanguage,
    setLockedLanguage,
    resetLanguageLock,
    // Emotion-Aware Voice Modulation
    emotionModulationEnabled,
    setEmotionModulationEnabled,
    emotionModulationIntensity,
    setEmotionModulationIntensity,
    testVocalModulation,
    computeVocalModulation,
  };
}
