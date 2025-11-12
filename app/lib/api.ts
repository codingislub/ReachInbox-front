import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Attachment {
  filename: string;
  contentType: string;
  size: number;
}

export interface Email {
  id: string;
  messageId: string;
  accountEmail: string;
  folder: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  html?: string;
  date: string;
  attachments?: Attachment[];
  category?: string;
  receivedAt: string;
}

export interface SearchQuery {
  query?: string;
  account?: string;
  folder?: string;
  category?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  success: boolean;
  data: Email[];
  total: number;
  limit: number;
  offset: number;
}

export interface SuggestedReply {
  emailId: string;
  suggestedReply: string;
  confidence: number;
  context: string[];
}

export interface Metadata {
  accounts: string[];
  folders: Record<string, string[]>;
}

export const api = {
  // Get emails with filters
  getEmails: async (query: SearchQuery = {}): Promise<SearchResponse> => {
    const params = new URLSearchParams();
    if (query.query) params.append('q', query.query);
    if (query.account) params.append('account', query.account);
    if (query.folder) params.append('folder', query.folder);
    if (query.category) params.append('category', query.category);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());

    const response = await axios.get(`${API_BASE_URL}/emails?${params.toString()}`);
    return response.data;
  },

  // Get single email
  getEmail: async (id: string): Promise<Email> => {
    const response = await axios.get(`${API_BASE_URL}/emails/${id}`);
    return response.data.data;
  },

  // Search emails
  searchEmails: async (query: SearchQuery): Promise<SearchResponse> => {
    const response = await axios.post(`${API_BASE_URL}/emails/search`, query);
    return response.data;
  },

  // Update email category
  updateCategory: async (id: string, category: string): Promise<void> => {
    await axios.patch(`${API_BASE_URL}/emails/${id}/category`, { category });
  },

  // Recategorize with AI
  recategorizeEmail: async (id: string): Promise<Email> => {
    const response = await axios.post(`${API_BASE_URL}/emails/${id}/recategorize`);
    return response.data.data;
  },

  // Get suggested reply
  getSuggestedReply: async (id: string): Promise<SuggestedReply> => {
    const response = await axios.post(`${API_BASE_URL}/emails/${id}/suggest-reply`);
    return response.data.data;
  },

  // Get metadata
  getMetadata: async (): Promise<Metadata> => {
    const response = await axios.get(`${API_BASE_URL}/metadata`);
    return response.data.data;
  },

  // Health check
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data.success;
    } catch {
      return false;
    }
  }
};
