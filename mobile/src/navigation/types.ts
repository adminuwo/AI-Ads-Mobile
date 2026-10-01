import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<AppTabsParamList>;
};

export type AppTabsParamList = {
  Home: undefined;
  Studio: { tab?: 'SOCIAL' | 'CREATIVE' | 'BLOG' | 'EMAIL' } | undefined;
  Strategy: NavigatorScreenParams<StrategyStackParamList> | undefined;
  CalendarTab: NavigatorScreenParams<CalendarStackParamList> | undefined;
  More: NavigatorScreenParams<MoreStackParamList> | undefined;
};

export type StrategyStackParamList = {
  StrategyHome: undefined;
  Seo: undefined;
  Campaigns: undefined;
};

export type CalendarStackParamList = {
  CalendarHome: undefined;
  Approvals: undefined;
};

export type MoreStackParamList = {
  MoreHome: undefined;
  BrandDna: undefined;
  AssetLibrary: undefined;
  Analytics: undefined;
  SettingsBilling: undefined;
};
