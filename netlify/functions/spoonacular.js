function appendParams(searchParams, params) {
  Object.entries(params).forEach(([key, value]) => {
    if (key === 'endpoint' || value == null) return;
    searchParams.append(key, String(value));
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const endpoint = event.queryStringParameters?.endpoint;
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing SPOONACULAR_API_KEY server env var' }),
    };
  }

  if (!endpoint || !endpoint.startsWith('/recipes/')) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid Spoonacular endpoint' }),
    };
  }

  const url = new URL(`https://api.spoonacular.com${endpoint}`);
  appendParams(url.searchParams, event.queryStringParameters || {});
  url.searchParams.set('apiKey', apiKey);

  try {
    const upstream = await fetch(url.toString());
    const body = await upstream.text();
    return {
      statusCode: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') || 'application/json',
      },
      body,
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: `Spoonacular proxy request failed: ${error.message}`,
      }),
    };
  }
};
