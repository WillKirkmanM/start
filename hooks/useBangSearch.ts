import { useState, useEffect } from 'react';
import { Bang } from '@/types/interfaces';

function useBangSearch(query: string, bangs: Bang[]) {
  const [showBangsList, setShowBangsList] = useState(false);
  const [filteredBangs, setFilteredBangs] = useState<Bang[]>([]);

  useEffect(() => {
    if (query.startsWith('!')) {
      const bangQuery = query.substring(1).toLowerCase();
      const filtered = bangs
        .filter(b => b.s.toLowerCase().includes(bangQuery) || b.t.toLowerCase().includes(bangQuery))
        .slice(0, 5);
      setFilteredBangs(filtered);
      setShowBangsList(filtered.length > 0);
    } else {
      setShowBangsList(false);
    }
  }, [query, bangs]);

  return { showBangsList, filteredBangs };
}

export default useBangSearch;