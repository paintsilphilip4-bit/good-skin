import { Doctor, Article, Testimonial, RoutineTip } from './types';

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Lin",
    specialty: "Acne Specialist",
    rating: 4.9,
    reviews: 124,
    price: 85,
    image: "https://picsum.photos/seed/doc1/200/200",
    available: true
  },
  {
    id: 2,
    name: "Dr. James Wilson",
    specialty: "Dermatologist",
    rating: 4.8,
    reviews: 98,
    price: 95,
    image: "https://picsum.photos/seed/doc2/200/200",
    available: true
  },
  {
    id: 3,
    name: "Dr. Emily Chen",
    specialty: "Cosmetic Surgery",
    rating: 5.0,
    reviews: 215,
    price: 150,
    image: "https://picsum.photos/seed/doc3/200/200",
    available: false
  },
  {
    id: 4,
    name: "Dr. Michael Ross",
    specialty: "Pediatric Derm",
    rating: 4.7,
    reviews: 67,
    price: 110,
    image: "https://picsum.photos/seed/doc4/200/200",
    available: true
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
  },
  {
    title: "Hands Off",
    text: "Avoid touching your face throughout the day to prevent bacteria transfer.",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80"
  },
  {
    title: "Simple Is Better",
    text: "Consistency with a simple routine is more effective than expensive products.",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80"
  },
  {
    title: "Gentle Drying",
    text: "Pat your face dry with a clean towel; rubbing can cause micro-tears.",
    image: "https://images.unsplash.com/photo-1552046122-03184de85e08?auto=format&fit=crop&q=80"
  },
  {
    title: "Barrier Care",
    text: "Exfoliate no more than twice a week to avoid damaging your skin's barrier.",
    image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80"
  },
  {
    title: "Internal Glow",
    text: "Stay hydrated! Drinking water helps maintain skin elasticity and health.",
    image: "https://images.unsplash.com/photo-1548919973-5cfe5d4fc494?auto=format&fit=crop&q=80"
  }
];

export const EDUCATION_ARTICLES: Article[] = [
  {
    id: 1,
    title: "Understanding Your Skin Barrier",
    category: "Science",
    readTime: "5 min",
    image: "https://picsum.photos/seed/skin1/400/200"
  },
  {
    id: 2,
    title: "Morning vs. Night Routine",
    category: "Lifestyle",
    readTime: "3 min",
    image: "https://picsum.photos/seed/skin2/400/200"
  },
  {
    id: 3,
    title: "SPF: The Anti-Aging Secret",
    category: "Prevention",
    readTime: "4 min",
    image: "https://picsum.photos/seed/skin3/400/200"
  }
];

export const SKINCARE_ROUTINE_TIPS: RoutineTip[] = [
    {
        id: 1,
        title: "Double Cleanse",
        description: "Start with an oil-based cleanser followed by a water-based one.",
        image: "https://picsum.photos/seed/cleanse/300/300",
        tag: "PM Routine"
    },
    {
        id: 2,
        title: "Vitamin C Serum",
        description: "Apply in the morning to brighten and protect against pollution.",
        image: "https://picsum.photos/seed/vitaminc/300/300",
        tag: "AM Routine"
    },
    {
        id: 3,
        title: "Moisturize",
        description: "Lock in hydration immediately after washing your face.",
        image: "https://picsum.photos/seed/moisture/300/300",
        tag: "Daily"
    }
];

export const CLIENT_TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        name: "Jessica M.",
        treatment: "Acne Treatment",
        text: "The AI analysis was spot on! Dr. Sarah helped me clear my skin in 3 months.",
        image: "https://picsum.photos/seed/user1/100/100"
    },
    {
        id: 2,
        name: "David K.",
        treatment: "Eczema Relief",
        text: "Finally found a routine that doesn't irritate my sensitive skin. Highly recommend.",
        image: "https://picsum.photos/seed/user2/100/100"
    }
];