const redirects = [
  { from: '/tools', to: '/categories' },
  { from: '/agents', to: '/ai-agent' },
  { from: '/blog', to: '/' },
  { from: '/search', to: '/' }
];

export function handleRedirects(path: string): string | null {
  const redirect = redirects.find(r => r.from === path);
  return redirect ? redirect.to : null;
}