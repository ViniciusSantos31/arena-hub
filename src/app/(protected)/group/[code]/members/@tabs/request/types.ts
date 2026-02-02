export interface MemberRequest {
  id: string;
  status: string;
  createdAt?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string | null;
  } | null;
}

export interface MemberCardProps {
  id: string;
  email?: string | null;
  image?: string | null;
  name?: string | null;
}
