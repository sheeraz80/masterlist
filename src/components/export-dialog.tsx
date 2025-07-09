'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  FileType,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface ExportDialogProps {
  projectIds?: string[];
  filters?: any;
  reportType?: 'export' | 'summary' | 'analytics';
  triggerText?: string;
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
  onExportComplete?: () => void;
}

const formatIcons = {
  csv: FileSpreadsheet,
  json: FileJson,
  xlsx: FileSpreadsheet,
  docx: FileText,
  pdf: FileType,
};

const formatLabels = {
  csv: 'CSV - Spreadsheet compatible',
  json: 'JSON - Developer friendly',
  xlsx: 'Excel - Full spreadsheet features',
  docx: 'Word - Document format',
  pdf: 'PDF - Print ready',
};

async function fetchExportMetadata() {
  const response = await fetch('/api/export');
  if (!response.ok) throw new Error('Failed to fetch export metadata');
  return response.json();
}

async function exportProjects(data: {
  format: string;
  projectIds?: string[];
  filters?: any;
  reportType: string;
}) {
  const response = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Export failed');
  }

  // Handle different response types
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    return response.json();
  } else {
    // For file downloads, create a blob and trigger download
    const blob = await response.blob();
    const filename = response.headers
      .get('content-disposition')
      ?.split('filename=')[1]
      ?.replace(/"/g, '') || `export.${data.format}`;
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true, filename };
  }
}

export function ExportDialog({
  projectIds,
  filters,
  reportType = 'export',
  triggerText = 'Export',
  triggerVariant = 'outline',
  onExportComplete,
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  
  const { data: metadata, isLoading: metadataLoading } = useQuery({
    queryKey: ['export-metadata'],
    queryFn: fetchExportMetadata,
    enabled: open,
  });

  const exportMutation = useMutation({
    mutationFn: exportProjects,
    onSuccess: (data) => {
      toast.success(`Export ${data.filename ? 'downloaded' : 'completed'} successfully!`);
      setOpen(false);
      onExportComplete?.();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Export failed');
    },
  });

  const handleExport = () => {
    exportMutation.mutate({
      format: selectedFormat,
      projectIds,
      filters,
      reportType,
    });
  };

  const FormatIcon = formatIcons[selectedFormat as keyof typeof formatIcons];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>
          <Download className="mr-2 h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Projects</DialogTitle>
          <DialogDescription>
            Choose a format to export your {projectIds?.length || 'filtered'} projects.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup
              value={selectedFormat}
              onValueChange={setSelectedFormat}
              className="space-y-2"
            >
              {metadata?.formats?.map((format: string) => {
                const Icon = formatIcons[format as keyof typeof formatIcons];
                return (
                  <div key={format} className="flex items-center space-x-2">
                    <RadioGroupItem value={format} id={format} />
                    <Label
                      htmlFor={format}
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{formatLabels[format as keyof typeof formatLabels]}</span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Export Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {projectIds?.length 
                ? `Exporting ${projectIds.length} selected projects`
                : filters 
                  ? 'Exporting filtered projects'
                  : 'Exporting all projects'
              }
            </AlertDescription>
          </Alert>

          {/* Recent Exports */}
          {metadata?.exportHistory?.length > 0 && (
            <div className="space-y-3">
              <Label>Recent Exports</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {metadata.exportHistory.map((exp: any) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {exp.format.toUpperCase()}
                      </Badge>
                      <span className="text-muted-foreground">
                        {exp.projectCount} projects
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(exp.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={exportMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FormatIcon className="mr-2 h-4 w-4" />
                Export as {selectedFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}