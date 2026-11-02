import { t } from '../i18n.js';
import { h } from '../utils/dom.js';

export function initDemoContacts(settings) {
  const demo = Boolean(settings.demoNotice);
  let dialog;
  let trigger;
  const show = () => {
    if (!dialog) {
      const close = h('button', { type:'button', class:'btn btn--primary', text:t('demo.close'), autofocus:true, onclick:()=>dialog.close() });
      dialog = h('dialog', { class:'demo-contact-dialog', 'aria-labelledby':'demo-contact-title', 'aria-describedby':'demo-contact-description' },
        h('h2',{ id:'demo-contact-title',text:t('demo.contactTitle') }),
        h('p',{ id:'demo-contact-description',text:t('demo.contactDescription') }),close);
      document.body.append(dialog);
      dialog.addEventListener('close',()=>trigger?.focus({preventScroll:true}));
    }
    if (!dialog.open) dialog.showModal();
  };
  document.addEventListener('click',(event)=>{
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href.includes('demo=contact') || (demo && /^(https:\/\/wa\.me\/|tel:)/.test(href))) {
      event.preventDefault(); trigger=link; show();
    }
  });
  if (new URLSearchParams(location.search).get('demo') === 'contact') show();
}
