
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit3, Workflow, Eye, FileJson, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

const SAVED_WORKFLOWS_INDEX_KEY = 'kairoSavedWorkflowsIndex'; // Array of names
const WORKFLOW_PREFIX = 'kairoWorkflow_'; // e.g., kairoWorkflow_MyFlow
const CURRENT_WORKFLOW_KEY = 'kairoCurrentWorkflow'; // Key for the main editor's state

interface SavedWorkflowItem {
  name: string;
  // lastModified?: string; // Could add this if storing more metadata
}

export default function SavedWorkflowsPage() {
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflowItem[]>([]);
  const [workflowToDelete, setWorkflowToDelete] = useState<SavedWorkflowItem | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const loadSavedWorkflows = useCallback(() => {
    const indexJson = localStorage.getItem(SAVED_WORKFLOWS_INDEX_KEY);
    if (indexJson) {
      try {
        const names: string[] = JSON.parse(indexJson);
        setSavedWorkflows(names.map(name => ({ name })));
      } catch (e) {
        console.error("Error parsing saved workflows index:", e);
        setSavedWorkflows([]);
        localStorage.removeItem(SAVED_WORKFLOWS_INDEX_KEY); // Clear corrupted index
      }
    } else {
      setSavedWorkflows([]);
    }
  }, []);

  useEffect(() => {
    loadSavedWorkflows();
  }, [loadSavedWorkflows]);

  const handleDeleteWorkflow = () => {
    if (!workflowToDelete) return;

    const workflowKey = `${WORKFLOW_PREFIX}${workflowToDelete.name}`;
    localStorage.removeItem(workflowKey);

    const indexJson = localStorage.getItem(SAVED_WORKFLOWS_INDEX_KEY);
    if (indexJson) {
      try {
        let names: string[] = JSON.parse(indexJson);
        names = names.filter(name => name !== workflowToDelete.name);
        localStorage.setItem(SAVED_WORKFLOWS_INDEX_KEY, JSON.stringify(names));
      } catch (e) {
        console.error("Error updating saved workflows index:", e);
        // Potentially re-throw or handle more gracefully
      }
    }
    
    setSavedWorkflows(prev => prev.filter(wf => wf.name !== workflowToDelete!.name));
    toast({ title: 'Workflow Deleted', description: `Workflow "${workflowToDelete.name}" has been deleted.` });
    setWorkflowToDelete(null);
  };

  const handleLoadAndEditWorkflow = (workflowName: string) => {
    const workflowKey = `${WORKFLOW_PREFIX}${workflowName}`;
    const workflowJson = localStorage.getItem(workflowKey);
    if (workflowJson) {
      localStorage.setItem(CURRENT_WORKFLOW_KEY, workflowJson); // Set it as the current workflow for the editor
      toast({ title: 'Workflow Loaded', description: `"${workflowName}" is now active in the editor.` });
      router.push('/workflow'); // Navigate to the main workflow editor
    } else {
      toast({ title: 'Error Loading Workflow', description: `Could not find data for workflow "${workflowName}". It might have been deleted or corrupted.`, variant: 'destructive' });
      loadSavedWorkflows(); // Refresh the list in case of inconsistencies
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-primary flex items-center">
            <Workflow className="h-8 w-8 mr-2" />
            Kairo
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/workflow">
                    <Edit3 className="mr-2 h-4 w-4" />
                    Workflow Editor
                </Link>
            </Button>
             <Button variant="ghost" asChild>
                <Link href="/subscriptions">
                    Subscriptions
                </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 text-center">
            Saved Workflows
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground text-center">
            Manage your saved automation workflows. Load them into the editor or delete them.
          </p>
        </section>

        {savedWorkflows.length === 0 ? (
          <div className="text-center py-10 bg-card shadow-lg rounded-lg">
            <FileJson className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-70" />
            <p className="text-xl text-muted-foreground font-semibold">No saved workflows yet.</p>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Go to the <Link href="/workflow" className="text-primary hover:underline font-medium">Workflow Editor</Link> to create and save your first workflow.
            </p>
            <Button asChild>
                <Link href="/workflow">
                    <Workflow className="mr-2 h-4 w-4" /> Go to Editor
                </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedWorkflows.map((wf) => (
              <Card key={wf.name} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out">
                <CardHeader className="pb-3">
                  <CardTitle className="truncate text-lg" title={wf.name}>
                    <Workflow className="inline h-5 w-5 mr-2.5 text-primary/80 align-text-bottom" />
                    {wf.name}
                  </CardTitle>
                  {/* Future: <CardDescription>Last modified: {wf.lastModified || "N/A"}</CardDescription> */}
                </CardHeader>
                <CardContent className="flex-grow py-2">
                  <p className="text-xs text-muted-foreground italic">
                    This workflow is stored locally in your browser.
                  </p>
                </CardContent>
                <CardFooter className="gap-2 border-t pt-4 mt-auto">
                  <Button 
                    variant="default" 
                    className="flex-1 h-9 text-sm" 
                    onClick={() => handleLoadAndEditWorkflow(wf.name)}
                    title={`Load "${wf.name}" into the editor`}
                  >
                    <ExternalLink className="mr-2 h-3.5 w-3.5" /> Load & Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setWorkflowToDelete(wf)}
                    title={`Delete workflow "${wf.name}"`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete {wf.name}</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-10 border-t mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kairo. Automate intelligently.
        </p>
      </footer>

      <AlertDialog open={!!workflowToDelete} onOpenChange={(open) => !open && setWorkflowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow "{workflowToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone and the workflow will be permanently removed from your browser's local storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorkflowToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkflow} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete Workflow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
