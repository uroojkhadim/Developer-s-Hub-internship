export interface Post {
  id: string;
  userId: string;
  userAvatar?: string;
  userName: string;
  content: string;
  imageUrl?: string;
  likes: string[]; // Array of user IDs who liked the post
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
}
