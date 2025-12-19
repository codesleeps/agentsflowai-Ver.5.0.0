"use client";

import {
  Bot,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/client-lib/api-client";

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  qualified: "bg-green-500",
  proposal: "bg-purple-500",
  won: "bg-emerald-500",
  lost: "bg-red-500",
};

const sourceIcons: Record<string, string> = {
  website: "🌐",
  chat: "💬",
  referral: "🤝",
  ads: "📢",
};

export default function HomePage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Bot className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-6 gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AgentsFlowAI
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-Powered Business Automation Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Chat Agent
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/leads">
              <Users className="h-4 w-4 mr-2" />
              Manage Leads
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeads ?? 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.qualifiedLeads ?? 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-primary font-medium">{stats?.conversionRate ?? 0}%</span> conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeConversations ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              AI agents handling inquiries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.revenue ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+23%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* AI Agents Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Agents
            </CardTitle>
            <CardDescription>Active automation agents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium">Chat Agent</span>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium">Lead Qualifier</span>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium">Service Recommender</span>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="font-medium">Analytics Agent</span>
              </div>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-400">
                Standby
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Lead Pipeline */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Lead Pipeline
            </CardTitle>
            <CardDescription>Leads by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.leadsByStatus?.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{item.status}</span>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
                <Progress
                  value={(item.count / (stats.totalLeads || 1)) * 100}
                  className={`h-2 ${statusColors[item.status] || 'bg-gray-500'}`}
                />
              </div>
            ))}
            {(!stats?.leadsByStatus || stats.leadsByStatus.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No leads yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Lead Sources
            </CardTitle>
            <CardDescription>Where leads come from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.leadsBySource?.map((item) => (
              <div key={item.source} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{sourceIcons[item.source] || "📊"}</span>
                  <span className="font-medium capitalize">{item.source}</span>
                </div>
                <Badge variant="outline">{item.count}</Badge>
              </div>
            ))}
            {(!stats?.leadsBySource || stats.leadsBySource.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No source data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Recent Leads
              </CardTitle>
              <CardDescription>Latest incoming leads</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/leads">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentLeads?.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {lead.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium">{lead.company || "No company"}</p>
                      <p className="text-xs text-muted-foreground">
                        Score: {lead.score}/100
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${statusColors[lead.status]}/20 capitalize`}
                    >
                      {lead.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!stats?.recentLeads || stats.recentLeads.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No leads yet. Start by creating one or using the AI Chat Agent.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start AI Conversation
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/leads/new">
                <Users className="h-4 w-4 mr-2" />
                Add New Lead
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/services">
                <Target className="h-4 w-4 mr-2" />
                Manage Services
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/analytics">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
