import 'server-only';
import { revalidatePath } from 'next/cache';

/**
 * Purge the ISR/CDN cache for every public page after an admin write so edits
 * show up immediately instead of waiting out each page's revalidate window.
 *
 * The 'layout' scope at '/' cascades to all routes under the root layout,
 * which is what we want: a vehicle change affects the home page, the inventory
 * list, and the vehicle detail page, while a settings change affects the
 * header/footer and page-visibility on every content page.
 */
export function revalidatePublicContent(): void {
  revalidatePath('/', 'layout');
}
