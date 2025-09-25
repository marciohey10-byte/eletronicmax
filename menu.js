// Ano no rodapé
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

// Drawer mobile
const btnMenu = document.querySelector('.btn-menu');
const drawer  = document.getElementById('drawer');
const btnClose= document.querySelector('.drawer-close');
function toggleDrawer(open){ 
  if(!drawer) return;
  const isOpen = open ?? !drawer.classList.contains('open');
  drawer.classList.toggle('open', isOpen);
  drawer.setAttribute('aria-hidden', String(!isOpen));
  btnMenu && btnMenu.setAttribute('aria-expanded', String(isOpen));
}
btnMenu && btnMenu.addEventListener('click', ()=>toggleDrawer(true));
btnClose && btnClose.addEventListener('click', ()=>toggleDrawer(false));

// Render de produtos dinâmicos (opcional)
(async function mountProducts(){
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  const src = grid.dataset.source;
  try{
    const res = await fetch(src);
    const data = await res.json(); // esperados: [{id,title,price,compareAt,img,href,rating,count,badge,tags}]
    const tpl = document.getElementById('tplProductCard');
    grid.innerHTML = '';
    data.forEach(p=>{
      const node = tpl.content.cloneNode(true);
      const a = node.querySelector('.product-link');
      const img = node.querySelector('img');
      const title = node.querySelector('.product-title');
      const badge = node.querySelector('.badge');
      const price = node.querySelector('.price-current');
      const compare = node.querySelector('.price-compare');
      const rating = node.querySelector('.rating');
      const count = node.querySelector('.rating-count');

      a.href = p.href || '#';
      img.src = p.img; img.alt = p.alt || p.title;
      title.textContent = p.title;
      if(p.badge){ badge.textContent = p.badge } else { badge.remove(); }
      price.textContent = `R$ ${Number(p.price).toFixed(2).replace('.',',')}`;
      if(p.compareAt){ compare.textContent = `R$ ${Number(p.compareAt).toFixed(2).replace('.',',')}` } else { compare.remove(); }
      rating.firstChild && (rating.firstChild.textContent = '★★★★★'.slice(0, Math.round(p.rating||5)));
      count.textContent = `(${p.count||0})`;

      const card = node.querySelector('.product-card');
      card.dataset.tags = (p.tags||[]).join(' ');
      node.querySelectorAll('[data-action]').forEach(btn=>{
        btn.dataset.id = p.id;
        btn.addEventListener('click', (e)=>{
          const action = e.currentTarget.dataset.action;
          if(action==='add-to-cart'){ console.log('ADD', p.id); alert('Adicionado ao carrinho!'); }
          if(action==='buy-now'){ console.log('BUY', p.id); location.href = p.href || '#'; }
        });
      });

      grid.appendChild(node);
    });
  }catch(e){ console.error('Falha ao carregar produtos', e); }
})();

// Filtros “pílula”
document.querySelectorAll('.pill').forEach(pill=>{
  pill.addEventListener('click', ()=>{
    document.querySelectorAll('.pill').forEach(x=>x.classList.remove('is-active'));
    pill.classList.add('is-active');
    const filter = pill.dataset.filter;
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(c=>{
      if(filter==='all'){ c.style.display='flex'; return; }
      const tags = (c.dataset.tags||'').split(' ');
      c.style.display = tags.includes(filter) ? 'flex' : 'none';
    });
  });
});

// Ordenação
const sortBy = document.getElementById('sortBy');
sortBy && sortBy.addEventListener('change', ()=>{
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  const cards = Array.from(grid.children);
  const key = sortBy.value;
  const parsePrice = el => Number(el.querySelector('.price-current')?.textContent.replace(/[^\d,]/g,'').replace(',','.'))||0;
  const ratingOf = el => {
    const txt = el.querySelector('.rating')?.textContent || '★★★★★';
    return (txt.match(/★/g)||[]).length;
  };
  cards.sort((a,b)=>{
    if(key==='price-asc')  return parsePrice(a)-parsePrice(b);
    if(key==='price-desc') return parsePrice(b)-parsePrice(a);
    if(key==='rating-desc')return ratingOf(b)-ratingOf(a);
    return 0; // featured (não mexe)
  }).forEach(el=>grid.appendChild(el));
});
