"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Eye,
  ThumbsUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAdminAuth } from "@/contexts/admin-auth";
import { adminAPI } from "@/api/admin";

interface DashboardStats {
  totalUsers: number;
  totalComments: number;
  totalSeries: number;
  pendingComments: number;
  recentUsers: Array<{
    id: number;
    name: string;
    email: string;
    created_at: string;
    avatar_path?: string;
  }>;
  recentComments: Array<{
    id: number;
    content: string;
    created_at: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
    series?: {
      id: number;
      title: string;
    };
  }>;
}

export default function AdminPage() {
  const { adminUser, loading } = useAdminAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (adminUser) {
      fetchDashboardStats();
    }
  }, [adminUser]);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminAPI.getStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError("Failed to fetch dashboard stats");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch dashboard stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Admin Dashboard</h2>
        <p className="mb-4 text-gray-600">
          You need to be logged in to access the admin panel.
        </p>
        <a href="/admin/login" className="text-blue-600 hover:underline">
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {adminUser.name}!</p>
        </div>
        <div className="text-sm text-gray-500">Home &gt; Dashboard</div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading
                  ? "..."
                  : stats?.totalUsers?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="mr-1 h-4 w-4" />
            <span>Active users</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Comments
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading
                  ? "..."
                  : stats?.totalComments?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span>All comments visible</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Series</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? "..." : "N/A"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span>MangaDex based</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-orange-100 p-3">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? "..." : "N/A"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <span>Analytics coming soon</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Users
            </h3>
          </div>
          <div className="p-6">
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recentUsers?.length ? (
              <div className="space-y-4">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                      <span className="text-xs font-medium text-gray-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(user.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-gray-500">No recent users</p>
            )}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <a
                href="/admin/users"
                className="text-sm text-blue-600 hover:underline"
              >
                View all users →
              </a>
            </div>
          </div>
        </div>

        {/* Recent Comments */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Comments
            </h3>
          </div>
          <div className="p-6">
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-3 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recentComments?.length ? (
              <div className="space-y-4">
                {stats.recentComments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                      <span className="text-xs font-medium text-gray-600">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.user.name}
                      </p>
                      <p className="text-xs text-gray-600">{comment.content}</p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button className="rounded p-1 text-green-600 hover:bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 text-red-600 hover:bg-red-50">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-gray-500">
                No recent comments
              </p>
            )}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <a
                href="/admin/comments"
                className="text-sm text-blue-600 hover:underline"
              >
                View all comments →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <a
              href="/admin/users"
              className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <Users className="mr-3 h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Manage Users</h4>
                <p className="text-sm text-gray-600">
                  View and manage user accounts
                </p>
              </div>
            </a>

            <a
              href="/admin/comments"
              className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-green-300 hover:bg-green-50"
            >
              <MessageSquare className="mr-3 h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Moderate Comments</h4>
                <p className="text-sm text-gray-600">
                  Review and approve comments
                </p>
              </div>
            </a>

            <a
              href="/admin/settings"
              className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-purple-300 hover:bg-purple-50"
            >
              <ThumbsUp className="mr-3 h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium text-gray-900">Site Settings</h4>
                <p className="text-sm text-gray-600">
                  Configure site preferences
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
