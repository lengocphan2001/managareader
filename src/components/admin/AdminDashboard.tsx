"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  MessageSquare, 
  Eye, 
  TrendingUp,
  Calendar,
  Clock,
  User,
  MessageCircle,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Badge } from "@/components/shadcn/badge";

interface DashboardStats {
  totalUsers: number;
  totalComments: number;
  totalViews: number;
  growthRate: number;
}

interface RecentActivity {
  id: string;
  type: "user" | "comment" | "login";
  description: string;
  timestamp: string;
  user?: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalComments: 0,
    totalViews: 0,
    growthRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchDashboardData = async () => {
      setLoading(true);
      // In real app, fetch from API
      setTimeout(() => {
        setStats({
          totalUsers: 1247,
          totalComments: 8923,
          totalViews: 45678,
          growthRate: 12.5,
        });
        
        setRecentActivity([
          {
            id: "1",
            type: "user",
            description: "New user registered",
            timestamp: "2 minutes ago",
            user: "john_doe@example.com"
          },
          {
            id: "2",
            type: "comment",
            description: "New comment on 'One Piece'",
            timestamp: "5 minutes ago",
            user: "manga_fan"
          },
          {
            id: "3",
            type: "login",
            description: "Admin login",
            timestamp: "10 minutes ago",
            user: "admin"
          },
          {
            id: "4",
            type: "user",
            description: "User account verified",
            timestamp: "15 minutes ago",
            user: "jane_smith@example.com"
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue 
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: "up" | "down";
    trendValue?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && trendValue && (
          <div className={`flex items-center text-xs ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${
              trend === "down" ? "rotate-180" : ""
            }`} />
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your site.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button>
            <TrendingUp className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue="+12% from last month"
        />
        <StatCard
          title="Total Comments"
          value={stats.totalComments.toLocaleString()}
          icon={MessageSquare}
          trend="up"
          trendValue="+8% from last month"
        />
        <StatCard
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          icon={Eye}
          trend="up"
          trendValue="+15% from last month"
        />
        <StatCard
          title="Growth Rate"
          value={`${stats.growthRate}%`}
          icon={TrendingUp}
          trend="up"
          trendValue="+2.5% from last month"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "user" ? "bg-blue-500" :
                    activity.type === "comment" ? "bg-green-500" : "bg-purple-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {activity.user && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.user}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/admin/users">
                View All Activity
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/admin/users">
                  <User className="h-6 w-6 mb-2" />
                  <span className="text-sm">Manage Users</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/admin/comments">
                  <MessageCircle className="h-6 w-6 mb-2" />
                  <span className="text-sm">Moderate Comments</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/admin/settings">
                  <Settings className="h-6 w-6 mb-2" />
                  <span className="text-sm">Site Settings</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-sm">View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
