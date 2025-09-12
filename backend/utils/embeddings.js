// Use global fetch available in Node 18+; no external dependency required

/**
 * Embeddings service adapter (Gemini-compatible abstraction).
 * Uses environment variables:
 * - GEMINI_API_KEY
 * - GEMINI_EMBEDDINGS_MODEL (optional)
 */
export async function generateEmbeddingFromText(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const model = process.env.GEMINI_EMBEDDINGS_MODEL || 'text-embedding-004';

  // Minimal payload for embeddings endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:embedContent?key=${apiKey}`;

  const body = {
    content: { parts: [{ text }] }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Embeddings API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const vector = data?.embedding?.values || data?.embedding || data?.data?.[0]?.embedding;
  if (!Array.isArray(vector)) {
    throw new Error('Invalid embeddings response');
  }
  return vector.map((v) => Number(v));
}

export function buildDescriptionFromMetadata(meta) {
  // One clean sentence: color + fabric + type + pattern + occasion + season + formality
  const color = (meta.color || '').trim();
  const material = (meta.material || '').trim();
  const type = (meta.type || 'item').trim();
  const pattern = (meta.pattern || '').trim();
  const occasion = (meta.occasion || '').trim();
  const season = (meta.season || '').trim();
  const formality = (meta.formality || '').trim();
  const weather = (meta.weather || '').trim();

  const main = [color, material, type].filter(Boolean).join(' ');
  const patternPart = pattern ? `${pattern} pattern` : '';
  const tailBits = [];
  if (occasion) tailBits.push(`${occasion} occasions`);
  if (season) tailBits.push(`${season} season`);
  if (formality) tailBits.push(`${formality} style`);
  if (weather) tailBits.push(`${weather}`);

  const tail = tailBits.length ? `, suitable for ${tailBits.join(', ')}` : '';
  const patternText = patternPart ? `, ${patternPart}` : '';
  const sentence = `${main}${patternText}${tail}`.replace(/\s+/g, ' ').trim();
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}


