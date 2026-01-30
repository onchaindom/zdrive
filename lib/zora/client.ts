import { setApiKey } from '@zoralabs/coins-sdk';

// Initialize Zora SDK with API key
// Get your API key from Zora Developer Settings
const ZORA_API_KEY = process.env.NEXT_PUBLIC_ZORA_API_KEY;

let initialized = false;

export function initializeZoraClient() {
  if (initialized) return;

  if (ZORA_API_KEY) {
    setApiKey(ZORA_API_KEY);
  }

  initialized = true;
}

// Call on app startup
initializeZoraClient();
