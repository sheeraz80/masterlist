'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Calculator, TrendingUp, DollarSign, Clock, 
  Target, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ROICalculatorProps {
  project?: {
    id: string;
    title: string;
    revenuePotential: number;
    technicalComplexity: number;
    developmentTime: string;
    category: string;
  };
}

export function ROICalculator({ project }: ROICalculatorProps) {
  // Input states
  const [developmentCost, setDevelopmentCost] = useState(50000);
  const [teamSize, setTeamSize] = useState(3);
  const [monthlyOperatingCost, setMonthlyOperatingCost] = useState(5000);
  const [customerAcquisitionCost, setCustomerAcquisitionCost] = useState(100);
  const [averageRevenuePerUser, setAverageRevenuePerUser] = useState(50);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState(15);
  const [initialCustomers, setInitialCustomers] = useState(100);
  const [churnRate, setChurnRate] = useState(5);

  // Calculate development time in months
  const getDevTimeMonths = () => {
    if (!project) return 6;
    const complexityFactor = project.technicalComplexity / 10;
    return Math.round(3 + complexityFactor * 9); // 3-12 months based on complexity
  };

  const [projectionMonths, setProjectionMonths] = useState(24);

  // Calculate projections
  const calculateProjections = () => {
    const months = [];
    let currentCustomers = initialCustomers;
    let totalCustomers = initialCustomers;
    let cumulativeRevenue = 0;
    let cumulativeCost = developmentCost;
    const devMonths = getDevTimeMonths();

    for (let i = 0; i <= projectionMonths; i++) {
      // Calculate revenue (starts after development)
      const monthlyRevenue = i >= devMonths ? currentCustomers * averageRevenuePerUser : 0;
      cumulativeRevenue += monthlyRevenue;

      // Calculate costs
      const monthlyCost = i < devMonths ? 
        developmentCost / devMonths : // Development phase
        monthlyOperatingCost + (totalCustomers * customerAcquisitionCost / 12); // Operating phase
      
      cumulativeCost += monthlyCost;

      // Calculate profit/loss
      const profit = cumulativeRevenue - cumulativeCost;
      const roi = cumulativeCost > 0 ? ((cumulativeRevenue - cumulativeCost) / cumulativeCost) * 100 : 0;

      months.push({
        month: i,
        customers: Math.round(currentCustomers),
        monthlyRevenue: Math.round(monthlyRevenue),
        cumulativeRevenue: Math.round(cumulativeRevenue),
        monthlyCost: Math.round(monthlyCost),
        cumulativeCost: Math.round(cumulativeCost),
        profit: Math.round(profit),
        roi: Math.round(roi)
      });

      // Update customer count for next month (after launch)
      if (i >= devMonths) {
        const growth = currentCustomers * (monthlyGrowthRate / 100);
        const churn = currentCustomers * (churnRate / 100);
        currentCustomers = Math.max(0, currentCustomers + growth - churn);
        totalCustomers += growth;
      }
    }

    return months;
  };

  const projections = calculateProjections();
  const breakEvenMonth = projections.findIndex(p => p.profit > 0);
  const finalROI = projections[projections.length - 1].roi;
  const totalRevenue = projections[projections.length - 1].cumulativeRevenue;
  const totalProfit = projections[projections.length - 1].profit;

  // Calculate key metrics
  const getPaybackPeriod = () => {
    if (breakEvenMonth === -1) return 'Not within projection period';
    return `${breakEvenMonth} months`;
  };

  const getROIStatus = () => {
    if (finalROI > 100) return { status: 'Excellent', color: 'text-green-600' };
    if (finalROI > 50) return { status: 'Good', color: 'text-blue-600' };
    if (finalROI > 0) return { status: 'Positive', color: 'text-yellow-600' };
    return { status: 'Negative', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            ROI Calculator
            {project && <Badge variant="outline">{project.title}</Badge>}
          </CardTitle>
          <CardDescription>
            Calculate return on investment and financial projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="costs" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="costs">Costs</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
            </TabsList>

            <TabsContent value="costs" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Development Cost</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm w-8">$</span>
                    <Input
                      type="number"
                      value={developmentCost}
                      onChange={(e) => setDevelopmentCost(Number(e.target.value))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total cost to develop the project
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Team Size</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[teamSize]}
                      onValueChange={([v]) => setTeamSize(v)}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-medium">{teamSize}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Number of team members
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Monthly Operating Cost</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm w-8">$</span>
                    <Input
                      type="number"
                      value={monthlyOperatingCost}
                      onChange={(e) => setMonthlyOperatingCost(Number(e.target.value))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hosting, tools, and maintenance
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Customer Acquisition Cost</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm w-8">$</span>
                    <Input
                      type="number"
                      value={customerAcquisitionCost}
                      onChange={(e) => setCustomerAcquisitionCost(Number(e.target.value))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cost to acquire one customer
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Average Revenue Per User (Monthly)</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm w-8">$</span>
                    <Input
                      type="number"
                      value={averageRevenuePerUser}
                      onChange={(e) => setAverageRevenuePerUser(Number(e.target.value))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monthly revenue per customer
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Initial Customers</Label>
                  <Input
                    type="number"
                    value={initialCustomers}
                    onChange={(e) => setInitialCustomers(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Customers at launch
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="growth" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Monthly Growth Rate (%)</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[monthlyGrowthRate]}
                      onValueChange={([v]) => setMonthlyGrowthRate(v)}
                      min={0}
                      max={50}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-medium">{monthlyGrowthRate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customer growth per month
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Monthly Churn Rate (%)</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[churnRate]}
                      onValueChange={([v]) => setChurnRate(v)}
                      min={0}
                      max={20}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-medium">{churnRate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customer loss per month
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Projection Period (Months)</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[projectionMonths]}
                      onValueChange={([v]) => setProjectionMonths(v)}
                      min={12}
                      max={60}
                      step={6}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-medium">{projectionMonths}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Final ROI</p>
                <p className={`text-2xl font-bold ${getROIStatus().color}`}>
                  {finalROI}%
                </p>
                <p className="text-xs text-muted-foreground">{getROIStatus().status}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Break-even</p>
                <p className="text-2xl font-bold">{getPaybackPeriod()}</p>
                <p className="text-xs text-muted-foreground">Payback period</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Over {projectionMonths} months</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(Math.abs(totalProfit) / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalProfit >= 0 ? 'Profit' : 'Loss'}
                </p>
              </div>
              {totalProfit >= 0 ? (
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Projections Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Projections</CardTitle>
          <CardDescription>
            Revenue, costs, and profit over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Area
                type="monotone"
                dataKey="cumulativeRevenue"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Cumulative Revenue"
              />
              <Area
                type="monotone"
                dataKey="cumulativeCost"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Cumulative Cost"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Net Profit/Loss"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ROI Over Time */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ROI Progression</CardTitle>
            <CardDescription>
              Return on investment over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projections.filter(p => p.month >= getDevTimeMonths())}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis unit="%" />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line
                  type="monotone"
                  dataKey="roi"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <CardDescription>
              Active customers over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="customers"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Investment Recommendations */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Investment Analysis:</strong> Based on current projections, this investment will
          {breakEvenMonth > 0 ? ` break even in ${breakEvenMonth} months and` : ''} achieve
          a {finalROI}% ROI over {projectionMonths} months. 
          {finalROI > 50 && ' This represents a strong investment opportunity.'}
          {finalROI > 0 && finalROI <= 50 && ' This represents a moderate investment opportunity.'}
          {finalROI <= 0 && ' Consider adjusting parameters to improve profitability.'}
        </AlertDescription>
      </Alert>
    </div>
  );
}