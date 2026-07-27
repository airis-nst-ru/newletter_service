export interface Block {
  id: string;
  type: string;
  logoUrl?: string;
  presentsText?: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  paragraphs?: string;
  readMoreUrl?: string;
  tableHeaders?: string;
  tableRows?: string;
  closingParagraph?: string;
  sectionLabel?: string;
  quoteText?: string;
  quoteAuthor?: string;
  gridCardsTitle?: string;
  gridCards?: string;
  endingParagraph?: string;
  author?: string;
  sourcesTitle?: string;
  sources?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  text?: string;
  unsubscribeUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  htmlContent?: string;
  hidden?: boolean;
  backgroundColor?: string;
}

export interface NewsletterVersion {
  id: string;
  name: string | null;
  description: string | null;
  state: any;
  content: string;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
    email: string;
  };
}
