import { t } from '../i18n.js';
import { withLang } from '../locale-data.js';
import { getSearchIndex } from './data-loader.js';
import { h } from '../utils/dom.js';
import { searchSite, SEARCH_TYPES, searchTypeKey } from '../utils/site-search.js';
import { animateVisibility, animateResults } from '../utils/animation.js';

export function initSiteSearch() {
  const toggle = document.querySelector('#site-search-toggle');
  const panel = document.querySelector('#site-search-panel');
  const form = document.querySelector('#site-search-form');
  if (!toggle || !panel || !form) return;
  const input = form.querySelector('input');
  const list = document.querySelector('#site-search-suggestions');
  const hint = document.querySelector('#site-search-hint');
  let matches = [], active = -1, revision = 0;
  const closeSuggestions = () => { list.hidden = true; input.setAttribute('aria-expanded','false'); input.removeAttribute('aria-activedescendant'); active = -1; };
  const close = () => { revision++; toggle.setAttribute('aria-expanded','false'); animateVisibility(panel, false); closeSuggestions(); };
  const suggest = async () => {
    const request = ++revision;
    const query = input.value.trim();
    closeSuggestions();
    hint.textContent = query ? t('search.searching') : t('search.hint');
    if (!query) return;
    try {
      const index = await getSearchIndex();
      if (request !== revision || toggle.getAttribute('aria-expanded') !== 'true') return;
      matches = searchSite(index,query).slice(0,5);
      list.replaceChildren(...matches.map((item,i)=>h('li',{role:'option',id:`site-search-option-${i}`,'aria-selected':'false','data-search-option':i},h('span',{text:item.title}),h('small',{text:t(`type.${item.type}`)}))));
      list.hidden = !matches.length;
      input.setAttribute('aria-expanded',String(matches.length>0));
      hint.textContent = matches.length ? t('search.hintKeys') : t('search.none');
    } catch { if (request === revision) hint.textContent = t('search.enter'); }
  };
  toggle.addEventListener('click',()=>{
    if (toggle.getAttribute('aria-expanded') === 'true') { close(); return; }
    document.querySelector('.nav-toggle[aria-expanded="true"]')?.click();
    animateVisibility(panel, true); toggle.setAttribute('aria-expanded','true'); input.focus(); suggest();
  });
  input.addEventListener('input', (event)=>{ if (!event.isComposing) suggest(); });
  input.addEventListener('compositionend',suggest);
  input.addEventListener('keydown',(event)=>{
    if (event.isComposing) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); toggle.focus(); }
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !list.hidden) {
      event.preventDefault(); active = (active + (event.key === 'ArrowDown' ? 1 : matches.length-1) + matches.length) % matches.length;
      [...list.children].forEach((option,i)=>option.setAttribute('aria-selected',String(i===active)));
      input.setAttribute('aria-activedescendant',list.children[active].id);
      list.children[active].scrollIntoView({block:'nearest'});
    }
    if (event.key === 'Enter' && active >= 0) input.value = matches[active].title;
  });
  list.addEventListener('pointerdown',(event)=>{ if(event.target.closest('[data-search-option]')) event.preventDefault(); });
  list.addEventListener('click',(event)=>{const option=event.target.closest('[data-search-option]');if(option){input.value=matches[Number(option.dataset.searchOption)].title;form.requestSubmit();}});
  form.addEventListener('submit',()=>{ input.value=input.value.trim().replace(/\s+/g,' ').slice(0,200); });
  document.addEventListener('click',(event)=>{if(!event.target.closest('.site-header'))close();});
  document.addEventListener('focusin',(event)=>{if(!event.target.closest('.site-header'))close();});
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape' && !panel.hidden){close();toggle.focus();}});
  document.querySelector('.nav-toggle')?.addEventListener('click',close);
}

export async function init() {
  const form = document.querySelector('#results-search-form');
  const input = form.querySelector('input');
  const status = document.querySelector('#search-status');
  const filters = document.querySelector('#search-type-filters');
  const results = document.querySelector('#search-results');
  const more = document.querySelector('#search-load-more');
  let index, type = '', count = 12, matches = [], filtered = [];
  const typeName = (value, plural = false) => t(searchTypeKey(value, plural));
  const render = () => {
    const query = input.value.trim().slice(0,200);
    matches = searchSite(index,query);
    filtered = matches.filter((item)=>!type || item.type===type);
    filters.hidden = !query;
    filters.replaceChildren(...['',...SEARCH_TYPES].map((value)=>h('button',{type:'button',class:'chip','aria-pressed':String(type===value),'data-search-type':value,text:`${value ? typeName(value, true) : t('search.all')} (${value ? matches.filter((item)=>item.type===value).length : matches.length})`})));
    const visible=filtered.slice(0,count);
    status.textContent = !query ? t('search.prompt') : `${filtered.length} ${filtered.length===1?t('search.one'):t('search.many')} “${query}”${type ? ` ${t('search.in', { where: typeName(type, true).toLowerCase() })}` : ''}${filtered.length ? ` · ${t('search.showing', { shown: visible.length, total: filtered.length })}` : `. ${t('search.another')}`}`;
    results.replaceChildren(...visible.map((item)=>h('article',{class:'search-result'},h('p',{class:'search-result__type',text:typeName(item.type)}),h('h2',{},h('a',{href:item.url,text:item.title})),h('p',{text:item.description}),h('a',{href:item.url,class:'search-result__link',text:t('search.view', { type: typeName(item.type).toLowerCase() }),'aria-label':t('card.detailsFor', { name: item.title })}))));
    animateResults(results);
    more.hidden=visible.length>=filtered.length;
  };
  const readUrl=()=>{const params=new URLSearchParams(location.search);input.value=(params.get('q')||'').slice(0,200);type=SEARCH_TYPES.includes(params.get('type'))?params.get('type'):'';count=12;};
  const saveUrl=()=>{const params=new URLSearchParams();if(input.value.trim())params.set('q',input.value.trim());if(type)params.set('type',type);withLang(params);history.pushState(null,'',`${location.pathname}${params.size?'?'+params:''}`);};
  const load=async()=>{status.textContent=t('search.loading');results.setAttribute('aria-busy','true');try{index=await getSearchIndex();readUrl();render();}catch{status.textContent=t('search.failed');results.replaceChildren(h('button',{type:'button',class:'btn btn--outline',text:t('search.retry'),onclick:load}));}finally{results.removeAttribute('aria-busy');}};
  form.addEventListener('submit',(event)=>{if(!index)return;event.preventDefault();type='';count=12;saveUrl();render();});
  filters.addEventListener('click',(event)=>{const button=event.target.closest('[data-search-type]');if(button){type=button.dataset.searchType;count=12;saveUrl();render();filters.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});}});
  more.addEventListener('click',()=>{const next=count;count+=12;render();results.children[next]?.querySelector('a')?.focus({preventScroll:true});});
  window.addEventListener('popstate',()=>{if(index){readUrl();render();}});
  await load();
}
