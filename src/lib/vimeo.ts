export type VimeoMeta = {
  thumbnail: string;
  /** True when the video is taller than it is wide (vertical / social reel). */
  portrait: boolean;
};

const cache = new Map<string, VimeoMeta>();

function fallbackFor(vimeoId: string): VimeoMeta {
  return { thumbnail: `https://vumbnail.com/${vimeoId}.jpg`, portrait: false };
}

export async function getVimeoMeta(vimeoId: string): Promise<VimeoMeta> {
  const cached = cache.get(vimeoId);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}&width=640`,
      { signal: controller.signal, next: { revalidate: 86400 } }
    );
    clearTimeout(timer);

    if (!res.ok) throw new Error(`Vimeo API ${res.status}`);
    const data = await res.json();
    const width = Number(data.width) || 0;
    const height = Number(data.height) || 0;
    const meta: VimeoMeta = {
      thumbnail:
        (data.thumbnail_url as string) ?? fallbackFor(vimeoId).thumbnail,
      portrait: width > 0 && height > width,
    };
    cache.set(vimeoId, meta);
    return meta;
  } catch {
    // Don't cache failures for long — a transient error would otherwise pin
    // the fallback thumbnail for the life of the server process.
    return fallbackFor(vimeoId);
  }
}

export async function getVimeoMetas(
  ids: string[]
): Promise<Record<string, VimeoMeta>> {
  const entries = await Promise.all(
    ids.map(async (id) => [id, await getVimeoMeta(id)] as const)
  );
  return Object.fromEntries(entries);
}
