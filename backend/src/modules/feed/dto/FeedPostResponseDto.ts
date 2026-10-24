export interface FeedAuthorDto {
  id: string;
  name: string;
  profilePhoto?: string | undefined;
  location?: string | undefined;
}

export interface FeedMediaDto {
  url: string;
  contentType: string;
  order: number;
}

export interface FeedPostResponseDto {
  id: string;
  caption: string;
  media: FeedMediaDto[];
  author: FeedAuthorDto;
  createdAt: Date;
}

export interface GetFeedResponseDto {
  posts: FeedPostResponseDto[];
  hasMore: boolean;
  nextCursor?: string | undefined;
}
