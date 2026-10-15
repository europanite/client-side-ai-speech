/**
 * Browser-only neural TTS with English + Japanese grapheme-to-phoneme support.
 * This URL is pinned because the exported project snapshot does not include
 * package.json or package-lock.json. No transcript text is sent to a TTS API.
 * The model, code and Japanese pronunciation assets are fetched on first use.
 */
const TTS_MODULE_URL =
  "https://cdn.jsdelivr.net/npm/kokoro-js-jp@0.2.0/dist/kokoro-jp.web.js";

type TtsAudio = { toBlob(): Blob };
type TtsModel = { speak(text: string, voiceId: string): Promise<TtsAudio> };

type TtsModule = { KokoroJP: { load(): Promise<TtsModel> } };

let modelPromise: Promise<TtsModel> | null = null;

function loadModel(): Promise<TtsModel> {
  if (!modelPromise) {
    // Vite leaves this browser-native ESM import unresolved so that the pinned
    // CDN bundle can load its own Worker / WASM assets at runtime.
    modelPromise = import(/* @vite-ignore */ TTS_MODULE_URL)
      .then((module: TtsModule) => module.KokoroJP.load())
      .catch((error: unknown) => {
        modelPromise = null; // allow retry after network/transient errors
        throw error;
      });
  }
  return modelPromise;
}

export async function synthesizeSpeech(
  text: string,
  voiceId: string,
  onModelReady?: () => void
): Promise<Blob> {
  const tts = await loadModel();
  onModelReady?.();
  const audio = await tts.speak(text, voiceId);
  const blob = audio.toBlob(); // kokoro-js WAV serialization
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("The TTS engine returned an empty audio file.");
  }
  return blob;
}
