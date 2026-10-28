// Equivalente a: audio/AudioRecorder.kt
import { useCallback, useRef, useState } from 'react';
import {
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
} from 'expo-audio';

export type RecorderStatus = 'idle' | 'recording' | 'stopped';

export interface RecordingResult {
  uri: string;
  durationSec: number;
}

export function useHiveAudioRecorder() {
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    extension: '.m4a',
    sampleRate: 44_100,
    bitRate: 128_000,
  });

  const [status, setStatus] = useState<RecorderStatus>('idle');
  const startedAtRef = useRef<number | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    return granted;
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    const granted = await requestPermission();
    if (!granted) return false;

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAtRef.current = Date.now();
      setStatus('recording');
      return true;
    } catch {
      return false;
    }
  }, [recorder, requestPermission]);

  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    if (status !== 'recording') return null;

    await recorder.stop();
    setStatus('stopped');

    const uri = recorder.uri;
    if (!uri) return null;

    const elapsedMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
    const durationSec = Math.max(0, Math.round(elapsedMs / 1000));

    return { uri, durationSec };
  }, [recorder, status]);

  const reset = useCallback(() => {
    setStatus('idle');
    startedAtRef.current = null;
  }, []);

  return { status, startRecording, stopRecording, reset };
}
