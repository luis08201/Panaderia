import { normalize } from './normalize.js';

export const SEARCH_TYPES = ['Product', 'Article', 'Page', 'Category'];
export function searchSite(documents, query) {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (!terms.length) return [];
  return documents.map((document, order) => {
    const title = normalize(`${document.title} ${document.titleEs || ''}`);
    const content = normalize(`${document.title} ${document.titleEs || ''} ${document.description} ${document.descriptionEs || ''} ${document.text}`);
    if (!terms.every((term) => content.includes(term))) return null;
    const score = (title === normalize(query) ? 100 : 0) + terms.reduce((sum, term) => sum + (title.includes(term) ? 10 : 1), 0);
    return { document, score, order };
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.order - b.order).map(({ document }) => document);
}
