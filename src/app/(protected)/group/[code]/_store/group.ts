import { create } from "zustand";

interface Member {
  organizationId: string;
  id: string;
  createdAt: Date;
  userId: string;
  score: number;
  role: "member" | "admin" | "guest" | "owner" | null;
}

interface MemberStore {
  member: Member | null;
  isLoading: boolean;
  error: string | null;
  setMember: (member: Member) => void;
  clearMember: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMemberStore = create<MemberStore>()((set) => ({
  member: null,
  isLoading: false,
  error: null,
  setMember: (member) => set({ member, error: null }),
  clearMember: () => set({ member: null, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
