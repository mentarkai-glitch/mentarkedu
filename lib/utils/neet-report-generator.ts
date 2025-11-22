import jsPDF from 'jspdf';
import type { NEETResult, NEETMetrics, SubjectScores, AlternativeCareer, RankImprovement } from './neet-scoring';

export interface NEETReportData {
  studentName?: string;
  result: NEETResult;
  language?: 'en' | 'hi' | 'mr';
}

// Premium color scheme for NEET
const COLORS = {
  primary: [20, 184, 166],    // Teal-500
  secondary: [14, 165, 233],   // Sky-500
  accent: [59, 130, 246],      // Blue-500
  success: [34, 197, 94],      // Green-500
  warning: [234, 179, 8],      // Yellow-600
  danger: [239, 68, 68],       // Red-500
  dark: [15, 23, 42],          // Slate-900
  light: [241, 245, 249],      // Slate-100
  text: [30, 41, 59],          // Slate-800
  border: [148, 163, 184],     // Slate-400
};

export function generateNEETPDFReport(data: NEETReportData): void {
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
      addPageHeader(doc, pageWidth, margin, data.studentName);
    }
  };

  const addSectionTitle = (title: string) => {
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

  const addSubsection = (title: string, size: number = 11) => {
    checkNewPage(15);
    yPos += 3;
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(title, margin, yPos);
    yPos += 7;
  };

  const addText = (text: string, size: number = 10, color: number[] = COLORS.text) => {
    checkNewPage(10);
    doc.setFontSize(size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    yPos += 2;
  };

  const addBulletPoint = (text: string, indent: number = 0) => {
    checkNewPage(8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    doc.circle(margin + indent + 2, yPos - 1.5, 1, 'F');
    const lines = doc.splitTextToSize(text, contentWidth - 10 - indent);
    lines.forEach((line: string, idx: number) => {
      doc.text(line, margin + indent + 6, yPos);
      yPos += 5;
    });
    yPos += 1;
  };

  const addMetricBox = (label: string, value: string, color: number[] = COLORS.primary) => {
    checkNewPage(15);
    const boxWidth = contentWidth / 2 - 5;
    const xPos = margin + ((yPos % 150 < 50) ? 0 : boxWidth + 10);

    // Box background - use lighter color instead of alpha
    const lightColor = color.map(c => Math.min(255, Math.round(c * 0.1 + 240)));
    doc.setFillColor(...lightColor);
    doc.roundedRect(xPos, yPos - 5, boxWidth, 12, 2, 2, 'F');

    // Border
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.roundedRect(xPos, yPos - 5, boxWidth, 12, 2, 2, 'S');

    // Label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.border);
    doc.text(label, xPos + 3, yPos);

    // Value
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(value, xPos + 3, yPos + 6);

    if (xPos === margin) {
      yPos += 2;
    } else {
      yPos += 15;
    }
  };

  // Cover Page
  addCoverPage(doc, data, pageWidth, pageHeight, margin);
  doc.addPage();
  yPos = addPremiumHeader(doc, pageWidth, margin, data.studentName);

  const { metrics, alternativeCareers, rankImprovement, insights } = data.result;

  // SECTION 01: Quick Insights Dashboard (3-column)
  yPos = addSectionNumber(doc, '01', margin, yPos);
  addSubsection('Quick Insights Dashboard', 11);
  yPos += 8;
  yPos = addQuickInsightsDashboard(doc, metrics, rankImprovement, margin, yPos, contentWidth);
  checkNewPage(0);

  // SECTION 02: Subject Vital Signs (6-Axis)
  yPos = addSectionNumber(doc, '02', margin, yPos);
  yPos = addSubjectVitalSigns(doc, metrics.subjectScores, margin, yPos, contentWidth);
  checkNewPage(0);

  // SECTION 03: Strategic Pathway Analysis (Plan A vs Plan B)
  yPos = addSectionNumber(doc, '03', margin, yPos);
  yPos = addStrategicPathwayAnalysis(doc, metrics, margin, yPos, contentWidth);
  checkNewPage(0);

  // SECTION 04: Rank Improvement Bridge
  yPos = addSectionNumber(doc, '04', margin, yPos);
  yPos = addRankImprovementBridge(doc, rankImprovement, margin, yPos, contentWidth);
  checkNewPage(0);

  // SECTION 05: Best-Fit Career Alternatives
  if (alternativeCareers.length > 0) {
    yPos = addSectionNumber(doc, '05', margin, yPos);
    yPos = addAlternativeCareers(doc, alternativeCareers, margin, yPos, contentWidth);
    checkNewPage(0);
  }

  // SECTION 06: Personalized Insights
  yPos = addSectionNumber(doc, '06', margin, yPos);
  yPos = addPersonalizedInsights(doc, insights, margin, yPos, contentWidth);
  checkNewPage(0);

  // Footer
  addFooter(doc, pageWidth, pageHeight, margin);

  // Save the PDF
  const fileName = `NEET-Diagnostic-${data.studentName || 'Report'}-${Date.now()}.pdf`;
  doc.save(fileName);
}

function addCoverPage(doc: jsPDF, data: NEETReportData, pageWidth: number, pageHeight: number, margin: number) {
  // Dark slate background
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Teal decorative top bar (4mm)
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 4, 'F');
  
  // Main title area
  let yPos = 50;
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('NEET DIAGNOSTIC REPORT', pageWidth / 2, yPos, { align: 'center' });
  
  // Student ID and date
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate-400
  const studentId = `#${Math.floor(Math.random() * 9000) + 1000}-${Date.now().toString().slice(-4)}`;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.text(`Student ID: ${studentId} • Analysis Date: ${date}`, pageWidth / 2, yPos, { align: 'center' });
  
  // Advanced Analysis badge (top right)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('ADVANCED ANALYSIS', pageWidth - margin, 25, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('AI-Powered Assessment', pageWidth - margin, 30, { align: 'right' });
  
  // Student info box (centered)
  yPos = pageHeight / 2 - 15;
  const boxWidth = pageWidth - (margin * 2);
  const boxHeight = 40;
  
  // Box background
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, 'F');
  
  // Gold border
  doc.setDrawColor(255, 215, 0); // Gold
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, 'S');
  
  // Student name
  if (data.studentName) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`Student: ${data.studentName}`, pageWidth / 2, yPos + 12, { align: 'center' });
  }
  
  // Current and target scores
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primary);
  const currentScore = data.result.rankImprovement.currentScore;
  const targetScore = data.result.rankImprovement.targetScore;
  doc.text(`Current Score: ${currentScore}/720 | Target: ${targetScore}/720`, pageWidth / 2, yPos + 25, { align: 'center' });
  
  // Bottom footer
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('© 2025 Mentark Quantum. Confidential Medical Report.', pageWidth / 2, pageHeight - 8, { align: 'center' });
}

function addPremiumHeader(doc: jsPDF, pageWidth: number, margin: number, studentName?: string) {
  // Dark header background
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, 20, 'F');
  
  // Teal bottom border
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 20, pageWidth, 1, 'F');
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('NEET DIAGNOSTIC REPORT', margin + 5, 12);
  
  // Student ID and date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.text(`Student ID: #${Math.floor(Math.random() * 9000) + 1000} • Analysis Date: ${date}`, margin + 5, 18);
  
  // Advanced Analysis badge (right side)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('ADVANCED ANALYSIS', pageWidth - margin - 5, 12, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('AI-Powered Assessment', pageWidth - margin - 5, 18, { align: 'right' });
  
  // Adjust yPos for content
  return 25; // Return new starting yPos
}

function addSectionNumber(doc: jsPDF, number: string, margin: number, yPos: number) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(number, margin, yPos);
  yPos += 5;
  return yPos;
}

// SECTION 01: Quick Insights Dashboard (3-column)
function addQuickInsightsDashboard(doc: jsPDF, metrics: NEETMetrics, rankImprovement: RankImprovement, margin: number, yPos: number, contentWidth: number): number {
  const cardWidth = (contentWidth - 8) / 3;
  const cardHeight = 28;
  const startY = yPos;
  
  // Card 1: NEET Probability (Teal)
  const card1X = margin;
  doc.setFillColor(240, 253, 250); // Teal-50
  doc.roundedRect(card1X, startY, cardWidth, cardHeight, 2, 2, 'F');
  doc.setFillColor(...COLORS.primary);
  doc.rect(card1X, startY, 1, cardHeight, 'F'); // Left border
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.3);
  doc.roundedRect(card1X, startY, cardWidth, cardHeight, 2, 2, 'S');
  
  // Icon area
  doc.setFillColor(204, 251, 241); // Teal-200
  doc.roundedRect(card1X + 3, startY + 3, 8, 8, 1, 1, 'F');
  
  // Confidence badge
  const confidence = metrics.neetProbability >= 70 ? 'High Confidence' : metrics.neetProbability >= 50 ? 'Moderate' : 'Low';
  const confColor = metrics.neetProbability >= 70 ? COLORS.success : metrics.neetProbability >= 50 ? COLORS.warning : COLORS.danger;
  doc.setFillColor(...confColor);
  doc.roundedRect(card1X + cardWidth - 35, startY + 3, 32, 6, 1, 1, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(confidence, card1X + cardWidth - 19, startY + 6.5, { align: 'center' });
  
  // Label
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('NEET Success Probability', card1X + 3, startY + 15);
  
  // Value
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 83, 75); // Teal-800
  doc.text(`${metrics.neetProbability}%`, card1X + 3, startY + 23);
  
  // Card 2: Allied Health Fit (Cyan)
  const card2X = card1X + cardWidth + 4;
  doc.setFillColor(236, 254, 255); // Cyan-50
  doc.roundedRect(card2X, startY, cardWidth, cardHeight, 2, 2, 'F');
  doc.setFillColor(...COLORS.secondary);
  doc.rect(card2X, startY, 1, cardHeight, 'F');
  doc.setDrawColor(...COLORS.secondary);
  doc.setLineWidth(0.3);
  doc.roundedRect(card2X, startY, cardWidth, cardHeight, 2, 2, 'S');
  
  doc.setFillColor(165, 243, 252); // Cyan-300
  doc.roundedRect(card2X + 3, startY + 3, 8, 8, 1, 1, 'F');
  
  // Fit score badge
  const fitScore = metrics.alliedHealthFit >= 70 ? '9.2/10' : metrics.alliedHealthFit >= 50 ? '7.5/10' : '6.0/10';
  doc.setFillColor(...COLORS.secondary);
  doc.roundedRect(card2X + cardWidth - 28, startY + 3, 25, 6, 1, 1, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(fitScore, card2X + cardWidth - 15.5, startY + 6.5, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Allied Health Fit Score', card2X + 3, startY + 15);
  
  const fitText = metrics.alliedHealthFit >= 70 ? 'Excellent' : metrics.alliedHealthFit >= 50 ? 'Good' : 'Fair';
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 116, 144); // Cyan-800
  doc.text(fitText, card2X + 3, startY + 23);
  
  // Card 3: Target Score (Blue)
  const card3X = card2X + cardWidth + 4;
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.roundedRect(card3X, startY, cardWidth, cardHeight, 2, 2, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(card3X, startY, 1, cardHeight, 'F');
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.3);
  doc.roundedRect(card3X, startY, cardWidth, cardHeight, 2, 2, 'S');
  
  doc.setFillColor(147, 197, 253); // Blue-300
  doc.roundedRect(card3X + 3, startY + 3, 8, 8, 1, 1, 'F');
  
  // Potential badge
  const potential = rankImprovement.targetScore - rankImprovement.currentScore;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.accent);
  doc.text(`+${potential} Potential`, card3X + cardWidth - 35, startY + 6);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Target Score', card3X + 3, startY + 15);
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175); // Blue-900
  doc.text(`${rankImprovement.targetScore}`, card3X + 3, startY + 22);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('/720', card3X + 25, startY + 22);
  
  return startY + cardHeight + 10;
}

// SECTION 02: Subject Vital Signs (6-Axis)
function addSubjectVitalSigns(doc: jsPDF, subjectScores: SubjectScores, margin: number, yPos: number, contentWidth: number): number {
  const startY = yPos;
  
  // Section header bar
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, startY, contentWidth, 8, 2, 2, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Subject Vital Signs (6-Axis)', margin + 3, startY + 5.5);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(204, 251, 241); // Teal-200
  doc.text('Performance Metrics', margin + contentWidth - 50, startY + 5.5, { align: 'right' });
  
  yPos = startY + 12;
  
  // Bordered content area
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, 0, 2, 2, 'S');
  const contentStartY = yPos;
  yPos += 5;
  
  // 2-column layout
  const colWidth = (contentWidth - 20) / 2;
  const leftColX = margin + 5;
  const rightColX = leftColX + colWidth + 10;
  
  // Left column: Subjects
  const subjects = [
    { label: 'Physics', value: Math.round(subjectScores.physics) },
    { label: 'Chemistry', value: Math.round(subjectScores.chemistry) },
    { label: 'Biology', value: Math.round(subjectScores.biology) }
  ];
  
  let currentY = yPos;
  subjects.forEach((subject) => {
    currentY = addVitalRow(doc, subject.label, subject.value, leftColX, currentY, colWidth);
  });
  
  // Right column: Meta-Skills
  const metaSkills = [
    { label: 'Accuracy', value: Math.round(subjectScores.accuracy) },
    { label: 'Exam Stamina', value: Math.round(subjectScores.stamina) },
    { label: 'Mindset', value: Math.round(subjectScores.mindset) }
  ];
  
  let rightY = yPos;
  metaSkills.forEach((skill) => {
    rightY = addVitalRow(doc, skill.label, skill.value, rightColX, rightY, colWidth);
  });
  
  // Close the border
  const contentEndY = Math.max(currentY, rightY) + 3;
  doc.roundedRect(margin, contentStartY, contentWidth, contentEndY - contentStartY, 2, 2, 'S');
  
  return contentEndY + 8;
}

function addVitalRow(doc: jsPDF, label: string, value: number, xPos: number, yPos: number, width: number): number {
  // Label
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(label, xPos, yPos);
  
  // Progress bar
  const barWidth = width - 50;
  const barHeight = 3;
  const barX = xPos + 30;
  const barY = yPos - 2.5;
  
  // Background
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.roundedRect(barX, barY, barWidth, barHeight, 1, 1, 'F');
  
  // Fill
  const fillWidth = (value / 100) * barWidth;
  let barColor: number[];
  let status: string;
  if (value >= 70) {
    barColor = COLORS.accent; // Blue
    status = 'Excellent';
  } else if (value >= 50) {
    barColor = COLORS.warning; // Yellow
    status = value >= 60 ? 'Good' : 'Fair';
  } else {
    barColor = COLORS.danger; // Red
    status = 'Needs Work';
  }
  
  doc.setFillColor(...barColor);
  doc.roundedRect(barX, barY, fillWidth, barHeight, 1, 1, 'F');
  
  // Percentage
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(`${value}%`, barX + barWidth + 3, yPos);
  
  // Status badge
  const badgeX = barX + barWidth + 15;
  const badgeWidth = 20;
  const badgeHeight = 5;
  
  let badgeBg: number[];
  let badgeText: number[];
  if (value >= 70) {
    badgeBg = [239, 246, 255]; // Blue-50
    badgeText = [37, 99, 235]; // Blue-600
  } else if (value >= 50) {
    badgeBg = [254, 252, 232]; // Yellow-50
    badgeText = [234, 179, 8]; // Yellow-600
  } else {
    badgeBg = [254, 242, 242]; // Red-50
    badgeText = [239, 68, 68]; // Red-600
  }
  
  doc.setFillColor(...badgeBg);
  doc.roundedRect(badgeX, yPos - 2.5, badgeWidth, badgeHeight, 1, 1, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...badgeText);
  doc.text(status.toUpperCase(), badgeX + badgeWidth / 2, yPos, { align: 'center' });
  
  return yPos + 8;
}

// SECTION 03: Strategic Pathway Analysis
function addStrategicPathwayAnalysis(doc: jsPDF, metrics: NEETMetrics, margin: number, yPos: number, contentWidth: number): number {
  const startY = yPos;
  
  // Section title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('03. Strategic Pathway Analysis', margin, startY);
  yPos = startY + 8;
  
  // Background box
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(margin, yPos, contentWidth, 0, 2, 2, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, 0, 2, 2, 'S');
  const boxStartY = yPos;
  yPos += 5;
  
  // Plan A: NEET
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('Plan A: MBBS (NEET)', margin + 5, yPos);
  
  const planAProb = metrics.neetProbability;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text(`${planAProb}% Probability`, margin + contentWidth - 40, yPos, { align: 'right' });
  yPos += 4;
  
  // Plan A progress bar
  const barWidth = contentWidth - 10;
  const barHeight = 4;
  doc.setFillColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin + 5, yPos, barWidth, barHeight, 2, 2, 'F');
  const fillWidthA = (planAProb / 100) * barWidth;
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin + 5, yPos, fillWidthA, barHeight, 2, 2, 'F');
  yPos += 8;
  
  // Plan B: Allied Health
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Plan B: Allied Health / Research', margin + 5, yPos);
  
  const planBProb = metrics.alliedHealthFit;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.secondary);
  doc.text(`${planBProb}% Probability`, margin + contentWidth - 40, yPos, { align: 'right' });
  yPos += 4;
  
  // Plan B progress bar
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(margin + 5, yPos, barWidth, barHeight, 2, 2, 'F');
  const fillWidthB = (planBProb / 100) * barWidth;
  doc.setFillColor(...COLORS.secondary);
  doc.roundedRect(margin + 5, yPos, fillWidthB, barHeight, 2, 2, 'F');
  yPos += 8;
  
  // Recommendation box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(234, 179, 8); // Yellow-500
  doc.setLineWidth(1);
  doc.rect(margin + 5, yPos, contentWidth - 10, 20, 'S');
  doc.setFillColor(234, 179, 8);
  doc.rect(margin + 5, yPos, 1, 20, 'F'); // Left border
  
  yPos += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Primary Recommendation', margin + 10, yPos);
  
  yPos += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // Slate-600
  const recText = planBProb > planAProb 
    ? `While Plan B is a "Safe Zone", your Biology score indicates strong potential for MBBS if Physics accuracy improves by 15%. Focus 70% effort on Plan A for next 3 months.`
    : `Your NEET probability is ${planAProb}%. Continue working hard and consider Plan B options as backup.`;
  const recLines = doc.splitTextToSize(recText, contentWidth - 20);
  recLines.forEach((line: string) => {
    doc.text(line, margin + 10, yPos);
    yPos += 4;
  });
  
  const boxEndY = yPos + 3;
  doc.roundedRect(margin, boxStartY, contentWidth, boxEndY - boxStartY, 2, 2, 'S');
  
  return boxEndY + 10;
}

// SECTION 04: Rank Improvement Bridge
function addRankImprovementBridge(doc: jsPDF, rankImprovement: RankImprovement, margin: number, yPos: number, contentWidth: number): number {
  const startY = yPos;
  
  // Section title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('04. Rank Improvement Bridge', margin, startY);
  yPos = startY + 10;
  
  // Score progression bars
  const scores = [
    { label: 'Current', value: rankImprovement.currentScore, color: COLORS.danger, height: 24 },
    { label: 'Phase 1', value: rankImprovement.potentialWithAccuracy, color: COLORS.warning, height: 28 },
    { label: 'Phase 2', value: rankImprovement.potentialWithSubjectFix, color: COLORS.secondary, height: 36 },
    { label: 'Target Goal', value: rankImprovement.targetScore, color: COLORS.success, height: 48 }
  ];
  
  const barWidth = 14;
  const barSpacing = (contentWidth - (scores.length * barWidth)) / (scores.length + 1);
  const baseY = yPos + 40;
  
  scores.forEach((score, idx) => {
    const xPos = margin + barSpacing + (idx * (barWidth + barSpacing));
    
    // Score bar
    doc.setFillColor(...score.color);
    doc.roundedRect(xPos, baseY - score.height, barWidth, score.height, 1, 1, 'F');
    
    // Score label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(score.value.toString(), xPos + barWidth / 2, baseY - score.height - 2, { align: 'center' });
    
    // Label below
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(score.label, xPos + barWidth / 2, baseY + 5, { align: 'center' });
    
    // Connector arrow (except last)
    if (idx < scores.length - 1) {
      const nextX = margin + barSpacing + ((idx + 1) * (barWidth + barSpacing));
      const connectorX = xPos + barWidth;
      const connectorWidth = nextX - connectorX;
      const connectorY = baseY - 20;
      
      // Line
      doc.setDrawColor(203, 213, 225); // Slate-300
      doc.setLineWidth(0.5);
      doc.line(connectorX, connectorY, connectorX + connectorWidth, connectorY);
      
      // Arrow
      const improvement = scores[idx + 1].value - score.value;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94); // Green-500
      doc.text(`+${improvement} pts`, connectorX + connectorWidth / 2, connectorY - 2, { align: 'center' });
      
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      const subLabel = idx === 0 ? 'Accuracy Fix' : idx === 1 ? 'Subject Mastery' : 'Optimization';
      doc.text(subLabel, connectorX + connectorWidth / 2, connectorY + 3, { align: 'center' });
    }
  });
  
  yPos = baseY + 15;
  
  // Action Cards (3-column)
  const cardWidth = (contentWidth - 8) / 3;
  const cardHeight = 25;
  const cardStartY = yPos;
  
  rankImprovement.actionableSteps.slice(0, 3).forEach((step, idx) => {
    const cardX = margin + (idx * (cardWidth + 4));
    const priorityColor = step.priority === 'High' ? COLORS.danger : step.priority === 'Medium' ? COLORS.warning : COLORS.secondary;
    
    // Card border
    const lightColor = priorityColor.map(c => Math.min(255, Math.round(c * 0.1 + 240)));
    doc.setFillColor(...lightColor);
    doc.setDrawColor(...priorityColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, cardStartY, cardWidth, cardHeight, 2, 2, 'F');
    doc.roundedRect(cardX, cardStartY, cardWidth, cardHeight, 2, 2, 'S');
    
    // Priority badge
    doc.setFillColor(...priorityColor);
    doc.roundedRect(cardX + 3, cardStartY + 3, 25, 5, 1, 1, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${step.priority} Priority`, cardX + 15.5, cardStartY + 6, { align: 'center' });
    
    // Timeline
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(step.timeline, cardX + cardWidth - 3, cardStartY + 6, { align: 'right' });
    
    // Title
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    const titleLines = doc.splitTextToSize(step.action.split(':')[0], cardWidth - 6);
    doc.text(titleLines[0], cardX + 3, cardStartY + 12);
    
    // Description
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const descText = step.action.includes(':') ? step.action.split(':').slice(1).join(':').trim() : step.action;
    const descLines = doc.splitTextToSize(descText, cardWidth - 6);
    descLines.forEach((line: string, lineIdx: number) => {
      doc.text(line, cardX + 3, cardStartY + 16 + (lineIdx * 4));
    });
  });
  
  return cardStartY + cardHeight + 10;
}

// SECTION 05: Alternative Careers
function addAlternativeCareers(doc: jsPDF, careers: AlternativeCareer[], margin: number, yPos: number, contentWidth: number): number {
  const startY = yPos;
  
  // Section title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('05. Best-Fit Career Alternatives', margin, startY);
  yPos = startY + 8;
  
  // 2-column grid
  const cardWidth = (contentWidth - 6) / 2;
  const cardHeight = 35;
  let currentY = yPos;
  
  careers.slice(0, 4).forEach((career, idx) => {
    if (idx > 0 && idx % 2 === 0) {
      currentY += cardHeight + 6;
    }
    
    const cardX = margin + ((idx % 2) * (cardWidth + 6));
    
    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, 'F');
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, 'S');
    
    // Icon circle
    const iconX = cardX + 4;
    const iconY = currentY + 4;
    const iconSize = 16;
    const iconColor = career.fitScore >= 80 ? COLORS.success : career.fitScore >= 60 ? COLORS.warning : COLORS.secondary;
    const lightIconColor = iconColor.map(c => Math.min(255, Math.round(c * 0.2 + 200)));
    doc.setFillColor(...lightIconColor);
    doc.circle(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 'F');
    
    // Fit badge
    doc.setFillColor(...iconColor);
    doc.roundedRect(cardX + cardWidth - 28, currentY + 4, 24, 6, 1, 1, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${career.fitScore}% Fit`, cardX + cardWidth - 16, currentY + 7, { align: 'center' });
    
    // Career name
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(career.name, iconX + iconSize + 4, iconY + 6);
    
    // Description
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const descLines = doc.splitTextToSize(career.description || career.why, cardWidth - iconSize - 12);
    descLines.slice(0, 2).forEach((line: string, lineIdx: number) => {
      doc.text(line, iconX + iconSize + 4, iconY + 12 + (lineIdx * 4));
    });
    
    // Tags
    const tags = ['Research', 'Clinical'];
    let tagX = iconX + iconSize + 4;
    tags.forEach((tag) => {
      doc.setFillColor(241, 245, 249); // Slate-50
      doc.roundedRect(tagX, currentY + cardHeight - 8, 18, 4, 0.5, 0.5, 'F');
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(148, 163, 184);
      doc.text(tag.toUpperCase(), tagX + 9, currentY + cardHeight - 5.5, { align: 'center' });
      tagX += 20;
    });
    
    if (idx % 2 === 1) {
      currentY += cardHeight + 6;
    }
  });
  
  return currentY + cardHeight + 10;
}

// SECTION 06: Personalized Insights
function addPersonalizedInsights(doc: jsPDF, insights: any, margin: number, yPos: number, contentWidth: number): number {
  const startY = yPos;
  
  // Section title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('06. Personalized Insights', margin, startY);
  yPos = startY + 8;
  
  // Strengths
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Strengths', margin, yPos);
  yPos += 6;
  
  insights.strengths.forEach((strength: string) => {
    addBulletPointHelper(doc, strength, margin, yPos, contentWidth);
    yPos += 5;
  });
  yPos += 3;
  
  // Areas to Improve
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Areas to Improve', margin, yPos);
  yPos += 6;
  
  insights.weaknesses.forEach((weakness: string) => {
    addBulletPointHelper(doc, weakness, margin, yPos, contentWidth);
    yPos += 5;
  });
  yPos += 3;
  
  // Recommendations
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Recommendations', margin, yPos);
  yPos += 6;
  
  insights.recommendations.forEach((rec: string) => {
    addBulletPointHelper(doc, rec, margin, yPos, contentWidth);
    yPos += 5;
  });
  
  return yPos + 5;
}

function addBulletPointHelper(doc: jsPDF, text: string, margin: number, yPos: number, contentWidth: number) {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.circle(margin + 2, yPos - 1.5, 1, 'F');
  const lines = doc.splitTextToSize(text, contentWidth - 10);
  lines.forEach((line: string, idx: number) => {
    doc.text(line, margin + 6, yPos + (idx * 4));
  });
}

function addFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number) {
  const footerY = pageHeight - 12;

  // Footer background
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(0, footerY, pageWidth, 12, 'F');
  
  // Footer border
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // Footer text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('© 2025 Mentark Quantum. Confidential Medical Report.', margin + 5, footerY + 5);
  doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 5, footerY + 5, { align: 'right' });
}

