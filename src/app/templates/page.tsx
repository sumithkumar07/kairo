'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { TemplateMarketplace } from '@/components/template-marketplace';
import { WorkflowTemplate } from '@/data/workflow-templates';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Download, 
  Star, 
  Clock, 
  Users, 
  ArrowRight,
  X,
  Eye,
  Settings,
  Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { withAuth } from '@/components/auth/with-auth';

function TemplatePreviewDialog({ 
  template, 
  isOpen, 
  onClose, 
  onUseTemplate 
}: { 
  template: WorkflowTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: WorkflowTemplate) => void;
}) {
  if (!template) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {template.name}
                {template.isPremium && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    Pro
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-lg mt-2">
                {template.description}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Badge className={getDifficultyColor(template.difficulty)}>
              {template.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {template.estimatedTime}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {template.rating}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Download className="h-4 w-4" />
              {template.downloadCount.toLocaleString()} downloads
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {template.integrations.map((integration) => (
                    <Badge key={integration} variant="secondary">
                      {integration}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Workflow Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Workflow Overview</h3>
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-3" />
                  <p>Workflow contains:</p>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="text-sm">
                      <strong>{template.workflow.nodes.length}</strong> nodes
                    </div>
                    <div className="text-sm">
                      <strong>{template.workflow.connections.length}</strong> connections
                    </div>
                    <div className="text-sm">
                      <strong>{template.integrations.length}</strong> integrations
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="text-sm">
              <span className="text-muted-foreground">Created by</span>{' '}
              <span className="font-medium">{template.author}</span>
              <span className="text-muted-foreground ml-2">•</span>
              <span className="text-muted-foreground ml-2">
                Updated {new Date(template.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => onUseTemplate(template)}
            >
              <Download className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
            <Button size="lg" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview Workflow
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    // Save template data to localStorage for workflow editor
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    
    toast({
      title: "Template Selected",
      description: `"${template.name}" will be loaded in the workflow editor.`,
    });
    
    // Navigate to workflow editor
    router.push('/workflow?from=template');
  };

  const handlePreviewTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleUseTemplate = (template: WorkflowTemplate) => {
    setIsPreviewOpen(false);
    handleSelectTemplate(template);
  };

  return (
    <AppLayout>
      <div className="h-full overflow-hidden">
        <TemplateMarketplace
          onSelectTemplate={handleSelectTemplate}
          onPreviewTemplate={handlePreviewTemplate}
        />
        
        <TemplatePreviewDialog
          template={selectedTemplate}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onUseTemplate={handleUseTemplate}
        />
      </div>
    </AppLayout>
  );
}

export default withAuth(TemplatesPage);