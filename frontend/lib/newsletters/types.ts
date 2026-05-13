export type NewsletterAuthor = {
  id: string;
  email: string;
  username: string;
};

export type NewsletterContent = {
  id: string;
  title: string;
  content: string;
  newsletterId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Newsletter = {
  id: string;
  dueDate: string;
  sentDate: string | null;
  sent: boolean;
  supportingNewsSection: boolean;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: NewsletterAuthor;
  content: NewsletterContent | null;
};
