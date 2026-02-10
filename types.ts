
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
  lastScanUrl?: string;
  history?: {
    chiefComplaint: string;
    hpc: string;
    pmh: string;
    medications: string;
    allergies: string;
  };
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
