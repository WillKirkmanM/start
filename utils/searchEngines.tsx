import { FaGoogle, FaYahoo } from 'react-icons/fa';
import { SiBrave, SiDuckduckgo } from 'react-icons/si';
import { SearchEngine } from '@/types/interfaces';

export const searchEngines: Record<string, SearchEngine> = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q={{{s}}}',
    icon: <FaGoogle className="w-5 h-5" />
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q={{{s}}}',
    icon: <SiDuckduckgo className="w-5 h-5" />
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q={{{s}}}',
    icon: <FaGoogle className="w-5 h-5" />
  },
  yahoo: {
    name: 'Yahoo',
    url: 'https://search.yahoo.com/search?p={{{s}}}',
    icon: <FaYahoo className="w-5 h-5" />
  },
  brave: {
    name: 'Brave',
    url: 'https://search.brave.com/search?q={{{s}}}',
    icon: <SiBrave className="w-5 h-5" />
  }
};