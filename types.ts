
export enum UserRole {
  PUBLIC = 'Citizen / Public User',
  HEALTH_WORKER = 'Health Worker',
  ADMIN = 'Administrator'
}

export enum UserStatus {
  ACTIVE = 'Active',
  PENDING_VERIFICATION = 'Pending Verification',
  SUSPENDED = 'Suspended'
}

export enum Permission {
  VIEW_REPORTS = 'VIEW_REPORTS',
  CREATE_REPORTS = 'CREATE_REPORTS',
  VERIFY_REPORTS = 'VERIFY_REPORTS',
  ASSIGN_REPORTS = 'ASSIGN_REPORTS',
  EXPORT_DATA = 'EXPORT_DATA',
  VIEW_MAP = 'VIEW_MAP',
  VIEW_TRENDS = 'VIEW_TRENDS',
  MANAGE_TASKS = 'MANAGE_TASKS',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  MANAGE_USERS = 'MANAGE_USERS',
  BROADCAST_ALERTS = 'BROADCAST_ALERTS'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  district: string;
  permissions: Permission[];
  phoneNumber?: string;
  lastLogin?: string;
  staffId?: string;
  facilityName?: string;
  jobTitle?: string;
  authCode?: string;
  savedAt?: number;
}

export interface CaseReport {
  id: string;
  disease: string;
  location: string;
  district?: string;
  status: 'Pending' | 'Verified' | 'Dismissed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  date: string;
  description: string;
  submitterId: string;
  submitterName: string;
  submitterRole: UserRole;
  patientName?: string;
  age?: number;
  contact?: string;
  clinicalNotes?: string;
  assignedTo?: string;
  patientHistory?: string;
  smsAlertSent?: boolean;
  notifiedProfessionals?: boolean;
  labStatus?: LabStatus;
  isolationStatus?: IsolationStatus;
  tracingStatus?: TracingStatus;
  lat?: number;
  lng?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  disease: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  author: string;
  date: string;
  district: string;
  published: boolean;
  reach?: number;
  targetAudience?: 'Public' | 'Internal';
}

export enum AppView {
  HOME = 'HOME',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  REPORT_SUBMISSION = 'REPORT_SUBMISSION',
  SURVEILLANCE_REGISTRY = 'SURVEILLANCE_REGISTRY',
  ALERTS = 'ALERTS',
  MAP = 'MAP',
  TRENDS = 'TRENDS',
  TASKS = 'TASKS',
  ADMIN_PANEL = 'ADMIN_PANEL',
  SUPPORT = 'SUPPORT',
  AI_BUDDY = 'AI_BUDDY',
  NEWS = 'NEWS',
  NEWS_MANAGEMENT = 'NEWS_MANAGEMENT',
  PROFILE = 'PROFILE',
  THREAT_MATRIX = 'THREAT_MATRIX'
}

export type LabStatus = 'Not Required' | 'Pending Collection' | 'Sample Collected' | 'Resulted - Positive' | 'Resulted - Negative';
export type IsolationStatus = 'Not Required' | 'Home Isolation' | 'Facility Isolation' | 'Emergency Quarantine';
export type TracingStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Suspended';

// Audit log entry for tracking system actions and user logins
export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details?: string;
  timestamp: string;
  category: string;
}

// System notification structure for internal alerts and messages
export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  readBy: string[];
  reportId?: string;
}

// Log entry for SMS alerts dispatched via the gateway
export interface SMSAlertLog {
  id: string;
  reportId: string;
  message: string;
  recipients: number;
  district: string;
  timestamp: string;
  status: string;
  gateway: string;
}
