
'use client';

import { useCallback, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { withAuth } from '@/components/auth/with-auth';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Bot, Plus, X, KeyRound, Copy, Check, Info, MoreVertical, Terminal, Send, Workflow as WorkflowIcon, User, Settings, Zap, Search, Star, Users, FilePlus } from 'lucide-react';
import type { SavedWorkflowMetadata, ExampleWorkflow, Workflow } from '@/types/workflow';
import { listWorkflowsAction, getCommunityWorkflowsAction, generateWorkflowIdeasAction, loadWorkflowAction, deleteWorkflowAction } from '@/app/actions';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

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

    const renderWorkflowGrid = (workflows: any[], type: 'user' | 'example' | 'community' | 'generated') => {
        const icons = {
            user: <WorkflowIcon className="h-6 w-6 text-primary" />,
            example: <Star className="h-6 w-6 text-amber-500" />,
            community: <Users className="h-6 w-6 text-sky-500" />,
            generated: <Bot className="h-6 w-6 text-violet-500" />
        };
        const loadHandler = type === 'generated' ? handleLoadGeneratedWorkflow : handleLoadWorkflow;

        const emptyStates = {
            user: (
                <div className="col-span-full flex flex-col items-center justify-center text-center py-16 bg-muted/30 rounded-lg">
                    <WorkflowIcon className="h-16 w-16 text-muted-foreground/40 mb-4"/>
                    <h3 className="text-lg font-semibold">No Saved Workflows</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">Create a workflow in the editor and save it to see it here.</p>
                    <Button asChild><Link href="/workflow"><FilePlus className="mr-2 h-4 w-4"/>Create a Workflow</Link></Button>
                </div>
            ),
            example: <p className="col-span-full text-sm text-center text-muted-foreground py-10">No example workflows found.</p>,
            community: <p className="col-span-full text-sm text-center text-muted-foreground py-10">No community workflows found.</p>,
            generated: (
                <div className="col-span-full flex flex-col items-center justify-center text-center py-16 bg-muted/30 rounded-lg">
                    <Bot className="h-16 w-16 text-muted-foreground/40 mb-4"/>
                    <h3 className="text-lg font-semibold">Generate Workflow Ideas</h3>
                    <p className="text-sm text-muted-foreground mt-1">Enter a topic above and let AI generate workflow templates for you.</p>
                </div>
            ),
        }
        
        if (isLoading) return <div className="col-span-full text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
        if (workflows.length === 0) return emptyStates[type];
        

        return workflows.map((wf, index) => (
             <Card key={`${type}-${wf.name}-${index}`} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
                    <div className="p-2 bg-muted rounded-md">{icons[type]}</div>
                    <div className="flex-1">
                        <CardTitle className="text-base truncate" title={wf.name}>{wf.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2 mt-1" title={wf.description}>{wf.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardFooter className="mt-auto flex justify-end gap-2 pt-4 border-t">
                    {type === 'user' && (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setWorkflowToDelete(wf.name)}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
                    )}
                    <Button size="sm" onClick={() => loadHandler(type === 'generated' ? wf : wf.name)}>Load into Editor</Button>
                </CardFooter>
            </Card>
        ));
    };

    return (
        <AppLayout>
            <div className="flex-1 flex flex-col p-4 sm:p-6 bg-muted/40 overflow-hidden">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Workflow Hub</h1>
                    <p className="max-w-2xl text-muted-foreground">Manage your workflows, explore templates, or generate new ideas with AI.</p>
                </header>
                <div className="flex-1 flex flex-col min-h-0">
                    <Tabs defaultValue="my-workflows" className="flex-1 flex flex-col min-h-0">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b">
                            <TabsList className="grid w-full sm:w-auto grid-cols-2 md:grid-cols-4 h-auto sm:h-10">
                                <TabsTrigger value="my-workflows">My Workflows</TabsTrigger>
                                <TabsTrigger value="examples">Examples</TabsTrigger>
                                <TabsTrigger value="community">Community</TabsTrigger>
                                <TabsTrigger value="generate">Generate Ideas</TabsTrigger>
                            </TabsList>
                             <div className="relative w-full sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search workflows..." value={hubSearchTerm} onChange={(e) => setHubSearchTerm(e.target.value)} className="pl-9 h-9" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden mt-4">
                            <TabsContent value="my-workflows" className="h-full m-0">
                                <ScrollArea className="h-full pr-4 -mr-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                                    {renderWorkflowGrid(filteredUserWorkflows, 'user')}
                                  </div>
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="examples" className="h-full m-0">
                                <ScrollArea className="h-full pr-4 -mr-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                                    {renderWorkflowGrid(filteredExampleWorkflows, 'example')}
                                  </div>
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="community" className="h-full m-0">
                               <ScrollArea className="h-full pr-4 -mr-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                                    {renderWorkflowGrid(filteredCommunityWorkflows, 'community')}
                                  </div>
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="generate" className="h-full m-0 flex flex-col">
                                <div className="flex w-full items-center space-x-2 p-4 border rounded-lg bg-card mb-4">
                                    <Input placeholder="e.g., social media, daily reports..." value={ideaQuery} onChange={(e) => setIdeaQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()} className="h-9"/>
                                    <Button onClick={handleGenerateIdeas} disabled={isGeneratingIdeas} className="h-9">
                                        {isGeneratingIdeas ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                                        Generate
                                    </Button>
                                </div>
                                <ScrollArea className="flex-1 pr-4 -mr-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                                    {isGeneratingIdeas 
                                        ? <div className="col-span-full text-center py-10 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" /><p>AI is generating ideas...</p></div>
                                        : renderWorkflowGrid(generatedIdeas, 'generated')
                                    }
                                  </div>
                                </ScrollArea>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
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
