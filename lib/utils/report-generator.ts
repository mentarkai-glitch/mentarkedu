import jsPDF from 'jspdf';
import type { QuizResult } from './path-finder-scoring';
import type { ExpandedCareerOpportunity } from './enhanced-results';

export interface ReportData {
  studentName?: string;
  stream: string;
  strengths: string[];
  paths: Array<{ name: string; why: string }>;
  roadmap: any;
  language: 'en' | 'hi' | 'mr';
  // New comprehensive fields
  result?: QuizResult;
  aptitudeDNA?: Array<{ axis: string; value: number }>;
  streamFit?: Array<{ stream: string; score: number }>;
  expandedOpportunities?: ExpandedCareerOpportunity[];
  traitScores?: any;
  personalityInsights?: any;
  completeTraitProfile?: any[];
  learningStyle?: any;
  whoYouAreNow?: any;
  subjectRecommendations?: any[];
}

// Premium color scheme
const COLORS = {
  primary: [255, 215, 0],      // Gold #FFD700
  secondary: [0, 230, 255],    // Cyan #00E6FF
  accent: [255, 0, 110],       // Pink #FF006E
  dark: [15, 23, 42],          // Slate-900
  light: [241, 245, 249],      // Slate-100
  text: [30, 41, 59],          // Slate-800
  border: [148, 163, 184],     // Slate-400
  success: [34, 197, 94],      // Green-500
  warning: [234, 179, 8],      // Yellow-600
};

export function generatePDFReport(data: ReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;
  
  // Helper functions
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 25) {
      doc.addPage();
      yPos = margin;
      addPageHeader(doc, pageWidth, margin);
    }
  };

  const addSectionTitle = (title: string, icon?: string) => {
    checkNewPage(20);
    yPos += 5;
    
    // Section background bar
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, yPos - 3, contentWidth, 8, 2, 2, 'F');
    
    // Title text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3, yPos + 5);
    
    yPos += 12;
  };

  const addSubsection = (title: string, size: number = 12) => {
    checkNewPage(15);
    yPos += 3;
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(title, margin, yPos);
    yPos += 7;
  };

  const addBorderedBox = (content: () => void, bgColor?: number[]) => {
    const startY = yPos;
    checkNewPage(30);
    
    if (bgColor) {
      doc.setFillColor(...bgColor);
      doc.roundedRect(margin, startY, contentWidth, 0, 2, 2, 'F');
    }
    
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    const endY = yPos;
    content();
    const boxHeight = yPos - startY + 5;
    doc.roundedRect(margin, startY, contentWidth, boxHeight, 2, 2, 'S');
    yPos += 3;
  };

  // Cover Page
  addCoverPage(doc, data, pageWidth, pageHeight, margin);
  doc.addPage();
  yPos = margin;
  addPageHeader(doc, pageWidth, margin);

  // Table of Contents (if multi-page)
  if (shouldIncludeTOC(data)) {
    addTableOfContents(doc, data, margin, yPos, contentWidth);
    doc.addPage();
    yPos = margin;
    addPageHeader(doc, pageWidth, margin);
  }

  // SECTION 2: QUICK INSIGHTS DASHBOARD (3-column layout)
  addSectionTitle('📊 Quick Insights Dashboard');
  yPos = addQuickInsightsSection(doc, data, margin, yPos, contentWidth);
  checkNewPage(0);

  // SECTION 3: VISUAL ANALYTICS
  if (data.aptitudeDNA && data.aptitudeDNA.length > 0) {
    addSectionTitle('📊 Your Aptitude DNA');
    addAptitudeDNASection(doc, data.aptitudeDNA, margin, yPos, contentWidth);
    yPos += 20;
    checkNewPage(0);
  }

  // Stream Fit Comparison (if available)
  if (data.streamFit && data.streamFit.length > 0) {
    addSectionTitle('📈 Stream Fit Comparison');
    addStreamFitSection(doc, data.streamFit, data.stream, margin, yPos, contentWidth);
    yPos += 20;
    checkNewPage(0);
  }

  // SECTION 4: 2-YEAR ROADMAP (Hero Section - Largest, Most Prominent)
  if (data.roadmap) {
    addSectionTitle('🗺️ Your 2-Year Roadmap');
    addRoadmapSection(doc, data.roadmap, margin, yPos, contentWidth, data.language);
    yPos += 20;
    checkNewPage(0);
  }

  // SECTION 5: EXPANDED CAREER OPPORTUNITIES
  if (data.expandedOpportunities && data.expandedOpportunities.length > 0) {
    addSectionTitle('🌍 Expanded Career Opportunities');
    addExpandedOpportunitiesSection(doc, data.expandedOpportunities, margin, yPos, contentWidth);
    yPos += 20;
    checkNewPage(0);
  }

  // SECTION 6: COLLEGE RECOMMENDATIONS (if available)
  if (data.result?.collegeRecommendations && data.result.collegeRecommendations.length > 0) {
    addSectionTitle('🎓 Recommended Colleges');
    yPos = addCollegeRecommendationsSection(doc, data.result.collegeRecommendations, margin, yPos, contentWidth);
    checkNewPage(0);
  }

  // SECTION 7: PERSONALITY & LEARNING INSIGHTS
  if (data.personalityInsights) {
    addSectionTitle('👤 Personality Insights');
    addPersonalityInsightsSection(doc, data.personalityInsights, margin, yPos, contentWidth);
    yPos += 20;
    checkNewPage(0);
  }

  // Learning Style (if available)
  if (data.learningStyle) {
    addSectionTitle('📖 Your Learning Style');
    addLearningStyleSection(doc, data.learningStyle, margin, yPos, contentWidth);
    yPos += 15;
    checkNewPage(0);
  }

  // Subject Recommendations (if available)
  if (data.subjectRecommendations && data.subjectRecommendations.length > 0) {
    addSectionTitle('📚 Subject Recommendations');
    addSubjectRecommendationsSection(doc, data.subjectRecommendations, margin, yPos, contentWidth);
    yPos += 15;
    checkNewPage(0);
  }

  // Complete Trait Profile (if available)
  if (data.completeTraitProfile && data.completeTraitProfile.length > 0) {
    addSectionTitle('✨ Complete Trait Profile');
    yPos = addCompleteTraitProfileSection(doc, data.completeTraitProfile, margin, yPos, contentWidth);
    checkNewPage(0);
  }

  // Success Tips
  if (data.roadmap?.success_tips && data.roadmap.success_tips.length > 0) {
    addSectionTitle('💡 Success Tips & Best Practices');
    addSuccessTipsSection(doc, data.roadmap.success_tips, margin, yPos, contentWidth);
    yPos += 15;
    checkNewPage(0);
  }

  // Add footer to all pages
  const totalPages = (doc as any).internal.pages?.length || 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageFooter(doc, pageWidth, pageHeight, i, totalPages, margin);
  }

  // Save PDF
  const fileName = `Mentark_PathFinder_${data.studentName || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Cover Page
function addCoverPage(doc: jsPDF, data: ReportData, pageWidth: number, pageHeight: number, margin: number) {
  // Background gradient effect
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Decorative top border
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 8, 'F');
  
  // Logo/Title area
  let yPos = 40;
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('MENTARK', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Path Finder Report', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 20;
  doc.setFontSize(14);
  doc.setTextColor(200, 200, 200);
  doc.text('Personalized Career & Stream Analysis', pageWidth / 2, yPos, { align: 'center' });
  
  // Student info box
  yPos = pageHeight / 2 - 20;
  const boxWidth = pageWidth - (margin * 2);
  const boxHeight = 50;
  
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, 'F');
  
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, 'S');
  
  let textY = yPos + 12;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  if (data.studentName) {
    doc.text(`Student: ${data.studentName}`, pageWidth / 2, textY, { align: 'center' });
    textY += 8;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primary);
  doc.text(`Stream: ${data.stream}`, pageWidth / 2, textY, { align: 'center' });
  textY += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, pageWidth / 2, textY, { align: 'center' });
  
  // Bottom decorative
  doc.setFillColor(...COLORS.secondary);
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Confidential Report - For Personal Use Only', pageWidth / 2, pageHeight - 3, { align: 'center' });
}

// Page Header
function addPageHeader(doc: jsPDF, pageWidth: number, margin: number) {
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 5, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Mentark Path Finder', margin, 3.5);
}

// Page Footer
function addPageFooter(doc: jsPDF, pageWidth: number, pageHeight: number, currentPage: number, totalPages: number, margin: number) {
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Page ${currentPage} of ${totalPages} | Generated by Mentark Path Finder`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );
  
  // Footer line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
}

// Table of Contents
function addTableOfContents(doc: jsPDF, data: ReportData, margin: number, yPos: number, contentWidth: number) {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Table of Contents', margin, yPos);
  yPos += 10;
  
  const sections = [
    'Quick Insights Dashboard',
    ...(data.aptitudeDNA ? ['Your Aptitude DNA'] : []),
    ...(data.streamFit ? ['Stream Fit Comparison'] : []),
    ...(data.roadmap ? ['Your 2-Year Roadmap'] : []),
    ...(data.expandedOpportunities ? ['Expanded Career Opportunities'] : []),
    ...(data.result?.collegeRecommendations ? ['Recommended Colleges'] : []),
    ...(data.personalityInsights ? ['Personality Insights'] : []),
    ...(data.learningStyle ? ['Your Learning Style'] : []),
    ...(data.subjectRecommendations ? ['Subject Recommendations'] : []),
    ...(data.completeTraitProfile ? ['Complete Trait Profile'] : []),
    ...(data.roadmap?.success_tips ? ['Success Tips & Best Practices'] : [])
  ];
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  sections.forEach((section, idx) => {
    doc.text(`${idx + 1}. ${section}`, margin + 5, yPos);
    const dots = '.'.repeat(60);
    doc.text(dots, margin + 50, yPos);
    yPos += 6;
  });
}

// Executive Summary
function addExecutiveSummary(doc: jsPDF, data: ReportData, margin: number, yPos: number, contentWidth: number) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  
  const summary = `This comprehensive report provides a detailed analysis of your career path, stream fit, and personalized roadmap. Based on your responses, we've identified your strengths, recommended career paths, and created a 2-year action plan to help you achieve your goals.`;
  
  const lines = doc.splitTextToSize(summary, contentWidth - 10);
  lines.forEach((line: string) => {
    doc.text(line, margin + 5, yPos);
    yPos += 5;
  });
}

// SECTION 2: Quick Insights Dashboard (3-column layout)
function addQuickInsightsSection(doc: jsPDF, data: ReportData, margin: number, yPos: number, contentWidth: number): number {
  const cardWidth = (contentWidth - 10) / 3;
  const cardHeight = 35;
  let startY = yPos;
  
  // Card 1: Strengths
  doc.setFillColor(255, 250, 240);
  doc.roundedRect(margin, startY, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, startY, cardWidth, cardHeight, 2, 2, 'S');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('⭐ Strengths', margin + 5, startY + 7);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  let textY = startY + 12;
  data.strengths.slice(0, 3).forEach((strength) => {
    doc.text(`• ${strength}`, margin + 5, textY);
    textY += 5;
  });
  
  // Card 2: Stream
  const card2X = margin + cardWidth + 5;
  doc.setFillColor(240, 255, 255);
  doc.roundedRect(card2X, startY, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(...COLORS.secondary);
  doc.setLineWidth(0.5);
  doc.roundedRect(card2X, startY, cardWidth, cardHeight, 2, 2, 'S');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.secondary);
  doc.text('🎯 Stream', card2X + 5, startY + 7);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text(data.stream, card2X + 5, startY + 15);
  
  if (data.result?.confidence) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const confColor = data.result.confidence === 'High' ? COLORS.success : 
                     data.result.confidence === 'Medium' ? COLORS.warning : [255, 140, 0];
    doc.setTextColor(...confColor);
    doc.text(`Confidence: ${data.result.confidence}`, card2X + 5, startY + 22);
  }
  
  // Card 3: Paths
  const card3X = card2X + cardWidth + 5;
  doc.setFillColor(255, 240, 250);
  doc.roundedRect(card3X, startY, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  doc.roundedRect(card3X, startY, cardWidth, cardHeight, 2, 2, 'S');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.accent);
  doc.text('🚀 Paths', card3X + 5, startY + 7);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  textY = startY + 12;
  data.paths.slice(0, 3).forEach((path) => {
    doc.setFont('helvetica', 'bold');
    doc.text(path.name, card3X + 5, textY);
    textY += 4;
    doc.setFont('helvetica', 'normal');
    const whyLines = doc.splitTextToSize(path.why, cardWidth - 10);
    whyLines.slice(0, 1).forEach((line: string) => {
      doc.text(line, card3X + 5, textY);
      textY += 4;
    });
    textY += 2;
  });
  
  return startY + cardHeight + 10;
}

// Aptitude DNA Section
function addAptitudeDNASection(doc: jsPDF, aptitudeDNA: Array<{ axis: string; value: number }>, margin: number, yPos: number, contentWidth: number) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  aptitudeDNA.forEach((item) => {
    const value = Math.round(item.value);
    
    // Axis name
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(item.axis, margin + 5, yPos);
    
    // Progress bar background
    const barWidth = contentWidth - 60;
    const barHeight = 4;
    const barX = margin + 50;
    const barY = yPos - 3;
    
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(barX, barY, barWidth, barHeight, 1, 1, 'F');
    
    // Progress bar fill
    const fillWidth = (value / 100) * barWidth;
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(barX, barY, fillWidth, barHeight, 1, 1, 'F');
    
    // Value text
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text(`${value}%`, barX + barWidth + 5, yPos);
    
    yPos += 8;
  });
}

// Stream Fit Section
function addStreamFitSection(doc: jsPDF, streamFit: Array<{ stream: string; score: number }>, recommendedStream: string, margin: number, yPos: number, contentWidth: number) {
  doc.setFontSize(10);
  
  streamFit.forEach((item) => {
    const score = Math.round(item.score);
    const isRecommended = item.stream === recommendedStream;
    
    // Stream name
    doc.setFont('helvetica', isRecommended ? 'bold' : 'normal');
    doc.setTextColor(...COLORS.text);
    doc.text(item.stream, margin + 5, yPos);
    
    // Score bar
    const barWidth = contentWidth - 50;
    const barHeight = 5;
    const barX = margin + 45;
    const barY = yPos - 3.5;
    
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(barX, barY, barWidth, barHeight, 1, 1, 'F');
    
    const fillWidth = (score / 100) * barWidth;
    const barColor = isRecommended ? COLORS.primary : (score > 70 ? COLORS.success : COLORS.warning);
    doc.setFillColor(...barColor);
    doc.roundedRect(barX, barY, fillWidth, barHeight, 1, 1, 'F');
    
    // Score text
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...barColor);
    doc.text(`${score}%`, barX + barWidth + 5, yPos);
    
    if (isRecommended) {
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.success);
      doc.text('(Recommended)', barX + barWidth + 15, yPos);
    }
    
    yPos += 9;
  });
}

// Career Paths Section
function addCareerPathsSection(doc: jsPDF, paths: Array<{ name: string; why: string }>, margin: number, yPos: number, contentWidth: number) {
  paths.forEach((path, idx) => {
    // Path card
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, yPos - 5, contentWidth, 20, 2, 2, 'F');
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, yPos - 5, contentWidth, 20, 2, 2, 'S');
    
    // Path name
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text(`${idx + 1}. ${path.name}`, margin + 5, yPos);
    
    // Why description
    yPos += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    const whyLines = doc.splitTextToSize(path.why, contentWidth - 10);
    whyLines.forEach((line: string) => {
      doc.text(line, margin + 5, yPos);
      yPos += 4.5;
    });
    
    yPos += 5;
  });
}

// Expanded Opportunities Section
function addExpandedOpportunitiesSection(doc: jsPDF, opportunities: ExpandedCareerOpportunity[], margin: number, yPos: number, contentWidth: number) {
  const categories = ['niche', 'international', 'government'] as const;
  
  categories.forEach(category => {
    const categoryOpps = opportunities.filter(o => o.category === category);
    if (categoryOpps.length === 0) return;
    
    const categoryTitles = {
      niche: 'Niche & Emerging Careers',
      international: 'International Opportunities',
      government: 'Government Careers'
    };
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(categoryTitles[category], margin, yPos);
    yPos += 7;
    
    categoryOpps.forEach((opp) => {
      // Opportunity card
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, yPos - 4, contentWidth, 30, 2, 2, 'F');
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPos - 4, contentWidth, 30, 2, 2, 'S');
      
      // Title
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.text);
      doc.text(opp.title, margin + 5, yPos);
      
      // Growth badge
      doc.setFontSize(7);
      const badgeColor = opp.growthPotential === 'High' ? COLORS.success : 
                        opp.growthPotential === 'Emerging' ? COLORS.secondary : COLORS.warning;
      doc.setFillColor(...badgeColor);
      doc.roundedRect(margin + contentWidth - 25, yPos - 3, 20, 4, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(opp.growthPotential, margin + contentWidth - 15, yPos + 0.5, { align: 'center' });
      
      yPos += 5;
      
      // Description
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const descLines = doc.splitTextToSize(opp.description, contentWidth - 10);
      descLines.forEach((line: string) => {
        doc.text(line, margin + 5, yPos);
        yPos += 4;
      });
      
      yPos += 2;
      
      // Salary
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primary);
      doc.text(`Salary: ${opp.salaryRange}`, margin + 5, yPos);
      
      yPos += 8;
    });
    
    yPos += 3;
  });
}

// Personality Insights Section
function addPersonalityInsightsSection(doc: jsPDF, insights: any, margin: number, yPos: number, contentWidth: number) {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text(insights.type || 'Personality Type', margin, yPos);
  yPos += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  const descLines = doc.splitTextToSize(insights.description || '', contentWidth - 10);
  descLines.forEach((line: string) => {
    doc.text(line, margin + 5, yPos);
    yPos += 4.5;
  });
  
  yPos += 3;
  
  // Strengths
  if (insights.strengths && insights.strengths.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.success);
    doc.text('Strengths:', margin + 5, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    insights.strengths.forEach((strength: string) => {
      doc.setFillColor(...COLORS.success);
      doc.circle(margin + 7, yPos - 1, 1, 'F');
      doc.text(strength, margin + 11, yPos);
      yPos += 5;
    });
  }
  
  yPos += 3;
  
  // Growth Areas
  if (insights.growthAreas && insights.growthAreas.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.warning);
    doc.text('Growth Areas:', margin + 5, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    insights.growthAreas.forEach((area: string) => {
      doc.setFillColor(...COLORS.warning);
      doc.circle(margin + 7, yPos - 1, 1, 'F');
      doc.text(area, margin + 11, yPos);
      yPos += 5;
    });
  }
}

// Learning Style Section
function addLearningStyleSection(doc: jsPDF, learningStyle: any, margin: number, yPos: number, contentWidth: number) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  
  if (learningStyle.primary) {
    doc.text(`Primary: ${learningStyle.primary}`, margin + 5, yPos);
    yPos += 6;
  }
  
  if (learningStyle.secondary) {
    doc.text(`Secondary: ${learningStyle.secondary}`, margin + 5, yPos);
    yPos += 6;
  }
  
  if (learningStyle.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const descLines = doc.splitTextToSize(learningStyle.description, contentWidth - 10);
    descLines.forEach((line: string) => {
      doc.text(line, margin + 5, yPos);
      yPos += 4.5;
    });
  }
}

// Subject Recommendations Section
function addSubjectRecommendationsSection(doc: jsPDF, recommendations: any[], margin: number, yPos: number, contentWidth: number) {
  recommendations.forEach((rec) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(rec.subject || rec.name || '', margin + 5, yPos);
    yPos += 5;
    
    if (rec.reason) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const reasonLines = doc.splitTextToSize(rec.reason, contentWidth - 10);
      reasonLines.forEach((line: string) => {
        doc.text(line, margin + 5, yPos);
        yPos += 4;
      });
    }
    
    yPos += 3;
  });
}

// Roadmap Section with Resources
function addRoadmapSection(doc: jsPDF, roadmap: any, margin: number, yPos: number, contentWidth: number, language: 'en' | 'hi' | 'mr') {
  // Title
  if (roadmap.title) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text(roadmap.title, margin, yPos);
    yPos += 7;
  }
  
  // Description
  if (roadmap.description) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    const descLines = doc.splitTextToSize(roadmap.description, contentWidth - 10);
    descLines.forEach((line: string) => {
      doc.text(line, margin + 5, yPos);
      yPos += 4.5;
    });
    yPos += 3;
  }
  
  // Milestones with Resources
  if (roadmap.milestones && roadmap.milestones.length > 0) {
    roadmap.milestones.forEach((milestone: any, idx: number) => {
      // Milestone header
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margin, yPos - 4, contentWidth, 25, 2, 2, 'F');
      doc.setDrawColor(...COLORS.primary);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPos - 4, contentWidth, 25, 2, 2, 'S');
      
      // Milestone number and title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primary);
      doc.text(`Milestone ${idx + 1}`, margin + 5, yPos);
      
      if (milestone.month_range) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text(milestone.month_range, margin + 40, yPos);
      }
      
      yPos += 5;
      
      // Milestone title
      if (milestone.title) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        doc.text(milestone.title, margin + 5, yPos);
        yPos += 5;
      }
      
      // Description
      if (milestone.description) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const descLines = doc.splitTextToSize(milestone.description, contentWidth - 10);
        descLines.forEach((line: string) => {
          doc.text(line, margin + 5, yPos);
          yPos += 4;
        });
        yPos += 2;
      }
      
      // Actions
      if (milestone.actions && milestone.actions.length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        doc.text('Actions:', margin + 5, yPos);
        yPos += 4;
        
        doc.setFont('helvetica', 'normal');
        milestone.actions.forEach((action: string) => {
          doc.setFillColor(...COLORS.success);
          doc.circle(margin + 7, yPos - 1, 1, 'F');
          doc.text(action, margin + 11, yPos);
          yPos += 4.5;
        });
        yPos += 2;
      }
      
      // Resources (NEW - Detailed)
      if (milestone.resources && milestone.resources.length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.secondary);
        doc.text('Resources:', margin + 5, yPos);
        yPos += 4;
        
        milestone.resources.forEach((resource: any) => {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...COLORS.text);
          
          // Resource type badge
          const typeColors: Record<string, number[]> = {
            video: [255, 0, 110],
            article: [0, 230, 255],
            course: [255, 215, 0],
            book: [34, 197, 94],
            tool: [234, 179, 8]
          };
          
          const typeColor = typeColors[resource.type] || [150, 150, 150];
          doc.setFillColor(...typeColor);
          doc.roundedRect(margin + 7, yPos - 2.5, 12, 3.5, 1, 1, 'F');
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          doc.text(resource.type.toUpperCase(), margin + 13, yPos, { align: 'center' });
          
          // Resource title
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.text);
          doc.text(resource.title || '', margin + 22, yPos);
          yPos += 4;
          
          // Resource description
          if (resource.description) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            const resDescLines = doc.splitTextToSize(resource.description, contentWidth - 25);
            resDescLines.forEach((line: string) => {
              doc.text(line, margin + 11, yPos);
              yPos += 3.5;
            });
          }
          
          yPos += 2;
        });
      }
      
      yPos += 5;
    });
  }
  
  // Monthly Plan
  if (roadmap.monthly_plan) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text('Monthly Action Plan', margin, yPos);
    yPos += 6;
    
    if (typeof roadmap.monthly_plan === 'object') {
      Object.entries(roadmap.monthly_plan).forEach(([period, items]: [string, any]) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text(period.replace(/_/g, ' ').toUpperCase(), margin + 5, yPos);
        yPos += 4;
        
        if (Array.isArray(items)) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...COLORS.text);
          items.forEach((item: string) => {
            doc.setFillColor(...COLORS.primary);
            doc.circle(margin + 7, yPos - 1, 1, 'F');
            doc.text(item, margin + 11, yPos);
            yPos += 4.5;
          });
        }
        yPos += 2;
      });
    }
  }
}

// College Recommendations Section
function addCollegeRecommendationsSection(doc: jsPDF, colleges: any[], margin: number, yPos: number, contentWidth: number): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  colleges.slice(0, 6).forEach((college, idx) => {
    // College card
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, yPos - 5, contentWidth, 30, 2, 2, 'F');
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, yPos - 5, contentWidth, 30, 2, 2, 'S');
    
    // College name
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text(college.name, margin + 5, yPos);
    
    // Location
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    doc.text(`📍 ${college.location}`, margin + 5, yPos + 6);
    
    // Rank and Rating
    if (college.rank) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.secondary);
      doc.text(`Rank #${college.rank}`, margin + contentWidth - 40, yPos);
    }
    
    if (college.rating) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.warning);
      doc.text(`⭐ ${college.rating}`, margin + contentWidth - 20, yPos);
    }
    
    // Fees
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    doc.text(`Fees: ${college.fees}`, margin + 5, yPos + 12);
    
    // Highlights
    if (college.highlights && college.highlights.length > 0) {
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      const highlights = college.highlights.slice(0, 2).join(', ');
      doc.text(`Highlights: ${highlights}`, margin + 5, yPos + 18);
    }
    
    // Cultural Context (if available)
    if (college.culturalContext) {
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(`Region: ${college.culturalContext.region} | Language: ${college.culturalContext.localLanguage}`, margin + 5, yPos + 24);
    }
    
    yPos += 35;
  });
  return yPos;
}

// Complete Trait Profile Section
function addCompleteTraitProfileSection(doc: jsPDF, traitProfile: any[], margin: number, yPos: number, contentWidth: number): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  traitProfile.forEach((trait) => {
    // Trait name
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(trait.trait, margin + 5, yPos);
    
    // Percentage badge
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin + contentWidth - 30, yPos - 3, 25, 6, 1, 1, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`${trait.percentage}%`, margin + contentWidth - 17.5, yPos + 1, { align: 'center' });
    
    // Progress bar
    const barWidth = contentWidth - 40;
    const barHeight = 3;
    const barX = margin + 5;
    const barY = yPos + 3;
    
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(barX, barY, barWidth, barHeight, 1, 1, 'F');
    
    const fillWidth = (trait.percentage / 100) * barWidth;
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(barX, barY, fillWidth, barHeight, 1, 1, 'F');
    
    // Description
    if (trait.description) {
      yPos += 7;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const descLines = doc.splitTextToSize(trait.description, contentWidth - 10);
      descLines.forEach((line: string) => {
        doc.text(line, margin + 5, yPos);
        yPos += 4;
      });
    }
    
    yPos += 8;
  });
  return yPos;
}

// Success Tips Section
function addSuccessTipsSection(doc: jsPDF, tips: string[], margin: number, yPos: number, contentWidth: number) {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  
  tips.forEach((tip) => {
    doc.setFillColor(...COLORS.warning);
    doc.circle(margin + 3, yPos - 1, 1.5, 'F');
    
    const tipLines = doc.splitTextToSize(tip, contentWidth - 10);
    tipLines.forEach((line: string) => {
      doc.text(line, margin + 8, yPos);
      yPos += 4.5;
    });
    yPos += 2;
  });
}

// Helper to check if TOC is needed
function shouldIncludeTOC(data: ReportData): boolean {
  let sectionCount = 3; // Base sections (Summary, Strengths, Paths, Roadmap)
  if (data.aptitudeDNA) sectionCount++;
  if (data.streamFit) sectionCount++;
  if (data.expandedOpportunities) sectionCount++;
  if (data.personalityInsights) sectionCount++;
  if (data.learningStyle) sectionCount++;
  if (data.subjectRecommendations) sectionCount++;
  return sectionCount > 5;
}
