'use client';

import { useState } from 'react';
import { FilterPills, type FilterPill } from '@/components/ui/FilterPills';
import { SearchInput } from '@/components/ui/SearchInput';

const pills: FilterPill[] = [
  { value: 'tous', label: 'Tous' },
  { value: 'article', label: 'Articles' },
  { value: 'congres', label: 'Congrès' },
  { value: 'video', label: 'Vidéos' },
];

export function FiltersDemo() {
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 }}>
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un article..."
      />
      <FilterPills pills={pills} value={filter} onChange={setFilter} />
      <p style={{ fontSize: 12, color: 'var(--cod-gray--400)' }}>
        Active filter: <code>{filter}</code> · Search: <code>{search || '(empty)'}</code>
      </p>
    </div>
  );
}
