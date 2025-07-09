import { NextRequest, NextResponse } from 'next/server';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format as dateFormat } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Declare the autotable property
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

function prepareProjectData(projects: any[]) {
  return projects.map(project => ({
    id: project.id,
    title: project.title,
    category: project.category,
    complexity: project.complexity,
    quality_score: project.qualityScore,
    revenue_potential: project.revenuePotential,
    development_time: project.developmentTime,
    competition_level: project.competitionLevel,
    monetization_model: project.monetizationModel,
    target_market: project.targetMarket,
    tags: project.tags.join(', '),
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  }));
}

function generateFilename(format: string, reportType: string) {
  const timestamp = dateFormat(new Date(), 'yyyy-MM-dd-HHmmss');
  return `masterlist-${reportType}-${timestamp}.${format}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { format, projectIds, reportType = 'export', filters } = await request.json();
    
    // Build query based on filters or projectIds
    let whereClause: any = {};
    
    if (projectIds && projectIds.length > 0) {
      whereClause.id = { in: projectIds };
    } else if (filters) {
      // Apply filters if provided
      if (filters.category) whereClause.category = filters.category;
      if (filters.minQuality !== undefined || filters.maxQuality !== undefined) {
        whereClause.qualityScore = {};
        if (filters.minQuality !== undefined) whereClause.qualityScore.gte = filters.minQuality;
        if (filters.maxQuality !== undefined) whereClause.qualityScore.lte = filters.maxQuality;
      }
      if (filters.minRevenue !== undefined || filters.maxRevenue !== undefined) {
        whereClause.revenuePotential = {};
        if (filters.minRevenue !== undefined) whereClause.revenuePotential.gte = filters.minRevenue;
        if (filters.maxRevenue !== undefined) whereClause.revenuePotential.lte = filters.maxRevenue;
      }
      if (filters.tags && filters.tags.length > 0) {
        whereClause.tags = { hasSome: filters.tags };
      }
    }
    
    // Fetch projects from database
    const selectedProjects = await prisma.project.findMany({
      where: whereClause,
      orderBy: { qualityScore: 'desc' }
    });

    if (selectedProjects.length === 0) {
      return NextResponse.json(
        { error: 'No projects found for export' },
        { status: 400 }
      );
    }

    // Track export in database if user is logged in
    if (user) {
      await prisma.export.create({
        data: {
          userId: user.id,
          format,
          type: reportType,
          projectCount: selectedProjects.length,
          metadata: JSON.stringify({ filters, projectIds })
        }
      });
    }

    const filename = generateFilename(format, reportType);
    const data = prepareProjectData(selectedProjects);

    switch (format) {
      case 'csv': {
        const csvParser = new Parser({
          fields: [
            { label: 'ID', value: 'id' },
            { label: 'Title', value: 'title' },
            { label: 'Category', value: 'category' },
            { label: 'Complexity', value: 'complexity' },
            { label: 'Quality Score', value: 'quality_score' },
            { label: 'Revenue Potential', value: 'revenue_potential' },
            { label: 'Development Time', value: 'development_time' },
            { label: 'Competition Level', value: 'competition_level' },
            { label: 'Monetization Model', value: 'monetization_model' },
            { label: 'Target Market', value: 'target_market' },
            { label: 'Tags', value: 'tags' },
            { label: 'Created At', value: 'created_at' },
            { label: 'Updated At', value: 'updated_at' }
          ]
        });
        const csv = csvParser.parse(data);
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      case 'json': {
        return NextResponse.json({ 
          filename, 
          data, 
          count: selectedProjects.length,
          message: 'Export successful' 
        });
      }

      case 'xlsx': {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Projects');
        
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      case 'docx': {
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Masterlist Export Report', bold: true, size: 32 }),
                ],
              }),
              new Paragraph({
                text: `Generated on ${dateFormat(new Date(), 'MMMM dd, yyyy')}`,
                spacing: { after: 400 },
              }),
              new Paragraph({
                text: `Total Projects: ${data.length}`,
                spacing: { after: 400 },
              }),
              new Paragraph({
                text: user ? `Exported by: ${user.name}` : 'Exported by: Guest',
                spacing: { after: 400 },
              }),
              new Paragraph({
                text: '',
                spacing: { after: 400 },
              }),
              ...data.map(project => [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  children: [
                    new TextRun({ text: project.title, bold: true }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Category: ', bold: true }),
                    new TextRun(project.category),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Quality Score: ', bold: true }),
                    new TextRun(project.quality_score.toString()),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Revenue Potential: $', bold: true }),
                    new TextRun(project.revenue_potential.toString()),
                  ],
                }),
                new Paragraph({
                  text: '',
                  spacing: { after: 200 },
                }),
              ]).flat(),
            ],
          }],
        });

        const buffer = await Packer.toBuffer(doc);
        
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      case 'pdf': {
        const pdf = new jsPDF();
        
        // Title
        pdf.setFontSize(16);
        pdf.text('Masterlist Export Report', 14, 15);
        pdf.setFontSize(10);
        pdf.text(`Generated on ${dateFormat(new Date(), 'MMMM dd, yyyy')}`, 14, 25);
        pdf.text(`Total Projects: ${data.length}`, 14, 30);
        pdf.text(user ? `Exported by: ${user.name}` : 'Exported by: Guest', 14, 35);
        
        // Table
        pdf.autoTable({
          head: [['ID', 'Title', 'Category', 'Quality Score', 'Revenue Potential']],
          body: data.map(p => [p.id, p.title, p.category, p.quality_score, p.revenue_potential]),
          startY: 45,
        });
        
        const pdfOutput = pdf.output('arraybuffer');
        
        return new NextResponse(pdfOutput, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid export format' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    // Get project count
    const projectCount = await prisma.project.count();
    
    // Get user's export history if logged in
    let exportHistory = [];
    if (user) {
      exportHistory = await prisma.export.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          format: true,
          type: true,
          projectCount: true,
          createdAt: true
        }
      });
    }
    
    // Return available export formats and metadata
    return NextResponse.json({
      formats: ['csv', 'json', 'xlsx', 'docx', 'pdf'],
      maxProjects: projectCount,
      reportTypes: ['export', 'summary', 'analytics'],
      exportHistory
    });
  } catch (error) {
    console.error('Export metadata error:', error);
    return NextResponse.json(
      { error: 'Failed to get export metadata' },
      { status: 500 }
    );
  }
}