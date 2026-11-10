// Tiny DOM helpers shared by UI modules.
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null) el.append(c);
  return el;
}

/** Set textContent only when it changed (avoids layout churn). */
export function setText(el, text) {
  if (el.textContent !== text) el.textContent = text;
}

export function setBar(barEl, fraction) {
  const pct = `${Math.max(0, Math.min(1, fraction || 0)) * 100}%`;
  const fill = barEl.firstChild;
  if (fill.style.width !== pct) fill.style.width = pct;
}

export function bar(extraClass = '') {
  return h('div', { class: `bar ${extraClass}` }, h('i'));
}
