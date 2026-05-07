const keys = 'qwertyuiopasdfghjklzxcvbnm'.split('');
const map = {};
for (const k of keys) {
  const el = document.querySelector('.key[data-key="' + k + '"] .key-hint');
  map[k] = el ? el.textContent.trim() : 'MISSING';
}
JSON.stringify(map, null, 2);
