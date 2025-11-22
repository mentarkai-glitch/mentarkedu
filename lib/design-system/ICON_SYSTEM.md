# 🎨 Mentark Icon System Documentation

## Overview

This document outlines the custom icon system for Mentark Quantum platform. The icon system provides semantic, consistent, and meaningful icons across the platform.

## Design Principles

1. **Consistency First** - Unified stroke width, corner radius, padding
2. **Clarity Over Style** - Instantly recognizable, work at small sizes
3. **Meaningful, Not Decorative** - Every icon has semantic meaning
4. **Mental Model Alignment** - Icons match user mental models

## Icon Specifications

### Grid System
- **Base Grid:** 24x24px (standard)
- **Stroke Width:** 1.5px (uniform)
- **Padding:** 3px (internal spacing)
- **Corner Radius:** 2px (rounded, friendly)
- **Optical Alignment:** Visually centered

### Icon Sizes
- **XS:** 12px - Tags, inline elements
- **SM:** 16px - Buttons, inline elements
- **MD:** 20px - Default, most common
- **LG:** 24px - Headers, important elements
- **XL:** 32px - Feature highlights
- **2XL:** 48px - Hero sections

### Visual Style
- **Style:** Outline with selective fills
- **Stroke:** 1.5px uniform
- **End Caps:** Rounded
- **Joints:** Rounded
- **Corners:** 2px radius
- **Fill:** Only for active/selected states

## Icon Categories

### Category 1: Core Navigation
- `nav-home` - Home / Dashboard
- `nav-arks` - ARKs (Adaptive Roadmaps)
- `nav-daily` - Daily Assistant
- `nav-mentor` - AI Mentor
- `nav-search` - Smart Search
- `nav-doubt` - Doubt Solver

### Category 2: Study & Learning
- `study-analyzer` - Study Analyzer
- `study-practice` - Practice Questions
- `study-visual` - Visual Explainer
- `study-project` - Project Helper
- `study-papers` - Academic Papers

### Category 3: Career & Growth
- `career-college` - College Matcher
- `career-job` - Job Matcher
- `career-resume` - Resume Builder
- `career-dna` - Career DNA

### Category 4: Community & Support
- `community-peers` - Peer Matches
- `community-progress` - Progress Tracking
- `community-achievements` - Achievements

### Category 5: Emotional & Wellness
- `wellness-emotion` - Emotion Check
- `wellness-checkin` - Daily Check-in
- `wellness-mood` - Mood Tracker

### Category 6: Actions & States
- `action-add` - Add / Create
- `action-edit` - Edit / Modify
- `action-delete` - Delete / Remove
- `action-save` - Save / Bookmark
- `action-share` - Share / Export
- `action-download` - Download
- `action-search` - Search
- `action-filter` - Filter

### Category 7: Status & Feedback
- `status-success` - Success / Check
- `status-error` - Error / Warning
- `status-info` - Information
- `status-loading` - Loading / Processing
- `status-empty` - Empty / No Data

### Category 8: Navigation & Movement
- `nav-back` - Back / Previous
- `nav-forward` - Forward / Next
- `nav-up` - Up / Top
- `nav-down` - Down / Expand
- `nav-close` - Close / Cancel
- `nav-menu` - Menu / Hamburger

### Category 9: AI & Intelligence
- `ai-brain` - AI Brain
- `ai-sparkle` - Sparkle / Magic
- `ai-insight` - Insight / Lightbulb
- `ai-recommendation` - Recommendation

## Color Usage

### Default States
- **Default:** Slate 500 (`#64748B`)
- **Active:** Mentorship Gold (`#FFD700`)
- **Hover:** Slate 300 (`#CBD5E1`)
- **Disabled:** Slate 700 (`#334155`)

### Semantic Colors
- **Success:** Growth Green (`#00C896`)
- **Warning:** Caution Orange (`#FF8C42`)
- **Error:** Alert Red (`#FF6B6B`)
- **Info:** Calm Blue (`#4A90E2`)

## Naming Convention

**Format:** `{category}-{name}-{state}`

**Examples:**
- `nav-home` - Navigation, home
- `nav-home-active` - Active state
- `study-practice` - Study, practice
- `action-add` - Action, add
- `status-success` - Status, success
- `ai-brain-active` - AI, brain, active

## Usage Guidelines

### When to Use Icons
1. **Reinforce Text** - Icons should support, not replace text
2. **Visual Hierarchy** - Use icons to draw attention
3. **Quick Recognition** - Icons aid in quick scanning
4. **Cultural Context** - Consider Indian cultural context

### When NOT to Use Icons
1. **Decorative Only** - Don't use icons purely for decoration
2. **Unclear Meaning** - If icon meaning is ambiguous, use text
3. **Critical Actions** - Critical actions should have text labels
4. **Overuse** - Too many icons create visual noise

## Animation Guidelines

### Principles
- **Subtle** - Icons should feel alive but not distracting
- **Purposeful** - Animation should communicate state/action
- **Smooth** - 200-300ms transitions
- **Consistent** - Same animation for same action

### Animation Types
- **Sparkle Icons:** Gentle pulse (2s loop)
- **Active States:** Gentle glow (gold shadow)
- **Loading:** Smooth rotation (2s loop)
- **Success:** Brief checkmark animation (bounce-in, 300ms)
- **Hover:** Slight scale (1.1), color change

## Implementation Notes

### File Structure
```
icons/
├── nav/              # Navigation icons
├── study/            # Study & learning
├── career/           # Career & growth
├── community/        # Community & support
├── wellness/         # Emotional & wellness
├── actions/          # Actions & operations
├── status/           # Status & feedback
├── navigation/       # Navigation & movement
└── ai/              # AI & intelligence
```

### Component Usage
```tsx
// Using Lucide React icons (current implementation)
import { Home, Brain, Target } from 'lucide-react';

// Recommended: Create icon mapping
const icons = {
  'nav-home': Home,
  'ai-brain': Brain,
  'study-analyzer': Target,
};
```

## Next Steps

1. **Icon Library Creation** - Design/create all 50+ icons
2. **Component Wrapper** - Create Icon component wrapper
3. **Usage Examples** - Document usage patterns
4. **Accessibility** - Ensure all icons have proper ARIA labels
5. **Performance** - Optimize icon loading and rendering

## Resources

- **Design Tool:** Figma / Adobe Illustrator
- **Format:** SVG (optimized)
- **Export:** Individual SVG files + React components
- **Library:** Consider custom icon library or Lucide React extension

---

**Last Updated:** 2024  
**Version:** 1.0  
**Status:** Planning Complete, Implementation Pending





