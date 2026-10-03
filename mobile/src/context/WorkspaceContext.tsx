import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Workspace } from '../types';
import { workspaceApi } from '../api/workspaceApi';
import { creativeApi } from '../api/creativeApi';
import { appStorage } from '../utils/storage';
import { STORAGE_KEYS, DEFAULT_WORKSPACE, INITIAL_WORKSPACES } from '../config/constants';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  isLoadingWorkspaces: boolean;
  refreshWorkspaces: () => Promise<void>;
  addWorkspace: (newWs: Partial<Workspace>) => Promise<{ success: boolean; workspace?: Workspace; error?: string }>;
  updateActiveWorkspace: (updatedData: Partial<Workspace>) => Promise<{ success: boolean; error?: string }>;
  deleteWorkspace: (id: string) => Promise<{ success: boolean; error?: string }>;
  credits: { tier: string; balance: number };
  refreshCredits: () => Promise<void>;
  deductCredits: (amount: number) => boolean;

  // Modals state
  isBrandSwitcherOpen: boolean;
  setIsBrandSwitcherOpen: (open: boolean) => void;
  isScraperOpen: boolean;
  setIsScraperOpen: (open: boolean) => void;
  scraperMode: 'NEW_BRAND' | 'ACTIVE_BRAND';
  setScraperMode: (mode: 'NEW_BRAND' | 'ACTIVE_BRAND') => void;
  openScraperModal: (mode?: 'NEW_BRAND' | 'ACTIVE_BRAND') => void;
  isQuickPostOpen: boolean;
  setIsQuickPostOpen: (open: boolean) => void;
  isAISAChatOpen: boolean;
  setIsAISAChatOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  isProfileMenuOpen: boolean;
  setIsProfileMenuOpen: (open: boolean) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  studioTarget: any | null;
  setStudioTarget: (target: any | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string>(DEFAULT_WORKSPACE.id);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState<boolean>(false);
  const [credits, setCredits] = useState<{ tier: string; balance: number }>({ tier: 'Agency Pro', balance: 500 });

  // Modal overlays
  const [isBrandSwitcherOpen, setIsBrandSwitcherOpen] = useState(false);
  const [isScraperOpen, setIsScraperOpen] = useState(false);
  const [scraperMode, setScraperMode] = useState<'NEW_BRAND' | 'ACTIVE_BRAND'>('NEW_BRAND');
  const [isQuickPostOpen, setIsQuickPostOpen] = useState(false);
  const [isAISAChatOpen, setIsAISAChatOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [studioTarget, setStudioTarget] = useState<any | null>(null);


  const fetchWorkspaces = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingWorkspaces(true);
    try {
      const response = await workspaceApi.list(user?.email);
      if (response.success && Array.isArray(response.workspaces) && response.workspaces.length > 0) {
        const formatted = response.workspaces.map((w: any) => ({
          ...w,
          id: w._id || w.id,
          brandName: w.brandName || 'My Brand',
        }));
        setWorkspaces(formatted);
        await appStorage.setJSON(STORAGE_KEYS.WORKSPACES, formatted);

        // Keep current or select first
        const savedId = await appStorage.getJSON<string>(STORAGE_KEYS.ACTIVE_WS_ID, '');
        const exists = formatted.some((w: any) => w.id === savedId || w._id === savedId);
        if (exists) {
          setActiveWorkspaceIdState(savedId);
        } else {
          setActiveWorkspaceIdState(formatted[0].id || formatted[0]._id);
        }
      }
    } catch (err) {
      console.warn('Workspace fetch note (using cached/fallback):', err);
      const cached = await appStorage.getJSON<Workspace[]>(STORAGE_KEYS.WORKSPACES, [DEFAULT_WORKSPACE]);
      if (cached && cached.length > 0) {
        setWorkspaces(cached);
      }
    } finally {
      setIsLoadingWorkspaces(false);
    }
  }, [isAuthenticated, user?.email]);

  const fetchCredits = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await creativeApi.getCredits();
      if (res.success && res.credits) {
        setCredits(res.credits);
      }
    } catch {
      // Fallback
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaces();
      fetchCredits();
    }
  }, [isAuthenticated, fetchWorkspaces, fetchCredits]);

  const setActiveWorkspaceId = (id: string) => {
    setActiveWorkspaceIdState(id);
    appStorage.setJSON(STORAGE_KEYS.ACTIVE_WS_ID, id);
  };

  const addWorkspace = async (newWs: Partial<Workspace>) => {
    try {
      const res = await workspaceApi.create(newWs);
      if (res.success && res.workspace) {
        const created = { ...res.workspace, id: res.workspace._id || res.workspace.id };
        setWorkspaces((prev) => [created, ...prev]);
        setActiveWorkspaceId(created.id);
        return { success: true, workspace: created };
      }
      return { success: false, error: 'Failed to create workspace' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateActiveWorkspace = async (updatedData: Partial<Workspace>) => {
    try {
      const res = await workspaceApi.update(activeWorkspaceId, updatedData);
      if (res.success && res.workspace) {
        const updated = { ...res.workspace, id: res.workspace._id || res.workspace.id };
        setWorkspaces((prev) => prev.map((w) => (w.id === activeWorkspaceId ? updated : w)));
        return { success: true };
      }
      return { success: false, error: 'Update failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteWorkspace = async (id: string) => {
    try {
      const res = await workspaceApi.delete(id);
      if (res.success) {
        setWorkspaces((prev) => {
          const filtered = prev.filter((w) => w.id !== id);
          if (activeWorkspaceId === id && filtered.length > 0) {
            setActiveWorkspaceId(filtered[0].id);
          }
          return filtered;
        });
        return { success: true };
      }
      return { success: false, error: res.message || 'Delete failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deductCredits = (amount: number): boolean => {
    if (credits.balance < amount) return false;
    setCredits((prev) => ({ ...prev, balance: prev.balance - amount }));
    return true;
  };

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId || w._id === activeWorkspaceId) ||
    workspaces[0] ||
    DEFAULT_WORKSPACE;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        activeWorkspaceId,
        setActiveWorkspaceId,
        isLoadingWorkspaces,
        refreshWorkspaces: fetchWorkspaces,
        addWorkspace,
        updateActiveWorkspace,
        deleteWorkspace,
        credits,
        refreshCredits: fetchCredits,
        deductCredits,

        isBrandSwitcherOpen,
        setIsBrandSwitcherOpen,
        isScraperOpen,
        setIsScraperOpen,
        scraperMode,
        setScraperMode,
        openScraperModal: (mode: 'NEW_BRAND' | 'ACTIVE_BRAND' = 'NEW_BRAND') => {
          setScraperMode(mode);
          setIsScraperOpen(true);
        },
        isQuickPostOpen,
        setIsQuickPostOpen,
        isAISAChatOpen,
        setIsAISAChatOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        isProfileMenuOpen,
        setIsProfileMenuOpen,
        unreadCount,
        setUnreadCount,
        studioTarget,
        setStudioTarget,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};


export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
