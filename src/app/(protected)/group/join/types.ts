export interface GroupSearchResult {
  data?: {
    id: string;
    name: string;
    description: string;
    code: string;
    isPrivate: boolean;
    logo: string | null;
    participants: number;
  } | null;
  serverError?: string;
}

export interface GroupPreviewData {
  name: string;
  logo: string | null;
  code: string;
  participants: number;
}
