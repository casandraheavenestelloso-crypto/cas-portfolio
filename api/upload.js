import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { protect } from '../lib/auth.js';
export const config = { api: { bodyParser: false } };
export const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
export function imageType(data) {
  if (data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if (data[0] === 255 && data[1] === 216 && data[2] === 255) return 'image/jpeg';
  if (['GIF87a', 'GIF89a'].includes(data.subarray(0, 6).toString())) return 'image/gif';
  if (data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!protect(req, res)) return;
  try {
    if (Number(req.headers['content-length']) > MAX_IMAGE_SIZE) return res.status(413).json({ error: 'Each screenshot must be 3 MB or smaller.' });
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_IMAGE_SIZE) return res.status(413).json({ error: 'Each screenshot must be 3 MB or smaller.' });
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks);
    const type = imageType(data);
    if (!type || type !== req.headers['content-type']) return res.status(400).json({ error: 'Choose a PNG, JPEG, WebP, or GIF image.' });
    const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }[type];
    const blob = await put(`projects/${randomUUID()}.${extension}`, data, { access: 'public', contentType: type, addRandomSuffix: false });
    return res.json({ url: blob.url });
  } catch (error) {
    console.error('Image upload failed:', error.name);
    return res.status(503).json({ error: 'Image upload failed. Check Blob storage and try again.' });
  }
}
