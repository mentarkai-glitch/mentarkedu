import jsPDF from 'jspdf';

export interface ReportData {
  studentName?: string;
  stream: string;
  strengths: string[];
  paths: Array<{ name: string; why: string }>;
  roadmap: any;
  language: 'en' | 'hi' | 'mr';
}

export function generatePDFReport(data: ReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;
  const margin = 20;
  const lineHeight = 7;
  const sectionSpacing = 10;

  // Helper to add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setTextColor(255, 215, 0); // Gold color
  doc.text('Mentark Path Finder Report', margin, yPos);
  yPos += lineHeight * 2;

  // Student info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  if (data.studentName) {
    doc.text(`Student: ${data.studentName}`, margin, yPos);
    yPos += lineHeight;
  }
  doc.text(`Stream: ${data.stream}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += sectionSpacing * 2;

  // Strengths
  checkNewPage(lineHeight * 3);
  doc.setFontSize(14);
  doc.setTextColor(255, 215, 0);
  doc.text('Your Strengths', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  data.strengths.forEach((strength) => {
    checkNewPage(lineHeight);
    doc.text(`• ${strength}`, margin + 5, yPos);
    yPos += lineHeight;
  });
  yPos += sectionSpacing;

  // Career Paths
  checkNewPage(lineHeight * 3);
  doc.setFontSize(14);
  doc.setTextColor(255, 215, 0);
  doc.text('Recommended Career Paths', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  data.paths.forEach((path) => {
    checkNewPage(lineHeight * 2);
    doc.setFont('helvetica', 'bold');
    doc.text(`• ${path.name}`, margin + 5, yPos);
    yPos += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text(`  ${path.why}`, margin + 10, yPos);
    yPos += lineHeight;
  });
  yPos += sectionSpacing;

  // Roadmap Title
  if (data.roadmap?.title) {
    checkNewPage(lineHeight * 2);
    doc.setFontSize(14);
    doc.setTextColor(255, 215, 0);
    doc.text('2-Year Roadmap', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(data.roadmap.title, margin, yPos);
    yPos += lineHeight * 2;
  }

  // Roadmap Description
  if (data.roadmap?.description) {
    checkNewPage(lineHeight * 3);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const descriptionLines = doc.splitTextToSize(data.roadmap.description, pageWidth - margin * 2);
    descriptionLines.forEach((line: string) => {
      checkNewPage(lineHeight);
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });
    yPos += sectionSpacing;
  }

  // Milestones
  if (data.roadmap?.milestones && data.roadmap.milestones.length > 0) {
    data.roadmap.milestones.forEach((milestone: any, idx: number) => {
      checkNewPage(lineHeight * 5);
      doc.setFontSize(12);
      doc.setTextColor(255, 215, 0);
      doc.text(`Milestone ${idx + 1}: ${milestone.month_range || ''}`, margin, yPos);
      yPos += lineHeight;
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(milestone.title || '', margin, yPos);
      yPos += lineHeight;
      
      if (milestone.description) {
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(milestone.description, pageWidth - margin * 2);
        descLines.forEach((line: string) => {
          checkNewPage(lineHeight);
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
      }

      if (milestone.actions && milestone.actions.length > 0) {
        yPos += lineHeight / 2;
        milestone.actions.forEach((action: string) => {
          checkNewPage(lineHeight);
          doc.text(`  ✓ ${action}`, margin + 5, yPos);
          yPos += lineHeight;
        });
      }
      yPos += sectionSpacing;
    });
  }

  // Monthly Plan
  if (data.roadmap?.monthly_plan) {
    checkNewPage(lineHeight * 3);
    doc.setFontSize(14);
    doc.setTextColor(255, 215, 0);
    doc.text('Monthly Plan', margin, yPos);
    yPos += lineHeight;
    
    if (typeof data.roadmap.monthly_plan === 'object') {
      Object.entries(data.roadmap.monthly_plan).forEach(([period, items]: [string, any]) => {
        checkNewPage(lineHeight * 2);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(period.replace(/_/g, ' '), margin, yPos);
        yPos += lineHeight;
        
        if (Array.isArray(items)) {
          doc.setFont('helvetica', 'normal');
          items.forEach((item: string) => {
            checkNewPage(lineHeight);
            doc.text(`  • ${item}`, margin + 5, yPos);
            yPos += lineHeight;
          });
        }
        yPos += lineHeight / 2;
      });
    }
  }

  // Success Tips
  if (data.roadmap?.success_tips && data.roadmap.success_tips.length > 0) {
    checkNewPage(lineHeight * 3);
    doc.setFontSize(14);
    doc.setTextColor(255, 215, 0);
    doc.text('Success Tips', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    data.roadmap.success_tips.forEach((tip: string) => {
      checkNewPage(lineHeight);
      doc.text(`• ${tip}`, margin + 5, yPos);
      yPos += lineHeight;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated by Mentark Path Finder`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save PDF
  const fileName = `Mentark_PathFinder_${data.studentName || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

