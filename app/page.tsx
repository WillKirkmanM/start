"use client";

import { useState, useEffect, useRef } from 'react';
import { bangs as defaultBangs } from './bang';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchForm from '@/components/SearchForm';
import PinnedLinksGrid from '@/components/PinnedLinksGrid';
import SettingsPanel from '@/components/SettingsPanel';
import { Bang, PinnedLink, SearchEngine } from '@/types/interfaces';
import { searchEngines } from '@/utils/searchEngines';
import { IoMdSettings } from 'react-icons/io';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q');
  
  const [query, setQuery] = useState('');
  const [defaultEngine, setDefaultEngine] = useState('google');
  const [showBangsList, setShowBangsList] = useState(false);
  const [filteredBangs, setFilteredBangs] = useState<Bang[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [customBangs, setCustomBangs] = useState<Bang[]>([]);
  const [bangs, setBangs] = useState<Bang[]>(defaultBangs);
  const [pinnedLinks, setPinnedLinks] = useState<PinnedLink[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery);
      const timer = setTimeout(() => {
        handleSearchWithQuery(urlQuery);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [urlQuery]);
  
  useEffect(() => {
    const savedEngine = localStorage.getItem('defaultSearchEngine');
    if (savedEngine && searchEngines[savedEngine]) {
      setDefaultEngine(savedEngine);
    }
    
    const savedCustomBangs = localStorage.getItem('customBangs');
    if (savedCustomBangs) {
      try {
        const parsedBangs = JSON.parse(savedCustomBangs);
        setCustomBangs(parsedBangs);
        setBangs([...defaultBangs, ...parsedBangs]);
      } catch (e) {
        console.error('Failed to parse custom bangs', e);
      }
    }

    const savedPinnedLinks = localStorage.getItem('pinnedLinks');
    if (savedPinnedLinks) {
      try {
        const parsedLinks = JSON.parse(savedPinnedLinks);
        const linksWithOrder = parsedLinks.map((link: PinnedLink, index: number) => ({
          ...link,
          order: link.order !== undefined ? link.order : index
        }));
        setPinnedLinks(linksWithOrder.sort((a: PinnedLink, b: PinnedLink) => 
          (a.order || 0) - (b.order || 0)
        ));
      } catch (e) {
        console.error('Failed to parse pinned links', e);
      }
    }
    
    if (searchInputRef.current && !urlQuery) {
      searchInputRef.current.focus();
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem('defaultSearchEngine', defaultEngine);
  }, [defaultEngine]);

  useEffect(() => {
    localStorage.setItem('customBangs', JSON.stringify(customBangs));
    setBangs([...defaultBangs, ...customBangs]);
  }, [customBangs]);

  useEffect(() => {
    localStorage.setItem('pinnedLinks', JSON.stringify(pinnedLinks));
  }, [pinnedLinks]);

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

  const handleSearchWithQuery = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      return;
    }

    const bangRegex = /!([\w]+)/;
    const matches = trimmedQuery.match(bangRegex);
    
    if (matches && matches.length > 1) {
      const bangCommand = matches[1].toLowerCase();
      const bang = bangs.find(b => b.s.toLowerCase() === bangCommand);
      
      if (bang) {
        let searchTerms = trimmedQuery.replace(new RegExp(`!${bangCommand}\\s*`), '').trim();
        
        if (!searchTerms) {
          return;
        }
        
        const targetUrl = bang.u.replace('{{{s}}}', encodeURIComponent(searchTerms));
        window.location.href = targetUrl;
        return;
      }
    }

    if (trimmedQuery.startsWith('!')) {
      const parts = trimmedQuery.split(' ');
      const bangCommand = parts[0].substring(1).toLowerCase();
      const bangSearchQuery = parts.slice(1).join(' ');

      const bang = bangs.find(b => b.s.toLowerCase() === bangCommand);

      if (bang && bangSearchQuery) {
        const targetUrl = bang.u.replace('{{{s}}}', encodeURIComponent(bangSearchQuery));
        window.location.href = targetUrl;
        return;
      }
    }

    const searchUrl = searchEngines[defaultEngine].url.replace('{{{s}}}', encodeURIComponent(trimmedQuery));
    window.location.href = searchUrl;
  };

  return (
    <main className="flex h-screen overflow-hidden flex-col items-center bg-black text-white">
      {/* Settings button */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
          aria-label="Settings"
        >
          <IoMdSettings className="w-6 h-6 text-zinc-400" />
        </button>
      </div>
      
      {/* Settings Panel Component */}
      {showSettings && (
        <SettingsPanel 
          ref={settingsRef}
          defaultEngine={defaultEngine}
          setDefaultEngine={setDefaultEngine}
          customBangs={customBangs}
          setCustomBangs={setCustomBangs}
          pinnedLinks={pinnedLinks}
          setPinnedLinks={setPinnedLinks}
          onClose={() => setShowSettings(false)}
          searchEngines={searchEngines}
        />
      )}

      {/* Main content with absolute positioning to ensure center alignment */}
      <div className="flex w-full h-full max-w-4xl mx-auto">
        <div className="m-auto w-full max-w-xl px-4">
          {/* Logo and search area */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6 flex items-center">
              <span className="text-3xl font-bold">ParsonLabs Search</span>
              <div className="ml-2 p-1 rounded bg-white text-black">
                {searchEngines[defaultEngine].icon}
              </div>
            </div>
            
            {/* Search Form Component */}
            <SearchForm 
              ref={searchInputRef}
              query={query}
              setQuery={setQuery}
              showBangsList={showBangsList}
              filteredBangs={filteredBangs}
              onSearch={handleSearchWithQuery}
            />
          </div>
          
          {/* Pinned Links Grid Component with fixed height */}
          <PinnedLinksGrid pinnedLinks={pinnedLinks} />
          
          {/* Footer */}
          <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-zinc-500 text-sm">
            <p>ParsonLabs Startpage / Search · {new Date().getFullYear()}</p>
          </footer>
        </div>
      </div>
    </main>
  );
}