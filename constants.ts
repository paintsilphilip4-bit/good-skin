
import { Doctor, Article, Testimonial, RoutineTip } from './types';

export const APP_LOGO_URL = 'https://github.com/paintsilphilip4-bit/grand-opening/blob/main/app%20logo.png?raw=true';

// Enforced Global Specialist ID for Zero-Error Handshake
export const ACTIVE_CLINIC_ID = 'GH-SKIN-001';
export const ADMIN_EMAIL = 'admin@goodskin.ai';

export interface Practitioner {
  id: string;
  name: string;
  title: string;
  isOnline: boolean;
  bio: string;
  avatar: string;
  waitMinutes: number;
}

export const PRACTITIONER_REGISTRY: Practitioner[] = [
  {
    id: ACTIVE_CLINIC_ID,
    name: 'Dr. Sarah Lin',
    title: 'Senior Dermatologist',
    isOnline: true,
    bio: 'Specializing in inflammatory acne and hormonal skin conditions with 12+ years of clinical practice.',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200&h=200',
    waitMinutes: 15
  },
  {
    id: 'DOC_MICHAEL_002',
    name: 'Dr. Michael Ross',
    title: 'Clinical Director',
    isOnline: true,
    bio: 'Board-certified expert in pediatric dermatology and rare skin disorders.',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200',
    waitMinutes: 25
  }
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: ACTIVE_CLINIC_ID,
    name: "Dr. Sarah Lin",
    specialty: "Acne Specialist",
    rating: 4.9,
    reviews: 124,
    price: 85,
    image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200&h=200",
    available: true,
    licenseNumber: "MD-882104",
    photo: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200&h=200",
    totalEarnings: 12450,
    stripeId: "acct_123"
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
