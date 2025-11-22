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

// Premium Career Navigator color scheme (Teal/Gold/Slate theme)
const COLORS = {
  // Primary theme colors
  teal: [13, 148, 136],        // Teal-600 #0D9488
  tealLight: [204, 251, 241],   // Teal-200
  gold: [234, 179, 8],          // Gold/Yellow-600 #EAB308
  goldLight: [254, 252, 232],   // Yellow-50
  rose: [244, 63, 94],          // Rose-500 (for paths)
  roseLight: [255, 228, 230],   // Rose-50
  cyan: [6, 182, 212],          // Cyan-500 (for streams)
  cyanLight: [207, 250, 254],  // Cyan-50
  
  // Legacy aliases for compatibility
  primary: [234, 179, 8],       // Gold (for strengths/aptitude)
  secondary: [6, 182, 212],     // Cyan (for streams)
  accent: [244, 63, 94],        // Rose (for paths)
  
  // Neutral colors
  dark: [15, 23, 42],           // Slate-900
  light: [241, 245, 249],       // Slate-100
  text: [30, 41, 59],          // Slate-800
  textBody: [71, 85, 105],     // Slate-600
  textMuted: [148, 163, 184],  // Slate-400
  border: [148, 163, 184],     // Slate-400
  white: [255, 255, 255],
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

  const addSectionTitle = (title: string, subtitle?: string) => {
    checkNewPage(20);
    yPos += 5;
    
    // Premium section header: Dark strip with gold accent
    doc.setFillColor(...COLORS.dark);
    doc.rect(margin, yPos - 3, contentWidth, 18, 'F');
    
    // Gold accent line
    doc.setFillColor(...COLORS.gold);
    doc.rect(margin, yPos + 14, contentWidth, 1, 'F');
    
    // Title text (teal)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.teal);
    doc.text(title.toUpperCase(), margin + 3, yPos + 5);
    
    // Subtitle (white)
    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.white);
      doc.text(subtitle, margin + 3, yPos + 11);
    }
    
    yPos += 20;
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

  // SECTION 1: QUICK INSIGHTS DASHBOARD (3-column premium layout)
  addSectionTitle('Quick Insights', 'Overview of your profile');
  yPos = addQuickInsightsSection(doc, data, margin, yPos, contentWidth);
  checkNewPage(0);

  // SECTION 2: APTITUDE DNA ANALYSIS
  if (data.aptitudeDNA && data.aptitudeDNA.length > 0) {
    addSectionTitle('Aptitude DNA Analysis', 'Your core strengths and abilities');
    yPos = addAptitudeDNASection(doc, data.aptitudeDNA, margin, yPos, contentWidth);
    checkNewPage(0);
  }

  // SECTION 3: STREAM FIT COMPARISON
  if (data.streamFit && data.streamFit.length > 0) {
    addSectionTitle('Stream Fit Analysis', 'Which stream matches you best');
    yPos = addStreamFitSection(doc, data.streamFit, data.stream, margin, yPos, contentWidth);
    checkNewPage(0);
  }

  // SECTION 4: 2-YEAR ROADMAP (Hero Section)
  if (data.roadmap) {
    addSectionTitle('Strategic Roadmap', 'Your plan for the next 2 years');
    yPos = addRoadmapSection(doc, data.roadmap, margin, yPos, contentWidth, data.language);
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

// Premium Cover Page
function addCoverPage(doc: jsPDF, data: ReportData, pageWidth: number, pageHeight: number, margin: number) {
  // Dark slate background
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Teal decorative top bar
  doc.setFillColor(...COLORS.teal);
  doc.rect(0, 0, pageWidth, 4, 'F');
  
  // Premium header
  let yPos = 30;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.teal);
  doc.text('MENTARK CAREER', margin, yPos);
  
  yPos += 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.white);
  doc.text('|  Stream Selector Report (Class 10)', margin + 50, yPos);
  
  // Student info box (centered)
  yPos = pageHeight / 2 - 25;
  const boxWidth = pageWidth - (margin * 2);
  const boxHeight = 50;
  
  // Box background
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, 'F');
  
  // Gold border
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, 'S');
  
  let textY = yPos + 12;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.white);
  if (data.studentName) {
    doc.text(`Student: ${data.studentName}`, pageWidth / 2, textY, { align: 'center' });
    textY += 8;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.teal);
  doc.text(`Stream: ${data.stream}`, pageWidth / 2, textY, { align: 'center' });
  textY += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, pageWidth / 2, textY, { align: 'center' });
  
  // Bottom footer
  doc.setFillColor(...COLORS.light);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('© 2025 Mentark Quantum. Confidential Career Report.', pageWidth / 2, pageHeight - 8, { align: 'center' });
}

// Premium Page Header
function addPageHeader(doc: jsPDF, pageWidth: number, margin: number) {
  // Dark header background
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, 20, 'F');
  
  // Teal bottom border
  doc.setFillColor(...COLORS.teal);
  doc.rect(0, 20, pageWidth, 1, 'F');
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.teal);
  doc.text('MENTARK CAREER', margin + 5, 12);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.white);
  doc.text('|  Stream Selector Report (Class 10)', margin + 50, 12);
  
  // Date
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.text(`Analysis Date: ${date}`, margin + 5, 18);
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

// SECTION 1: Quick Insights Dashboard (Premium 3-column layout)
function addQuickInsightsSection(doc: jsPDF, data: ReportData, margin: number, yPos: number, contentWidth: number): number {
  const cardWidth = (contentWidth - 8) / 3;
  const cardHeight = 35;
  const gap = 4;
  let startY = yPos;
  
  // Card 1: Core Strengths (Gold theme)
  const card1X = margin;
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(card1X, startY, cardWidth, cardHeight, 3, 3, 'FD');
  
  // Top accent strip
  doc.setFillColor(...COLORS.gold);
  doc.roundedRect(card1X, startY, cardWidth, 2, 2, 2, 'F');
  
  // Icon placeholder (rounded square)
  doc.setFillColor(...COLORS.goldLight);
  doc.roundedRect(card1X + 7, startY + 7, 6, 6, 1, 1, 'F');
  
  // Title
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.gold);
  doc.text('CORE STRENGTHS', card1X + 18, startY + 10);
  
  // Value (top strength)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  const topStrength = data.strengths[0] || 'Logical Reasoning';
  doc.text(topStrength, card1X + 5, startY + 22);
  
  // Subtitle
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Top 5% in Peer Group', card1X + 5, startY + 29);
  
  // Card 2: Best Fit Stream (Cyan theme)
  const card2X = card1X + cardWidth + gap;
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.cyan);
  doc.setLineWidth(0.5);
  doc.roundedRect(card2X, startY, cardWidth, cardHeight, 3, 3, 'FD');
  
  // Top accent strip
  doc.setFillColor(...COLORS.cyan);
  doc.roundedRect(card2X, startY, cardWidth, 2, 2, 2, 'F');
  
  // Icon placeholder
  doc.setFillColor(...COLORS.cyanLight);
  doc.roundedRect(card2X + 7, startY + 7, 6, 6, 1, 1, 'F');
  
  // Title
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.cyan);
  doc.text('BEST FIT STREAM', card2X + 18, startY + 10);
  
  // Value
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text(data.stream, card2X + 5, startY + 22);
  
  // Match score badge
  const matchScore = data.result?.confidence === 'High' ? 92 : data.result?.confidence === 'Medium' ? 75 : 65;
  doc.setFillColor(...COLORS.cyan);
  doc.roundedRect(card2X + cardWidth - 28, startY + 3, 24, 6, 1, 1, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.white);
  doc.text(`${matchScore}% Match`, card2X + cardWidth - 16, startY + 6.5, { align: 'center' });
  
  // Card 3: Career Paths (Rose theme)
  const card3X = card2X + cardWidth + gap;
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.rose);
  doc.setLineWidth(0.5);
  doc.roundedRect(card3X, startY, cardWidth, cardHeight, 3, 3, 'FD');
  
  // Top accent strip
  doc.setFillColor(...COLORS.rose);
  doc.roundedRect(card3X, startY, cardWidth, 2, 2, 2, 'F');
  
  // Icon placeholder
  doc.setFillColor(...COLORS.roseLight);
  doc.roundedRect(card3X + 7, startY + 7, 6, 6, 1, 1, 'F');
  
  // Title
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.rose);
  doc.text('CAREER PATHS', card3X + 18, startY + 10);
  
  // Value (top path)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  const topPath = data.paths[0]?.name || 'Engineering / Tech';
  doc.text(topPath, card3X + 5, startY + 22);
  
  // Subtitle
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textMuted);
  doc.text('High Growth Fields', card3X + 5, startY + 29);
  
  return startY + cardHeight + 10;
}

// SECTION 2: Aptitude DNA Analysis (Premium with progress bars)
function addAptitudeDNASection(doc: jsPDF, aptitudeDNA: Array<{ axis: string; value: number }>, margin: number, yPos: number, contentWidth: number): number {
  const startY = yPos;
  
  // Header bar (gold theme)
  doc.setFillColor(...COLORS.gold);
  doc.rect(margin, startY, contentWidth, 8, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  doc.text('APTITUDE DNA ANALYSIS', margin + 5, startY + 5.5);
  
  let currentY = startY + 15;
  
  // Process each trait
  aptitudeDNA.forEach((trait) => {
    // Label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(trait.axis, margin, currentY);
    
    // Progress bar track
    const barX = margin + 60;
    const barY = currentY - 3;
    const barWidth = 90;
    const barHeight = 4;
    
    doc.setFillColor(226, 232, 240); // Slate-200
    doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
    
    // Fill (gold)
    doc.setFillColor(...COLORS.gold);
    const fillWidth = (barWidth * trait.value) / 100;
    doc.roundedRect(barX, barY, fillWidth, barHeight, 2, 2, 'F');
    
    // Percentage badge
    doc.setFillColor(...COLORS.dark);
    doc.roundedRect(barX + barWidth + 3, barY - 1, 12, 6, 1, 1, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text(`${Math.round(trait.value)}%`, barX + barWidth + 9, currentY, { align: 'center' });
    
    currentY += 10;
  });
  
  return currentY + 5;
}

// SECTION 3: Stream Fit Analysis (Premium bar charts)
function addStreamFitSection(doc: jsPDF, streamFit: Array<{ stream: string; score: number }>, recommendedStream: string, margin: number, yPos: number, contentWidth: number): number {
  const startY = yPos;
  
  // Section title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Stream Fit Analysis', margin, startY);
  
  let currentY = startY + 10;
  
  streamFit.forEach((item) => {
    const score = Math.round(item.score);
    const isRecommended = item.stream === recommendedStream;
    
    // Determine color
    let barColor: number[];
    if (isRecommended) {
      barColor = COLORS.gold; // Recommended = Gold
    } else if (score > 60) {
      barColor = COLORS.cyan; // Good fit = Cyan
    } else {
      barColor = COLORS.dark; // Low fit = Dark
    }
    
    // Stream name
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.textBody);
    doc.text(item.stream, margin, currentY + 3.5);
    
    // Bar
    const barX = margin + 40;
    const barY = currentY;
    const maxBarWidth = 120;
    const barHeight = 5;
    const fillWidth = (maxBarWidth * score) / 100;
    
    // Background
    doc.setFillColor(226, 232, 240); // Slate-200
    doc.rect(barX, barY, maxBarWidth, barHeight, 'F');
    
    // Fill
    doc.setFillColor(...barColor);
    doc.rect(barX, barY, fillWidth, barHeight, 'F');
    
    // Score label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(`${score}%`, barX + fillWidth + 3, currentY + 3.5);
    
    // Recommended badge
    if (isRecommended) {
      doc.setFillColor(...COLORS.goldLight);
      doc.setDrawColor(...COLORS.gold);
      doc.setLineWidth(0.3);
      doc.roundedRect(barX + fillWidth + 15, currentY - 1, 25, 6, 1, 1, 'FD');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.gold);
      doc.text('RECOMMENDED', barX + fillWidth + 27.5, currentY + 3.5, { align: 'center' });
    }
    
    currentY += 10;
  });
  
  return currentY + 10;
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
// SECTION 4: 2-Year Roadmap (Premium Timeline)
function addRoadmapSection(doc: jsPDF, roadmap: any, margin: number, yPos: number, contentWidth: number, language: 'en' | 'hi' | 'mr'): number {
  const startY = yPos;
  
  // Hero Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.teal);
  doc.text('Your 2-Year Success Roadmap', margin, startY);
  
  // Gold underline
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(margin, startY + 3, margin + 75, startY + 3);
  
  let currentY = startY + 20;
  
  // Timeline line
  const lineX = margin + 10;
  const timelineStartY = currentY;
  const timelineEndY = currentY + 100; // Will be adjusted based on milestones
  
  doc.setDrawColor(...COLORS.light);
  doc.setLineWidth(1);
  doc.line(lineX, timelineStartY, lineX, timelineEndY);
  
  // Premium Timeline Milestones
  if (roadmap.milestones && roadmap.milestones.length > 0) {
    roadmap.milestones.slice(0, 3).forEach((milestone: any, idx: number) => {
      const milestoneY = currentY + (idx * 35);
      
      // Timeline dot
      doc.setFillColor(...COLORS.teal);
      doc.setDrawColor(...COLORS.white);
      doc.setLineWidth(1);
      doc.roundedRect(lineX - 3, milestoneY + 7, 6, 6, 3, 3, 'FD');
      
      // Card box
      const cardX = lineX + 15;
      const cardWidth = 145;
      const cardHeight = 25;
      
      doc.setDrawColor(...COLORS.tealLight);
      doc.setFillColor(...COLORS.white);
      doc.setLineWidth(0.3);
      doc.roundedRect(cardX, milestoneY, cardWidth, cardHeight, 2, 2, 'FD');
      
      // Left border accent
      doc.setFillColor(...COLORS.teal);
      doc.roundedRect(cardX, milestoneY, 2, cardHeight, 2, 2, 'F');
      
      // Time label
      const timeLabel = milestone.month_range || `Month ${(idx + 1) * 3}-${(idx + 2) * 3}`;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.textMuted);
      doc.text(timeLabel.toUpperCase(), cardX + 8, milestoneY + 8);
      
      // Title
      if (milestone.title) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.text);
        doc.text(milestone.title, cardX + 8, milestoneY + 14);
      }
      
      // Description
      if (milestone.description) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textBody);
        const descText = milestone.description.length > 60 ? milestone.description.substring(0, 60) + '...' : milestone.description;
        doc.text(descText, cardX + 8, milestoneY + 20);
      }
      
      // Type badge
      const typeLabel = milestone.type || (idx === 0 ? 'ACADEMIC' : idx === 1 ? 'EXAM' : 'STRATEGY');
      doc.setFillColor(...COLORS.cyanLight);
      doc.setDrawColor(...COLORS.cyan);
      doc.setLineWidth(0.3);
      doc.roundedRect(cardX + 110, milestoneY + 5, 30, 6, 1, 1, 'FD');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.cyan);
      doc.text(typeLabel, cardX + 125, milestoneY + 8.5, { align: 'center' });
    });
    
    currentY += (roadmap.milestones.slice(0, 3).length * 35) + 10;
  }
  
  return currentY;
      
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
