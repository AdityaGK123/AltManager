import { create } from 'zustand';

interface UserProfile {
  roleTitle?: string;
  experienceYears?: number;
  careerGoals?: string;
  currentChallenges?: string;
  managerTone?: 'supportive' | 'direct' | 'balanced';
  onboardingCompleted?: boolean;
  level?: number;
  experiencePoints?: number;
}

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : updates,
    })),
}));
