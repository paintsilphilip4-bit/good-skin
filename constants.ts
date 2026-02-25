
import { Doctor, Article, Testimonial, RoutineTip } from './types';

export const APP_LOGO_URL = 'https://raw.githubusercontent.com/paintsilphilip4-bit/grand-opening/refs/heads/main/app%20logo.png';

// Enforced Global Specialist ID for Zero-Error Handshake
export const ACTIVE_CLINIC_ID = 'GH-SKIN-001';
export const ADMIN_EMAIL = 'admin@goodskin.ai';

// Consultant Newman Credentials
export const NEWMAN_EMAIL = 'newman@goodskin.com';
export const NEWMAN_MDC = 'MDC/REG/7721-D';

// Consultant Araba Credentials
export const ARABA_EMAIL = 'araba@goodskin.com';
export const ARABA_MDC = 'ARABA';

export interface Practitioner {
  id: string;
  name: string;
  title: string;
  isOnline: boolean;
  bio: string;
  avatar: string;
  waitMinutes: number;
  experience?: string;
  specialty_tags?: string[];
}

// Global utility for generating video consult rooms
export const generateConsultationRoom = (caseId: string) => `https://goodskin.daily.co/consultation-${caseId}`;

export const PRACTITIONER_REGISTRY: Practitioner[] = [
  {
    id: 'DOC_NEWMAN_001',
    name: 'Dr. Newman',
    title: 'Consultant Dermatologist',
    isOnline: true,
    bio: 'Board-certified consultant specializing in African skin types and complex inflammatory conditions with over 10 years of clinical expertise.',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400',
    waitMinutes: 5,
    experience: '10+ Years Experience',
    specialty_tags: ['African Skin Specialist', 'MDC Verified']
  },
  {
    id: 'DOC_ARABA_002',
    name: 'Dr. Araba Paintsil',
    title: 'Pediatrics Dermatology Consultant',
    isOnline: true,
    bio: 'Specialist in pediatric skin conditions and adolescent dermatology with a focus on gentle, effective treatment protocols.',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400',
    waitMinutes: 8,
    experience: '6 Years Experience',
    specialty_tags: ['Pediatrics', 'Clinical Lead']
  }
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'DOC_NEWMAN_001',
    name: "Dr. Newman",
    specialty: "Consultant Dermatologist",
    rating: 5.0,
    reviews: 842,
    price: 100,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400",
    available: true,
    licenseNumber: NEWMAN_MDC,
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400",
    totalEarnings: 0,
    stripeId: "acct_newman_001",
    bio: "Specialized in African Skin Types"
  },
  {
    id: 'DOC_ARABA_002',
    name: "Dr. Araba Paintsil",
    specialty: "Pediatrics Dermatology Consultant",
    rating: 4.9,
    reviews: 428,
    price: 100,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400",
    available: true,
    licenseNumber: ARABA_MDC,
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400",
    totalEarnings: 0,
    stripeId: "acct_araba_002",
    bio: "Specialist in Pediatric & Adolescent Dermatology"
  }
];

export interface AdviceItem {
  title: string;
  text: string;
  image: string;
}

export const DERMATOLOGIST_ADVICE: AdviceItem[] = [
  {
    title: "The SPF Rule",
    text: "Always wear SPF 30+, even on cloudy days or when indoors near windows.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80"
  }
];

export const EDUCATION_ARTICLES: Article[] = [
  {
    id: 1,
    title: "Understanding Your Skin Barrier",
    category: "Science",
    readTime: "5 min",
    image: "https://picsum.photos/seed/skin1/400/200"
  }
];

export const SKINCARE_ROUTINE_TIPS: RoutineTip[] = [
    {
        id: 1,
        title: "Double Cleanse",
        description: "Start with an oil-based cleanser followed by a water-based one.",
        image: "https://picsum.photos/seed/cleanse/300/300",
        tag: "PM Routine"
    }
];

export const CLIENT_TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        name: "Jessica M.",
        treatment: "Acne Treatment",
        text: "The AI analysis was spot on! Dr. Sarah helped me clear my skin in 3 months.",
        image: "https://picsum.photos/seed/user1/100/100"
    }
];
