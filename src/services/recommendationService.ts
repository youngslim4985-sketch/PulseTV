/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentData, ContentItem } from "../types";

export function getRecommendations(
  data: ContentData,
  history: string[]
): ContentItem[] {
  if (history.length === 0) return [];

  // 1. Calculate category affinity
  const categoryScores: Record<string, number> = {
    movies: 0,
    sports: 0,
    live_tv: 0,
  };

  history.forEach((id) => {
    if (data.movies.some((m) => m.id === id)) categoryScores.movies++;
    else if (data.sports.some((s) => s.id === id)) categoryScores.sports++;
    else if (data.live_tv.some((l) => l.id === id)) categoryScores.live_tv++;
    else if (data.basketball) {
       Object.values(data.basketball).flat().forEach(item => {
         if (item.id === id) categoryScores.sports += 1.5; // Favor basketball
       });
    }
    else if (data.soccer) {
       Object.values(data.soccer).flat().forEach(item => {
         if (item.id === id) categoryScores.sports += 1.5; // Favor soccer
       });
    }
  });

  // 2. Sort categories by affinity
  const sortedCategories = Object.entries(categoryScores).sort(
    ([, a], [, b]) => b - a
  );

  // 3. Pick items from top categories that haven't been watched yet
  const recommendations: ContentItem[] = [];
  const watchedSet = new Set(history);

  for (const [category] of sortedCategories) {
    const categoryItems = data[category as keyof Pick<ContentData, 'movies' | 'sports' | 'live_tv'>];
    if (Array.isArray(categoryItems)) {
      const unwatched = categoryItems.filter((item) => !watchedSet.has(item.id));
      recommendations.push(...unwatched);
    }
    if (recommendations.length >= 8) break;
  }

  // 4. Fallback: If everything watched, just suggest the top category's items again
  if (recommendations.length === 0) {
    const topCategory = sortedCategories[0][0] as keyof Pick<ContentData, 'movies' | 'sports' | 'live_tv'>;
    const fallbackItems = data[topCategory];
    return Array.isArray(fallbackItems) ? fallbackItems.slice(0, 4) : [];
  }

  return recommendations.slice(0, 10);
}
