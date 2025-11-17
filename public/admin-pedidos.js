document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = '/login.html'; return; }

    const orderListDiv = document.getElementById('order-list');
    
    async function loadOrders() { /* ... implementação abaixo ... */ }

    orderListDiv.addEventListener('click', async (e) => {
        if(e.target.classList.contains('btn-delete')){
            const id = e.target.dataset.id;
            if(confirm(`Tem certeza que deseja excluir o pedido #${id}?`)){
                await fetch(`/api/pedidos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                loadOrders();
            }
        }
    });

    async function loadOrders() {
        try {
            const res = await fetch('/api/pedidos', { headers: { 'Authorization': `Bearer ${token}` } });
            const pedidos = await res.json();
            orderListDiv.innerHTML = `<table class="data-table"><thead><tr><th>ID</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead><tbody>
                ${pedidos.map(p => `<tr>
                    <td>#${p.id}</td><td>${p.cliente_nome}</td>
                    <td>${new Date(p.data_pedido).toLocaleString('pt-BR')}</td>
                    <td>${parseFloat(p.total).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td>
                    <td>${p.status_pedido}</td>
                    <td><button class="btn-delete" data-id="${p.id}">Excluir</button></td>
                </tr>`).join('')}
            </tbody></table>`;
        } catch (error) { orderListDiv.innerHTML = '<p style="color:red">Falha ao carregar pedidos</p>'; }
    }
    
    loadOrders();
});