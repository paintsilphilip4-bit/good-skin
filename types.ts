
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

export interface Appointment {
  id: string;
  patientId: string;
  specialistId: string;
  status: 'pending' | 'active' | 'completed' | 'in-consultation';
  scheduledTime: number;
  consultationFee: number;
  aiAnalysisSummary?: string; 
  aiConfidence?: number;
}

export interface PatientData {
  id: string;
  patientId: string; // Persistent UID
  phoneNumber: string; // Primary Key for Folder System
  folderId: string; // Display ID (e.g. GS-4421)
  name: string;
  age: number;
  attachedImages: string[];
  aiAnalysisJson: {
    condition: string;
    probability: number;
    severity: 'Low' | 'Medium' | 'High';
  };
}

export interface PrescriptionEntry {
  drugName: string;
  dosage: string;
  duration: string;
}

export interface MedicalRecord {
  clerkingNotes: string;
  historyDuration: string;
  historyTreatments: string;
  historyAllergies: string;
  labRequests: string[];
  prescriptionText: PrescriptionEntry[];
  labInvestigationRequest: string;
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

export interface AnalysisResult {
  condition: string;
  severityScore: number;
  confidence: number;
  description: string;
  potentialCauses: string[];
  recommendedIngredients: string[];
  urgency: 'Low' | 'Medium' | 'High';
  tips: string[];
}

export interface MedicalAnalysis {
  findings: string;
  diagnosis: string;
  confidence: string;
  explanation: string;
  treatment: string[];
  physicalFindings?: string;
  pathophysiology?: string;
  treatmentPlan?: string;
}

export interface Patient extends PatientData {
  gender: string;
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

export interface DashboardPatient extends Patient {
  status: 'waiting' | 'processing' | 'scheduled' | 'in-consultation' | 'assigned' | 'completed';
  requestTime: number;
  scheduledTime?: number;
  aiFindings?: string;
}

export interface ConsultationHistoryRecord extends MedicalRecord {
  id: string;
  patientId: string;
  phoneNumber: string;
  patientName: string;
  date: string;
  condition: string;
  imageUrl: string;
  analysis: AnalysisResult;
  fee: number;
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
