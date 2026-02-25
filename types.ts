
export type UserRole = 'client' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface SpecialistProfile {
  id: string;
  name: string;
  licenseNumber: string;
  photo: string;
  totalEarnings: number;
  stripeId: string;
}

export interface Doctor extends SpecialistProfile {
  specialty: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  available: boolean;
  bio?: string;
}

/**
 * AI Analysis Result Interface
 * Professional Dermatological Schema V5.1 (Dual Layer)
 */
export interface AnalysisResult {
  // LAYER 1: Specialist Data
  primary_diagnosis: string;
  confidence_score: number;
  morphology: string;
  distribution: string;
  clinical_markers: string; // ABCDE or 7-point checklist summary
  fitzpatrick_type: string;
  differential_diagnoses: string[];
  urgency: 'Low' | 'Medium' | 'High';
  modality_recommendation: 'Physical Biopsy Required' | 'Video Consultation Suitable';
  
  // LAYER 2: Patient Summary
  patient_explanation: string;
  patient_causes: string;
  patient_advice: string[];

  // Backward compatibility fields
  recommended_next_step: string;
  condition: string;
  diagnosis: string;
  findings: string;
  pathophysiology: string;
  confidence: string;
  treatment_plan: string[];
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

// Adding missing types for cross-component compatibility
export interface PrescriptionEntry {
  drugName: string;
  dosage: string;
  frequency: string;
}

export interface ConsultationHistoryRecord {
  id: string;
  date: string;
  imageUrl: string;
  patientName: string;
  condition: string;
  fee: number;
  notes?: string;
}

export interface DashboardPatient {
  id: string;
  name: string;
  phone: string;
}

export interface MedicalAnalysis {
  physicalFindings: string;
  pathophysiology: string;
  treatmentPlan: string;
}
