// public/admin-pedidos.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = '/login.html'; return; }

    const orderListDiv = document.getElementById('order-list');
    const logoutBtn = document.getElementById('logout-btn');
    
    async function loadOrders() {
        orderListDiv.innerHTML = '<p>Carregando pedidos...</p>';
        try {
            const response = await fetch('/api/pedidos', { 
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao carregar pedidos.');
            
            const pedidos = await response.json();
            renderOrders(pedidos);

        } catch (error) {
            orderListDiv.innerHTML = `<p style="color:red">${error.message}</p>`;
        }
    }

    function renderOrders(pedidos) {
        if (pedidos.length === 0) {
            orderListDiv.innerHTML = '<p>Nenhum pedido encontrado.</p>';
            return;
        }

        orderListDiv.innerHTML = `
            <table class="data-table">
                <thead><tr><th>ID</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                    ${pedidos.map(p => `<tr>
                        <td>#${p.id}</td>
                        <td>${p.cliente_nome}</td>
                        <td>${new Date(p.data_pedido).toLocaleString('pt-BR')}</td>
                        <td>${(p.total ? parseFloat(p.total) : 0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td>
                        <td><span class="status-badge">${p.status_pedido}</span></td>
                        <td><button class="btn-delete" data-id="${p.id}">Excluir</button></td>
                    </tr>`).join('')}
                </tbody>
            </table>`;
    }

    // --- CORREÇÃO NO EVENT LISTENER DE CLIQUE ---
    orderListDiv.addEventListener('click', async (e) => {
        if(e.target.classList.contains('btn-delete')){
            const id = e.target.dataset.id;
            if(confirm(`Tem certeza que deseja excluir o pedido #${id}? Esta ação não pode ser desfeita.`)){
                try {
                    const response = await fetch(`/api/pedidos/${id}`, { 
                        method: 'DELETE', 
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    // Verifica se a resposta da API foi bem-sucedida (status 200-299)
                    if (!response.ok) {
                        // Se não foi, pega a mensagem de erro do servidor
                        const errorData = await response.json();
                        throw new Error(errorData.erro || 'Não foi possível excluir o pedido.');
                    }

                    // Se foi bem-sucedida, recarrega a lista
                    loadOrders();

                } catch(error) {
                    // Exibe o erro para o usuário
                    alert(`Erro: ${error.message}`);
                }
            }
        }
    });

    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
        });
    }
    
    loadOrders();
});