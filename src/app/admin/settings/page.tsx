import { ensureAdmin } from '@/lib/require-admin';
import SettingsForm from '@/components/admin/SettingsForm';
import { getEditableSiteSettings } from '@/lib/site-settings-store';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await ensureAdmin();
  const settings = await getEditableSiteSettings();

  return (
    <>
      <div className="mb-10">
        <div className="eyebrow text-ash">Configuration</div>
        <h1 className="display text-5xl mt-2">Settings</h1>
      </div>

      <SettingsForm fields={settings.fields} values={settings.values} />
    </>
  );
}
