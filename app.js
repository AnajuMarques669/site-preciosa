/* ===========================
   PRECIOSA — Interatividade
   - Carrinho com localStorage
   - Drawer, Modal Quick View
   - Busca, Filtros, Ordenação
   - WhatsApp dinâmico
   - FAB e formulários
=========================== */

// ---------- Utils ----------
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
const money = (n) => (Number(n) || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const body = document.body;
const WA_NUMBER = body.dataset.whatsapp || '+5599999999999';
const LOJA = body.dataset.nomeLoja || 'Preciosa Joias';

// ---------- WhatsApp Helpers ----------
function waLink(texto){
  const msg = encodeURIComponent(texto);
  return `https://wa.me/${WA_NUMBER.replace(/\D/g,'')}?text=${msg}`;
}
function attachWhatsLinks(){
  // Botões com data-whats
  $$('[data-whats]').forEach(a=>{
    a.setAttribute('href', waLink(a.getAttribute('data-whats')));
    a.setAttribute('target','_blank');
  });
  // Floating
  const waFloat = $('#wa-float'); if(waFloat) waFloat.href = waLink(`Olá! Vim do site ${LOJA}.`);
  const waFab = $('#wa-fab'); if(waFab) waFab.href = waLink(`Olá! Preciso de ajuda no ${LOJA}.`);
}
attachWhatsLinks();

// ---------- FAB ----------
(function initFAB(){
  const fab = $('.fab'); if(!fab) return;
  $('.fab-main', fab).addEventListener('click', ()=> fab.classList.toggle('open'));
  $('#btn-topo')?.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
})();

// ---------- Carrinho ----------
const CART_KEY = 'preciosa.cart.v1';
let cart = loadCart();

function loadCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch{ return []; }
}
function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartBadge(); }
function updateCartBadge(){ $$('#cart-count').forEach(el => el.textContent = cart.reduce((a,i)=>a+ (i.qtd||1),0)); }
updateCartBadge();

function addToCart({id, nome, preco, img}){
  const found = cart.find(i=>i.id===id);
  if(found) found.qtd += 1;
  else cart.push({id, nome, preco:Number(preco), img, qtd:1});
  saveCart();
  toast(`${nome} adicionado ao carrinho ✨`);
  renderCart();
}
function removeFromCart(id){
  cart = cart.filter(i=>i.id!==id); saveCart(); renderCart();
}
function changeQty(id, delta){
  const it = cart.find(i=>i.id===id); if(!it) return;
  it.qtd = Math.max(1, it.qtd + delta); saveCart(); renderCart();
}

// ---------- Drawer (carrinho lateral) ----------
const drawer = $('#drawer');
function renderCart(){
  if(!drawer) return;
  const total = cart.reduce((a,i)=> a + i.preco * i.qtd, 0);
  drawer.innerHTML = `
    <header>
      <strong>Seu carrinho</strong>
      <button class="btn" id="closeDrawer">Fechar</button>
    </header>
    <div class="items">
      ${
        cart.length ? cart.map(i=>`
          <div class="itemRow">
            <img src="${i.img || '../img/produtos/placeholder.jpg'}" alt="">
            <div>
              <div class="name">${i.nome}</div>
              <div class="price">${money(i.preco)} <small>× ${i.qtd}</small></div>
              <div style="display:flex; gap:8px; margin-top:6px;">
                <button class="btn" data-q="-1" data-id="${i.id}">−</button>
                <button class="btn" data-q="+1" data-id="${i.id}">+</button>
                <button class="remove" data-remove="${i.id}">remover</button>
              </div>
            </div>
            <div><strong>${money(i.preco * i.qtd)}</strong></div>
          </div>
        `).join('') : `<p style="text-align:center;color:#777">Seu carrinho está vazio.</p>`
      }
    </div>
    <div class="totals">
      <div style="display:flex; justify-content:space-between; font-weight:700">
        <span>Total</span><span>${money(total)}</span>
      </div>
    </div>
    <div class="actions">
      <a class="btn" href="checkout.html">Ir para Checkout</a>
      <a class="btn-primary" target="_blank" id="btnComprarWhats">Finalizar no Whats</a>
    </div>
  `;
  $('#closeDrawer')?.addEventListener('click', closeDrawer);
  // qty handlers
  $$('[data-q]').forEach(b=>{
    b.addEventListener('click', ()=> changeQty(b.dataset.id, Number(b.dataset.q)));
  });
  $$('[data-remove]').forEach(b=> b.addEventListener('click', ()=> removeFromCart(b.dataset.remove)));
  // Whats summary
  const resumo = cart.map(i=>`• ${i.nome} x${i.qtd} — ${money(i.preco*i.qtd)}`).join('\n');
  $('#btnComprarWhats')?.setAttribute('href', waLink(`Olá! Quero finalizar meu pedido:\n${resumo}\nTotal: ${money(total)}`));
}
function openDrawer(){ drawer?.classList.add('open'); renderCart(); }
function closeDrawer(){ drawer?.classList.remove('open'); }

// botão de abrir carrinho
$$('#btnCart').forEach(btn => btn.addEventListener('click', openDrawer));
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeDrawer(); });

// ---------- Modal Quick View ----------
const modal = $('#modal');
function openQuick({id, nome, preco, img}){
  if(!modal) return;
  modal.innerHTML = `
    <div class="box">
      <img src="${img}" alt="${nome}">
      <div class="info">
        <h3>${nome}</h3>
        <div class="price">${money(preco)}</div>
        <p>Banho dourado premium, hipoalergênico. Acabamento espelhado em padrão de luxo.</p>
        <div class="actions">
          <button class="btn-secondary" id="qAdd">Adicionar ao carrinho</button>
          <a class="btn" target="_blank" href="${waLink(`Olá! Quero ${nome}.`)}">WhatsApp</a>
        </div>
        <p class="hint">Garantia de 6 meses contra defeito de fabricação.</p>
        <div style="margin-top:12px"><button class="btn" id="qClose">Fechar</button></div>
      </div>
    </div>
  `;
  modal.classList.add('open');
  $('#qClose')?.addEventListener('click', ()=> modal.classList.remove('open'));
  $('#qAdd')?.addEventListener('click', ()=>{
    addToCart({id, nome, preco, img});
    modal.classList.remove('open');
    openDrawer();
  });
}
modal?.addEventListener('click', (e)=>{ if(e.target===modal) modal.classList.remove('open') });

// ---------- Bind de botões "Adicionar" e Quick ----------
function bindProductButtons(scope=document){
  // add to cart
  $$('[data-add]', scope).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const { id, nome, preco, img } = btn.dataset;
      addToCart({ id, nome, preco: Number(preco), img });
    });
  });
  // quick view ao clicar no card (se tiver data-quick)
  $$('[data-quick]', scope).forEach(card=>{
    card.style.cursor='pointer';
    card.addEventListener('click', (e)=>{
      // Evita conflito quando clicar em botões internos
      if(e.target.closest('[data-add]') || e.target.tagName==='A' || e.target.classList.contains('btn')) return;
      const { id, nome, preco, img } = card.dataset;
      openQuick({id, nome, preco:Number(preco), img});
    });
  });
}
bindProductButtons();

// ---------- Busca / Filtro / Ordenação (produtos.html) ----------
(function initFilters(){
  const grid = $('#catalog-grid'); if(!grid) return;
  const search = $('#search'); const cat = $('#filter-cat'); const sort = $('#sort');

  function apply(){
    let items = $$('.produto', grid);
    const term = (search?.value || '').trim().toLowerCase();
    const categoria = cat?.value || 'all';
    // filtra
    items.forEach(card=>{
      const nome = (card.dataset.nome||'').toLowerCase();
      const okTerm = !term || nome.includes(term);
      const okCat = categoria==='all' || (card.dataset.cat===categoria);
      card.style.display = okTerm && okCat ? '' : 'none';
    });
    // ordena
    const visible = items.filter(c=>c.style.display!=='none');
    if(sort){
      if(sort.value==='price-asc') visible.sort((a,b)=> Number(a.dataset.preco)-Number(b.dataset.preco));
      if(sort.value==='price-desc') visible.sort((a,b)=> Number(b.dataset.preco)-Number(a.dataset.preco));
      visible.forEach(c=> grid.appendChild(c));
    }
  }
  search?.addEventListener('input', apply);
  cat?.addEventListener('change', apply);
  sort?.addEventListener('change', apply);
})();

// ---------- Formulários ----------
(function forms(){
  // Newsletter
  const nl = document.querySelector('.newsletter form');
  nl?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = nl.querySelector('input[type="email"]')?.value || '';
    toast(`Obrigada! Cupom de 10% enviado para ${email} ✨`);
    nl.reset();
  });

  // Contato
  const contato = document.querySelector('.form-contato');
  contato?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const nome = contato.querySelector('input[type="text"]')?.value || '';
    const msg = contato.querySelector('textarea')?.value || '';
    const link = waLink(`Olá, sou ${nome}. Mensagem: ${msg}`);
    window.open(link,'_blank');
  });

  // Checkout → envia resumo pro WhatsApp
  const chk = document.querySelector('.checkout-form');
  chk?.addEventListener('submit',(e)=>{
    e.preventDefault();
    const dados = Array.from(chk.querySelectorAll('input,select')).map(i=> `${i.placeholder||i.name}: ${i.value}`).join('\n');
    const resumo = cart.map(i=>`• ${i.nome} x${i.qtd} — ${money(i.preco*i.qtd)}`).join('\n');
    const total = money(cart.reduce((a,i)=>a+i.preco*i.qtd,0));
    const link = waLink(`Pedido ${LOJA}\n\n${resumo}\nTotal: ${total}\n\nDados:\n${dados}`);
    window.open(link,'_blank');
  });

  // Login/Cadastro (simulado)
  document.querySelector('.login-form')?.addEventListener('submit', (e)=>{e.preventDefault(); toast('Login realizado ✨ (simulado)');});
  document.querySelector('.signup-form')?.addEventListener('submit', (e)=>{e.preventDefault(); toast('Conta criada ✨ (simulado)');});
})();

// ---------- Página produto: botão add/whats ----------
(function productPageWires(){
  const addBtn = document.getElementById('btn-add');
  if(!addBtn) return;
  const nome = document.getElementById('produto-nome')?.textContent?.trim() || 'Produto';
  const precoText = document.getElementById('produto-preco')?.textContent?.replace(/[^\d]/g,'') || '0';
  const preco = Number(precoText);
  const img = document.getElementById('produto-img')?.src || '';

  addBtn.addEventListener('click', ()=> addToCart({id: nome.toLowerCase().replace(/\s+/g,'-'), nome, preco, img}));
  const w = document.getElementById('btn-whats');
  if(w) w.href = waLink(`Olá! Tenho interesse em ${nome} (${money(preco)}).`);
})();

// ---------- Toast simples ----------
let toastTimer;
function toast(msg){
  let t = $('#toast');
  if(!t){
    t = document.createElement('div');
    t.id='toast';
    Object.assign(t.style,{
      position:'fixed', bottom:'20px', left:'50%', transform:'translateX(-50%)',
      background:'#1a1a1a', color:'#fff', padding:'12px 16px', borderRadius:'999px',
      boxShadow:'0 10px 20px rgba(0,0,0,.2)', zIndex:2000, maxWidth:'92vw', textAlign:'center'
    });
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity='0'; t.style.transition='opacity .2s'; t.style.display='block';
  requestAnimationFrame(()=> t.style.opacity='1');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=> t.style.display='none', 200) }, 2200);
}

// ---------- Inicialização ----------
document.addEventListener('DOMContentLoaded', ()=>{
  bindProductButtons();       // em todas as páginas com cards
  renderCart();               // desenha carrinho ao carregar
});
