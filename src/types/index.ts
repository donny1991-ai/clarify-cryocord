// Type definitions for the application

export interface BackendResponse {
  complianceSummary: string;
  customerAnswer: string;
}

export interface QueryRequest {
  question: string;
}

export interface Message {
  id: string;
  question: string;
  complianceSummary: string;
  customerAnswer: string;
  timestamp: Date;
}

export type ViewType = 'login' | 'app' | 'admin';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}
