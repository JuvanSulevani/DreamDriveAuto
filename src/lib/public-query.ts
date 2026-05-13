export async function safePublicQuery<T>(
  label: string,
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error(`[public-query] ${label} failed; rendering fallback content.`, error);
    return fallback;
  }
}
