const GITHUB_PAGES_BASE_PATH = '/pricematch';

function cleanPath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return '/';
  if (/^(https?:|data:|blob:)/.test(trimmed)) return trimmed;
  return `/${trimmed.replace(/^\/+/, '')}`.replace(/\/+/g, '/');
}

export function getAssetPath(path: string): string {
  const cleaned = cleanPath(path);
  if (/^(https?:|data:|blob:)/.test(cleaned)) return cleaned;
  if (cleaned === GITHUB_PAGES_BASE_PATH || cleaned.startsWith(`${GITHUB_PAGES_BASE_PATH}/`)) return cleaned;

  const isBrowser = typeof window !== 'undefined';
  const isGitHubPages = isBrowser
    ? window.location.hostname.endsWith('github.io') && window.location.pathname.startsWith(GITHUB_PAGES_BASE_PATH)
    : process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GITHUB_PAGES !== 'false';

  return isGitHubPages ? `${GITHUB_PAGES_BASE_PATH}${cleaned}` : cleaned;
}
