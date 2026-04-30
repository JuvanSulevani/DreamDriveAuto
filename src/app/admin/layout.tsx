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
            <main className="p-6 lg:p-10">{children}</main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-ink">{children}</div>
      )}
    </AdminSessionProvider>
  );
}
