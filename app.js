/* ingredients.md is the only inventory source. No remote services or build step. */
const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const key = (name) => name.trim().toLowerCase().replace(/liqueuer/g, 'liqueur');
function parseInventory(markdown) {
  const items = new Map();
  let category = 'Other';
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) category = heading[1].trim();
    const bullet = line.match(/^\s*[-*+]\s+(.+?)\s*$/);
    if (!bullet) continue;
    const out = /\[x\]/i.test(bullet[1]);
    const name = bullet[1].replace(/\[[ x]\]/ig, '').trim();
    if (!name) continue;
    const id = key(name);
    if (items.has(id)) items.get(id).out ||= out;
    else items.set(id, {id, name: name.replace(/liqueuer/i, 'liqueur'), category, out});
  }
  return [...items.values()];
}
let inventory = [], recipes = [], purchased = {};
try { purchased = JSON.parse(localStorage.getItem('home-bar-purchased') || '{}') || {}; } catch { /* Storage may be disabled. */ }
const inStock = (name) => inventory.some(item => item.id === key(name) && !item.out);
const missing = (recipe) => recipe.ingredients.filter(([,name]) => !inStock(name));
const stockMessage = (recipe) => { const count = missing(recipe).length; return count ? `${count} ingredient${count === 1 ? '' : 's'} missing` : 'Mixing ingredients in stock'; };
function renderRecipes() {
  const query = $('#search').value.trim().toLowerCase();
  const filter = $('#availability').value;
  const visible = recipes.filter(recipe => {
    const count = missing(recipe).length;
    return (filter === 'all' || (filter === 'ready' && !count) || (filter === 'one' && count === 1)) && `${recipe.name} ${recipe.tag} ${recipe.ingredients.map(i => i[1]).join(' ')}`.toLowerCase().includes(query);
  }).sort((a,b) => missing(a).length - missing(b).length || a.name.localeCompare(b.name));
  $('#results').textContent = `${visible.length} COCKTAIL${visible.length === 1 ? '' : 'S'}`;
  $('#cards').innerHTML = visible.length ? visible.map(recipe => `<article class="card"><div class="card-art ${escapeHTML(recipe.colour)}" aria-hidden="true"><div class="mini-glass"></div></div><div class="card-body"><span class="tag">${escapeHTML(recipe.tag)}</span><h3>${escapeHTML(recipe.name)}</h3><span class="badge ${missing(recipe).length ? '' : 'ready'}">${stockMessage(recipe)}</span><p>${escapeHTML(recipe.style)}</p><p class="ingredients">${recipe.ingredients.map(([,name]) => escapeHTML(name === 'Egg' ? 'Egg white' : name)).join(' · ')}</p><button class="recipe-button" data-recipe="${recipes.indexOf(recipe)}" aria-label="View ${escapeHTML(recipe.name)} recipe">View recipe <span aria-hidden="true">↗</span></button></div></article>`).join('') : '<p>No cocktails match. Try another search or availability filter.</p>';
}
function openRecipe(index) {
  const recipe = recipes[index];
  if (!recipe) return;
  $('#recipe-detail').innerHTML = `<p class="eyebrow">${escapeHTML(recipe.style)} · ONE SERVING</p><h2 id="recipe-title">${escapeHTML(recipe.name)}</h2><p class="badge">${stockMessage(recipe)}</p><h3>Ingredients</h3><ul>${recipe.ingredients.map(([amount,name,unit]) => `<li class="${inStock(name) ? '' : 'missing'}">${amount} ${unit || 'ml'} ${escapeHTML(name === 'Egg' ? 'pasteurised egg white' : name)}${inStock(name) ? '' : ` <small>— ${inventory.some(i => i.id === key(name)) ? 'out of stock' : 'not in your bar'}</small>`}</li>`).join('')}</ul>${recipe.optional ? `<p class="hint">Optional: ${escapeHTML(recipe.optional)}</p>` : ''}<h3>Method</h3><p>${escapeHTML(recipe.method)}</p><h3>Finish</h3><p>${escapeHTML(recipe.garnish)}</p><p class="hint">Garnishes are not included in the stock check. Have ice ready. Rich sugar syrup means 2 parts sugar to 1 part water by weight; it is not assumed to be in your bar.</p><p><a href="https://www.diffordsguide.com/cocktails/recipe/${escapeHTML(recipe.source)}" target="_blank" rel="noopener noreferrer">Original recipe at Difford’s Guide ↗</a></p><p class="hint">Measures follow Difford’s metric convention (30 ml per fl oz). Brand names are generalised to match your bar. Methods are summarised.</p>`;
  $('#recipe-dialog').showModal();
}
function renderInventory() {
  const categories = [...new Set(inventory.map(item => item.category))];
  $('#inventory').innerHTML = categories.map(category => `<section class="stock-group"><h3>${escapeHTML(category)}</h3>${inventory.filter(i => i.category === category).map(item => `<div class="stock-row"><span>${escapeHTML(item.name)}</span><span class="stock-label ${item.out ? 'out' : ''}">${item.out ? 'Out of stock' : 'In stock'}</span></div>`).join('')}</section>`).join('');
  const out = inventory.filter(item => item.out);
  $('#shop-count').textContent = out.length;
  $('#shopping-items').innerHTML = out.length ? out.map(item => `<label class="shopping-row"><input type="checkbox" data-item="${escapeHTML(item.id)}" ${purchased[item.id] ? 'checked' : ''}><span>${escapeHTML(item.name)}</span></label>`).join('') : '<p>Your usual bar is fully stocked.</p>';
  $('#stats').innerHTML = `<span><strong>${inventory.filter(i => !i.out).length}</strong> in stock</span><span><strong>${recipes.filter(r => !missing(r).length).length}</strong> ready to mix*</span><span><strong>${out.length}</strong> to restock</span>`;
  $('#stats').title = 'Ready to mix checks required mixing ingredients; garnishes are separate.';
}
for (const button of document.querySelectorAll('[data-tab]')) {
  button.addEventListener('click', () => {
    for (const tab of document.querySelectorAll('[data-tab]')) {
      const active = tab === button;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-pressed', active);
      document.getElementById(tab.dataset.tab).hidden = !active;
    }
  });
}
$('#search').addEventListener('input', renderRecipes);
$('#availability').addEventListener('change', renderRecipes);
$('#cards').addEventListener('click', event => { const button = event.target.closest('[data-recipe]'); if (button) openRecipe(Number(button.dataset.recipe)); });
$('#close-dialog').addEventListener('click', () => $('#recipe-dialog').close());
$('#recipe-dialog').addEventListener('click', event => { if (event.target === $('#recipe-dialog')) { const rect = event.target.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close(); } });
$('#shopping-items').addEventListener('change', event => {
  if (!event.target.matches('[data-item]')) return;
  purchased[event.target.dataset.item] = event.target.checked;
  try { localStorage.setItem('home-bar-purchased', JSON.stringify(purchased)); } catch { $('#shopping-status').textContent = 'Shopping ticks cannot be saved in this browser.'; }
});
$('#download').addEventListener('click', () => {
  const list = inventory.filter(item => item.out).map(item => `- [${purchased[item.id] ? 'x' : ' '}] ${item.name}`).join('\n');
  const url = URL.createObjectURL(new Blob([`Home bar — shopping list\n\n${list || 'Nothing to restock.'}\n\nFrom ingredients.md. Shopping ticks do not update bar stock.\n`], {type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = 'bar-shopping-list.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
async function init() {
  try {
    const responses = await Promise.all([fetch('ingredients.md', {cache:'no-store'}), fetch('recipes.json')]);
    if (responses.some(response => !response.ok)) throw new Error('Unable to load ingredients.md or recipes.json.');
    inventory = parseInventory(await responses[0].text());
    recipes = await responses[1].json();
    if (!inventory.length) throw new Error('No ingredients found in ingredients.md.');
    renderInventory(); renderRecipes();
  } catch (error) {
    $('#stats').textContent = 'The cabinet could not be loaded.';
    $('#error').hidden = false;
    $('#error').textContent = `${error.message} Serve this folder through GitHub Pages or a local web server, then reload.`;
    $('#download').disabled = true;
  }
}
init();
