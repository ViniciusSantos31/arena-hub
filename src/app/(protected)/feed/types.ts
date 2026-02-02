export interface FeedGroup {
  id: string;
  name: string;
  description: string;
  code: string;
  isPrivate: boolean;
  logo: string | null;
  createdAt: string;
  isMember?: string;
}
