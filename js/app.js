document.addEventListener('DOMContentLoaded',()=>{

// Lista de produtos
const produtos=[
  {nome:"Anel de Ouro", preco:250, imagem:"anel.jpg", descricao:"Anel elegante de ouro 18k."},
  {nome:"Colar Rosa", preco:180, imagem:"colar.jpg", descricao:"Colar delicado com pingente rosa."},
  {nome:"Brincos Luxo", preco:150, imagem:"brinco.jpg", descricao:"Brincos sofisticados para qualquer ocasião."},
  {nome:"Pulseira Dourada", preco:200, imagem:"pulseira.jpg", descricao:"Pulseira elegante e moderna."},
  {nome:"Tiara Brilhante", preco:300, imagem:"tiara.jpg", descricao:"Tiara para ocasiões especiais."}
];

// Carrinho
let carrinho=JSON.parse(localStorage.getItem('carrinho')) || [];

// Seleciona o grid de produtos
const grid=document.querySelector('.produtos-grid');

// Gera cards automaticamente
produtos.forEach((p,i)=>{
  const div=document.createElement('div');
  div.className='produto';
  div.innerHTML=`
    <img src="imagens/${p.imagem}" alt="${p.nome}" data-index="${i}">
    <h3>${p.nome}</h3>
    <p>R$ ${p.preco}</p>
    <button onclick="adicionarCarrinho(${i})">Adicionar ao Carrinho</button>
  `;
  grid.appendChild(div);
});

// Modal Produto
const modal=document.getElementById('modal-produto');
const modalImg=modal.querySelector('img');
const modalTitle=modal.querySelector('h3');
const modalDesc=modal.querySelector('p');
const btnAddModal=modal.querySelector('button');

// Abre modal ao clicar na imagem
grid.addEventListener('click', e=>{
  if(e.target.tagName==='IMG'){
    const index=e.target.dataset.index;
    modal.style.display='flex';
    modalImg.src=`imagens/${produtos[index].imagem}`;
    modalTitle.textContent=produtos[index].nome;
    modalDesc.textContent=produtos[index].descricao;
    btnAddModal.onclick=()=>{adicionarCarrinho(index); modal.style.display='none';};
  }
});

// Fecha modal
document.querySelectorAll('.close-modal').forEach(el=>{
  el.onclick=()=>{modal.style.display='none';}
});

// Função para adicionar ao carrinho
window.adicionarCarrinho=(i)=>{
  carrinho.push(produtos[i]);
  localStorage.setItem('carrinho',JSON.stringify(carrinho));
  alert(`${produtos[i].nome} adicionado ao carrinho!`);
  updateCarrinho();
};

// Atualiza carrinho (se houver container)
function updateCarrinho(){
  const ul=document.querySelector('#carrinho-container ul');
  if(!ul) return;
  ul.innerHTML='';
  let total=0;
  carrinho.forEach((p)=>{
    total+=p.preco;
    const li=document.createElement('li');
    li.textContent=`${p.nome} - R$ ${p.preco}`;
    ul.appendChild(li);
  });
  const totalElem=document.getElementById('total');
  if(totalElem) totalElem.textContent=`Total: R$ ${total}`;
}

// Atualiza ao carregar
updateCarrinho();
});
