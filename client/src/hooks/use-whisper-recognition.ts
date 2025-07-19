import { useState, useCallback, useRef } from "react";
import { apiRequest } from "../lib/queryClient";

interface WhisperRecognitionHook {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  validation: any;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  error: string | null;
}

export function useWhisperRecognition(): WhisperRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [validation, setValidation] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const isSupported = 
    typeof window !== "undefined" && 
    'MediaRecorder' in window;

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError("Audio recording not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);

        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.webm');

          // Step 1: Transcribe audio using Whisper
          const transcriptionResponse = await fetch('/api/transcribe-audio', {
            method: 'POST',
            body: formData,
          });

          if (!transcriptionResponse.ok) {
            throw new Error('Failed to transcribe audio');
          }

          const transcriptionData = await transcriptionResponse.json();
          setTranscript(transcriptionData.text);

          // Step 2: Validate command using AI agent
          const validationData = await apiRequest('/api/validate-voice-command', {
            method: 'POST',
            body: { command: transcriptionData.text },
          });

          setValidation(validationData);
          setError(null);

        } catch (err) {
          console.error('Error processing audio:', err);
          setError('Failed to process voice command');
        } finally {
          setIsProcessing(false);
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred');
        setIsListening(false);
        setIsProcessing(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
      setError(null);
      setTranscript("");
      setValidation(null);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    isProcessing,
    transcript,
    validation,
    startListening,
    stopListening,
    isSupported,
    error,
  };
}