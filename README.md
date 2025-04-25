<p align="center">
  <img src="https://avatars.githubusercontent.com/u/138057124?s=200&v=4" width="150" />
</p>
<h1 align="center">ParsonLabs Startpage</h1>

<p align="center">
  
</p>

<h4 align="center">
  <a href="https://start.parson.dev">View Live</a>
</h4>

<p align="center">ParsonLabs Startpage is the World's Most Accessible Search Engine, Providing Thousands of Options to Search From</p>

## Key Features

### Universal Search
- Use as default browser search engine with URL parameter support (/search?q=your query)
- Direct URL navigation when typing web addresses
- Compatible with all major browsers

### Bang Commands
- Access thousands of custom search engines using bang syntax (e.g., !g for Google, !w for Wikipedia)
- Place bang commands anywhere in your query (e.g., "pizza recipe !yt" searches YouTube)
- Create custom bangs for your favorite websites and tools

### Smart Suggestions
- Advanced autocomplete with search history integration
- Spelling corrections and "did you mean" suggestions
- Keyboard navigation for quick selection (Tab to complete)

### Customizable Interface
- Pin your favorite websites for quick access
- Drag and drop to reorder pinned links
- Choose your default search engine

### Visual Stability
- No content shifting when adding/removing links
- Centered layout optimized for all screen sizes
- Clean, distraction-free design

### Privacy
- Local storage for your preferences (no server tracking)
- All customizations stay on your device

## How It Works

1.  **Search:** Type your query into the `SearchForm`. Pressing Enter triggers the `handleSearchWithQuery` function in `app/page.tsx`. If no bang command is detected, it constructs a search URL using the selected `defaultEngine` and redirects the browser.

    ````typescript
    const handleSearchWithQuery = (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();
      // ... bang detection logic ...

      // Default to selected search engine if no bang is used or matched
      const searchUrl = searchEngines[defaultEngine].url.replace('{{{s}}}', encodeURIComponent(trimmedQuery));
      window.location.href = searchUrl;
    };
    ````

2.  **Bang Commands:** If the query starts with `!` or contains a pattern like `!yt`, the `handleSearchWithQuery` function identifies the bang command (e.g., `yt`). It searches the combined list of default and custom `bangs` for a match. If found, it extracts the search terms, constructs the target URL using the bang's `u` template, and redirects.

    ```typescript
    const handleSearchWithQuery = (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();
      // ... check if query is empty ...

      const bangRegex = /!([\w]+)/;
      const matches = trimmedQuery.match(bangRegex);

      if (matches && matches.length > 1) {
        const bangCommand = matches[1].toLowerCase();
        const bang = bangs.find(b => b.s.toLowerCase() === bangCommand);

        if (bang) {
          let searchTerms = trimmedQuery.replace(new RegExp(`!${bangCommand}\\s*`), '').trim();
          // ... handle empty search terms ...
          const targetUrl = bang.u.replace('{{{s}}}', encodeURIComponent(searchTerms));
          window.location.href = targetUrl;
          return;
        }
      }
      // ... handle bangs at the start or default search ...
    };
    ```

3.  **Customize:** Click the settings icon to open the `SettingsPanel`.
    *   **Custom Bangs:** Add new bangs via the form. The `handleAddCustomBang` function validates input (requires command, title, and URL with `{{{s}}}`) and updates the `customBangs` state, which is persisted to `localStorage`.
    *   **Pinned Links:** Add/edit links using the form. `handleAddPinnedLink` validates, ensures URLs have protocols, and updates the `pinnedLinks` state, also saved to `localStorage`. Links can be reordered via drag-and-drop.
    *   **Default Engine:** Select a new default search engine from the dropdown, updating the `defaultEngine` state stored in `localStorage`.

    ````typescript
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
    ````

4.  **Navigate:** Pinned links stored in the `pinnedLinks` state are displayed by the `PinnedLinksGrid` component. It maps over the `pinnedLinks` array, rendering each link as an `<a>` tag with its URL and a fetched favicon.

    ````typescript
    const PinnedLinksGrid = ({ pinnedLinks }: PinnedLinksGridProps) => {
      // ... empty check and favicon function ...
      return (
        <div className="mt-6 min-h-[100px]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {pinnedLinks
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  className="flex flex-col items-center p-3 bg-zinc-900/70 hover:bg-zinc-800 rounded-lg transition-colors text-center"
                >
                  {/* ... icon and title rendering ... */}
                </a>
              ))}
          </div>
        </div>
      );
    };
    ````