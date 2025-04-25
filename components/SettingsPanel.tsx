import { forwardRef, FormEvent, useState, Ref } from 'react';
import { IoMdSettings, IoMdClose } from 'react-icons/io';
import { FaPlus, FaEdit } from 'react-icons/fa';
import { MdDragIndicator } from 'react-icons/md';
import { Bang, PinnedLink, SearchEngine } from '@/types/interfaces';

interface SettingsPanelProps {
  defaultEngine: string;
  setDefaultEngine: (engine: string) => void;
  customBangs: Bang[];
  setCustomBangs: (bangs: Bang[]) => void;
  pinnedLinks: PinnedLink[];
  setPinnedLinks: (links: PinnedLink[]) => void;
  onClose: () => void;
  searchEngines: Record<string, SearchEngine>;
}

const SettingsPanel = forwardRef((
  { 
    defaultEngine, 
    setDefaultEngine, 
    customBangs, 
    setCustomBangs, 
    pinnedLinks, 
    setPinnedLinks, 
    onClose,
    searchEngines
  }: SettingsPanelProps,
  ref: Ref<HTMLDivElement>
) => {
  const [showCustomBangForm, setShowCustomBangForm] = useState(false);
  const [showPinnedLinkForm, setShowPinnedLinkForm] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);
  
  const [newBang, setNewBang] = useState<Partial<Bang>>({
    c: "Custom",
    d: "",
    r: 5,
    s: "",
    sc: "Custom",
    t: "",
    u: "",
  });
  
  const [newPinnedLink, setNewPinnedLink] = useState<PinnedLink>({
    id: '',
    title: '',
    url: '',
    icon: '',
    order: 0,
  });

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  };

  const handleAddCustomBang = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newBang.s || !newBang.t || !newBang.u) {
      alert("Command, Title and URL are required fields");
      return;
    }
    
    if (!newBang.u.includes("{{{s}}}")) {
      alert("URL must contain {{{s}}} as a placeholder for search terms");
      return;
    }
    
    const fullBang: Bang = {
      c: newBang.c || "Custom",
      d: newBang.d || new URL(newBang.u).hostname,
      r: newBang.r || 5,
      s: newBang.s,
      sc: newBang.sc || "Custom",
      t: newBang.t,
      u: newBang.u,
    };
    
    setCustomBangs([...customBangs, fullBang]);
    
    setNewBang({
      c: "Custom",
      d: "",
      r: 5,
      s: "",
      sc: "Custom",
      t: "",
      u: "",
    });
    
    setShowCustomBangForm(false);
  };
  
  const removeCustomBang = (shortcut: string) => {
    setCustomBangs(customBangs.filter(bang => bang.s !== shortcut));
  };

  const handleAddPinnedLink = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newPinnedLink.title || !newPinnedLink.url) {
      alert("Title and URL are required fields");
      return;
    }
    
    let url = newPinnedLink.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (editingLinkId) {
      setPinnedLinks(pinnedLinks.map(link => 
        link.id === editingLinkId 
          ? { ...link, title: newPinnedLink.title, url: url } 
          : link
      ));
      setEditingLinkId(null);
    } else {
      const maxOrder = pinnedLinks.length > 0 
        ? Math.max(...pinnedLinks.map(link => link.order || 0))
        : -1;
        
      const newLink: PinnedLink = {
        ...newPinnedLink,
        url: url,
        id: Date.now().toString(),
        order: maxOrder + 1
      };
      
      setPinnedLinks([...pinnedLinks, newLink]);
    }
    
    setNewPinnedLink({
      id: '',
      title: '',
      url: '',
      icon: '',
      order: 0,
    });
    
    setShowPinnedLinkForm(false);
  };
  
  const startEditingLink = (link: PinnedLink) => {
    setNewPinnedLink({
      ...link
    });
    setEditingLinkId(link.id);
    setShowPinnedLinkForm(true);
  };
  
  const cancelEditing = () => {
    setEditingLinkId(null);
    setNewPinnedLink({
      id: '',
      title: '',
      url: '',
      icon: '',
      order: 0,
    });
    setShowPinnedLinkForm(false);
  };
  
  const removePinnedLink = (id: string) => {
    setPinnedLinks(pinnedLinks.filter(link => link.id !== id));
  };

  const handleDragStart = (id: string) => {
    setIsDragging(true);
    setDraggedLinkId(id);
  };
  
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedLinkId === id || !draggedLinkId) return;
    
    const draggedIndex = pinnedLinks.findIndex(link => link.id === draggedLinkId);
    const targetIndex = pinnedLinks.findIndex(link => link.id === id);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newLinks = [...pinnedLinks];
    const draggedLink = newLinks[draggedIndex];
    
    newLinks.splice(draggedIndex, 1);
    newLinks.splice(targetIndex, 0, draggedLink);
    
    const reorderedLinks = newLinks.map((link, index) => ({
      ...link,
      order: index
    }));
    
    setPinnedLinks(reorderedLinks);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedLinkId(null);
  };

  return (
    <div 
      ref={ref}
      className="absolute top-14 right-4 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-4 w-96 z-20 max-h-[80vh] overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-medium">Settings</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-zinc-800"
        >
          <IoMdClose className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm text-zinc-400 mb-2">Default Search Engine</label>
        <div className="space-y-2">
          {Object.entries(searchEngines).map(([key, engine]) => (
            <div 
              key={key}
              onClick={() => setDefaultEngine(key)}
              className={`flex items-center p-2 rounded cursor-pointer ${
                defaultEngine === key ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
              }`}
            >
              <div className="mr-3">{engine.icon}</div>
              <span>{engine.name}</span>
              {defaultEngine === key && (
                <span className="ml-auto w-2 h-2 rounded-full bg-white"></span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t border-zinc-800 pt-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm text-zinc-400">Pinned Links</label>
          <button 
            onClick={() => {
              if (editingLinkId) {
                cancelEditing();
              } else {
                setShowPinnedLinkForm(!showPinnedLinkForm);
              }
            }}
            className="text-sm flex items-center p-1 rounded bg-zinc-800 hover:bg-zinc-700"
          >
            {showPinnedLinkForm ? 'Cancel' : <><FaPlus size={10} className="mr-1" /> Add</>}
          </button>
        </div>
        
        {showPinnedLinkForm && (
          <form onSubmit={handleAddPinnedLink} className="mb-4 bg-zinc-800/50 p-3 rounded-lg">
            <div className="mb-3">
              <label className="block text-xs text-zinc-400 mb-1">Title*</label>
              <input
                type="text"
                value={newPinnedLink.title}
                onChange={(e) => setNewPinnedLink({...newPinnedLink, title: e.target.value})}
                className="w-full px-3 py-2 rounded bg-zinc-700 border border-zinc-600 text-white text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="e.g. GitHub"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-xs text-zinc-400 mb-1">URL*</label>
              <input
                type="text"
                value={newPinnedLink.url}
                onChange={(e) => setNewPinnedLink({...newPinnedLink, url: e.target.value})}
                className="w-full px-3 py-2 rounded bg-zinc-700 border border-zinc-600 text-white text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="e.g. github.com"
                required
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors"
              >
                {editingLinkId ? 'Update Link' : 'Add Link'}
              </button>
              
              {editingLinkId && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="py-2 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
        
        {pinnedLinks.length > 0 ? (
          <div className="space-y-2 mt-2">
            {pinnedLinks
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(link => (
                <div 
                  key={link.id} 
                  className="flex items-center justify-between p-2 rounded bg-zinc-800/50 text-sm"
                  draggable
                  onDragStart={() => handleDragStart(link.id)}
                  onDragOver={(e) => handleDragOver(e, link.id)}
                  onDragEnd={handleDragEnd}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                  <div className="flex items-center overflow-hidden">
                    <span className="mr-2 cursor-grab text-zinc-500">
                      <MdDragIndicator className="w-4 h-4" />
                    </span>
                    <img 
                      src={getFaviconUrl(link.url)} 
                      className="w-4 h-4 mr-2 flex-shrink-0" 
                      alt=""
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="truncate">{link.title}</span>
                  </div>
                  <div className="flex ml-2">
                    <button
                      onClick={() => startEditingLink(link)}
                      className="mr-2 text-zinc-400 hover:text-white flex-shrink-0"
                      type="button"
                    >
                      <FaEdit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removePinnedLink(link.id)}
                      className="text-zinc-400 hover:text-white flex-shrink-0"
                      type="button"
                    >
                      <IoMdClose className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-zinc-500 text-sm italic text-center py-2">
            No pinned links yet
          </div>
        )}
      </div>
      
      <div className="border-t border-zinc-800 pt-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm text-zinc-400">Custom Bangs</label>
          <button 
            onClick={() => setShowCustomBangForm(!showCustomBangForm)}
            className="text-sm flex items-center p-1 rounded bg-zinc-800 hover:bg-zinc-700"
            type="button"
          >
            {showCustomBangForm ? 'Cancel' : <><FaPlus size={10} className="mr-1" /> Add</>}
          </button>
        </div>
        
        {showCustomBangForm && (
          <form onSubmit={handleAddCustomBang} className="mb-4 bg-zinc-800/50 p-3 rounded-lg">
            <div className="mb-3">
              <label className="block text-xs text-zinc-400 mb-1">Command* (without !)</label>
              <input
                type="text"
                value={newBang.s}
                onChange={(e) => setNewBang({...newBang, s: e.target.value})}
                className="w-full px-3 py-2 rounded bg-zinc-700 border border-zinc-600 text-white text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="e.g. gh"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-xs text-zinc-400 mb-1">Title*</label>
              <input
                type="text"
                value={newBang.t}
                onChange={(e) => setNewBang({...newBang, t: e.target.value})}
                className="w-full px-3 py-2 rounded bg-zinc-700 border border-zinc-600 text-white text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="e.g. GitHub"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-xs text-zinc-400 mb-1">URL* (use {"{{{s}}}"} for search term)</label>
              <input
                type="text"
                value={newBang.u}
                onChange={(e) => setNewBang({...newBang, u: e.target.value})}
                className="w-full px-3 py-2 rounded bg-zinc-700 border border-zinc-600 text-white text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="e.g. https://github.com/search?q={{{s}}}"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-xs text-zinc-400 mb-1">Category</label>
              <input
                type="text"
                value={newBang.c}
                onChange={(e) => setNewBang({...newBang, c: e.target.value})}
                className="w-full px-3 py-2 rounded bg-zinc-700 border border-zinc-600 text-white text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="e.g. Developer"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-xs text-zinc-400 mb-1">Subcategory</label>
              <input
                type="text"
                value={newBang.sc}
                onChange={(e) => setNewBang({...newBang, sc: e.target.value})}
                className="w-full px-3 py-2 rounded bg-zinc-700 border border-zinc-600 text-white text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                placeholder="e.g. Code Repository"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors"
            >
              Add Custom Bang
            </button>
          </form>
        )}
        
        {customBangs.length > 0 ? (
          <div className="space-y-2 mt-2">
            {customBangs.map(bang => (
              <div key={bang.s} className="flex items-center justify-between p-2 rounded bg-zinc-800/50 text-sm">
                <div>
                  <span className="font-bold">!{bang.s}</span>
                  <span className="text-zinc-400 ml-2">{bang.t}</span>
                </div>
                <button
                  onClick={() => removeCustomBang(bang.s)}
                  className="text-zinc-400 hover:text-white"
                  type="button"
                >
                  <IoMdClose className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-zinc-500 text-sm italic text-center py-2">
            No custom bangs yet
          </div>
        )}
      </div>
    </div>
  );
});

SettingsPanel.displayName = 'SettingsPanel';

export default SettingsPanel;