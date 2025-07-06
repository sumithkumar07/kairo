
'use client';

import { useCallback, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { withAuth } from '@/components/auth/with-auth';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Bot, SaveAll, File, FolderOpen, Save, Zap, Users, BrainCircuit, Search, Star, Workflow as WorkflowIcon } from 'lucide-react';
import type { SavedWorkflowMetadata, ExampleWorkflow, Workflow } from '@/types/workflow';
import { listWorkflowsAction, getCommunityWorkflowsAction, generateWorkflowIdeasAction, loadWorkflowAction, deleteWorkflowAction } from '@/app/actions';
import { buttonVariants } from '@/components/ui/button';

function WorkflowHubPage() {
    const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflowMetadata[]>([]);
    const [communityWorkflows, setCommunityWorkflows] = useState<ExampleWorkflow[]>([]);
    const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
    const [ideaQuery, setIdeaQuery] = useState('');
    const [hubSearchTerm, setHubSearchTerm] = useState('');
    const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const loadWorkflows = useCallback(async () => {
        setIsLoading(true);
        try {
            const [userAndExample, community] = await Promise.all([
                listWorkflowsAction(),
                getCommunityWorkflowsAction()
            ]);
            setSavedWorkflows(userAndExample);
            setCommunityWorkflows(community);
        } catch (e: any) {
            toast({ title: 'Error', description: 'Could not load workflows.', variant: 'destructive' });
            setSavedWorkflows([]);
            setCommunityWorkflows([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadWorkflows();
    }, [loadWorkflows]);

    const handleLoadWorkflow = useCallback(async (workflowName: string) => {
        try {
            const loadedData = await loadWorkflowAction(workflowName);
            if (loadedData) {
                localStorage.setItem('kairoCurrentWorkflow', JSON.stringify({ name: loadedData.name, workflow: loadedData.workflow }));
                toast({ title: 'Workflow Ready', description: `Loading "${workflowName}" into the editor.` });
                router.push('/workflow');
            } else {
                throw new Error("Workflow data not found.");
            }
        } catch (e: any) {
            toast({ title: 'Load Error', description: `Failed to load workflow "${workflowName}": ${e.message}`, variant: 'destructive' });
            loadWorkflows();
        }
    }, [toast, router, loadWorkflows]);

    const handleLoadGeneratedWorkflow = (idea: any) => {
        localStorage.setItem('kairoCurrentWorkflow', JSON.stringify({ name: idea.name, workflow: idea.workflow }));
        toast({ title: 'Workflow Ready', description: `Loading "${idea.name}" into the editor.` });
        router.push('/workflow');
    };

    const handleDeleteWorkflow = useCallback(async () => {
        if (!workflowToDelete) return;
        try {
            const result = await deleteWorkflowAction(workflowToDelete);
            if (result.success) {
                toast({ title: 'Workflow Deleted', description: result.message });
                setSavedWorkflows(prev => prev.filter(wf => wf.name !== workflowToDelete));
            } else {
                throw new Error(result.message);
            }
        } catch (e: any) {
            toast({ title: 'Error Deleting', description: e.message, variant: 'destructive' });
        } finally {
            setWorkflowToDelete(null);
        }
    }, [workflowToDelete, toast]);

    const handleGenerateIdeas = useCallback(async () => {
        if (!ideaQuery.trim()) {
            toast({ title: "Query is empty", description: "Please enter a topic to generate ideas." });
            return;
        }
        setIsGeneratingIdeas(true);
        setGeneratedIdeas([]);
        try {
            const result = await generateWorkflowIdeasAction({ query: ideaQuery, count: 4 });
            setGeneratedIdeas(result.ideas || []);
        } catch (e: any) {
            toast({ title: "Failed to generate ideas", description: e.message, variant: "destructive" });
        } finally {
            setIsGeneratingIdeas(false);
        }
    }, [ideaQuery, toast]);
    
    const filteredUserWorkflows = useMemo(() => savedWorkflows.filter(wf => wf.type === 'user' && wf.name.toLowerCase().includes(hubSearchTerm.toLowerCase())), [savedWorkflows, hubSearchTerm]);
    const filteredExampleWorkflows = useMemo(() => savedWorkflows.filter(wf => wf.type === 'example' && wf.name.toLowerCase().includes(hubSearchTerm.toLowerCase())), [savedWorkflows, hubSearchTerm]);
    const filteredCommunityWorkflows = useMemo(() => communityWorkflows.filter(wf => wf.name.toLowerCase().includes(hubSearchTerm.toLowerCase())), [communityWorkflows, hubSearchTerm]);

    const renderWorkflowList = (workflows: any[], type: 'user' | 'example' | 'community' | 'generated') => {
        if (isLoading) return <div className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
        if (workflows.length === 0) return <p className="text-sm text-center text-muted-foreground py-10">No workflows found.</p>;

        const icons = {
            user: <WorkflowIcon className="h-5 w-5 text-primary" />,
            example: <Star className="h-5 w-5 text-amber-500" />,
            community: <Users className="h-5 w-5 text-sky-500" />,
            generated: <Bot className="h-5 w-5 text-violet-500" />
        };

        const loadHandler = type === 'generated' ? handleLoadGeneratedWorkflow : handleLoadWorkflow;
        const nameKey = type === 'user' || type === 'example' ? 'name' : 'name';
        const descKey = type === 'user' || type === 'example' ? 'description' : 'description';

        return (
            <div className="space-y-2">
                {workflows.map((wf, index) => (
                    <div key={`${type}-${wf.name}-${index}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            {icons[type]}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate" title={wf[nameKey]}>{wf[nameKey]}</p>
                                <p className="text-xs text-muted-foreground truncate" title={wf[descKey]}>{wf[descKey]}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                            {type === 'user' && (
                                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setWorkflowToDelete(wf.name)}><Trash2 className="h-4 w-4" /></Button>
                            )}
                            <Button variant="default" size="sm" className="h-8" onClick={() => loadHandler(type === 'generated' ? wf : wf.name)}>Load</Button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <AppLayout>
            <div className="flex-1 flex flex-col p-4 sm:p-6 bg-muted/40 overflow-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Workflow Hub</h1>
                    <p className="max-w-2xl text-muted-foreground">Manage your workflows, explore templates, or generate new ideas with AI.</p>
                </header>
                <Card className="flex-1 flex flex-col">
                    <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
                        <Tabs defaultValue="my-workflows" className="flex-1 flex flex-col">
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-10">
                                <TabsTrigger value="my-workflows">My Workflows</TabsTrigger>
                                <TabsTrigger value="examples">Examples</TabsTrigger>
                                <TabsTrigger value="community">Community</TabsTrigger>
                                <TabsTrigger value="generate">Generate Ideas</TabsTrigger>
                            </TabsList>
                            <div className="py-4 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search workflows..." value={hubSearchTerm} onChange={(e) => setHubSearchTerm(e.target.value)} className="pl-9" />
                            </div>
                            <div className="flex-1 min-h-0 border rounded-lg bg-background">
                                <TabsContent value="my-workflows" className="h-full m-0">
                                    <ScrollArea className="h-full">{renderWorkflowList(filteredUserWorkflows, 'user')}</ScrollArea>
                                </TabsContent>
                                <TabsContent value="examples" className="h-full m-0">
                                    <ScrollArea className="h-full">{renderWorkflowList(filteredExampleWorkflows, 'example')}</ScrollArea>
                                </TabsContent>
                                <TabsContent value="community" className="h-full m-0">
                                    <ScrollArea className="h-full">{renderWorkflowList(filteredCommunityWorkflows, 'community')}</ScrollArea>
                                </TabsContent>
                                <TabsContent value="generate" className="h-full m-0 flex flex-col">
                                    <div className="flex w-full items-center space-x-2 p-4 border-b">
                                        <Input placeholder="e.g., social media, daily reports..." value={ideaQuery} onChange={(e) => setIdeaQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()} />
                                        <Button onClick={handleGenerateIdeas} disabled={isGeneratingIdeas}>
                                            {isGeneratingIdeas ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                                            Generate
                                        </Button>
                                    </div>
                                    <ScrollArea className="flex-1">
                                        {isGeneratingIdeas ? (
                                            <div className="text-center py-10 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" /><p>AI is generating ideas...</p></div>
                                        ) : generatedIdeas.length > 0 ? (
                                            renderWorkflowList(generatedIdeas, 'generated')
                                        ) : (
                                            <p className="text-sm text-center text-muted-foreground pt-10">Enter a topic above and let AI generate workflow ideas for you.</p>
                                        )}
                                    </ScrollArea>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
            <AlertDialog open={!!workflowToDelete} onOpenChange={(open) => !open && setWorkflowToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Workflow "{workflowToDelete}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure? This action cannot be undone and the workflow will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setWorkflowToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteWorkflow} className={buttonVariants({ variant: "destructive" })}>
                            Delete Workflow
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

export default withAuth(WorkflowHubPage);
