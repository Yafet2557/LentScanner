function normalizeParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

function appendParams(searchParams, params) {
  Object.entries(params).forEach(([key, rawValue]) => {
    if (key === 'endpoint' || rawValue == null) return;
    if (Array.isArray(rawValue)) {
      rawValue.forEach((value) => {
        if (value != null) searchParams.append(key, String(value));
      });
      return;
    }
    searchParams.append(key, String(rawValue));
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const endpoint = normalizeParam(req.query.endpoint);
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'Missing SPOONACULAR_API_KEY server env var' });
    return;
  }

  if (!endpoint || !endpoint.startsWith('/recipes/')) {
    res.status(400).json({ error: 'Invalid Spoonacular endpoint' });
    return;
  }

  const url = new URL(`https://api.spoonacular.com${endpoint}`);
  appendParams(url.searchParams, req.query);
  url.searchParams.set('apiKey', apiKey);

  try {
    const upstream = await fetch(url.toString());
    const body = await upstream.text();

    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);
    res.send(body);
  } catch (error) {
    res.status(502).json({ error: `Spoonacular proxy request failed: ${error.message}` });
  }
};
