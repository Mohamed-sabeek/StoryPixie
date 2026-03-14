import type { NextApiRequest, NextApiResponse } from 'next';

const isAllowedProtocol = (value: string) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const imageUrl = typeof req.query.url === 'string' ? req.query.url : '';

  if (!imageUrl || !isAllowedProtocol(imageUrl)) {
    res.status(400).json({ error: 'Invalid image URL.' });
    return;
  }

  try {
    const upstreamResponse = await fetch(imageUrl);
    if (!upstreamResponse.ok) {
      res.status(upstreamResponse.status).json({ error: 'Failed to fetch image.' });
      return;
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'image/png';
    const arrayBuffer = await upstreamResponse.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Image proxy failed:', error);
    res.status(500).json({ error: 'Unable to proxy image.' });
  }
}
