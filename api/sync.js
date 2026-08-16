import { Redis } from '@upstash/redis';

// Helper to initialize Redis from available environment variables
function getRedis() {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;

  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;

  if (url && token) {
    return new Redis({ url, token });
  }

  // If redis connection string exists
  const redisUrl = process.env.KV_URL || process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
  if (redisUrl) {
    return Redis.fromEnv();
  }

  return null;
}

export default async function handler(req, res) {
  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const redis = getRedis();

  if (!redis) {
    return res.status(200).json({
      success: false,
      configured: false,
      message: 'Vercel KV / Upstash Redis is not connected yet. Add Upstash Redis in Vercel Dashboard -> Storage.',
    });
  }

  const STORAGE_KEY = 'sage_school_master_data';

  try {
    if (req.method === 'GET') {
      let data = await redis.get(STORAGE_KEY);
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          // data is already raw or parsed
        }
      }
      return res.status(200).json({
        success: true,
        configured: true,
        data: data || null,
      });
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }
      const { students, cfg, finances } = body || {};
      const payload = {
        students,
        cfg,
        finances,
        lastUpdated: new Date().toISOString(),
      };
      await redis.set(STORAGE_KEY, payload);
      return res.status(200).json({
        success: true,
        configured: true,
        lastUpdated: payload.lastUpdated,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database Sync Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
