export interface FeedGroup {
  id: string;
  name: string;
  description: string | null;
  code: string;
  isPrivate: boolean;
  logo: string | null;
  createdAt: Date;
  isMember?: string;
}
