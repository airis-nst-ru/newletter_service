export interface Newsletter {
  id: string;
  dueDate: string;
  sent: boolean;
  supportingNewsSection: boolean;
  editionNumber?: number | null;
  createdBy: {
    id: string;
    email: string;
    username: string;
  };
  content?: {
    title: string;
    content: string;
    state?: string;
  } | null;
}