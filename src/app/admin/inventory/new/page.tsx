import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import VehicleForm from '@/components/admin/VehicleForm';
import { ensureAdmin } from '@/lib/require-admin';

export default async function NewVehiclePage() {
  await ensureAdmin();

  return (
    <>
      <Link href="/admin/inventory" className="eyebrow text-ash hover:text-cream inline-flex items-center gap-2 mb-6">
        <ChevronLeft size={14} /> Inventory
      </Link>
      <h1 className="display text-5xl mb-10">Add Vehicle</h1>
      <VehicleForm />
    </>
  );
}
