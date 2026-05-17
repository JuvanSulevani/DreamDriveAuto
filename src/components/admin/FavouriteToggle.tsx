'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function FavouriteToggle({ vehicleId, initial }: { vehicleId: string; initial: boolean }) {
  const [active, setActive] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const next = !active;
    setActive(next);
    try {
      await fetch(`/api/vehicles/${vehicleId}/favourite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favourite: next })
      });
    } catch {
      setActive(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      title={active ? "Remove from this week's favourites" : "Add to this week's favourites"}
      className={`p-1.5 transition-colors ${active ? 'text-copper' : 'text-ash hover:text-copper'} ${busy ? 'opacity-50' : ''}`}
    >
      <Heart size={14} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
