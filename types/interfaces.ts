export interface Bang {
  c?: string;
  d: string;
  r: number;
  s: string;
  sc?: string;
  t: string;
  u: string;
}

export interface SearchEngine {
  name: string;
  url: string;
  icon: React.ReactNode;
}

export interface PinnedLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  order?: number;
}