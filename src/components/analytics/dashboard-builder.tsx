'use client';

import { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import GridLayout from 'react-grid-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Layout, Plus, Save, Download, Upload, Trash2,
  BarChart3, LineChart, PieChart, Activity,
  DollarSign, Users, TrendingUp, Target
} from 'lucide-react';
import { toast } from 'sonner';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Widget types
const WIDGET_TYPES = {
  METRIC: 'metric',
  CHART: 'chart',
  LIST: 'list',
  PROGRESS: 'progress'
};

// Available widgets
const AVAILABLE_WIDGETS = [
  { id: 'revenue-metric', type: WIDGET_TYPES.METRIC, title: 'Revenue', icon: DollarSign, color: 'green' },
  { id: 'users-metric', type: WIDGET_TYPES.METRIC, title: 'Active Users', icon: Users, color: 'blue' },
  { id: 'growth-metric', type: WIDGET_TYPES.METRIC, title: 'Growth Rate', icon: TrendingUp, color: 'purple' },
  { id: 'revenue-chart', type: WIDGET_TYPES.CHART, title: 'Revenue Trend', icon: LineChart, chartType: 'line' },
  { id: 'category-chart', type: WIDGET_TYPES.CHART, title: 'Category Distribution', icon: PieChart, chartType: 'pie' },
  { id: 'activity-chart', type: WIDGET_TYPES.CHART, title: 'Activity Timeline', icon: Activity, chartType: 'area' },
  { id: 'top-projects', type: WIDGET_TYPES.LIST, title: 'Top Projects', icon: BarChart3 },
  { id: 'goals-progress', type: WIDGET_TYPES.PROGRESS, title: 'Goals Progress', icon: Target }
];

interface WidgetInstance {
  i: string;
  type: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config?: any;
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetInstance[];
  createdAt: Date;
  updatedAt: Date;
}

// Draggable widget component
function DraggableWidget({ widget }: { widget: typeof AVAILABLE_WIDGETS[0] }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'widget',
    item: widget,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const Icon = widget.icon;

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-lg cursor-move transition-all ${
        isDragging ? 'opacity-50' : 'hover:border-primary'
      }`}
    >
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{widget.title}</span>
      </div>
    </div>
  );
}

// Widget renderer
function WidgetRenderer({ widget, data }: { widget: WidgetInstance; data?: any }) {
  const renderContent = () => {
    switch (widget.type) {
      case WIDGET_TYPES.METRIC:
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{data?.value || '0'}</p>
              <p className="text-xs text-muted-foreground">{data?.change || '+0%'} from last period</p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        );
      
      case WIDGET_TYPES.CHART:
        return (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Chart placeholder</p>
            </div>
          </div>
        );
      
      case WIDGET_TYPES.LIST:
        return (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-2 bg-gray-50 rounded flex items-center justify-between">
                <span className="text-sm">Project {i}</span>
                <Badge variant="outline">{90 - i * 10}%</Badge>
              </div>
            ))}
          </div>
        );
      
      case WIDGET_TYPES.PROGRESS:
        return (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Revenue Goal</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>User Growth</span>
                <span>60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        );
      
      default:
        return <p>Unknown widget type</p>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}

export function DashboardBuilder() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [currentLayout, setCurrentLayout] = useState<string>('');
  const [layoutName, setLayoutName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Drop zone for widgets
  const [, drop] = useDrop(() => ({
    accept: 'widget',
    drop: (item: typeof AVAILABLE_WIDGETS[0]) => {
      const newWidget: WidgetInstance = {
        i: `${item.id}-${Date.now()}`,
        type: item.type,
        title: item.title,
        x: 0,
        y: 0,
        w: item.type === WIDGET_TYPES.CHART ? 6 : 3,
        h: item.type === WIDGET_TYPES.CHART ? 4 : 2
      };
      setWidgets(prev => [...prev, newWidget]);
    },
  }));

  const handleLayoutChange = (layout: any[]) => {
    setWidgets(prev => prev.map((widget, index) => ({
      ...widget,
      x: layout[index]?.x || widget.x,
      y: layout[index]?.y || widget.y,
      w: layout[index]?.w || widget.w,
      h: layout[index]?.h || widget.h,
    })));
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.i !== widgetId));
  };

  const saveLayout = () => {
    if (!layoutName.trim()) {
      toast.error('Please enter a layout name');
      return;
    }

    const newLayout: DashboardLayout = {
      id: Date.now().toString(),
      name: layoutName,
      widgets: widgets,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setLayouts(prev => [...prev, newLayout]);
    setCurrentLayout(newLayout.id);
    setLayoutName('');
    setShowSaveDialog(false);
    toast.success('Layout saved successfully');
  };

  const loadLayout = (layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (layout) {
      setWidgets(layout.widgets);
      setCurrentLayout(layoutId);
      toast.success(`Loaded layout: ${layout.name}`);
    }
  };

  const exportLayout = () => {
    const dataStr = JSON.stringify({ layouts, currentLayout }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'dashboard-layouts.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layout className="h-6 w-6" />
              Dashboard Builder
            </h2>
            <p className="text-muted-foreground">
              Drag and drop widgets to create your custom dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={currentLayout} onValueChange={loadLayout}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a layout" />
              </SelectTrigger>
              <SelectContent>
                {layouts.map(layout => (
                  <SelectItem key={layout.id} value={layout.id}>
                    {layout.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Layout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Dashboard Layout</DialogTitle>
                  <DialogDescription>
                    Give your custom dashboard layout a name
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Layout Name</Label>
                    <Input
                      value={layoutName}
                      onChange={(e) => setLayoutName(e.target.value)}
                      placeholder="e.g., Executive Dashboard"
                    />
                  </div>
                  <Button onClick={saveLayout} className="w-full">
                    Save Layout
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" onClick={exportLayout}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px,1fr]">
          {/* Widget Palette */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Available Widgets</CardTitle>
              <CardDescription>
                Drag widgets to the canvas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {AVAILABLE_WIDGETS.map(widget => (
                <DraggableWidget key={widget.id} widget={widget} />
              ))}
            </CardContent>
          </Card>

          {/* Canvas */}
          <Card ref={drop} className="min-h-[600px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dashboard Canvas</CardTitle>
                {widgets.length > 0 && (
                  <Badge variant="outline">{widgets.length} widgets</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {widgets.length === 0 ? (
                <div className="h-[500px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <Plus className="h-12 w-12 mx-auto mb-2" />
                    <p>Drop widgets here to start building</p>
                  </div>
                </div>
              ) : (
                <GridLayout
                  className="layout"
                  layout={widgets}
                  cols={12}
                  rowHeight={60}
                  width={1200}
                  onLayoutChange={handleLayoutChange}
                  draggableHandle=".drag-handle"
                >
                  {widgets.map(widget => (
                    <div key={widget.i} className="relative group">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeWidget(widget.i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="drag-handle absolute top-2 left-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Badge variant="outline" className="text-xs">
                          Drag
                        </Badge>
                      </div>
                      <WidgetRenderer widget={widget} />
                    </div>
                  ))}
                </GridLayout>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}