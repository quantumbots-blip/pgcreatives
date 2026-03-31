const cache = new Map<string, string>();

export async function getVimeoThumbnail(vimeoId: string): Promise<string> {
  if (cache.has(vimeoId)) return cache.get(vimeoId)!;

  const fallback = `https://vumbnail.com/${vimeoId}.jpg`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}&width=640`,
      { signal: controller.signal, next: { revalidate: 86400 } }
    );
    clearTimeout(timer);

    if (!res.ok) throw new Error(`Vimeo API ${res.status}`);
    const data = await res.json();
    const url = (data.thumbnail_url as string) ?? fallback;
    cache.set(vimeoId, url);
    return url;
  } catch {
    cache.set(vimeoId, fallback);
    return fallback;
  }
}

export async function getVimeoThumbnails(
  ids: string[]
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    ids.map(async (id) => [id, await getVimeoThumbnail(id)] as const)
  );
  return Object.fromEntries(entries);
}
