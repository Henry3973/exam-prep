// Netlify Function — 云端标记同步
// POST:  保存标记  { url: "...", marks: [1,3,5] }
// GET:   获取标记  ?url=...

const STORE_NAME = 'exam-marks';

export default async (req, context) => {
  // 使用 Netlify Blob 存储（免费，无需额外配置）
  // context.env 未暴露 getStore，需使用 @netlify/blobs
  const { getStore } = await import('@netlify/blobs');

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const url = body.url;
      const marks = body.marks;
      if (!url) {
        return new Response(JSON.stringify({ error: 'missing url' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const store = getStore(STORE_NAME);
      await store.set(url, JSON.stringify(marks));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const urlObj = new URL(req.url);
      const url = urlObj.searchParams.get('url');
      if (!url) {
        return new Response(JSON.stringify({ error: 'missing url param' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const store = getStore(STORE_NAME);
      const data = await store.get(url);
      return new Response(data || '[]', {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('method not allowed', { status: 405 });
};
