const STORAGE_KEY = 'zdrive_search_index';
const MAX_ENTRIES = 500;

export interface IndexEntry {
  coinAddress: string;
  creatorAddress: string;
  name: string;
  description: string;
  image: string;
  createdAt?: string;
  indexedAt: number;
}

function getIndex(): IndexEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as IndexEntry[];
  } catch {
    return [];
  }
}

function saveIndex(entries: IndexEntry[]): void {
  try {
    // Keep only the most recent entries
    const trimmed = entries.slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function addToIndex(entry: Omit<IndexEntry, 'indexedAt'>): void {
  const entries = getIndex();
  // Update existing or add new
  const existingIdx = entries.findIndex(
    (e) => e.coinAddress.toLowerCase() === entry.coinAddress.toLowerCase()
  );

  const newEntry: IndexEntry = { ...entry, indexedAt: Date.now() };

  if (existingIdx >= 0) {
    entries[existingIdx] = newEntry;
  } else {
    entries.push(newEntry);
  }

  saveIndex(entries);
}

export function addManyToIndex(items: Omit<IndexEntry, 'indexedAt'>[]): void {
  const entries = getIndex();
  const existingMap = new Map(
    entries.map((e, i) => [e.coinAddress.toLowerCase(), i])
  );

  for (const item of items) {
    const key = item.coinAddress.toLowerCase();
    const newEntry: IndexEntry = { ...item, indexedAt: Date.now() };
    const idx = existingMap.get(key);

    if (idx !== undefined) {
      entries[idx] = newEntry;
    } else {
      entries.push(newEntry);
      existingMap.set(key, entries.length - 1);
    }
  }

  saveIndex(entries);
}

export function searchIndex(query: string): IndexEntry[] {
  const entries = getIndex();
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  return entries.filter((entry) =>
    entry.name.toLowerCase().includes(lowerQuery) ||
    entry.description.toLowerCase().includes(lowerQuery) ||
    entry.creatorAddress.toLowerCase().includes(lowerQuery) ||
    entry.coinAddress.toLowerCase().includes(lowerQuery)
  );
}
