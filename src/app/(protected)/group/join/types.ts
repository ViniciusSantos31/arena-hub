export interface GroupSearchResult {
  data: {
    code: string;
    id: string;
    name: string;
    createdAt: Date;
    slug: string | null;
    logo: string | null;
    private: boolean;
    maxPlayers: number;
    metadata: string | null;
    isAlreadyMember: boolean;
    participants: number;
  };
  serverError?: string;
}

export interface GroupPreviewData {
  name: string;
  logo: string | null;
  code: string;
  participants: number;
}
