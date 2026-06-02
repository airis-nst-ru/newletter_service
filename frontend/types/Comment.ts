export interface CommentReply {
  id: string;
  commentId: string;
  authorId?: string | null;
  author?: { id: string; username: string; email: string } | null;
  type: 'text' | 'voice';
  text?: string | null;
  voiceUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  newsletterId: string;
  blockId: string;
  authorId?: string | null;
  author?: { id: string; username: string; email: string } | null;
  content: string;
  resolved: boolean;
  replies?: CommentReply[];
  createdAt: string;
  updatedAt: string;
}