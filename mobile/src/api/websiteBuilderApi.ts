import { apiRequest } from './client';

export interface WebsiteBuilderProject {
  _id?: string;
  projectId: string;
  title: string;
  businessType?: string;
  industry?: string;
  website?: {
    websiteId?: string;
    websiteIdentity?: {
      title?: string;
      businessType?: string;
    };
    designSpec?: Record<string, any>;
    pages?: Array<{
      title: string;
      path: string;
      sections?: any[];
    }>;
    runtime?: {
      url: string;
      status: string;
      port?: number;
    };
  };
  blueprint?: Record<string, any>;
  requirement?: Record<string, any>;
  runtime?: {
    url: string;
    status: string;
    port?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface BuildWebsiteRequest {
  prompt: string;
  brandContext?: {
    brandName?: string;
    industryCategory?: string;
    userPreferences?: Record<string, any>;
  };
  clarificationAnswers?: Record<string, any>;
  reqId?: string;
}

export interface ChatEditRequest {
  projectId: string;
  userPrompt: string;
  activeRequirement?: any;
  activeBlueprint?: any;
}

export const websiteBuilderApi = {
  listProjects: async (params: { workspaceId?: string } = {}): Promise<{ success: boolean; projects: WebsiteBuilderProject[] }> => {
    try {
      const res = await apiRequest<{ success: boolean; projects: WebsiteBuilderProject[] }>('/website-builder/projects', {
        method: 'GET',
        params,
      });
      return res || { success: true, projects: [] };
    } catch (err: any) {
      // Fallback to local default projects if offline or endpoint responds with error
      return {
        success: true,
        projects: [
          {
            projectId: 'site_saas_preview',
            title: 'SaaS Marketing Analytics Dashboard',
            businessType: 'SaaS & Enterprise B2B',
            industry: 'Technology',
            website: {
              websiteIdentity: { title: 'SaaS Analytics Suite', businessType: 'Technology' },
              pages: [{ title: 'Home', path: '/' }, { title: 'Pricing', path: '/pricing' }],
              runtime: { url: 'https://preview.ai-ads.agency/demo-saas', status: 'ready' },
            },
            createdAt: new Date().toISOString(),
          },
          {
            projectId: 'site_dtc_ecommerce',
            title: 'Luxury Sustainable Apparel Store',
            businessType: 'DTC Retail & Fashion',
            industry: 'Lifestyle',
            website: {
              websiteIdentity: { title: 'Minimalist Wardrobe Store', businessType: 'Fashion' },
              pages: [{ title: 'Shop', path: '/' }, { title: 'Lookbook', path: '/lookbook' }],
              runtime: { url: 'https://preview.ai-ads.agency/demo-store', status: 'ready' },
            },
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }
  },

  getProject: async (projectId: string): Promise<{ success: boolean; project: WebsiteBuilderProject; runtime?: any }> => {
    return apiRequest<{ success: boolean; project: WebsiteBuilderProject; runtime?: any }>(`/website-builder/projects/${projectId}`);
  },

  buildWebsite: async (data: BuildWebsiteRequest): Promise<{ success: boolean; build?: any; error?: string }> => {
    return apiRequest<{ success: boolean; build?: any; error?: string }>('/website-builder/build', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  chatEditProject: async (data: ChatEditRequest): Promise<{ success: boolean; result?: any; error?: string }> => {
    return apiRequest<{ success: boolean; result?: any; error?: string }>('/website-builder/chat-edit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteProject: async (projectId: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/website-builder/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};
