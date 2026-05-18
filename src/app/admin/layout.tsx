import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';
import AdminSessionProvider from '@/components/admin/SessionProvider';

export const metadata = { title: 'Admin' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <AdminSessionProvider>
      {session ? (
        <div className="min-h-screen bg-ink">
          <AdminNav />
          <div className="lg:ml-64 min-h-screen">
            {/* On mobile the admin nav is `56px + safe-area-inset-top`; on lg+ it's a sidebar. */}
            <main className="pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pt-0 p-6 lg:p-10">{children}</main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-ink">{children}</div>
      )}
    </AdminSessionProvider>
  );
}
