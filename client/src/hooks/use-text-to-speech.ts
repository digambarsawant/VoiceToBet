import { useState, useCallback, useRef } from "react";

interface TextToSpeechHook {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  setVolume: (volume: number) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
}

export function useTextToSpeech(): TextToSpeechHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolumeState] = useState(0.75);
  const [rate, setRateState] = useState(1);
  const [pitch, setPitchState] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = 
    typeof window !== "undefined" && 
    'speechSynthesis' in window;

  const speak = useCallback((text: string) => {
    if (!isSupported) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = 'en-GB';

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, volume, rate, pitch]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  }, []);

  const setRate = useCallback((newRate: number) => {
    setRateState(Math.max(0.1, Math.min(10, newRate)));
  }, []);

  const setPitch = useCallback((newPitch: number) => {
    setPitchState(Math.max(0, Math.min(2, newPitch)));
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    setVolume,
    setRate,
    setPitch,
  };
}
