/* FeedCraft – client-side Google Merchant Center feed audit + fix. No data leaves the browser. */
'use strict';

const FIELDS = ['id','title','description','link','image_link','price','availability','brand','gtin','mpn',
  'condition','google_product_category','product_type','color','size','material','gender','age_group','identifier_exists'];

const ALIASES = {
  id:['id','sku','variant sku','item_id','item id'],
  title:['title','name','product name'],
  description:['description','body (html)','body','product description'],
  link:['link','url','product url','product_url'],
  image_link:['image_link','image link','image src','image url','image'],
  price:['price','variant price'],
  availability:['availability','stock status','stock'],
  brand:['brand','vendor'],
  gtin:['gtin','barcode','variant barcode','upc','ean'],
  mpn:['mpn'],
  condition:['condition'],
  google_product_category:['google_product_category','google product category'],
  product_type:['product_type','product type','type','category'],
  color:['color','colour'],size:['size'],material:['material'],gender:['gender'],age_group:['age_group','age group'],
  identifier_exists:['identifier_exists']
};

const SAMPLE = [
['id','title','description','link','image_link','price','availability','brand','gtin','product_type'],
['HRP-001','HARPER LINEN DRESS - FREE SHIPPING!!!','<p>Soft olive green linen midi dress for women. Relaxed fit, breathable and perfect for summer evenings.</p>','https://example-shop.com/products/harper-linen-dress','https://example-shop.com/img/harper.jpg','$89.00','In Stock','Harper & Co','','Dresses'],
['TEE-002','Classic Tee','Tee','https://example-shop.com/products/classic-tee','http://example-shop.com/img/tee.jpg','24','instock','','','T-Shirts'],
['EAR-003','Silver Hoop Earrings','Handmade sterling silver hoop earrings with a polished finish. Lightweight and hypoallergenic for everyday wear.','https://example-shop.com/products/hoops','https://example-shop.com/img/hoops.jpg','34.00 USD','in_stock','Luna','123456789013','Jewelry'],
['RUN-004',"Trail Runner Shoes Men's Black",'Grippy, cushioned trail running shoes for men with a breathable mesh upper and reinforced toe cap for rocky terrain.','https://example-shop.com/products/trail-runner','https://example-shop.com/img/trail.jpg','120.00 USD','in_stock','Stride','4006381333931','Running Shoes'],
['CND-005','Soy Candle Lavender 8oz','Hand-poured soy wax candle scented with lavender essential oil. Burns clean for up to 45 hours.','https://example-shop.com/products/lavender-candle','','£18.00','sold out','Ember','','Candles'],
['MUG-006','Ceramic Mug','Glazed ceramic mug, 12oz, dishwasher and microwave safe. Comfortable handle and a smooth speckled finish.','https://example-shop.com/products/mug','https://example-shop.com/img/mug.jpg','12.50 USD','in_stock','Clay Works','','Mugs']
].map(r=>r.map(c=>/[\t"\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c).join('\t')).join('\n');

const COLORS = ['black','white','red','blue','green','olive green','navy','grey','gray','pink','purple','yellow','orange','brown','beige','cream','silver','gold','rose gold','burgundy','tan','teal','ivory'];
const MATERIALS = ['linen','cotton','silk','wool','leather','denim','polyester','sterling silver','silver','gold','stainless steel','ceramic','wood','bamboo','glass','soy wax','nylon','velvet'];
const CATEGORIES = [
  [/dress|gown/i,'Apparel & Accessories > Clothing > Dresses'],
  [/t-?shirt|tee\b|shirt|blouse|top\b/i,'Apparel & Accessories > Clothing > Shirts & Tops'],
  [/jean|pant|trouser|legging|short/i,'Apparel & Accessories > Clothing > Pants'],
  [/jacket|coat|hoodie|sweater|cardigan/i,'Apparel & Accessories > Clothing > Outerwear'],
  [/shoe|sneaker|boot|sandal|runner|trainer/i,'Apparel & Accessories > Shoes'],
  [/earring|necklace|bracelet|ring\b|jewel|pendant/i,'Apparel & Accessories > Jewelry'],
  [/handbag|bag\b|tote|backpack|purse/i,'Apparel & Accessories > Handbags, Wallets & Cases > Handbags'],
  [/candle/i,'Home & Garden > Decor > Home Fragrances > Candles'],
  [/mug|cup|plate|bowl|kitchen/i,'Home & Garden > Kitchen & Dining'],
  [/serum|cream|lotion|skin|soap|cosmetic|lip/i,'Health & Beauty > Personal Care'],
  [/dog|cat|pet\b/i,'Animals & Pet Supplies'],
  [/phone|cable|charger|headphone|speaker/i,'Electronics']
];
const PROMO = /\b(free shipping|best ?seller|best price|on sale|hot deal|limited time|buy now|cheap)\b|!{2,}|\bsale!*/gi;

const SEV = {crit:30, warn:8, info:3};
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let original = [], fixed = null, changes = [];

/* ---------- parsing ---------- */
function parseDelimited(text){
  text = text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim();
  if(!text) return [];
  const first = text.split('\n')[0];
  const d = (first.match(/\t/g)||[]).length >= (first.match(/,/g)||[]).length && first.includes('\t') ? '\t' : ',';
  const rows = []; let row = [], cur = '', q = false;
  for(let i=0;i<text.length;i++){
    const c = text[i];
    if(q){
      if(c === '"'){ if(text[i+1] === '"'){ cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if(c === '"') q = true;
    else if(c === d){ row.push(cur); cur = ''; }
    else if(c === '\n'){ row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  row.push(cur); rows.push(row);
  return rows;
}

function toProducts(rows){
  if(rows.length < 2) return [];
  const map = {};
  rows[0].forEach((h,i)=>{
    const n = h.trim().toLowerCase();
    for(const f in ALIASES) if(ALIASES[f].includes(n) && !(f in map)) map[f] = i;
  });
  return rows.slice(1).map(r=>{
    const p = {}; FIELDS.forEach(f=>p[f] = f in map ? (r[map[f]]||'').trim() : '');
    return p;
  }).filter(p => p.id || p.title); // skips Shopify variant continuation rows
}

/* ---------- helpers ---------- */
const stripHtml = s => s.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const has = (hay, needle) => new RegExp('\\b'+needle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(hay);
const titleCase = s => s.toLowerCase().replace(/\b[a-z]/g,c=>c.toUpperCase());
const isCaps = s => /[A-Z]/.test(s) && s === s.toUpperCase() && s.replace(/[^A-Za-z]/g,'').length > 5;

function gtinValid(g){
  if(!/^\d+$/.test(g) || ![8,12,13,14].includes(g.length)) return false;
  const d = g.split('').map(Number), last = d.pop();
  let sum = 0;
  d.reverse().forEach((n,i)=>{ sum += n * (i%2===0 ? 3 : 1); });
  return (10 - sum % 10) % 10 === last;
}
function normAvail(v){
  const s = v.toLowerCase().replace(/[\s-]+/g,'_');
  if(['in_stock','instock','available','yes','true','1'].includes(s)) return 'in_stock';
  if(['out_of_stock','outofstock','sold_out','soldout','no','false','0','unavailable'].includes(s)) return 'out_of_stock';
  if(['preorder','pre_order'].includes(s)) return 'preorder';
  if(['backorder','back_order'].includes(s)) return 'backorder';
  return null;
}
function normPrice(v, cur){
  if(!v) return null;
  const m = v.match(/(\d[\d.,]*)/); if(!m) return null;
  let num = m[1];
  if(/,\d{2}$/.test(num) && !/\.\d/.test(num)) num = num.replace(',','.'); else num = num.replace(/,/g,'');
  const n = parseFloat(num); if(isNaN(n)) return null;
  const code = (v.match(/\b([A-Z]{3})\b/)||[])[1] || (v.includes('£')?'GBP':v.includes('€')?'EUR':v.includes('$')?cur:cur);
  return n.toFixed(2)+' '+code;
}
const text = p => (p.title+' '+stripHtml(p.description)+' '+p.product_type);
const guessCategory = p => { const t = text(p); for(const [re,c] of CATEGORIES) if(re.test(t)) return c; return ''; };
const isApparel = p => /^Apparel/.test(p.google_product_category || guessCategory(p)) && !/Jewelry|Handbags/.test(p.google_product_category || guessCategory(p));
const findColor = p => COLORS.slice().sort((a,b)=>b.length-a.length).find(c=>has(text(p),c)) || '';
const findMaterial = p => MATERIALS.slice().sort((a,b)=>b.length-a.length).find(m=>has(text(p),m)) || '';
function findGender(p){
  const t = text(p);
  if(/\b(women'?s?|woman|ladies|female|girls?)\b/i.test(t)) return 'female';
  if(/\b(men'?s?|man|male|boys?)\b/i.test(t)) return 'male';
  if(/\bunisex\b/i.test(t)) return 'unisex';
  return '';
}
const findAge = p => /\b(kids?|children|toddler|boys?|girls?)\b/i.test(text(p)) ? 'kids' : 'adult';

/* ---------- audit ---------- */
const MSG = {
  missing_id:['crit','Missing product ID',false],
  missing_title:['crit','Missing title',false],
  missing_description:['crit','Missing description',false],
  missing_link:['crit','Missing product link',false],
  missing_image:['crit','Missing image link',false],
  missing_price:['crit','Missing price',false],
  bad_price:['crit','Price not in Google format (e.g. 12.99 USD)',true],
  bad_avail:['crit','Availability not a Google value (in_stock / out_of_stock / preorder / backorder)',true],
  missing_avail:['crit','Missing availability',false],
  title_long:['warn','Title over 150 characters',true],
  title_caps:['warn','Title is ALL CAPS',true],
  title_promo:['warn','Title contains promotional text (policy risk)',true],
  title_weak:['warn','Title is short / missing brand, color or material keywords',true],
  desc_html:['warn','Description contains HTML tags',true],
  desc_short:['warn','Description under 50 characters',false],
  missing_brand:['warn','Missing brand',false],
  gtin_invalid:['crit','GTIN fails the checksum (invalid barcode)',false],
  no_identifier:['warn','No GTIN/MPN and identifier_exists not set',true],
  missing_category:['warn','Missing Google product category',true],
  missing_color:['warn','Apparel is missing color',true],
  missing_gender:['warn','Apparel is missing gender',true],
  missing_age:['warn','Apparel is missing age_group',true],
  missing_size:['warn','Apparel is missing size',false],
  img_http:['info','Image link is not https',true],
  link_http:['info','Product link is not https',true]
};

function audit(p){
  const out = [], add = (code,field) => out.push({code, field, sev:MSG[code][0], msg:MSG[code][1], fixable:MSG[code][2]});
  if(!p.id) add('missing_id','id');
  if(!p.title) add('missing_title','title');
  if(!p.description) add('missing_description','description');
  if(!p.link) add('missing_link','link');
  if(!p.image_link) add('missing_image','image_link');
  if(!p.price) add('missing_price','price');
  else if(!/^\d+(\.\d{1,2})? [A-Z]{3}$/.test(p.price)) add('bad_price','price');
  if(!p.availability) add('missing_avail','availability');
  else if(!['in_stock','out_of_stock','preorder','backorder'].includes(p.availability)) add('bad_avail','availability');
  if(p.title){
    if(p.title.length > 150) add('title_long','title');
    if(isCaps(p.title)) add('title_caps','title');
    if(new RegExp(PROMO.source,'i').test(p.title)) add('title_promo','title');
    const rich = p.title.length >= 20 && (!p.brand || has(p.title,p.brand) || p.title.toLowerCase().startsWith(p.brand.split(/\s+/)[0].toLowerCase()));
    if(!rich) add('title_weak','title');
  }
  if(/<[a-z][\s\S]*>/i.test(p.description)) add('desc_html','description');
  else if(p.description && p.description.length < 50) add('desc_short','description');
  if(!p.brand) add('missing_brand','brand');
  if(p.gtin && !gtinValid(p.gtin)) add('gtin_invalid','gtin');
  if(!p.gtin && !p.mpn && !/^(no|false)$/i.test(p.identifier_exists)) add('no_identifier','identifier_exists');
  if(!p.google_product_category) add('missing_category','google_product_category');
  if(isApparel(p)){
    if(!p.color) add('missing_color','color');
    if(!p.gender) add('missing_gender','gender');
    if(!p.age_group) add('missing_age','age_group');
    if(!p.size) add('missing_size','size');
  }
  if(/^http:\/\//i.test(p.image_link)) add('img_http','image_link');
  if(/^http:\/\//i.test(p.link)) add('link_http','link');
  return out;
}
const scoreOf = issues => Math.max(0, 100 - issues.reduce((s,i)=>s + SEV[i.sev], 0));

/* ---------- smart fix ---------- */
function betterTitle(p){
  let t = stripHtml(p.title).replace(PROMO,' ').replace(/\s+[-–|]\s*$/,'').replace(/\s+/g,' ').trim();
  t = t.replace(/[\s\-–|]+$/,'');
  if(isCaps(t)) t = titleCase(t);
  const brand = p.brand;
  if(brand && !has(t,brand) && !t.toLowerCase().startsWith(brand.split(/\s+/)[0].toLowerCase())) t = brand + ' ' + t;
  const extra = [];
  [p.color || findColor(p), p.material || findMaterial(p), p.size].forEach(a=>{ if(a && !has(t,a)) extra.push(a.replace(/\b[a-z]/g,c=>c.toUpperCase())); });
  if(extra.length) t += ' - ' + extra.join(', ');
  if(t.length > 150) t = t.slice(0,150).replace(/\s+\S*$/,'');
  return t;
}

function smartFix(p, cur){
  const r = {...p}, log = [];
  const set = (f,v,why) => { if(v && v !== r[f]){ log.push({field:f, from:r[f], to:v, why}); r[f] = v; } };
  set('price', normPrice(r.price, cur) && (!/^\d+(\.\d{1,2})? [A-Z]{3}$/.test(r.price)) ? normPrice(r.price, cur) : '', 'Google price format');
  if(r.availability && !['in_stock','out_of_stock','preorder','backorder'].includes(r.availability)){
    const a = normAvail(r.availability); if(a) set('availability', a, 'Google availability value');
  }
  if(/<[a-z][\s\S]*>/i.test(r.description)) set('description', stripHtml(r.description), 'Removed HTML');
  if(r.link) set('link', r.link.replace(/^http:/i,'https:'), 'https');
  if(r.image_link) set('image_link', r.image_link.replace(/^http:/i,'https:'), 'https');
  if(!r.google_product_category) set('google_product_category', guessCategory(r), 'Matched from title / type (verify)');
  if(isApparel(r)){
    if(!r.color) set('color', findColor(r).replace(/\b[a-z]/g,c=>c.toUpperCase()), 'Found in title/description');
    if(!r.gender) set('gender', findGender(r), 'Found in title/description');
    if(!r.age_group) set('age_group', findAge(r), 'Default / found in text');
  }
  if(!r.material) set('material', findMaterial(r).replace(/\b[a-z]/g,c=>c.toUpperCase()), 'Found in title/description');
  if(!r.gtin && !r.mpn && !/^(no|false)$/i.test(r.identifier_exists)) set('identifier_exists', 'no', 'Only valid if the product truly has no barcode');
  const needsTitle = audit(r).some(i=>['title_long','title_caps','title_promo','title_weak'].includes(i.code));
  if(needsTitle) set('title', betterTitle(r), 'Title formula: Brand + Product + attributes');
  return {row:r, log};
}

/* ---------- render ---------- */
function groupIssues(rows){
  const g = {};
  rows.forEach(r=>audit(r).forEach(i=>{ (g[i.code] ||= {...i, count:0}).count++; }));
  return Object.values(g).sort((a,b)=>SEV[b.sev]*b.count - SEV[a.sev]*a.count);
}
const avg = rows => rows.length ? Math.round(rows.reduce((s,r)=>s+scoreOf(audit(r)),0)/rows.length) : 0;
const cls = s => s >= 80 ? 'good' : s >= 55 ? 'mid' : 'bad';
const chipLabel = {crit:'Critical', warn:'Warning', info:'Info'};

function render(){
  const cur = fixed || original;
  const s = avg(cur);
  const g = $('gauge');
  g.style.setProperty('--p', s);
  g.style.setProperty('--c', s >= 80 ? '#15803d' : s >= 55 ? '#d97706' : '#dc2626');
  $('score').textContent = s;
  g.setAttribute('aria-label','Feed score '+s+' out of 100');
  const issues = groupIssues(cur);
  const sum = sev => issues.filter(i=>i.sev===sev).reduce((a,i)=>a+i.count,0);
  $('n-crit').textContent = sum('crit');
  $('n-warn').textContent = sum('warn');
  $('n-fix').textContent = issues.filter(i=>i.fixable).reduce((a,i)=>a+i.count,0);
  $('n-prod').textContent = cur.length;
  if(fixed){
    $('after').textContent = 'Was '+avg(original)+' → now '+s+' after Smart Fix';
  } else {
    const preview = avg(original.map(p=>smartFix(p,$('currency').value).row));
    $('after').textContent = 'Could reach ~'+preview+' after Smart Fix';
  }
  $('fixall').disabled = !!fixed || !issues.some(i=>i.fixable);
  $('fixall').textContent = fixed ? '✓ Fixes applied' : '✨ Fix all issues automatically';

  $('summary').innerHTML = issues.length ? issues.map(i =>
    `<li><span class="chip ${i.sev}">${chipLabel[i.sev]}</span><span class="msg">${esc(i.msg)}</span><span class="cnt">${i.count}×</span>` +
    (i.fixable ? '<span class="chip fix">Auto-fix</span>' : '<span class="chip manual">Needs your input</span>') + '</li>'
  ).join('') : '<li>🎉 No issues found.</li>';

  $('items').innerHTML = cur.map((p,idx)=>{
    const iss = audit(p), sc = scoreOf(iss), ch = changes[idx] || [];
    return `<details class="item"><summary><span class="pid">${esc(p.id||'(no id)')}</span><span class="ptitle">${esc(p.title||'(no title)')}</span>` +
      `<span class="pill ${cls(sc)}">${sc}/100</span></summary><div class="body">` +
      (iss.length ? '<h3>Issues</h3><ul>'+iss.map(i=>`<li><span class="chip ${i.sev}">${chipLabel[i.sev]}</span> ${esc(i.msg)} ${i.fixable?'<span class="chip fix">Auto-fix</span>':'<span class="chip manual">Needs your input</span>'}</li>`).join('')+'</ul>' : '<h3>Issues</h3><p>None 🎉</p>') +
      (ch.length ? '<h3>Changes made</h3><dl class="diff">'+ch.map(c=>`<dt>${esc(c.field)}</dt><dd>${c.from?`<span class="old">${esc(c.from)}</span> `:''}<span class="new">${esc(c.to)}</span> <small>— ${esc(c.why)}</small></dd>`).join('')+'</dl>' : '') +
      '</div></details>';
  }).join('');
  renderExport();
}

/* ---------- export ---------- */
const tsvCell = v => String(v ?? '').replace(/[\t\n\r]+/g,' ');
function buildExport(fmt){
  const rows = fixed || original;
  if(fmt === 'supp'){
    const cols = ['id', ...FIELDS.filter(f=>f!=='id' && changes.some(c=>c.some(x=>x.field===f)))];
    if(cols.length === 1) return 'Apply Smart Fix first — nothing changed yet.\n';
    const body = rows.map((r,i)=> changes[i] && changes[i].length ? cols.map(c=>tsvCell(r[c])).join('\t') : null).filter(Boolean);
    return [cols.join('\t'), ...body].join('\n') + '\n';
  }
  if(fmt === 'full'){
    const cols = FIELDS.filter(f=>rows.some(r=>r[f]));
    return [cols.join('\t'), ...rows.map(r=>cols.map(c=>tsvCell(r[c])).join('\t'))].join('\n') + '\n';
  }
  const seller = $('seller').value.trim();
  const oai = r => {
    const o = {item_id:r.id, title:r.title, description:r.description, url:r.link, brand:r.brand, seller_name:seller,
      image_url:r.image_link, availability:r.availability, price:r.price,
      is_eligible_search:'true', is_eligible_checkout:'false'};
    if(r.gtin) o.gtin = r.gtin; if(r.color) o.color = r.color; if(r.size) o.size = r.size; if(r.material) o.material = r.material;
    return o;
  };
  const list = rows.map(oai).map(o=>{ Object.keys(o).forEach(k=>{ if(o[k]==='') delete o[k]; }); return o; });
  if(fmt === 'oai-jsonl') return list.map(o=>JSON.stringify(o)).join('\n') + '\n';
  const cols = [...new Set(list.flatMap(o=>Object.keys(o)))];
  return [cols.join('\t'), ...list.map(o=>cols.map(c=>tsvCell(o[c])).join('\t'))].join('\n') + '\n';
}
const HELP = {
  supp:'Upload in Merchant Center → Products → Data sources → Add supplemental source. It matches rows by id and only overrides the changed columns, so your Shopify/Woo price and stock sync keeps working.',
  full:'A complete primary feed. Use this only if you manage your feed by file; otherwise prefer the supplemental feed.',
  'oai-tsv':'Mapped to OpenAI\'s product feed fields (item_id, url, image_url, seller_name, is_eligible_*). Checkout is off by default. The spec evolves and needs merchant-portal approval — verify before uploading.',
  'oai-jsonl':'Same fields as the TSV, one JSON object per line.'
};
function renderExport(){
  const f = $('fmt').value;
  $('fmt-help').textContent = HELP[f];
  $('preview').textContent = buildExport(f);
}
function download(){
  const f = $('fmt').value;
  const name = {supp:'gmc-supplemental-feed.tsv', full:'gmc-full-feed.tsv', 'oai-tsv':'openai-feed.tsv', 'oai-jsonl':'openai-feed.jsonl'}[f];
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([buildExport(f)], {type:'text/plain;charset=utf-8'}));
  a.download = name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
}

/* ---------- actions ---------- */
function setStatus(msg, err){ const s = $('status'); s.textContent = msg; s.classList.toggle('err', !!err); }
function analyze(){
  const products = toProducts(parseDelimited($('raw').value));
  if(!products.length){ setStatus('Could not find products. Needs a header row plus at least one product (CSV or TSV).', true); return; }
  const cur = $('currency').value;
  original = products.map(p=>({...p, price: p.price })); fixed = null; changes = [];
  setStatus('Analyzed '+products.length+' products.');
  render();
}
function fixAll(){
  const cur = $('currency').value, res = original.map(p=>smartFix(p,cur));
  fixed = res.map(r=>r.row); changes = res.map(r=>r.log);
  setStatus('Smart Fix applied to '+changes.filter(c=>c.length).length+' products.');
  render();
}
function loadFile(file){
  const r = new FileReader();
  r.onload = () => { $('raw').value = r.result; analyze(); };
  r.readAsText(file);
}

/* ---------- optional AI rewrite (Gemini, bring-your-own-key, called straight from the browser) ---------- */
const AI_FIELDS = ['title','color','material','gender','age_group','google_product_category'];
const setAi = (m, err) => { const s = $('aistatus'); s.textContent = m; s.classList.toggle('err', !!err); };

function aiPrompt(batch){
  return 'You optimise product data for Google Shopping (Google Merchant Center). For each product return improved fields.\n' +
  'Rules: never invent facts that are not in the input; keep the brand; no promotional words (sale, free shipping, best); ' +
  'title max 150 chars, formula: Brand + Product type + key attributes (color, material, size, gender); natural capitalisation. ' +
  'Leave a field as an empty string if it cannot be determined from the input. gender: male|female|unisex. age_group: adult|kids|toddler|infant|newborn. ' +
  'google_product_category: the full Google product taxonomy path text, e.g. "Apparel & Accessories > Clothing > Dresses".\n' +
  'Return ONLY a JSON array of objects: {"id","title","color","material","gender","age_group","google_product_category"}.\n\nPRODUCTS:\n' +
  JSON.stringify(batch);
}

async function aiBatch(batch, key, model){
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
    method:'POST',
    headers:{'Content-Type':'application/json','x-goog-api-key':key},
    body: JSON.stringify({contents:[{parts:[{text:aiPrompt(batch)}]}], generationConfig:{responseMimeType:'application/json', temperature:0.3}})
  });
  if(!res.ok){
    let m = res.status + ''; try{ m = (await res.json()).error.message; }catch{}
    throw new Error(m);
  }
  const data = await res.json();
  const txt = data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('') || '';
  const arr = JSON.parse(txt.replace(/^```(?:json)?|```$/g,'').trim());
  if(!Array.isArray(arr)) throw new Error('Unexpected AI response');
  return arr;
}

function applyAi(i, out){
  const row = fixed[i], log = changes[i];
  AI_FIELDS.forEach(f=>{
    let v = typeof out[f] === 'string' ? out[f].replace(/\s+/g,' ').trim() : '';
    if(!v) return;
    if(f === 'title'){ v = v.replace(PROMO,'').replace(/\s+/g,' ').trim(); if(v.length > 150) v = v.slice(0,150).replace(/\s+\S*$/,''); }
    if(f === 'gender' && !['male','female','unisex'].includes(v.toLowerCase())) return;
    if(f === 'gender' || f === 'age_group') v = v.toLowerCase();
    if(!['title','google_product_category'].includes(f) && row[f]) return; // never overwrite data you already have
    if(f === 'age_group' && !isApparel(row)) return;
    if(v === row[f]) return;
    const prev = log.find(c=>c.field===f);
    if(prev){ prev.to = v; prev.why = 'AI rewrite (Gemini)'; }
    else log.push({field:f, from:row[f], to:v, why:'AI rewrite (Gemini)'});
    row[f] = v;
  });
}

async function aiRun(){
  const key = $('apikey').value.trim(), model = $('model').value.trim() || 'gemini-2.5-flash';
  if(!key){ setAi('Paste a Gemini API key first.', true); return; }
  if(!original.length){ setAi('Load a feed first.', true); return; }
  if(!fixed) fixAll();
  const btn = $('airun'); btn.disabled = true;
  const size = 15; let done = 0;
  try{
    for(let s=0; s<original.length; s+=size){
      setAi('Rewriting ' + Math.min(s+size, original.length) + ' / ' + original.length + '…');
      const batch = fixed.slice(s, s+size).map(p=>({id:p.id, title:p.title, description:p.description.slice(0,500), brand:p.brand, product_type:p.product_type, color:p.color, material:p.material, size:p.size, gender:p.gender}));
      const out = await aiBatch(batch, key, model);
      const byId = new Map(out.map(o=>[String(o.id), o]));
      batch.forEach((b,k)=>{ const o = byId.get(String(b.id)); if(o){ applyAi(s+k, o); done++; } });
    }
    setAi('AI rewrote ' + done + ' products. Review the changes below.');
    render();
  }catch(e){
    setAi('AI request failed: ' + e.message + ' (check key / model name). Your rule-based fixes are unchanged.', true);
    render();
  }finally{ btn.disabled = false; }
}
$('airun').addEventListener('click', aiRun);

$('analyze').addEventListener('click', analyze);
$('sample').addEventListener('click', ()=>{ $('raw').value = SAMPLE; analyze(); });
$('fixall').addEventListener('click', fixAll);
$('fmt').addEventListener('change', renderExport);
$('seller').addEventListener('input', renderExport);
$('currency').addEventListener('change', ()=>{ if(original.length) analyze(); });
$('download').addEventListener('click', download);
$('copy').addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText(buildExport($('fmt').value)); setStatus('Copied to clipboard.'); }
  catch{ setStatus('Copy blocked by the browser — use Download instead.', true); }
});
const drop = $('drop');
drop.addEventListener('click', ()=>$('file').click());
drop.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); $('file').click(); } });
$('file').addEventListener('change', e=>{ if(e.target.files[0]) loadFile(e.target.files[0]); });
['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{ e.preventDefault(); drop.classList.add('over'); }));
['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{ e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e=>{ const f = e.dataTransfer.files[0]; if(f) loadFile(f); });

/* Pre-load sample + show the fixed result straight away so value is visible on load */
$('raw').value = SAMPLE;
analyze();
fixAll();
