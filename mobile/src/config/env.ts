import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AI Ads Platform Mobile Environment Configuration
 * Auto-detects Android Emulator (10.0.2.2) vs LAN IP vs Production
 */

const LOCAL_LAN_IP = '192.168.29.16';
const PORT = '5000';

export const LOCAL_API_URL = `http://${LOCAL_LAN_IP}:${PORT}/api`;
export const PRODUCTION_API_URL = 'https://aiads.aisa24.com/api';
export const LIVE_CLOUD_API_URL = PRODUCTION_API_URL;

// Auto-switch: Development (__DEV__) uses local Wi-Fi IP, Production (Release) uses aiads.aisa24.com
export const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? LOCAL_API_URL : PRODUCTION_API_URL);

// Storage key for user-customized API URL (e.g. testing with physical device over Wi-Fi)
export const CUSTOM_API_URL_KEY = 'aisa_custom_api_url';

let cachedApiUrl: string | null = null;

export const getApiBaseUrl = async (): Promise<string> => {
  if (cachedApiUrl) return cachedApiUrl;
  try {
    const saved = await AsyncStorage.getItem(CUSTOM_API_URL_KEY);
    if (saved && saved.trim() && !saved.includes('asia-south1.run.app')) {
      cachedApiUrl = saved.trim().replace(/\/+$/, '');
      return cachedApiUrl;
    }
  } catch (e) {
    // Fallback to default
  }
  const fallback = (DEFAULT_API_URL || LOCAL_API_URL).replace(/\/+$/, '');
  cachedApiUrl = fallback;
  return fallback;
};

export const setCustomApiUrl = async (url: string): Promise<void> => {
  const clean = url.trim().replace(/\/+$/, '');
  cachedApiUrl = clean;
  await AsyncStorage.setItem(CUSTOM_API_URL_KEY, clean);
};

export const resetApiUrl = async (): Promise<void> => {
  cachedApiUrl = null;
  await AsyncStorage.removeItem(CUSTOM_API_URL_KEY);
};

export const ENV = {
  appName: 'AI Ads™',
  appVersion: '2.0.0',
  defaultLanIp: LOCAL_LAN_IP,
  defaultPort: PORT,
};
