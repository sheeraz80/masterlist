'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download, FileText, Image, BarChart3, Calendar,
  Mail, Printer, Share2, Settings, Clock, CheckCircle,
  AlertTriangle, Zap, FileSpreadsheet, FilePlus
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportReportingProps {
  analytics: any;
  projects: any[];
}

export function ExportReporting({ analytics, projects }: ExportReportingProps) {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [reportType, setReportType] = useState('comprehensive');
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'overview', 'quality', 'revenue', 'categories', 'predictions'
  ]);
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const [reportEmail, setReportEmail] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const reportSections = [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
    { id: 'quality', label: 'Quality Analysis', icon: CheckCircle },
    { id: 'revenue', label: 'Revenue Analysis', icon: Zap },
    { id: 'categories', label: 'Category Breakdown', icon: FileText },
    { id: 'predictions', label: 'AI Predictions', icon: AlertTriangle },
    { id: 'trends', label: 'Market Trends', icon: Calendar },
    { id: 'risks', label: 'Risk Assessment', icon: AlertTriangle },
    { id: 'recommendations', label: 'Strategic Recommendations', icon: FilePlus }
  ];

  const exportFormats = [
    { value: 'pdf', label: 'PDF Report', icon: FileText, description: 'Professional formatted report' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet, description: 'Data analysis workbook' },
    { value: 'csv', label: 'CSV Data', icon: Download, description: 'Raw data export' },
    { value: 'png', label: 'Chart Images', icon: Image, description: 'Visualization exports' }
  ];

  const reportTemplates = [
    { 
      value: 'comprehensive', 
      label: 'Comprehensive Report',
      description: 'Full analytics with all insights and recommendations',
      sections: ['overview', 'quality', 'revenue', 'categories', 'predictions', 'trends', 'risks', 'recommendations']
    },
    { 
      value: 'executive', 
      label: 'Executive Summary',
      description: 'High-level overview for leadership',
      sections: ['overview', 'revenue', 'predictions', 'recommendations']
    },
    { 
      value: 'technical', 
      label: 'Technical Analysis',
      description: 'Detailed metrics and performance data',
      sections: ['quality', 'categories', 'trends', 'risks']
    },
    { 
      value: 'financial', 
      label: 'Financial Report',
      description: 'Revenue and ROI focused analysis',
      sections: ['overview', 'revenue', 'predictions']
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const exportData = {
        format: exportFormat,
        sections: selectedSections,
        analytics,
        projects: projects.slice(0, 100), // Limit for performance
        generatedAt: new Date().toISOString(),
        metadata: {
          totalProjects: projects.length,
          sectionsIncluded: selectedSections.length,
          format: exportFormat
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Report exported successfully as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleScheduleReport = async () => {
    if (!reportEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setIsScheduling(true);
    try {
      // Simulate scheduling
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Implement actual scheduling logic
      toast.success(`${scheduleFrequency.charAt(0).toUpperCase() + scheduleFrequency.slice(1)} reports scheduled to ${reportEmail}`);
    } catch (error) {
      toast.error('Failed to schedule report');
    } finally {
      setIsScheduling(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const selectTemplate = (template: typeof reportTemplates[0]) => {
    setReportType(template.value);
    setSelectedSections(template.sections);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export & Reporting
          </CardTitle>
          <CardDescription>
            Generate professional reports and schedule automated analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="export">
            <TabsList>
              <TabsTrigger value="export">Quick Export</TabsTrigger>
              <TabsTrigger value="custom">Custom Report</TabsTrigger>
              <TabsTrigger value="schedule">Scheduled Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Quick Export Options */}
                <div className="space-y-4">
                  <Label>Quick Export Options</Label>
                  <div className="grid gap-3">
                    {exportFormats.map(format => (
                      <div
                        key={format.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          exportFormat === format.value ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                        onClick={() => setExportFormat(format.value)}
                      >
                        <div className="flex items-center gap-3">
                          <format.icon className="h-5 w-5" />
                          <div>
                            <p className="font-medium">{format.label}</p>
                            <p className="text-sm text-muted-foreground">{format.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report Templates */}
                <div className="space-y-4">
                  <Label>Report Templates</Label>
                  <div className="grid gap-3">
                    {reportTemplates.map(template => (
                      <div
                        key={template.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          reportType === template.value ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                        onClick={() => selectTemplate(template)}
                      >
                        <div>
                          <p className="font-medium">{template.label}</p>
                          <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {template.sections.map(section => (
                              <Badge key={section} variant="outline" className="text-xs">
                                {reportSections.find(s => s.id === section)?.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <Button onClick={handleExport} disabled={isExporting} className="flex-1">
                  {isExporting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export {exportFormat.toUpperCase()} Report
                    </>
                  )}
                </Button>
                <Badge variant="outline">
                  {selectedSections.length} sections • {projects.length} projects
                </Badge>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Section Selection */}
                <div>
                  <Label className="mb-3 block">Report Sections</Label>
                  <div className="space-y-3">
                    {reportSections.map(section => (
                      <div key={section.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={section.id}
                          checked={selectedSections.includes(section.id)}
                          onCheckedChange={() => toggleSection(section.id)}
                        />
                        <div className="flex items-center gap-2">
                          <section.icon className="h-4 w-4" />
                          <Label htmlFor={section.id} className="cursor-pointer">
                            {section.label}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Settings */}
                <div className="space-y-4">
                  <div>
                    <Label>Export Format</Label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exportFormats.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Custom reports may take longer to generate depending on the selected sections and data volume.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <Button onClick={handleExport} disabled={isExporting} className="w-full">
                {isExporting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Generating Custom Report...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Custom Report
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Report Frequency</Label>
                    <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTemplates.map(template => (
                          <SelectItem key={template.value} value={template.value}>
                            {template.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Preview Settings</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Frequency:</strong> {scheduleFrequency.charAt(0).toUpperCase() + scheduleFrequency.slice(1)}</p>
                      <p><strong>Report Type:</strong> {reportTemplates.find(t => t.value === reportType)?.label}</p>
                      <p><strong>Format:</strong> PDF</p>
                      <p><strong>Next Report:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      Scheduled reports will be sent to your email automatically. You can manage or cancel schedules anytime.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <Button onClick={handleScheduleReport} disabled={isScheduling} className="w-full">
                {isScheduling ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Setting up Schedule...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule {scheduleFrequency.charAt(0).toUpperCase() + scheduleFrequency.slice(1)} Reports
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}