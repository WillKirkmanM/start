"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchInitialiserProps {
  setQuery: (query: string) => void;
  handleSearchWithQuery: (query: string) => void;
}

export default function SearchInitialiser({ setQuery, handleSearchWithQuery }: SearchInitialiserProps) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q');

  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery);
      const timer = setTimeout(() => {
        handleSearchWithQuery(urlQuery);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [urlQuery, setQuery, handleSearchWithQuery]);

  return null;
}