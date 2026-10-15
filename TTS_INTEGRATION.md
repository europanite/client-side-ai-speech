# Client-Side AI Speech — STT + TTS integration

The UI has two modes with the **same** left Audio and right Text panels.

| Mode | Audio (left) | Text (right) |
| --- | --- | --- |
| STT (Whisper) | Upload audio/video or capture microphone | Read-only transcription |
| TTS (Kokoro) | WAV player and download | Editable synthesis text |

Transcripts are copied to the TTS editor when switching from STT to TTS.
On narrow displays the panes stack with Audio first, Text second.

## TTS runtime

The added `ttsEngine.ts` dynamically loads the version-pinned
`kokoro-js-jp@0.2.0` browser bundle via jsDelivr. This avoids changing
`package.json`/`package-lock.json` because neither was included in the supplied
project export. It downloads Kokoro-82M weights from Hugging Face and
Japanese Open JTalk dictionaries/assets from the CDN when needed.
**Actual speech synthesis runs on the client and does not send input text to a
synthesis service.** Downloads need an internet connection on the first run.
English and Japanese voices are available; other Whisper languages are not
TTS languages at this time. This is a neural TTS model, not system voice API.

TTS does not generate live streaming frames: it renders a WAV file first,
then the HTML audio player can play it or the user can download it.
The **Cancel result** action discards an in-flight result, but does not
physically interrupt ONNX inference. The model is reused on later requests.

## Apply and test

From the root of the original repository:

```bash
git apply --check ~/Downloads/client_side_audio_stt_tts.patch
git apply ~/Downloads/client_side_audio_stt_tts.patch
cd frontend/app
npm ci
npx tsc --noEmit
npm test -- --ci --runInBand
npm run build:demo
```

The source export did not include `package.json` or `package-lock.json`,
so those files are intentionally not modified. Verify the above commands in
the actual repository before deploying. The external TTS module requires the
browser to permit cross-origin ESM, WebAssembly, and Blob Workers.
