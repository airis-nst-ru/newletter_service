export interface Newsletter {
  id: string;
  dueDate: string;
  sent: boolean;
  status?: string;
  hasSupportingNews: boolean;
  editionNumber?: number | null;
  createdBy: {
    id: string;
    email: string;
    username: string;
  };
  content?: {
    title: string;
    content: string;
    state?: string | any;
  } | null;
}