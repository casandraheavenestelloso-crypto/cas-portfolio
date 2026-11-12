export function driveEmbed(value) {
  if (!value) return '';
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com') throw new Error('Use a Google Drive video share link.');
  const id = url.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/)?.[1] || url.searchParams.get('id');
  if (!id || !/^[a-zA-Z0-9_-]{10,200}$/.test(id)) throw new Error('The Drive link must point to a video file.');
  return `https://drive.google.com/file/d/${id}/preview`;
}
export function safeUrl(value, optional = true) {
  if (!value && optional) return '';
  if (typeof value !== 'string' || value.length > 2048) throw new Error('Invalid URL.');
  if (/^assets\/[a-zA-Z0-9%._/ ()-]+$/.test(value) && !value.includes('..')) return value;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use HTTPS links.');
  return url.href;
}
const text = (value, max, required = false) => {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error(`Required text is missing or too long (maximum ${max} characters).`);
  return value.trim();
};
export function validateProject(input) {
  if (!input || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || input.slug.length > 100) throw new Error('Use a project slug with lowercase letters, numbers, and hyphens.');
  if (input.deleted === true) return { slug: input.slug, deleted: true };
  if (!Array.isArray(input.tags) || input.tags.length > 20 || !Array.isArray(input.gallery) || input.gallery.length > 30) throw new Error('Use at most 20 tags and 30 screenshots.');
  const project = {
    slug: input.slug, title: text(input.title, 160, true), category: text(input.category, 160, true),
    description: text(input.description, 1000, true), longDescription: text(input.longDescription || '', 12000),
    featured: Boolean(input.featured), mediaUrl: safeUrl(input.mediaUrl),
    mediaType: input.mediaType === 'video' ? 'video' : 'image',
    projectUrl: safeUrl(input.projectUrl), demoUrl: safeUrl(input.demoUrl), driveVideoUrl: driveEmbed(input.driveVideoUrl),
    tags: input.tags.map(x => text(x, 80, true)),
    gallery: input.gallery.map(x => ({ src: safeUrl(x.src, false), alt: text(x.alt || '', 300), caption: text(x.caption || '', 300), ...(Number.isFinite(x.width) && Number.isFinite(x.height) ? { width: x.width, height: x.height } : {}) })),
    detailParagraphs: (input.detailParagraphs || []).slice(0, 10).map(x => text(x, 12000)),
    aliases: (input.aliases || []).slice(0, 30).map(x => text(x, 100))
  };
  return project;
}
