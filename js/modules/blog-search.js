import { blogSearchSuggestions, rememberBlogQuery } from '../utils/blog.js';
import { h, icon } from '../utils/dom.js';

const HISTORY_KEY = 'crumb-oven:blog-searches:v1';

export function initBlogSearch(root, { posts, getCategory, onChange, onSubmit }) {
  const form = root.querySelector('#blog-search-form');
  const input = root.querySelector('#blog-search');
  const panel = root.querySelector('#blog-search-panel');
  const list = root.querySelector('#blog-suggestions');
  const empty = root.querySelector('#blog-suggestion-empty');
  const clear = root.querySelector('#blog-search-clear');
  const clearHistory = root.querySelector('#blog-search-history-clear');
  let recent = [];
  try { recent = rememberBlogQuery(JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'), ''); } catch { /* Search also works with browser storage disabled. */ }
  let suggestions = [];
  let active = -1;
  let timer;
  const saveHistory = () => { try { if (recent.length) localStorage.setItem(HISTORY_KEY, JSON.stringify(recent)); else localStorage.removeItem(HISTORY_KEY); } catch { /* Session-only fallback. */ } };
  const close = () => { panel.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; };
  const setActive = (index) => {
    active = index;
    for (const [i, option] of [...list.children].entries()) option.setAttribute('aria-selected', String(i === active));
    if (active >= 0 && list.children[active]) {
      input.setAttribute('aria-activedescendant', list.children[active].id);
      list.children[active].scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };
  const render = () => {
    clear.hidden = !input.value;
    suggestions = blogSearchSuggestions(posts, { category: getCategory(), query: input.value, recent });
    list.replaceChildren(...suggestions.map((item, index) => h('li', { id: `blog-suggestion-${index}`, role: 'option', 'aria-selected': 'false', 'data-suggestion-index': index }, icon(item.kind === 'recent' ? 'clock' : 'search'), h('span', {}, h('span', { class: 'blog-suggestion-label', text: item.label }), h('small', { text: item.detail })), h('span', { class: 'blog-suggestion-arrow', 'aria-hidden': 'true', text: '↗' }))));
    clearHistory.hidden = !recent.length;
    empty.hidden = suggestions.length !== 0;
    setActive(-1);
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };
  const submit = (value = input.value) => {
    clearTimeout(timer);
    input.value = value.trim().replace(/\s+/g, ' ');
    recent = rememberBlogQuery(recent, input.value);
    saveHistory();
    clear.hidden = !input.value;
    onSubmit();
    input.focus({ preventScroll: true });
    close();
  };
  form.addEventListener('submit', (event) => { event.preventDefault(); submit(); });
  input.addEventListener('focus', render);
  input.addEventListener('input', (event) => {
    if (event.isComposing) return;
    render();
    clearTimeout(timer);
    timer = setTimeout(onChange, 150);
  });
  input.addEventListener('compositionend', () => { render(); clearTimeout(timer); timer = setTimeout(onChange, 150); });
  input.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (panel.hidden) render();
      if (suggestions.length) setActive(event.key === 'ArrowDown' ? (active + 1) % suggestions.length : (active < 0 ? suggestions.length - 1 : (active - 1 + suggestions.length) % suggestions.length));
    }
    if (event.key === 'Enter' && !panel.hidden && active >= 0) { event.preventDefault(); submit(suggestions[active].value); }
  });
  list.addEventListener('pointerdown', (event) => { if (event.target.closest('[data-suggestion-index]')) event.preventDefault(); });
  list.addEventListener('click', (event) => { const option = event.target.closest('[data-suggestion-index]'); if (option) submit(suggestions[Number(option.dataset.suggestionIndex)].value); });
  clear.addEventListener('click', () => { clearTimeout(timer); input.value = ''; onChange(); input.focus(); render(); });
  clearHistory.addEventListener('click', () => { recent = []; saveHistory(); input.focus(); render(); });
  form.addEventListener('focusout', () => { setTimeout(() => { if (!form.contains(document.activeElement)) close(); }, 0); });
  document.addEventListener('click', (event) => { if (!form.contains(event.target)) close(); });
  clear.hidden = !input.value;
  return {
    sync() { clearTimeout(timer); clear.hidden = !input.value; close(); },
    refresh() { clearTimeout(timer); clear.hidden = !input.value; if (!panel.hidden) render(); },
  };
}
