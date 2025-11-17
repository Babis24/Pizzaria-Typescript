document.addEventListener('DOMContentLoaded', () => {
    // --- Autenticação ---
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // --- Referências do DOM ---
    const productsGridContainer = document.getElementById('products-grid-container');
    const sectionTitle = document.getElementById('section-title');
    const loadingDiv = document.getElementById('loading');
    const productsSection = document.querySelector('.products-section');
    const searchInput = document.getElementById('search-input');
    const filterContainer = document.querySelector('.sidebar .filter-container');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Carrinho
    const cartIcon = document.getElementById('cart-icon');
    const cartCountSpan = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeModalButton = cartModal.querySelector('.close-button');
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalValueSpan = document.getElementById('cart-total-value');
    const checkoutSection = document.getElementById('checkout-section');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clienteLogadoSpan = document.getElementById('cliente-logado');

    // Comprovante (Receipt)
    const receiptModal = document.getElementById('receipt-modal');
    const receiptContent = document.getElementById('receipt-content');
    const closeReceiptBtn = receiptModal.querySelector('.close-button');
    const printBtn = document.getElementById('print-receipt-btn');

    // --- Variáveis de Estado ---
    let usuarioLogado;
    let cart = [];
    let searchTimer;

    // --- Função de Inicialização ---
    async function initialize() {
        try {
            const response = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Sessão inválida.');
            
            usuarioLogado = await response.json();
            
            if (usuarioLogado.role === 'admin') {
                window.location.href = '/admin.html';
                return;
            }

            if (clienteLogadoSpan) clienteLogadoSpan.textContent = usuarioLogado.nome;
            
            loadProducts(); 
            loadCartFromStorage();
        } catch (error) {
            console.error(error.message);
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
        }
    }

    // --- Funções de Lógica ---
    async function loadProducts(categoria = 'todos', searchTerm = '') {
        loadingDiv.style.display = 'block';
        productsSection.style.display = 'none';
        
        const apiUrl = searchTerm ? `/api/produtos/search?termo=${encodeURIComponent(searchTerm)}` : '/api/produtos';
        
        try {
            const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao carregar produtos do servidor.');
            
            let produtos = await response.json();
            
            if (!searchTerm && categoria !== 'todos') {
                produtos = produtos.filter(p => p.categoria === categoria);
            }
            renderProducts(produtos);
        } catch (error) {
            loadingDiv.textContent = `Erro: ${error.message}`;
        } finally {
            loadingDiv.style.display = 'none';
            productsSection.style.display = 'block';
        }
    }


function renderProducts(produtos) {
    productsGridContainer.innerHTML = '';
    if (!produtos || produtos.length === 0) {
        productsGridContainer.innerHTML = '<p style="text-align: center; width: 100%;">Nenhum produto encontrado.</p>';
        return;
    }
    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        
        const precoFinal = produto.em_promocao && produto.preco_promocional ? produto.preco_promocional : produto.preco;
        const precoFormatado = parseFloat(precoFinal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const precoAntigoFormatado = parseFloat(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // --- CORREÇÃO E ADIÇÃO AQUI ---
        card.innerHTML = `
          ${produto.imagem_url ? `<img src="${produto.imagem_url}" alt="${produto.nome}" class="card-image">` : ''}
          ${produto.em_promocao ? `<div class="promo-badge">PROMO</div>` : ''}
          <div class="info-container">
            <div class="categoria">${produto.categoria}</div>
            <h2 class="nome">${produto.nome}</h2>
            <p class="descricao">${produto.descricao || ''}</p>
          </div>
          <div class="card-footer">
            <div class="preco">
              ${produto.em_promocao ? `<span class="preco-antigo">${precoAntigoFormatado}</span>` : ''}
              ${precoFormatado}
            </div>
            <div class="footer-actions">
              <button class="add-to-cart-btn" title="Adicionar ao Carrinho" data-id="${produto.id}" data-nome="${produto.nome}" data-preco="${precoFinal}">➕</button>
            </div>
          </div>
        `;
        // -----------------------------
        productsGridContainer.appendChild(card);
    });
}

    // -- Lógica do Carrinho --
    function loadCartFromStorage() { /* ... implementação anterior ... */ }
    function saveCartToStorage() { /* ... implementação anterior ... */ }
    function addToCart(productId, productName, productPrice) { /* ... implementação anterior ... */ }
    function removeFromCart(productId) { /* ... implementação anterior ... */ }
    function updateCartUI() { /* ... implementação anterior ... */ }

    async function handleCheckout() {
        if (cart.length === 0) return alert('Seu carrinho está vazio.');
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Processando...';
        const pedidoData = {
            formaPagamento: document.getElementById('pagamento-select').value,
            itens: cart.map(item => ({ produtoId: item.id, quantidade: item.quantity }))
        };
        try {
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(pedidoData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.erro || 'Falha ao finalizar o pedido.');
            }
            const result = await response.json();
            alert('Pedido finalizado com sucesso!');
            
            showReceipt(result, usuarioLogado);

            cart = [];
            saveCartToStorage();
            updateCartUI();
            cartModal.style.display = 'none';
        } catch (error) {
            alert(`Erro: ${error.message}`);
        } finally {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Finalizar Pedido';
        }
    }

    function showReceipt(pedidoResult, cliente) {
        receiptContent.innerHTML = `
            <p><strong>Pedido ID:</strong> #${pedidoResult.id}</p>
            <p><strong>Cliente:</strong> ${cliente.nome}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <hr><h4>Itens:</h4>
            <ul>
                ${pedidoResult.itens.map(item => `<li>${cart.find(p => p.id === item.produtoId)?.name || 'Produto desconhecido'} (x${item.quantidade})</li>`).join('')}
            </ul><hr>
            <p><strong>Pagamento:</strong> ${pedidoResult.formaPagamento}</p>
            <h3>Total: ${parseFloat(pedidoResult.total).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</h3>
        `;
        receiptModal.style.display = 'flex';
    }


    // -- Event Listeners --
    filterContainer.addEventListener('click', e => { /* ... implementação anterior ... */ });
    searchInput.addEventListener('keyup', e => { /* ... implementação anterior ... */ });
    productsGridContainer.addEventListener('click', e => { /* ... implementação anterior ... */ });
    cartItemsDiv.addEventListener('click', e => { /* ... implementação anterior ... */ });
    logoutBtn.addEventListener('click', () => { /* ... implementação anterior ... */ });
    cartIcon.onclick = () => { /* ... implementação anterior ... */ };
    closeModalButton.onclick = () => { /* ... implementação anterior ... */ };
    checkoutBtn.addEventListener('click', handleCheckout);
    closeReceiptBtn.onclick = () => { receiptModal.style.display = 'none'; };
    printBtn.onclick = () => window.print();
    window.onclick = e => { if (e.target == cartModal || e.target == receiptModal) e.target.style.display = 'none'; };

    // -- INICIALIZAÇÃO --
    initialize();

    // Copiando as implementações anteriores para cá, para garantir que tudo esteja no mesmo lugar.
    function loadCartFromStorage(){const storedCart=localStorage.getItem('pizzariaCart');if(storedCart)cart=JSON.parse(storedCart);updateCartUI()}
    function saveCartToStorage(){localStorage.setItem('pizzariaCart',JSON.stringify(cart))}
    function addToCart(productId,productName,productPrice){const existingItem=cart.find(item=>item.id===productId);if(existingItem){existingItem.quantity++}else{cart.push({id:productId,name:productName,price:productPrice,quantity:1})}saveCartToStorage();updateCartUI()}
    function removeFromCart(productId){cart=cart.filter(item=>item.id!==productId);saveCartToStorage();updateCartUI()}
    function updateCartUI(){cartItemsDiv.innerHTML='';let total=0,totalItems=0;cart.forEach(item=>{const itemTotal=item.price*item.quantity;total+=itemTotal;totalItems+=item.quantity;const cartItem=document.createElement('div');cartItem.className='cart-item';cartItem.innerHTML=`<span>${item.name} (x${item.quantity})</span><span>${itemTotal.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span><button class="remove-item-btn" data-id="${item.id}" title="Remover">&times;</button>`;cartItemsDiv.appendChild(cartItem)});cartCountSpan.textContent=totalItems;cartTotalValueSpan.textContent=total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});checkoutSection.style.display=cart.length>0?'block':'none'}
    filterContainer.addEventListener('click', function(event) { const target = event.target.closest('.filter-btn'); if (target) { searchInput.value = ''; document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active')); target.classList.add('active'); loadProducts(target.dataset.categoria); } });
    searchInput.addEventListener('keyup', (event) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active')); document.querySelector('.filter-btn[data-categoria="todos"]').classList.add('active'); loadProducts('todos', event.target.value.trim()); }, 400); });
    productsGridContainer.addEventListener('click', (event) => { const target = event.target.closest('.add-to-cart-btn'); if (target) { addToCart(parseInt(target.dataset.id), target.dataset.nome, parseFloat(target.dataset.preco)); } });
    cartItemsDiv.addEventListener('click', (event) => { const target = event.target.closest('.remove-item-btn'); if (target) removeFromCart(parseInt(target.dataset.id)); });
    logoutBtn.addEventListener('click', () => { localStorage.removeItem('authToken'); window.location.href = '/login.html'; });
    cartIcon.onclick = () => { cartModal.style.display = 'flex'; };
    closeModalButton.onclick = () => { cartModal.style.display = 'none'; };
});