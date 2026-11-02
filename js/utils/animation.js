const running = new WeakMap();
export const allowsMotion = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;

// Cancel an interrupted transition before starting another; the latest state wins.
export function animateVisibility(element, open) {
  if (!element) return;
  const previous = running.get(element);
  if (!previous && element.hidden === !open) return;
  const currentHeight = element.hidden ? 0 : element.getBoundingClientRect().height;
  previous?.cancel();
  running.delete(element);
  element.inert = !open;
  if (!allowsMotion() || !element.animate) { element.hidden = !open; element.style.removeProperty('overflow'); return; }
  element.hidden = false;
  const height = element.getBoundingClientRect().height;
  const style = getComputedStyle(element);
  const expanded = { height: `${height}px`, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom, opacity: 1 };
  const collapsed = { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 };
  const start = previous ? { ...expanded, height: `${currentHeight}px` } : open ? collapsed : expanded;
  const frames = [start, open ? expanded : collapsed];
  element.style.overflow = 'hidden';
  const animation = element.animate(frames, { duration: open ? 240 : 160, easing: 'cubic-bezier(.22,1,.36,1)' });
  running.set(element, animation);
  animation.finished.then(() => {
    if (running.get(element) !== animation) return;
    element.hidden = !open;
    element.style.removeProperty('overflow');
    running.delete(element);
  }).catch(() => {});
}

export function animateResults(element, children = [...element.children]) {
  if (!allowsMotion()) return;
  children.forEach((child, index) => child.animate?.(
    [{ opacity: .35, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 320, delay: Math.min(index, 5) * 25, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }
  ));
}
