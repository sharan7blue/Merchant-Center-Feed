/* FeedCraft v1.2 – Google Merchant Center & AI Shopping Feed Engine
   100% Client-side processing. Designed for high accuracy and instant merchant feedback. */
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

/* Presets */
const PRESETS = {
  jewel: [
    ['id','title','description','link','image_link','price','availability','brand','gtin','product_type'],
    ['MJ-16251','Torun Bangle','Designed by Vivianna Torun. Two halves meet with a curving hook clasp. Sterling silver with 18ct yellow gold accents. Size Medium.','https://www.michaeljonesjeweller.co.uk/products/georg-jensen-torun-sterling-silver-and-18ct-yellow-gold-bangle','https://michaeljonesjeweller.co.uk/img/torun.jpg','£425.00','in stock','Georg Jensen','','Bracelets'],
    ['MJ-17890','DIAMOND SOLITAIRE RING 18CT WHITE GOLD - BEST SELLER!','<p>Classic brilliant cut diamond solitaire engagement ring set in polished 18ct white gold. 0.50ct certified diamond G/VS2.</p>','https://www.michaeljonesjeweller.co.uk/products/18ct-white-gold-diamond-solitaire-engagement-ring','https://michaeljonesjeweller.co.uk/img/ring.jpg','£1,850.00','instock','Michael Jones','123456789013','Rings'],
    ['MJ-20411','TAG Heuer Aquaracer 300m Watch','Men\'s professional dive watch with blue sunray dial, stainless steel bracelet and 300m water resistance. Calibre 5 automatic movement.','https://www.michaeljonesjeweller.co.uk/products/tag-heuer-aquaracer-professional-300-date-43mm-mens-watch-wbp201bba0632','http://michaeljonesjeweller.co.uk/img/aqua.jpg','2750','available','TAG Heuer','7612533145892','Watches'],
    ['MJ-21904','Pearl Drop Earrings','Freshwater cultured pearl earrings with 9ct yellow gold butterfly backs. Elegant bridal and everyday jewelry.','https://www.michaeljonesjeweller.co.uk/products/mikimoto-pearl-earrings','https://michaeljonesjeweller.co.uk/img/pearl.jpg','£145.00','in_stock','Mikimoto','','Earrings'],
    ['MJ-22001','Pre-Owned Rolex Submariner Date 41mm','Certified authentic luxury wristwatch in stainless steel with black ceramic Cerachrom bezel. Excellent condition, box & papers included.','https://www.michaeljonesjeweller.co.uk/products/pre-owned-rolex-submariner-date-41mm','https://michaeljonesjeweller.co.uk/img/sub.jpg','£11,200.00','sold out','Rolex','','Luxury Watches']
  ],
  gallery: [
    ['id','title','description','link','image_link','price','availability','brand','gtin','product_type'],
    ['MKG-101','Concrete Cow Mini Sculpture Replica','Hand-cast concrete mini sculpture inspired by Liz Leyh\'s iconic Milton Keynes concrete cows. 12cm width, felt base. Handcrafted locally.','https://mkgallery-shop.myshopify.com/collections/gifts/products/concrete-cow','https://mkgallery-shop.myshopify.com/img/cow.jpg','28.00 GBP','in_stock','MK Gallery Editions','','Sculptures & Art'],
    ['MKG-102','Milton Keynes Grid Map Organic Cotton Tote Bag - FREE SHIPPING','100% certified organic cotton canvas tote featuring the famous Milton Keynes H & V road grid print in black ink. Sturdy handles.','https://mkgallery-shop.myshopify.com/collections/gifts/products/grid-tote','https://mkgallery-shop.myshopify.com/img/tote.jpg','16.50','In Stock','MK Gallery','','Bags & Totes'],
    ['MKG-103','Studio Ceramic Speckled Coffee Mug 10oz','Wheel-thrown stoneware ceramic mug with matte cream glaze and iron specks. Microwave and dishwasher safe. Handcrafted by local MK ceramicist.','https://mkgallery-shop.myshopify.com/collections/gifts/products/speckled-mug','https://mkgallery-shop.myshopify.com/img/mug.jpg','£24.00','instock','Clay MK','','Kitchenware'],
    ['MKG-104','Lavender & Cedarwood Botanical Soy Candle 220g','Clean-burning natural soy wax candle scented with pure essential oils. Cotton wick, amber glass jar with brass lid. 45 hour burn time.','https://mkgallery-shop.myshopify.com/collections/gifts/products/botanical-candle','','19.50 GBP','in_stock','Bucks Botanicals','','Candles'],
    ['MKG-105','Midsummer Boulevard Screenprint by Local Artist (A3)','Limited edition 3-color silkscreen print on 300gsm Fabriano cotton paper. Signed and numbered edition of 50. Sold unframed.','https://mkgallery-shop.myshopify.com/collections/gifts/products/a3-print','https://mkgallery-shop.myshopify.com/img/print.jpg','£45.00','pre-order','Studio MK9','','Art Prints']
  ],
  sample: [
    ['id','title','description','link','image_link','price','availability','brand','gtin','product_type'],
    ['HRP-001','HARPER LINEN DRESS - FREE SHIPPING!!!','<p>Soft olive green linen midi dress for women. Relaxed fit, breathable and perfect for summer evenings.</p>','https://example-shop.com/products/harper-linen-dress','https://example-shop.com/img/harper.jpg','$89.00','In Stock','Harper & Co','','Dresses'],
    ['TEE-002','Classic Tee','Tee','https://example-shop.com/products/classic-tee','http://example-shop.com/img/tee.jpg','24','instock','','','T-Shirts'],
    ['EAR-003','Silver Hoop Earrings','Handmade sterling silver hoop earrings with a polished finish. Lightweight and hypoallergenic for everyday wear.','https://example-shop.com/products/hoops','https://example-shop.com/img/hoops.jpg','34.00 USD','in_stock','Luna','123456789013','Jewelry'],
    ['RUN-004',"Trail Runner Shoes Men's Black",'Grippy, cushioned trail running shoes for men with a breathable mesh upper and reinforced toe cap for rocky terrain.','https://example-shop.com/products/trail-runner','https://example-shop.com/img/trail.jpg','120.00 USD','in_stock','Stride','4006381333931','Running Shoes'],
    ['CND-005','Soy Candle Lavender 8oz','Hand-poured soy wax candle scented with lavender essential oil. Burns clean for up to 45 hours.','https://example-shop.com/products/lavender-candle','','£18.00','sold out','Ember','','Candles'],
    ['MUG-006','Ceramic Mug','Glazed ceramic mug, 12oz, dishwasher and microwave safe. Comfortable handle and a smooth speckled finish.','https://example-shop.com/products/mug','https://example-shop.com/img/mug.jpg','12.50 USD','in_stock','Clay Works','','Mugs']
  ]
};

const formatPreset = data => data.map(r=>r.map(c=>/[\t"\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c).join('\t')).join('\n');

const COLORS = ['black','white','red','blue','green','olive green','navy','grey','gray','pink','purple','yellow','orange','brown','beige','cream','silver','gold','rose gold','burgundy','tan','teal','ivory','amber'];
const MATERIALS = ['linen','cotton','silk','wool','leather','denim','polyester','sterling silver','silver','18ct yellow gold','18ct white gold','9ct yellow gold','gold','white gold','yellow gold','stainless steel','ceramic','stoneware','concrete','wood','bamboo','glass','soy wax','soy','nylon','velvet','diamond','pearl'];
const CATEGORIES = [
  [/dress|gown/i,'Apparel & Accessories > Clothing > Dresses'],
  [/t-?shirt|tee\b|shirt|blouse|top\b/i,'Apparel & Accessories > Clothing > Shirts & Tops'],
  [/jean|pant|trouser|legging|short/i,'Apparel & Accessories > Clothing > Pants'],
  [/jacket|coat|hoodie|sweater|cardigan/i,'Apparel & Accessories > Clothing > Outerwear'],
  [/shoe|sneaker|boot|sandal|runner|trainer/i,'Apparel & Accessories > Shoes'],
  [/earring/i,'Apparel & Accessories > Jewelry > Earrings'],
  [/ring\b|solitaire/i,'Apparel & Accessories > Jewelry > Rings'],
  [/bangle|bracelet/i,'Apparel & Accessories > Jewelry > Bracelets'],
  [/watch|wristwatch/i,'Apparel & Accessories > Jewelry > Watches'],
  [/necklace|pendant/i,'Apparel & Accessories > Jewelry > Necklaces'],
  [/jewelry|jewellery/i,'Apparel & Accessories > Jewelry'],
  [/handbag|bag\b|tote|backpack|purse/i,'Apparel & Accessories > Handbags, Wallets & Cases > Handbags'],
  [/candle|fragrance/i,'Home & Garden > Decor > Home Fragrances > Candles'],
  [/mug|cup|plate|bowl|kitchen|kitchenware/i,'Home & Garden > Kitchen & Dining > Tableware > Drinkware > Mugs'],
  [/sculpture|print|artwork|art\b/i,'Arts & Entertainment > Hobbies & Creative Arts > Artwork'],
  [/serum|cream|lotion|skin|soap|cosmetic|lip/i,'Health & Beauty > Personal Care'],
  [/phone|cable|charger|headphone|speaker/i,'Electronics']
];
const PROMO = /\b(free shipping|best ?seller|best price|on sale|hot deal|limited time|buy now|cheap|pre-owned|certified authentic)\b|!{2,}|\bsale!*/gi;

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
  }).filter(p => p.id || p.title);
}

/* ---------- normalizers & helpers ---------- */
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
const isApparel = p => /^Apparel/.test(p.google_product_category || guessCategory(p)) && !/Jewelry|Handbags|Watches/.test(p.google_product_category || guessCategory(p));
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

/* ---------- audit rules ---------- */
const MSG = {
  missing_id:['crit','Missing product SKU/ID',false],
  missing_title:['crit','Missing product title',false],
  missing_description:['crit','Missing product description',false],
  missing_link:['crit','Missing live product link',false],
  missing_image:['crit','Missing primary image link',false],
  missing_price:['crit','Missing product price',false],
  bad_price:['crit','Price not formatted to Google specs (e.g., 89.00 GBP)',true],
  bad_avail:['crit','Availability not a standard Google enum (in_stock/out_of_stock)',true],
  missing_avail:['crit','Missing availability status',false],
  title_long:['warn','Title exceeds 150 characters (truncated in Shopping carousel)',true],
  title_caps:['warn','Title contains aggressive ALL CAPS formatting',true],
  title_promo:['warn','Title contains promotional spam violating Google Shopping policy',true],
  title_weak:['warn','Title lacks search keywords (brand, material, color, product type)',true],
  desc_html:['warn','Description contains raw HTML tags (breaks plain text crawlers)',true],
  desc_short:['warn','Description under 50 characters (poor algorithmic matching)',false],
  missing_brand:['warn','Missing brand / vendor attribute',false],
  gtin_invalid:['crit','GTIN/barcode fails GS1 checksum verification',false],
  no_identifier:['warn','Missing GTIN/MPN without identifier_exists="no" flag',true],
  missing_category:['warn','Missing Google Product Category taxonomy string',true],
  missing_color:['warn','Apparel item is missing required color attribute',true],
  missing_gender:['warn','Apparel item is missing required gender attribute',true],
  missing_age:['warn','Apparel item is missing required age_group attribute',true],
  missing_size:['warn','Apparel item is missing required size attribute',false],
  img_http:['info','Image link uses insecure http:// protocol',true],
  link_http:['info','Product link uses insecure http:// protocol',true]
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

/* ---------- smart fix engine ---------- */
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
  const rawCur = cur.replace(/[^A-Z]/g,'') || 'GBP';
  const np = normPrice(r.price, rawCur);
  if(np && !/^\d+(\.\d{1,2})? [A-Z]{3}$/.test(r.price)) set('price', np, 'Google price format');
  if(r.availability && !['in_stock','out_of_stock','preorder','backorder'].includes(r.availability)){
    const a = normAvail(r.availability); if(a) set('availability', a, 'Google availability standard');
  }
  if(/<[a-z][\s\S]*>/i.test(r.description)) set('description', stripHtml(r.description), 'Removed promotional HTML');
  if(r.link) set('link', r.link.replace(/^http:/i,'https:'), 'Upgraded to HTTPS');
  if(r.image_link) set('image_link', r.image_link.replace(/^http:/i,'https:'), 'Upgraded to HTTPS');
  if(!r.google_product_category) set('google_product_category', guessCategory(r), 'Auto-mapped Google Taxonomy');
  if(isApparel(r)){
    if(!r.color) set('color', findColor(r).replace(/\b[a-z]/g,c=>c.toUpperCase()), 'Extracted from text');
    if(!r.gender) set('gender', findGender(r), 'Extracted from text');
    if(!r.age_group) set('age_group', findAge(r), 'Inferred audience demographic');
  }
  if(!r.material) set('material', findMaterial(r).replace(/\b[a-z]/g,c=>c.toUpperCase()), 'Extracted material');
  if(!r.gtin && !r.mpn && !/^(no|false)$/i.test(r.identifier_exists)) set('identifier_exists', 'no', 'Safely flagged identifier_exists="no"');
  const needsTitle = audit(r).some(i=>['title_long','title_caps','title_promo','title_weak'].includes(i.code));
  if(needsTitle) set('title', betterTitle(r), 'Engine Title Formula: Brand + Category + Attributes');
  return {row:r, log};
}

/* ---------- AI rewrite (Google Gemini) ---------- */
const AI_FIELDS = ['title','color','material','gender','age_group','google_product_category'];
const setAi = (m, err) => { const s = $('aistatus'); s.textContent = m; s.classList.toggle('err', !!err); };

function aiPrompt(batch){
  return 'You are an elite Google Shopping product feed specialist. For each product return an optimized title and attributes.\n' +
  'Rules: Never hallucinate facts; keep the brand; strip promotional hype (free shipping, best price); ' +
  'title max 150 chars, formula: Brand + Product Type + Color + Material + Key Specs; clean capitalization. ' +
  'Return empty string if unknown. gender: male|female|unisex. age_group: adult|kids|toddler|infant. ' +
  'google_product_category: full official Google taxonomy path string.\n' +
  'Return ONLY a valid JSON array of objects: {"id","title","color","material","gender","age_group","google_product_category"}.\n\nPRODUCTS:\n' +
  JSON.stringify(batch);
}

async function aiBatch(batch, key, model){
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
    method:'POST',
    headers:{'Content-Type':'application/json','x-goog-api-key':key},
    body: JSON.stringify({contents:[{parts:[{text:aiPrompt(batch)}]}], generationConfig:{responseMimeType:'application/json', temperature:0.2}})
  });
  if(!res.ok){
    let m = res.status + ''; try{ m = (await res.json()).error.message; }catch{}
    throw new Error(m);
  }
  const data = await res.json();
  const txt = data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('') || '';
  const arr = JSON.parse(txt.replace(/^```(?:json)?|```$/g,'').trim());
  if(!Array.isArray(arr)) throw new Error('Unexpected response format');
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
    if(!['title','google_product_category'].includes(f) && row[f]) return;
    if(f === 'age_group' && !isApparel(row)) return;
    if(v === row[f]) return;
    const prev = log.find(c=>c.field===f);
    if(prev){ prev.to = v; prev.why = '✨ Gemini AI Rewrite'; }
    else log.push({field:f, from:row[f], to:v, why:'✨ Gemini AI Rewrite'});
    row[f] = v;
  });
}

async function aiRun(){
  const key = $('apikey').value.trim(), model = $('model').value.trim() || 'gemini-2.5-flash';
  if(!key){ setAi('Please provide a Google AI Studio API key.', true); return; }
  if(!original.length){ setAi('Please load feed data first.', true); return; }
  if(!fixed) fixAll();
  const btn = $('airun'); btn.disabled = true;
  const size = 10; let done = 0;
  try{
    for(let s=0; s<original.length; s+=size){
      setAi('Rewriting ' + Math.min(s+size, original.length) + ' / ' + original.length + ' products with Gemini…');
      const batch = fixed.slice(s, s+size).map(p=>({id:p.id, title:p.title, description:p.description.slice(0,400), brand:p.brand, product_type:p.product_type, color:p.color, material:p.material, size:p.size, gender:p.gender}));
      const out = await aiBatch(batch, key, model);
      const byId = new Map(out.map(o=>[String(o.id), o]));
      batch.forEach((b,k)=>{ const o = byId.get(String(b.id)); if(o){ applyAi(s+k, o); done++; } });
    }
    setAi('✨ Gemini successfully enriched ' + done + ' products!');
    render();
  }catch(e){
    setAi('AI call failed: ' + e.message, true);
    render();
  }finally{ btn.disabled = false; }
}

/* ---------- renderers & filters ---------- */
function groupIssues(rows){
  const g = {};
  rows.forEach(r=>audit(r).forEach(i=>{ (g[i.code] ||= {...i, count:0}).count++; }));
  return Object.values(g).sort((a,b)=>SEV[b.sev]*b.count - SEV[a.sev]*a.count);
}
const avg = rows => rows.length ? Math.round(rows.reduce((s,r)=>s+scoreOf(audit(r)),0)/rows.length) : 0;
const cls = s => s >= 80 ? 'good' : s >= 55 ? 'mid' : 'bad';
const chipLabel = {crit:'Disapproval', warn:'Policy Warning', info:'Notice'};

function render(){
  const cur = fixed || original;
  const s = avg(cur);
  const g = $('gauge');
  g.style.setProperty('--p', s);
  g.style.setProperty('--c', s >= 80 ? '#15803d' : s >= 55 ? '#d97706' : '#dc2626');
  $('score').textContent = s;
  g.setAttribute('aria-label','Feed health score '+s+' out of 100');

  const issues = groupIssues(cur);
  const sum = sev => issues.filter(i=>i.sev===sev).reduce((a,i)=>a+i.count,0);
  $('n-crit').textContent = sum('crit');
  $('n-warn').textContent = sum('warn');
  $('n-fix').textContent = issues.filter(i=>i.fixable).reduce((a,i)=>a+i.count,0);
  $('n-prod').textContent = cur.length;

  if(fixed){
    $('after').textContent = 'Initial: ' + avg(original) + ' → Optimized: ' + s + ' / 100';
  } else {
    const preview = avg(original.map(p=>smartFix(p,$('currency').value).row));
    $('after').textContent = 'Potential score: ~' + preview + ' / 100';
  }

  $('fixall').disabled = !!fixed || !issues.some(i=>i.fixable);
  $('fixall').textContent = fixed ? '✓ Smart Fixes Applied' : '✨ Fix All Issues Automatically';

  $('summary').innerHTML = issues.length ? issues.map(i =>
    `<li><span class="chip ${i.sev}">${chipLabel[i.sev]}</span><span class="msg">${esc(i.msg)}</span><span class="cnt">${i.count} items</span>` +
    (i.fixable ? '<span class="chip fix">⚡ Auto-Fix Ready</span>' : '<span class="chip manual">Manual Input Required</span>') + '</li>'
  ).join('') : '<li>🎉 Zero disapprovals found! Your feed is 100% compliant with Google Merchant Center specifications.</li>';

  renderProducts();
  renderExport();
}

function renderProducts(){
  const cur = fixed || original;
  const q = ($('search-input').value || '').toLowerCase().trim();
  const filter = $('filter-select').value;

  const filtered = cur.map((p,idx)=>({p, orig: original[idx] || p, idx, iss:audit(p), sc:scoreOf(audit(p)), ch:changes[idx]||[]}))
    .filter(item => {
      if(q && !((item.p.id||'').toLowerCase().includes(q) || (item.p.title||'').toLowerCase().includes(q))) return false;
      if(filter === 'issues' && item.iss.length === 0) return false;
      if(filter === 'clean' && item.iss.length > 0) return false;
      return true;
    });

  if(!filtered.length){
    $('items').innerHTML = '<p class="note" style="padding:14px;text-align:center;">No matching products found.</p>';
    return;
  }

  $('items').innerHTML = filtered.map(({p, orig, idx, iss, sc, ch}) => {
    let hostname = '';
    try { if(p.link) hostname = new URL(p.link).hostname.replace(/^www\./,''); } catch{}

    return `<details class="item" ${idx === 0 ? 'open' : ''}><summary>` +
      `<span class="pid">${esc(p.id||'(no id)')}</span>` +
      `<span class="ptitle">${esc(p.title||'(untitled product)')}</span>` +
      `<span class="pill ${cls(sc)}">${sc}/100</span>` +
      `</summary><div class="body">` +

      `<h3>Live Google Shopping Ad Simulator (Before vs. After)</h3>` +
      `<div class="shopping-preview-box">` +
        `<div class="serp-card bad-serp">` +
          `<span class="serp-tag bad">Raw Storefront Title</span>` +
          `<p class="serp-title">${esc(orig.title)}</p>` +
          `<div class="serp-price">${esc(orig.price || 'Unformatted')}</div>` +
          `<div class="serp-merchant">Store: ${esc(orig.brand || 'Unbranded')}</div>` +
        `</div>` +
        `<div class="serp-card good-serp">` +
          `<span class="serp-tag good">Google Shopping Optimized</span>` +
          `<p class="serp-title">${esc(p.title)}</p>` +
          `<div class="serp-price">${esc(p.price)}</div>` +
          `<div class="serp-merchant">GMC: ${esc(p.brand || 'Brand Verified')}</div>` +
          `<div class="serp-badges">` +
            (p.color ? `<span class="serp-badge">${esc(p.color)}</span>` : '') +
            (p.material ? `<span class="serp-badge">${esc(p.material)}</span>` : '') +
            (p.google_product_category ? `<span class="serp-badge">Taxonomy Synced</span>` : '') +
          `</div>` +
        `</div>` +
      `</div>` +

      (p.link ? `<a class="live-verify-link" href="${esc(p.link)}" target="_blank" rel="noopener">🔗 View Real Product on Live Store (${esc(hostname)}) ↗</a>` : '') +

      (iss.length ? `<h3>Detected Issues</h3><ul>` + iss.map(i=>`<li><span class="chip ${i.sev}">${chipLabel[i.sev]}</span> ${esc(i.msg)} ${i.fixable?'<span class="chip fix">Auto-Fix</span>':'<span class="chip manual">Needs Barcode</span>'}</li>`).join('') + `</ul>` : `<h3>Status</h3><p>✓ All Merchant Center validation rules passed!</p>`) +
      (ch.length ? `<h3>Applied Transformations</h3><dl class="diff">` + ch.map(c=>`<dt>${esc(c.field)}</dt><dd>${c.from?`<span class="old">${esc(c.from)}</span> `:''}<span class="new">${esc(c.to)}</span> <small>— ${esc(c.why)}</small></dd>`).join('') + `</dl>` : '') +
      `</div></details>`;
  }).join('');
}

/* ---------- export studio ---------- */
const tsvCell = v => String(v ?? '').replace(/[\t\n\r]+/g,' ');

function buildExport(fmt){
  const rows = fixed || original;
  if(fmt === 'supp'){
    const cols = ['id', ...FIELDS.filter(f=>f!=='id' && changes.some(c=>c.some(x=>x.field===f)))];
    if(cols.length === 1) return 'id\ttitle\tgoogle_product_category\tcolor\tmaterial\n# Run "Fix All Issues Automatically" above to generate your supplemental override file.\n';
    const body = rows.map((r,i)=> changes[i] && changes[i].length ? cols.map(c=>tsvCell(r[c])).join('\t') : null).filter(Boolean);
    return [cols.join('\t'), ...body].join('\n') + '\n';
  }
  if(fmt === 'full'){
    const cols = FIELDS.filter(f=>rows.some(r=>r[f]));
    return [cols.join('\t'), ...rows.map(r=>cols.map(c=>tsvCell(r[c])).join('\t'))].join('\n') + '\n';
  }
  const seller = $('seller').value.trim() || 'Merchant Store';
  const oai = r => {
    const o = {
      item_id: r.id,
      title: r.title,
      description: r.description,
      url: r.link,
      brand: r.brand,
      seller_name: seller,
      image_url: r.image_link,
      availability: r.availability,
      price: r.price,
      is_eligible_search: 'true',
      is_eligible_checkout: 'false'
    };
    if(r.gtin) o.gtin = r.gtin;
    if(r.color) o.color = r.color;
    if(r.size) o.size = r.size;
    if(r.material) o.material = r.material;
    Object.keys(o).forEach(k=>{ if(o[k]==='' || o[k]==null) delete o[k]; });
    return o;
  };
  const list = rows.map(oai);
  if(fmt === 'oai-jsonl') return list.map(o=>JSON.stringify(o)).join('\n') + '\n';
  const cols = [...new Set(list.flatMap(o=>Object.keys(o)))];
  return [cols.join('\t'), ...list.map(o=>cols.map(c=>tsvCell(o[c])).join('\t'))].join('\n') + '\n';
}

const HELP = {
  supp:'Recommended for Shopify & WooCommerce: Upload via Merchant Center > Products > Data sources > Add supplemental source. Safely injects optimized titles and categories by product ID without breaking live stock or pricing sync.',
  full:'Full standalone catalog feed. Ideal for manual FTP/SFTP uploads or merchants maintaining their complete feed in spreadsheets.',
  'oai-tsv':'Strictly formatted for OpenAI Agentic Commerce Protocol (ChatGPT Shopping carousels). Includes seller_name and search/checkout eligibility flags.',
  'oai-jsonl':'OpenAI newline-delimited JSONL specification for compressed, streaming agentic catalog ingestion.'
};

function renderExport(){
  const f = $('fmt').value;
  $('fmt-help').textContent = HELP[f] || '';
  const text = buildExport(f);
  $('preview').textContent = text;
  $('line-count').textContent = text.trim() ? text.trim().split('\n').length : 0;
}

function download(){
  const f = $('fmt').value;
  const name = {supp:'gmc-supplemental-feed.tsv', full:'gmc-full-primary-feed.tsv', 'oai-tsv':'openai-product-feed.tsv', 'oai-jsonl':'openai-product-feed.jsonl'}[f];
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([buildExport(f)], {type:'text/plain;charset=utf-8'}));
  a.download = name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
}

/* ---------- event actions ---------- */
function setStatus(msg, err){ const s = $('status'); s.textContent = msg; s.classList.toggle('err', !!err); }

function analyze(){
  const products = toProducts(parseDelimited($('raw').value));
  if(!products.length){ setStatus('Could not find products. Ensure your file has a header row.', true); return; }
  original = products; fixed = null; changes = [];
  setStatus('Successfully parsed ' + products.length + ' products.');
  render();
}

function fixAll(){
  const cur = $('currency').value;
  const res = original.map(p=>smartFix(p,cur));
  fixed = res.map(r=>r.row); changes = res.map(r=>r.log);
  setStatus('Smart Fix successfully optimized ' + changes.filter(c=>c.length).length + ' products.');
  render();
}

function loadPreset(key){
  $('raw').value = formatPreset(PRESETS[key] || PRESETS.sample);
  analyze();
  fixAll();
  // Update button active state
  document.querySelectorAll('.bench-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.preset === key);
  });
}

function loadFile(file){
  const r = new FileReader();
  r.onload = () => { $('raw').value = r.result; analyze(); fixAll(); };
  r.readAsText(file);
}

/* Tab clicks */
document.querySelectorAll('.fmt-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fmt-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    $('fmt').value = btn.dataset.fmt;
    renderExport();
  });
});

/* Modal handler */
const modal = $('sync-modal');
$('open-sync-modal').addEventListener('click', () => modal.removeAttribute('hidden'));
$('close-modal').addEventListener('click', () => modal.setAttribute('hidden', ''));
modal.addEventListener('click', e => { if(e.target === modal) modal.setAttribute('hidden', ''); });
$('beta-form').addEventListener('submit', e => {
  e.preventDefault();
  $('beta-success').removeAttribute('hidden');
  setTimeout(() => { modal.setAttribute('hidden', ''); $('beta-success').setAttribute('hidden', ''); }, 3000);
});

/* Settings Modal handler */
const settingsModal = $('settings-modal');
if($('open-settings-modal')) $('open-settings-modal').addEventListener('click', () => settingsModal.removeAttribute('hidden'));
if($('close-settings-modal')) $('close-settings-modal').addEventListener('click', () => settingsModal.setAttribute('hidden', ''));
if(settingsModal) settingsModal.addEventListener('click', e => { if(e.target === settingsModal) settingsModal.setAttribute('hidden', ''); });

/* Live Store Scanner */
async function scanLiveStore(){
  let rawUrl = $('scanner-url').value.trim();
  if(!rawUrl){
    showScannerAlert('Please enter a store URL (e.g. https://yourstore.com)', true);
    return;
  }
  if(!/^https?:\/\//i.test(rawUrl)) rawUrl = 'https://' + rawUrl;
  showScannerAlert('Connecting to live store and fetching catalog…', false);
  
  try {
    const cleanUrl = rawUrl.replace(/\/+$/, '');
    const endpoint = cleanUrl + '/products.json?limit=25';
    const res = await fetch(endpoint, { mode: 'cors' });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if(!data.products || !data.products.length) throw new Error('No products returned');
    
    const rows = [
      ['id', 'title', 'description', 'link', 'image_link', 'price', 'availability', 'brand', 'gtin', 'product_type']
    ];
    data.products.forEach(p => {
      const v = p.variants?.[0] || {};
      const img = p.images?.[0]?.src || '';
      const prodUrl = cleanUrl + '/products/' + p.handle;
      const avail = v.available ? 'in_stock' : 'out_of_stock';
      rows.push([
        String(v.id || p.id),
        p.title,
        p.body_html || '',
        prodUrl,
        img,
        String(v.price || ''),
        avail,
        p.vendor || '',
        v.barcode || '',
        p.product_type || ''
      ]);
    });
    
    $('raw').value = formatPreset(rows);
    showScannerAlert('🎉 Successfully imported ' + data.products.length + ' live products from ' + new URL(cleanUrl).hostname + '!', false);
    analyze();
    fixAll();
  } catch(err) {
    showScannerAlert(
      '🔒 Direct browser cross-origin (CORS) note: Some Shopify stores restrict third-party browser scripts. ' +
      'To scan this store: <a href="' + esc(rawUrl.replace(/\/+$/, '') + '/products.json') + '" target="_blank" rel="noopener"><strong>Click here to open ' + esc(new URL(rawUrl).hostname) + '/products.json</strong></a>, ' +
      'press Cmd+S / Ctrl+S to save, and drag the file into the box below. Or click the verified Milton Keynes store buttons above to test real live store data immediately.',
      true
    );
  }
}

function showScannerAlert(html, isErr){
  const el = $('scanner-alert');
  el.removeAttribute('hidden');
  el.innerHTML = html;
  el.style.borderColor = isErr ? '#fca5a5' : '#5eead4';
  el.style.background = isErr ? '#fff5f5' : '#f0fdfa';
}

/* Event listeners */
$('btn-scan').addEventListener('click', scanLiveStore);
$('analyze').addEventListener('click', () => { analyze(); fixAll(); });
$('sample').addEventListener('click', () => loadPreset('sample'));
$('clear-input').addEventListener('click', () => { $('raw').value = ''; setStatus('Cleared.'); });
$('load-mk-jewel').addEventListener('click', () => loadPreset('jewel'));
$('load-mk-gallery').addEventListener('click', () => loadPreset('gallery'));
$('load-demo-gen').addEventListener('click', () => loadPreset('sample'));
$('fixall').addEventListener('click', fixAll);
$('airun').addEventListener('click', aiRun);
$('seller').addEventListener('input', renderExport);
$('currency').addEventListener('change', () => { if(original.length) fixAll(); });
$('search-input').addEventListener('input', renderProducts);
$('filter-select').addEventListener('change', renderProducts);

$('download').addEventListener('click', download);
$('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(buildExport($('fmt').value));
    const s = $('export-status'); s.textContent = '✓ Copied to clipboard!';
    setTimeout(() => { s.textContent = ''; }, 2500);
  } catch {
    download();
  }
});

/* Drag and drop */
const drop = $('drop');
drop.addEventListener('click', () => $('file').click());
drop.addEventListener('keydown', e => { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); $('file').click(); } });
$('file').addEventListener('change', e => { if(e.target.files[0]) loadFile(e.target.files[0]); });
['dragenter','dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave','drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if(f) loadFile(f); });

/* Initialize on load with real-world Milton Keynes retail benchmark */
loadPreset('jewel');
