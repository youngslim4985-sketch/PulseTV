/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ContentItem {
  id: string;
  title: string;
  thumb: string;
  url: string;
  duration?: number;
  isLive?: boolean;
  league?: string;
  region?: string;
}

export interface ContentData {
  movies: ContentItem[];
  sports: ContentItem[];
  live_tv: ContentItem[];
  basketball?: {
    [league: string]: ContentItem[];
  };
  soccer?: {
    [competition: string]: ContentItem[];
  };
}

export type View = "home" | "search" | "player" | "profiles";

export interface Profile {
  id: string;
  name: string;
  avatar: string; // Color or emoji
  favorites: string[];
  resumePositions: Record<string, number>; // videoId -> seconds
}
