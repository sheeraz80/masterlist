'use client';

import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, Layers, TreePine, Clock, 
  GitBranch, Zap, Target, RefreshCw 
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  category: string;
  qualityScore: number;
  technicalComplexity: number;
  revenuePotential: number;
  activitiesCount: number;
  createdAt: Date;
}

interface D3VisualizationsProps {
  projects: Project[];
}

// Force-directed Network Graph Component
function NetworkGraph({ projects }: { projects: Project[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || projects.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Create nodes and links
    const nodes = projects.map(p => ({
      id: p.id,
      title: p.title.substring(0, 20) + (p.title.length > 20 ? '...' : ''),
      category: p.category,
      quality: p.qualityScore,
      revenue: p.revenuePotential,
      complexity: p.technicalComplexity,
      size: Math.sqrt(p.revenuePotential / 10000) + 5
    }));

    // Create links based on category similarity and quality correlation
    const links: Array<{ source: string; target: string; strength: number }> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        // Link projects in same category or similar quality
        if (node1.category === node2.category || 
            Math.abs(node1.quality - node2.quality) <= 2) {
          links.push({
            source: node1.id,
            target: node2.id,
            strength: node1.category === node2.category ? 0.8 : 0.3
          });
        }
      }
    }

    // Color scale for categories
    const categories = [...new Set(projects.map(p => p.category))];
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(categories);

    // Create simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).strength((d: any) => d.strength))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => d.size + 2));

    // Create SVG container
    const container = svg
      .attr("width", width)
      .attr("height", height)
      .style("border", "1px solid #e5e7eb");

    // Add zoom behavior
    const g = container.append("g");
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    container.call(zoom as any);

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: any) => Math.sqrt(d.strength * 5));

    // Create nodes
    const node = g.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", (d: any) => d.size)
      .attr("fill", (d: any) => colorScale(d.category))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any
      );

    // Add labels
    const label = g.append("g")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text((d: any) => d.title)
      .style("font-size", "10px")
      .style("text-anchor", "middle")
      .style("pointer-events", "none");

    // Add tooltips
    node
      .on("mouseover", (event, d: any) => {
        setSelectedNode(d.id);
        
        // Highlight connected nodes
        const connectedNodes = new Set();
        links.forEach(l => {
          if (l.source === d.id) connectedNodes.add(l.target);
          if (l.target === d.id) connectedNodes.add(l.source);
        });
        
        node.style("opacity", (n: any) => 
          n.id === d.id || connectedNodes.has(n.id) ? 1 : 0.3
        );
        link.style("opacity", (l: any) => 
          l.source.id === d.id || l.target.id === d.id ? 1 : 0.1
        );
      })
      .on("mouseout", () => {
        setSelectedNode(null);
        node.style("opacity", 1);
        link.style("opacity", 0.6);
      });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      label
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y + d.size + 12);
    });

    return () => {
      simulation.stop();
    };
  }, [projects]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Network</h3>
          <p className="text-sm text-muted-foreground">
            Interactive network showing project relationships
          </p>
        </div>
        {selectedNode && (
          <Badge variant="outline">
            Selected: {projects.find(p => p.id === selectedNode)?.title}
          </Badge>
        )}
      </div>
      <div className="flex justify-center">
        <svg ref={svgRef} />
      </div>
    </div>
  );
}

// Treemap Visualization Component
function TreemapVisualization({ projects }: { projects: Project[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [metric, setMetric] = useState<'revenue' | 'quality' | 'activities'>('revenue');

  useEffect(() => {
    if (!svgRef.current || projects.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;

    // Group projects by category
    const categoryGroups = d3.group(projects, d => d.category);
    
    // Create hierarchy data
    const hierarchyData = {
      name: "Projects",
      children: Array.from(categoryGroups, ([category, projects]) => ({
        name: category,
        children: projects.map(p => ({
          name: p.title,
          value: metric === 'revenue' ? p.revenuePotential : 
                 metric === 'quality' ? p.qualityScore * 10000 : 
                 p.activitiesCount * 1000,
          project: p
        }))
      }))
    };

    // Create treemap layout
    const root = d3.hierarchy(hierarchyData)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemap = d3.treemap()
      .size([width, height])
      .padding(2)
      .round(true);

    treemap(root);

    // Color scales
    const colorScale = d3.scaleOrdinal(d3.schemeSet3);
    
    // Create SVG
    const container = svg
      .attr("width", width)
      .attr("height", height)
      .style("border", "1px solid #e5e7eb");

    // Create cells
    const leaf = container.selectAll("g")
      .data(root.leaves())
      .enter().append("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    leaf.append("rect")
      .attr("fill", (d: any) => colorScale(d.parent.data.name))
      .attr("fill-opacity", 0.8)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d: any) {
        d3.select(this).attr("fill-opacity", 1);
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill-opacity", 0.8);
      });

    // Add text labels
    leaf.append("text")
      .attr("x", 4)
      .attr("y", 14)
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text((d: any) => d.data.name.substring(0, 15) + (d.data.name.length > 15 ? '...' : ''));

    // Add category labels
    leaf.append("text")
      .attr("x", 4)
      .attr("y", 28)
      .style("font-size", "8px")
      .style("fill", "#666")
      .text((d: any) => d.parent.data.name);

    // Add value labels
    leaf.append("text")
      .attr("x", 4)
      .attr("y", (d: any) => Math.max(40, d.y1 - d.y0 - 4))
      .style("font-size", "9px")
      .style("fill", "#888")
      .text((d: any) => {
        const value = d.data.value;
        if (metric === 'revenue') return `$${(value / 1000).toFixed(0)}k`;
        if (metric === 'quality') return `${(value / 10000).toFixed(1)}/10`;
        return `${(value / 1000).toFixed(0)}k acts`;
      });

  }, [projects, metric]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Portfolio Treemap</h3>
          <p className="text-sm text-muted-foreground">
            Hierarchical view of projects sized by selected metric
          </p>
        </div>
        <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Revenue Potential</SelectItem>
            <SelectItem value="quality">Quality Score</SelectItem>
            <SelectItem value="activities">Activity Count</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-center">
        <svg ref={svgRef} />
      </div>
    </div>
  );
}

// Interactive Timeline Component
function TimelineVisualization({ projects }: { projects: Project[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [brushSelection, setBrushSelection] = useState<[Date, Date] | null>(null);

  useEffect(() => {
    if (!svgRef.current || projects.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Process data by month
    const projectsByMonth = d3.rollup(
      projects,
      v => ({
        count: v.length,
        totalRevenue: d3.sum(v, d => d.revenuePotential),
        avgQuality: d3.mean(v, d => d.qualityScore) || 0
      }),
      d => d3.timeMonth(new Date(d.createdAt))
    );

    const timelineData = Array.from(projectsByMonth, ([date, metrics]) => ({
      date,
      ...metrics
    })).sort((a, b) => a.date.getTime() - b.date.getTime());

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(timelineData, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(timelineData, d => d.count) || 0])
      .range([innerHeight, 0]);

    const revenueScale = d3.scaleLinear()
      .domain([0, d3.max(timelineData, d => d.totalRevenue) || 0])
      .range([innerHeight, 0]);

    // Create main container
    const container = svg
      .attr("width", width)
      .attr("height", height);

    const g = container.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%b %Y"));
    
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    const yAxis = d3.axisLeft(yScale);
    g.append("g").call(yAxis);

    // Add secondary y-axis for revenue
    const yAxisRight = d3.axisRight(revenueScale)
      .tickFormat(d => `$${(+d / 1000).toFixed(0)}k`);
    g.append("g")
      .attr("transform", `translate(${innerWidth},0)`)
      .call(yAxisRight);

    // Create line generators
    const projectLine = d3.line<any>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    const revenueLine = d3.line<any>()
      .x(d => xScale(d.date))
      .y(d => revenueScale(d.totalRevenue))
      .curve(d3.curveMonotoneX);

    // Add area chart for project count
    const area = d3.area<any>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(timelineData)
      .attr("fill", "rgba(59, 130, 246, 0.3)")
      .attr("d", area);

    // Add project count line
    g.append("path")
      .datum(timelineData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", projectLine);

    // Add revenue line
    g.append("path")
      .datum(timelineData)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("d", revenueLine);

    // Add dots for each data point
    g.selectAll(".project-dot")
      .data(timelineData)
      .enter().append("circle")
      .attr("class", "project-dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.count))
      .attr("r", 4)
      .attr("fill", "#3b82f6")
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 6);
        
        // Show tooltip
        const tooltip = g.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${xScale(d.date)},${yScale(d.count) - 10})`);

        const rect = tooltip.append("rect")
          .attr("x", -50)
          .attr("y", -30)
          .attr("width", 100)
          .attr("height", 25)
          .attr("fill", "white")
          .attr("stroke", "#ccc")
          .attr("rx", 3);

        tooltip.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -10)
          .style("font-size", "11px")
          .text(`${d.count} projects`);
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 4);
        g.select(".tooltip").remove();
      });

    // Add brush for zooming
    const brush = d3.brushX()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("end", (event) => {
        if (!event.selection) {
          setBrushSelection(null);
          return;
        }
        
        const [x0, x1] = event.selection;
        const newDomain: [Date, Date] = [xScale.invert(x0), xScale.invert(x1)];
        setBrushSelection(newDomain);
      });

    g.append("g")
      .attr("class", "brush")
      .call(brush);

    // Add legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 120}, 20)`);

    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 15)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2);

    legend.append("text")
      .attr("x", 20)
      .attr("y", 4)
      .style("font-size", "12px")
      .text("Project Count");

    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 15)
      .attr("y1", 15)
      .attr("y2", 15)
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    legend.append("text")
      .attr("x", 20)
      .attr("y", 19)
      .style("font-size", "12px")
      .text("Revenue");

  }, [projects, brushSelection]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Timeline</h3>
          <p className="text-sm text-muted-foreground">
            Interactive timeline with brushing and zooming
          </p>
        </div>
        {brushSelection && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setBrushSelection(null)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Zoom
          </Button>
        )}
      </div>
      <div className="flex justify-center">
        <svg ref={svgRef} />
      </div>
    </div>
  );
}

// Main D3 Visualizations Component
export function D3Visualizations({ projects }: D3VisualizationsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Advanced Visualizations</h2>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          D3.js Powered
        </Badge>
      </div>

      <Tabs defaultValue="network" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="treemap" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            Treemap
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Force-Directed Network Graph
              </CardTitle>
              <CardDescription>
                Explore project relationships and clustering based on categories and quality scores.
                Drag nodes to rearrange, zoom and pan to navigate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NetworkGraph projects={projects} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treemap">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5" />
                Portfolio Treemap
              </CardTitle>
              <CardDescription>
                Hierarchical visualization showing project proportions by category and selected metrics.
                Larger rectangles represent higher values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TreemapVisualization projects={projects} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Interactive Timeline
              </CardTitle>
              <CardDescription>
                Time-based analysis with brushing and zooming capabilities.
                Select a time range by clicking and dragging on the chart.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimelineVisualization projects={projects} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}