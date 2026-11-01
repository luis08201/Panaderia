// A small, self-contained playground. No form or analytics requests are made.
const rootStyle = getComputedStyle(document.documentElement);
function updateTypeSizes() {
  const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  for (const label of document.querySelectorAll('[data-size-for]')) {
    const sample = document.getElementById(label.dataset.sizeFor);
    if (!sample) continue;
    const pixels = parseFloat(getComputedStyle(sample).fontSize);
    label.textContent = `${Number(pixels.toFixed(2))}px / ${Number((pixels / rootSize).toFixed(4))}rem`;
  }
}
updateTypeSizes();
window.addEventListener('resize', updateTypeSizes);
for (const element of document.querySelectorAll('[data-token]')) {
  const value = rootStyle.getPropertyValue(element.dataset.token).trim();
  if (value) element.textContent = value;
}

const copyStatus = document.querySelector('#copy-status');
for (const button of document.querySelectorAll('[data-copy-token]')) {
  button.addEventListener('click', async () => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(button.dataset.copyToken).trim();
    try {
      await navigator.clipboard.writeText(value);
      copyStatus.textContent = `Copied ${value} to your clipboard.`;
    } catch {
      copyStatus.textContent = `Color value: ${value}. Select the value on the swatch to copy it manually.`;
    }
  });
}

const form = document.querySelector('#sg-form');
const formStatus = document.querySelector('#sg-form-status');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  formStatus.textContent = 'Example validated. Nothing has been sent.';
});
form.addEventListener('reset', () => { formStatus.textContent = ''; });

const filters = [...document.querySelectorAll('[data-sg-filter]')];
for (const button of filters) {
  button.addEventListener('click', () => {
    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter === button));
    document.querySelector('#sg-filter-status').textContent = `Sample selection: ${button.textContent.trim()}.`;
  });
}

// Keep the index useful without overriding native anchor navigation or focus.
const links = [...document.querySelectorAll('.sg-sidebar nav a')];
if ('IntersectionObserver' in window) {
  const visible = new Set();
  const sections = [...document.querySelectorAll('.sg-section')];
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target.id);
      else visible.delete(entry.target.id);
    }
    const first = sections.find((section) => visible.has(section.id));
    for (const link of links) {
      if (first && link.hash === `#${first.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }, { rootMargin: '-10% 0px -30% 0px' });
  for (const section of sections) observer.observe(section);
}
