
export type UserRole = 'client' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  available: boolean;
  bio?: string;
}

export interface AnalysisResult {
  condition: string;
  severityScore: number; // 1-10
  confidence: number; // 0-100
  description: string;
  potentialCauses: string[];
  recommendedIngredients: string[];
  urgency: 'Low' | 'Medium' | 'High';
  tips: string[];
}

export interface MedicalAnalysis {
  physicalFindings: string;
  pathophysiology: string;
  treatmentPlan: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  // Added image property to support profile or placeholder images in dashboard views
  image?: string;
  lastScanUrl?: string;
  history?: {
    chiefComplaint: string;
    hpc: string;
    pmh: string;
    medications: string;
    allergies: string;
  };
}

// Added DashboardPatient to fix missing type errors in App.tsx
export interface DashboardPatient extends Patient {
  status: 'waiting' | 'processing' | 'scheduled';
  requestTime: number;
  scheduledTime?: number; // timestamp for the appointment
  remindersSent?: {
    twentyFourHour: boolean;
    thirtyMinute: boolean;
  };
}

export interface ConsultationHistoryRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  condition: string;
  imageUrl: string;
  notes: string;
  analysis: AnalysisResult;
  clinicalAnalysis?: MedicalAnalysis;
}

export interface ScanResult {
  id: string;
  date: string;
  imageUrl: string;
  analysis: AnalysisResult;
}

export interface Article {
  id: number;
  title: string;
  category: string;
  readTime: string;
  image: string;
}

export interface Testimonial {
  id: number;
  name: string;
  treatment: string;
  text: string;
  image: string;
}

export interface RoutineTip {
  id: number;
  title: string;
  description: string;
  image: string;
  tag: string;
}
