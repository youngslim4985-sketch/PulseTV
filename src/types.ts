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
}

export interface ContentData {
  movies: ContentItem[];
  sports: ContentItem[];
  live_tv: ContentItem[];
}

export type View = "home" | "search" | "player";
