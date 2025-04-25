import { FormEvent, forwardRef, Ref } from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { Bang } from '@/types/interfaces';

interface SearchFormProps {
  query: string;
  setQuery: (query: string) => void;
  showBangsList: boolean;
  filteredBangs: Bang[];
  onSearch: (query: string) => void;
}

const SearchForm = forwardRef(
  (
    { query, setQuery, showBangsList, filteredBangs, onSearch }: SearchFormProps,
    ref: Ref<HTMLInputElement>
  ) => {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSearch(query);
    };

    const handleBangClick = (bangShortcut: string) => {
      setQuery(`!${bangShortcut} `);
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.focus();
      }
    };

    return (
      <form onSubmit={handleSubmit} className="w-full relative">
        <div className="relative">
          <input
            ref={ref}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or type a URL"
            className="w-full px-5 py-3 pl-12 rounded-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            autoComplete="off"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            <FaSearch className="w-4 h-4" />
          </div>
          {query && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <IoClose className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {showBangsList && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-10 overflow-hidden">
            {filteredBangs.map(bang => (
              <div 
                key={bang.s} 
                className="p-3 hover:bg-zinc-800 cursor-pointer flex items-center"
                onClick={() => handleBangClick(bang.s)}
              >
                <span className="font-bold mr-2">!{bang.s}</span>
                <span className="text-sm text-zinc-400">{bang.t} ({bang.sc})</span>
              </div>
            ))}
          </div>
        )}
      </form>
    );
  }
);

SearchForm.displayName = 'SearchForm';

export default SearchForm;