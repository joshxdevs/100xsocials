export type MemberCategory = 'SUPER30' | 'SCHOOL';

export interface ProfileTagGroup {
  tags: string[];
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  phonePublic?: boolean;
  age?: number | null;
  city?: string | null;
  country?: string | null;
  about?: string | null;
  currentCompany?: string | null;
  hasJobOffers?: boolean;
  jobOffersDesc?: string | null;
  jobUrl?: string | null;
  salaryRange?: string | null;
  jobLocation?: string | null;
  activelyLooking?: boolean;
  resumeUrl?: string | null;
  resumeFilename?: string | null;
  atsScore?: number | null;
  atsFeedback?: string | null;
  techStack: string[];
  skills: string[];
  interests: string[];
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  category: MemberCategory;
  isComplete: boolean;
  createdAt: string;
  updatedAt?: string;
  aiTags?: ProfileTagGroup | null;
}

export interface ProfileFormData {
  avatar: string;
  username: string;
  fullName: string;
  phone: string;
  phonePublic: boolean;
  about: string;
  city: string;
  country: string;
  currentCompany: string;
  activelyLooking: boolean;
  hasJobOffers: boolean;
  jobOffersDesc: string;
  jobUrl: string;
  salaryRange: string;
  jobLocation: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  portfolioUrl: string;
  aiTags: string[];
  resumeUrl: string;
  resumeFilename: string;
  atsScore: number | null;
  atsFeedback: string;
  techStack: string[];
  skills: string[];
  interests: string[];
}

export interface Bookmark {
  id: string;
  recruiterId: string;
  profileId: string;
  profile: Profile;
  createdAt: string;
}

export interface RecruiterProfileResponse {
  account: {
    id: string;
    userId: string;
    companyName: string;
    website?: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  stats: {
    bookmarksCount: number;
  };
}
