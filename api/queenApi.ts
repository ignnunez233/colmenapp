// Equivalente a: data/repo/QueenApi.kt

const BASE_URL = 'https://api-tu-dominio';
const TIMEOUT_MS = 10_000;

export type QueenResult = 'ALIVE' | 'DEAD';

function randomResult(): QueenResult {
  return Math.random() < 0.5 ? 'ALIVE' : 'DEAD';
}

export async function analyzeQueen(audioUrl: string): Promise<QueenResult> {
  if (BASE_URL.includes('api-tu-dominio')) {
    return randomResult();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL.replace(/\/$/, '')}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: audioUrl }),
      signal: controller.signal,
    });

    if (!response.ok) return randomResult();

    const payload = (await response.text()).trim();
    const norm = payload.toUpperCase();

    if (norm.includes('ALIVE')) return 'ALIVE';
    if (norm.includes('DEAD')) return 'DEAD';
    return randomResult();
  } catch {
    return randomResult();
  } finally {
    clearTimeout(timeoutId);
  }
}
