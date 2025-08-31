export type ReadListResponse = {
  success: boolean;
  data: {
    id: number;
    user_id: number;
    series_id: string;
    chapter_id: string | null;
    created_at: string;
    updated_at: string;
  }[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export type UserResponse = {
  avatar_path: string | null;
  email: string;
  created_at: string;
  email_verified_at: string | null;
  id: number;
  name: string;
  comment_count: number;
  display_roles: string[];
};

export type GetUserResponse = {
  user: UserResponse;
};

export type CommentListResponse = {
  comments: {
    current_page: number;
    data: CommentResponse[];
    per_page: number;
    total: number;
    last_page: number;
  };
};

export type CommentResponse = {
  content: string;
  created_at: string;
  id: number;
  user: {
    id: number;
    name: string;
    display_roles: string[];
    avatar_path: string | null;
  };
  parent_id: number;
  replies?: CommentResponse[];
  reply_count: number;
  commentable: {
    title: string;
    type: string;
    id: string;
    uuid: string;
    series: {
      title: string;
      uuid: string;
    };
  };
  commentable_type: string;
};

export type CommentRepliesResponse = {
  replies: CommentResponse[];
};

export type RecentCommentResponse = CommentResponse;

export type RecentCommentListResponse = {
  comments: RecentCommentResponse[];
};

export type SeriesHomepageResponse = {
  data: {
    title: string;
    uuid: string;
    last_chapter_updated_at: string;
    chapters: {
      uuid: string;
      title: string;
      md_updated_at: string;
    }[];
  }[];
  total: number;
  current_page: number;
};
