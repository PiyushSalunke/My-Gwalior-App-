export type IssueCategory = 'pothole' | 'water_leakage' | 'streetlight' | 'garbage' | 'road_damage' | 'other';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'reported' | 'verified' | 'acknowledged' | 'in_progress' | 'resolved';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  imageUrl?: string | null;
}

export interface StatusTimelineEvent {
  status: IssueStatus;
  title: string;
  description: string;
  timestamp: string;
  updatedBy: string;
  imageUrl?: string | null;
}

export interface VisionIntakeResult {
  category: IssueCategory;
  severity: IssueSeverity;
  confidence: number;
  reasoning: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarIssueId?: string | null;
  explanation: string;
  nearbyCount: number;
}

export interface PriorityScoringResult {
  baseScore: number;
  bonusPoints: number;
  finalScore: number;
  reasoning: string;
}

export interface RoutingAndDraftingResult {
  department: string;
  draftedLetter: string;
  contactInfo: string;
}

export interface PredictiveInsightsResult {
  historicalPattern: string;
  recommendation: string;
  warningLevel: 'low' | 'medium' | 'high';
}

export interface AIAgentAnalysis {
  visionIntake: VisionIntakeResult;
  duplicateCheck: DuplicateCheckResult;
  priorityScoring: PriorityScoringResult;
  routingAndDrafting: RoutingAndDraftingResult;
  predictiveInsights: PredictiveInsightsResult;
  timestamp: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  ward: string;
  reporterName: string;
  reporterAvatar: string;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  image: string; // Base64 or image URL
  voiceNoteUrl?: string | null;
  confirmations: number;
  confirmedBy: string[]; // List of userIds who confirmed
  priorityScore: number;
  timeline: StatusTimelineEvent[];
  aiAnalysis: AIAgentAnalysis | null;
  comments: Comment[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  unlockedAt: string;
  color: string;
}

export interface AttendanceLog {
  timestamp: string;
  type: 'app_open' | 'manual_checkin' | 'manual_checkout';
  location?: string;
  device?: string;
  pageOpened?: string;
  durationMinutes?: number;
  latitude?: number;
  longitude?: number;
  sessionId?: string;
  pagesVisited?: string[];
  updatesPerformed?: string[];
  status?: 'active' | 'completed';
  checkInTime?: string;
  checkOutTime?: string;
  patrolSummary?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  points: number;
  badges: Badge[];
  reportedCount: number;
  verifiedCount: number;
  resolvedCount: number;
  role?: 'citizen' | 'authority' | 'admin';
  verificationStatus?: 'verified' | 'pending' | 'rejected' | 'none';
  accessLevel?: 'level_1' | 'level_2' | 'level_3' | 'none';
  password?: string;
  phone?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  attendanceLogs?: AttendanceLog[];
  department?: 'water' | 'light' | 'garbage' | 'road' | 'health' | 'admin' | string;
  authorityLevel?: 'commissioner' | 'chief_engineer' | 'superintendent' | 'inspector' | 'field_officer' | string;
}

export interface WardStats {
  wardName: string;
  reportedCount: number;
  resolvedCount: number;
  avgResolutionDays: number;
  hotspotIntensity: number; // 0 to 100
  topCategory: IssueCategory;
}

export interface ImpactStats {
  totalReported: number;
  totalResolved: number;
  averageResolutionHours: number;
  activeCitizens: number;
  categoryDistribution: Record<IssueCategory, number>;
  wardLeaderboard: WardStats[];
}

export interface ToastNotification {
  id: string;
  issueId: string;
  issueTitle: string;
  oldStatus?: string;
  newStatus: string;
  type: 'status_change' | 'new_comment' | 'general';
  message: string;
  timestamp: string;
}
