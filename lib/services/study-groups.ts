/**
 * Study Groups Service
 * Handles study group creation, collaboration, and management
 */

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  topic?: string;
  members: Array<{
    userId: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'member';
    joinedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  settings: {
    isPublic: boolean;
    maxMembers?: number;
    requiresApproval: boolean;
  };
}

export interface StudySession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  scheduledFor: Date;
  duration: number; // minutes
  location?: string;
  onlineLink?: string;
  attendees: string[]; // user IDs
  agenda: Array<{
    item: string;
    duration: number;
    assignedTo?: string;
  }>;
  notes?: string;
  completed: boolean;
}

export interface GroupDocument {
  id: string;
  groupId: string;
  title: string;
  type: 'notes' | 'assignment' | 'resource' | 'quiz';
  content: string;
  uploadedBy: string;
  uploadedAt: Date;
  sharedWith: string[]; // user IDs
  tags: string[];
}

/**
 * Create a new study group
 */
export function createStudyGroup(
  name: string,
  description: string,
  subject: string,
  creatorId: string,
  creatorName: string,
  settings?: Partial<StudyGroup['settings']>
): StudyGroup {
  return {
    id: `group-${Date.now()}`,
    name,
    description,
    subject,
    members: [{
      userId: creatorId,
      name: creatorName,
      role: 'admin',
      joinedAt: new Date()
    }],
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      isPublic: settings?.isPublic ?? false,
      maxMembers: settings?.maxMembers ?? 10,
      requiresApproval: settings?.requiresApproval ?? false
    }
  };
}

/**
 * Schedule a study session
 */
export function scheduleStudySession(
  groupId: string,
  title: string,
  scheduledFor: Date,
  duration: number,
  creatorId: string
): StudySession {
  return {
    id: `session-${Date.now()}`,
    groupId,
    title,
    description: '',
    scheduledFor,
    duration,
    attendees: [creatorId],
    agenda: [],
    completed: false
  };
}

