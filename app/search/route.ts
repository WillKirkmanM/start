import { NextRequest, NextResponse } from 'next/server';
import { bangs as defaultBangs } from '@/app/bang';
import { searchEngines } from '@/utils/searchEngines';
import { Bang } from '@/types/interfaces';

const bangs: Bang[] = [...defaultBangs];
const defaultEngineKey = 'google';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    homeUrl.search = '';
    return NextResponse.redirect(homeUrl);
  }

  const trimmedQuery = query.trim();

  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  if (urlPattern.test(trimmedQuery)) {
    let url = trimmedQuery;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return NextResponse.redirect(url);
  }

  const bangRegex = /!([\w]+)/;
  const matches = trimmedQuery.match(bangRegex);

  if (matches && matches.length > 1) {
    const bangCommand = matches[1].toLowerCase();
    const bang = bangs.find(b => b.s.toLowerCase() === bangCommand);

    if (bang) {
      let searchTerms = trimmedQuery.replace(new RegExp(`!${bangCommand}\\s*`), '').trim();

      if (searchTerms) {
        const targetUrl = bang.u.replace('{{{s}}}', encodeURIComponent(searchTerms));
        return NextResponse.redirect(targetUrl);
      }
    }
  }

  const defaultEngine = searchEngines[defaultEngineKey];
  if (!defaultEngine) {
    console.error(`Default search engine "${defaultEngineKey}" not found.`);
    return NextResponse.redirect(`https://www.google.com/search?q=${encodeURIComponent(trimmedQuery)}`);
  }

  const searchUrl = defaultEngine.url.replace('{{{s}}}', encodeURIComponent(trimmedQuery));
  return NextResponse.redirect(searchUrl);
}