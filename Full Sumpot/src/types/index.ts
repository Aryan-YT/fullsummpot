export interface User {
  id: string;
  username: string;
  email: string;
  niche: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  niche: string;
  memberCount: number;
  bannerUrl?: string;
  createdAt: string;
  isMember?: boolean;
}

export interface Link {
  id: string;
  communityId: string;
  userId: string;
  username: string;
  youtubeUrl: string;
  title: string;
  thumbnailUrl: string;
  clickCount: number;
  createdAt: string;
  isClickedByMe?: boolean;
}

export interface Points {
  availablePoints: number;
  pointsEarnedToday: number;
  viewsGivenToday: number;
}

export interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
