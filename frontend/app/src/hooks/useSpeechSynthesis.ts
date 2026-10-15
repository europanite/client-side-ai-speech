import { useCallback, useEffect, useRef, useState } from "react";
import { synthesizeSpeech } from "../services/ttsEngine";

export type TtsStatus = "idle" | "loading-model" | "synthesizing" | "done" | "error";

export const TTS_VOICES = [
  { id: "af_heart", label: "English — female", language: "en" },
  { id: "am_michael", label: "English — male", language: "en" },
  { id: "jf_alpha", label: "Japanese — female", language: "ja" },
  { id: "jm_kumo", label: "Japanese — male", language: "ja" },
] as const;

export function useSpeechSynthesis() {
  const [status, setStatus] = useState<TtsStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string>(TTS_VOICES[0].id);
  const generationRef = useRef(0);
  const urlRef = useRef<string | null>(null);

  const clearOutput = useCallback(() => {
    // The audio element owns playback; revoking the previous URL also releases
    // any browser-held WAV data when the user generates a replacement.
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setAudioUrl(null);
  }, []);

  const cancel = useCallback(() => {
    // Kokoro does not currently expose a portable interrupt signal.
    // Ignore an in-flight completion rather than displaying stale speech.
    generationRef.current += 1;
    setError(null);
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    cancel();
    clearOutput();
  }, [cancel, clearOutput]);

  const synthesize = useCallback(async (text: string) => {
    const input = text.trim();
    if (!input) {
      setError("Enter some text to synthesize.");
      setStatus("error");
      return;
    }

    const generation = ++generationRef.current;
    clearOutput();
    setError(null);
    setStatus("loading-model");
    try {
      const blob = await synthesizeSpeech(input, voiceId, () => {
        if (generation === generationRef.current) setStatus("synthesizing");
      });
      if (generation !== generationRef.current) return;
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setAudioUrl(url);
      setStatus("done");
    } catch (reason) {
      if (generation !== generationRef.current) return;
      setError(reason instanceof Error ? reason.message : "Speech generation failed.");
      setStatus("error");
    }
  }, [voiceId, clearOutput]);

  useEffect(() => () => {
    generationRef.current += 1;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  return {
    status, error, audioUrl, voiceId, setVoiceId,
    voices: TTS_VOICES, synthesize, cancel, reset,
  };
}
