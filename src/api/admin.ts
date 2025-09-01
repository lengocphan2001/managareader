import { axios } from "./core/axios";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  avatar_path?: string;
  display_roles: string[];
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  user: AdminUser;
  token: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar_path?: string;
  created_at: string;
  email_verified_at?: string;
  comment_count: number;
  display_roles: string[];
  status: "active" | "suspended" | "banned";
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  display_roles?: string[];
  status?: "active" | "suspended" | "banned";
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    display_roles: string[];
    avatar_path: string | null;
  };
  parent_id: number | null;
  reply_count: number;
  commentable: {
    title: string;
    type: string;
    id: string;
    uuid: string;
    series: {
      title: string;
      uuid: string;
    };
  };
  status: "pending" | "approved" | "rejected" | "flagged";
  is_spam: boolean;
}

export interface UpdateCommentData {
  content?: string;
  status?: "pending" | "approved" | "rejected" | "flagged";
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

class AdminAPI {
  private baseURL = "/api";

  // Admin Authentication
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const response = await axios.post(`${this.baseURL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  }

  // Get admin dashboard stats
  async getStats(): Promise<any> {
    const response = await axios.get(`${this.baseURL}/admin/stats`);
    return response.data;
  }

  async logout(): Promise<void> {
    await axios.post(`${this.baseURL}/auth/logout`);
  }

  async getCurrentUser(): Promise<{ user: AdminUser }> {
    const response = await axios.get(`${this.baseURL}/user`);
    return response.data;
  }

  // User Management
  async getUsers(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<User>> {
    const response = await axios.get(`${this.baseURL}/admin/users`, {
      params: { page, limit },
    });
    return response.data;
  }

  async updateUser(
    userId: number,
    userData: UpdateUserData,
  ): Promise<{ success: boolean; message: string; user?: User }> {
    const response = await axios.put(
      `${this.baseURL}/admin/users/${userId}`,
      userData,
    );
    return response.data;
  }

  async updateUserRole(
    userId: number,
    roles: string[],
  ): Promise<{ success: boolean; message: string }> {
    const response = await axios.put(
      `${this.baseURL}/admin/users/${userId}/roles`,
      { roles },
    );
    return response.data;
  }

  async deleteUser(
    userId: number,
  ): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(
      `${this.baseURL}/admin/users/${userId}`,
    );
    return response.data;
  }

  // Comment Management
  async getComments(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<Comment>> {
    const response = await axios.get(`${this.baseURL}/admin/comments`, {
      params: { page, limit },
    });
    return response.data;
  }

  async updateComment(
    commentId: number,
    commentData: UpdateCommentData,
  ): Promise<{ success: boolean; message: string }> {
    const response = await axios.put(
      `${this.baseURL}/admin/comments/${commentId}`,
      commentData,
    );
    return response.data;
  }

  async deleteComment(
    commentId: number,
  ): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(
      `${this.baseURL}/admin/comments/${commentId}`,
    );
    return response.data;
  }

  // Site Settings
  async getSiteSettings(): Promise<any> {
    const response = await axios.get(`${this.baseURL}/admin/settings`);
    return response.data;
  }

  async updateSiteSettings(
    settings: any,
  ): Promise<{ success: boolean; message: string }> {
    const response = await axios.put(
      `${this.baseURL}/admin/settings`,
      settings,
    );
    return response.data;
  }
}

export const adminAPI = new AdminAPI();
