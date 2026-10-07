import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<AppTabsParamList>;
  CreativeStudio: { tab?: 'MOCKUP' | 'VISUAL' | 'CAROUSEL' | 'REEL' | 'STORYBOARD' | 'BRANDKIT'; target?: any } | undefined;
  WebsiteBuilder: undefined;
};

export type CreateStackParamList = {
  CreateHome: { tab?: 'SOCIAL' | 'CREATIVE' | 'CAROUSEL' | 'REEL' | 'STORYBOARD' | 'BRANDKIT' | 'BLOG' | 'EMAIL' | 'AD_COPY' | 'NEWSPAPER' } | undefined;
  CreativeStudio: { tab?: 'MOCKUP' | 'VISUAL' | 'CAROUSEL' | 'REEL' | 'STORYBOARD' | 'BRANDKIT'; target?: any } | undefined;
  WebsiteBuilder: undefined;
};

export type AppTabsParamList = {
  Home: undefined;
  CalendarTab: NavigatorScreenParams<CalendarStackParamList> | undefined;
  Studio: NavigatorScreenParams<CreateStackParamList> | { tab?: 'SOCIAL' | 'CREATIVE' | 'CAROUSEL' | 'REEL' | 'STORYBOARD' | 'BRANDKIT' | 'BLOG' | 'EMAIL' | 'AD_COPY' | 'NEWSPAPER' } | undefined;
  AssetLibraryTab: undefined;
  More: NavigatorScreenParams<MoreStackParamList> | undefined;
  Strategy?: NavigatorScreenParams<StrategyStackParamList> | undefined;
};

export type StrategyStackParamList = {
  StrategyHome: undefined;
};

export type CalendarStackParamList = {
  CalendarHome: undefined;
  Approvals: undefined;
  ApprovalsDesk: undefined;
  AssetLibrary: undefined;
};

export type MoreStackParamList = {
  MoreHome: undefined;
  BrandDna: undefined;
  AssetLibrary: undefined;
  Analytics: undefined;
  SettingsBilling: undefined;
  WebsiteBuilder: undefined;
  TeamRbac: undefined;
  AdminDashboard: undefined;
  ProductShowcase: undefined;
  CreativeStudio: { tab?: 'MOCKUP' | 'VISUAL' | 'CAROUSEL' | 'REEL' | 'STORYBOARD' | 'BRANDKIT'; target?: any } | undefined;
  Seo: undefined;
  SEO: undefined;
  Campaigns: { campaignId?: string } | undefined;
};


