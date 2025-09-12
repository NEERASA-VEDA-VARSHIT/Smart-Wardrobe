// Uses Node 18+ global fetch

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not configured');
  return key;
}

function toBase64(buffer) {
  return Buffer.from(buffer).toString('base64');
}

export async function generateClothingMetadataFromImage(fileBuffer, mimeType = 'image/jpeg', hints = {}) {
  const apiKey = getApiKey();
  const model = process.env.GEMINI_VISION_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

  const systemPrompt = [
    'You are a fashion metadata extractor. Given an image of a single clothing item, return STRICT JSON only, no prose.',
    'Fields: {"name": string, "type": string, "color": string, "pattern": string, "material": string, "occasion": string}.',
    'Type should be a simple category like shirt, pants, jacket, shoes, dress, accessory.',
    'Occasion should be one of: casual, formal, party, workout, business, travel, beach, winter, summer (choose best fit).',
    'If unsure, leave the field as empty string. Do not add extra fields. Return ONLY a JSON object.'
  ].join(' ');

  const base64 = toBase64(fileBuffer);

  const parts = [{ text: systemPrompt }, { inline_data: { mime_type: mimeType, data: base64 } }];

  // Optional text hints to help model
  if (hints && Object.keys(hints).length) {
    parts.unshift({ text: `Hints: ${JSON.stringify(hints)}` });
  }

  const body = { contents: [{ parts }] };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Vision API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Attempt to extract JSON {...}
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  let parsed;
  try {
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
  } catch {
    // Fallback minimal structure
    parsed = { name: '', type: '', color: '', pattern: '', material: '', occasion: '' };
  }

  // Normalize fields to strings
  const normalize = (v) => (typeof v === 'string' ? v : (v == null ? '' : String(v)));
  return {
    name: normalize(parsed.name),
    type: normalize(parsed.type),
    color: normalize(parsed.color),
    pattern: normalize(parsed.pattern),
    material: normalize(parsed.material),
    occasion: normalize(parsed.occasion)
  };
}


