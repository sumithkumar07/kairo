
'use client';

import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { withAuth } from '@/components/auth/with-auth';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ArrowRight, CheckCircle2, FilePlus, History, Loader2, Workflow, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SavedWorkflowMetadata, WorkflowRunRecord } from '@/types/workflow';
import { getRunHistoryAction, listWorkflowsAction } from '@/app/actions';
import { formatDistanceToNow, subDays, startOfDay, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Bar, BarChart, CartesianGrid, XAxis, Area, AreaChart, Tooltip as RechartsTooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface DashboardStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
  totalWorkflows: number;
  dailyRuns: { date: string; successful: number; failed: number }[];
  runStatusData: { name: string; value: number; fill: string }[];
}

const areaChartConfig = {
  successful: { label: "Successful", color: "hsl(var(--chart-2))" },
  failed: { label: "Failed", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

const barChartConfig = {
  value: { label: "Count" },
  successful: { label: "Successful", color: "hsl(var(--chart-2))" },
  failed: { label: "Failed", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

function DashboardPage() {
    const { user } = useSubscription();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentRuns, setRecentRuns] = useState<WorkflowRunRecord[]>([]);
    const [recentWorkflows, setRecentWorkflows] = useState<SavedWorkflowMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadDashboardData() {
            setIsLoading(true);
            try {
                const [runs, workflows] = await Promise.all([
                    getRunHistoryAction(),
                    listWorkflowsAction(),
                ]);

                const userWorkflows = workflows.filter(wf => wf.type === 'user');
                
                const totalRuns = runs.length;
                const successfulRuns = runs.filter(r => r.status === 'Success').length;
                const failedRuns = totalRuns - successfulRuns;
                const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;
                
                // Process data for charts
                const today = startOfDay(new Date());
                const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();

                const dailyRuns = last7Days.map(day => {
                    const dayString = format(day, 'MMM d');
                    const runsOnDay = runs.filter(run => startOfDay(new Date(run.timestamp)).getTime() === day.getTime());
                    return {
                        date: dayString,
                        successful: runsOnDay.filter(r => r.status === 'Success').length,
                        failed: runsOnDay.filter(r => r.status === 'Failed').length,
                    };
                });
                
                const runStatusData = [
                    { name: 'Successful', value: successfulRuns, fill: 'var(--color-successful)' },
                    { name: 'Failed', value: failedRuns, fill: 'var(--color-failed)' },
                ];

                setStats({
                    totalRuns,
                    successfulRuns,
                    failedRuns,
                    successRate,
                    totalWorkflows: userWorkflows.length,
                    dailyRuns,
                    runStatusData,
                });

                setRecentRuns(runs.slice(0, 5));
                // Sort user workflows by description (which contains date) before slicing
                const sortedUserWorkflows = userWorkflows.sort((a,b) => (b.description || '').localeCompare(a.description || ''));
                setRecentWorkflows(sortedUserWorkflows.slice(0, 5));

            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    const getStatusIndicator = (status: 'Success' | 'Failed') => {
        const styles = {
            Success: { Icon: CheckCircle2, color: 'text-green-500' },
            Failed: { Icon: XCircle, color: 'text-destructive' }
        };
        const { Icon, color } = styles[status];
        return <Icon className={cn("h-4 w-4 shrink-0", color)} title={status}/>;
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading your dashboard...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }
    
    return (
        <AppLayout>
            <div className="flex-1 flex flex-col p-4 sm:p-6 bg-muted/40 overflow-auto">
                <header className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Welcome back, {user?.email.split('@')[0]}!
                    </h1>
                    <p className="text-muted-foreground">Here's a summary of your automation activities.</p>
                </header>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
                            <History className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalRuns ?? 0}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Successful Runs</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.successfulRuns ?? 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.successRate.toFixed(1) ?? '0.0'}% success rate
                            </p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Failed Runs</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             <div className="text-2xl font-bold">{stats?.failedRuns ?? 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Saved Workflows</CardTitle>
                            <Workflow className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             <div className="text-2xl font-bold">{stats?.totalWorkflows ?? 0}</div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="grid gap-6 lg:grid-cols-5 mb-6">
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Runs - Last 7 Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={areaChartConfig} className="h-64 w-full">
                                <AreaChart data={stats?.dailyRuns} accessibilityLayer>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                                    <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} />
                                    <Area dataKey="successful" type="natural" fill="var(--color-successful)" fillOpacity={0.4} stroke="var(--color-successful)" stackId="a" />
                                    <Area dataKey="failed" type="natural" fill="var(--color-failed)" fillOpacity={0.4} stroke="var(--color-failed)" stackId="a" />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>All-Time Runs</CardTitle>
                            <CardDescription>Successful vs. Failed</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={barChartConfig} className="h-64 w-full">
                                <BarChart data={stats?.runStatusData} layout="vertical" accessibilityLayer>
                                    <XAxis type="number" hide />
                                    <RechartsTooltip content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="value" layout="vertical" radius={5} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your most recently executed workflows.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            {recentRuns.length > 0 ? (
                                <ul className="space-y-3">
                                    {recentRuns.map(run => (
                                        <li key={run.id} className="flex items-center text-sm gap-3">
                                            {getStatusIndicator(run.status)}
                                            <span className="flex-grow truncate" title={run.workflowName}>{run.workflowName}</span>
                                            <span className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No workflow runs found.</p>
                            )}
                        </CardContent>
                        <CardFooter>
                             <Button asChild variant="outline" size="sm" className="w-full">
                                <Link href="/run-history">View All History <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Recent Workflows</CardTitle>
                            <CardDescription>Your most recently saved workflows.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            {recentWorkflows.length > 0 ? (
                                <ul className="space-y-3">
                                    {recentWorkflows.map(wf => (
                                        <li key={wf.name} className="flex items-center text-sm gap-3">
                                            <Workflow className="h-4 w-4 text-primary shrink-0"/>
                                            <span className="flex-grow truncate" title={wf.name}>{wf.name}</span>
                                            <Button asChild variant="secondary" size="sm" className="h-7 text-xs">
                                                <Link href={`/workflow?load=${encodeURIComponent(wf.name)}`}>Open</Link>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                 <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground mb-3">You haven't saved any workflows yet.</p>
                                    <Button asChild size="sm">
                                        <Link href="/workflow"><FilePlus className="mr-2 h-4 w-4"/>Create Your First Workflow</Link>
                                    </Button>
                                 </div>
                            )}
                        </CardContent>
                         <CardFooter>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link href="/workflow">Go to Editor <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

export default withAuth(DashboardPage);
