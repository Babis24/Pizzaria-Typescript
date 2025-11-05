document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos da interface
    const loadingEl = document.getElementById('loading-admin');
    const reportsContentEl = document.getElementById('reports-content');
    const btnGerarRelatorio = document.getElementById('btnGerarRelatorio');
    const dataInicioEl = document.getElementById('dataInicio');
    const dataFimEl = document.getElementById('dataFim');

    // Variáveis para as instâncias dos gráficos Chart.js
    let graficoVendas, graficoTopProdutos;

    // Função utilitária para formatar números como moeda (BRL)
    const formatarMoeda = (valor) => {
        return parseFloat(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };
    
    // Função principal para buscar e renderizar os relatórios
    const gerarRelatorio = async () => {
        const dataInicio = dataInicioEl.value;
        const dataFim = dataFimEl.value;

        if (!dataInicio || !dataFim) {
            alert('Por favor, selecione as datas de início e fim.');
            return;
        }

        // Exibe o loading e esconde o conteúdo antigo
        loadingEl.style.display = 'block';
        reportsContentEl.style.display = 'none';

        try {
            const url = `/api/relatorios/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}`;
            const response = await fetch(url);

            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.erro || 'Falha ao buscar os dados do relatório.');
            }
            
            const data = await response.json();
            
            // Chama as funções para popular a página com os novos dados
            atualizarResumo(data.resumoGeral);
            renderizarGraficoVendas(data.vendasPorDia);
            renderizarGraficoTopProdutos(data.topProdutos);
            preencherTabelaTodosProdutos(data.todosProdutosVendidos);

        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            alert(`Não foi possível carregar o relatório: ${error.message}`);
        } finally {
            // Esconde o loading e exibe o novo conteúdo
            loadingEl.style.display = 'none';
            reportsContentEl.style.display = 'block';
        }
    };

    // Atualiza os cards de resumo (Faturamento, Pedidos, Ticket Médio)
    const atualizarResumo = (resumo) => {
        const container = document.getElementById('summary-container');
        container.innerHTML = `
            <div class="summary-item">
                <h3>Faturamento Total</h3>
                <p>${formatarMoeda(resumo.faturamento_total)}</p>
            </div>
            <div class="summary-item">
                <h3>Total de Pedidos</h3>
                <p>${resumo.total_pedidos || 0}</p>
            </div>
            <div class="summary-item">
                <h3>Ticket Médio</h3>
                <p>${formatarMoeda(resumo.ticket_medio)}</p>
            </div>
        `;
    };

    // Renderiza o gráfico de vendas diárias
    const renderizarGraficoVendas = (vendas) => {
        const ctx = document.getElementById('graficoVendas').getContext('2d');
        if (graficoVendas) graficoVendas.destroy(); // Destrói o gráfico anterior

        graficoVendas = new Chart(ctx, {
            type: 'line',
            data: {
                labels: vendas.map(v => new Date(v.dia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })),
                datasets: [{
                    label: 'Faturamento por Dia',
                    data: vendas.map(v => v.total_vendido),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            }
        });
    };

    // Renderiza o gráfico de top 10 produtos
    const renderizarGraficoTopProdutos = (produtos) => {
        const ctx = document.getElementById('graficoTopProdutos').getContext('2d');
        if (graficoTopProdutos) graficoTopProdutos.destroy(); // Destrói o gráfico anterior

        graficoTopProdutos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: produtos.map(p => p.nome),
                datasets: [{
                    label: 'Unidades Vendidas',
                    data: produtos.map(p => p.quantidade_vendida),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)'
                }]
            },
            options: { indexAxis: 'y', responsive: true }
        });
    };

    // Preenche a tabela com a lista de todos os produtos vendidos
    const preencherTabelaTodosProdutos = (produtos) => {
        const corpoTabela = document.getElementById('corpoTabelaTodosProdutos');
        corpoTabela.innerHTML = ''; // Limpa dados antigos

        if (produtos.length === 0) {
            corpoTabela.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhum produto vendido no período.</td></tr>';
            return;
        }

        produtos.forEach(produto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.quantidade_total}</td>
                <td style="text-align: right;">${formatarMoeda(produto.faturamento_gerado)}</td>
            `;
            corpoTabela.appendChild(tr);
        });
    };

    // Define um período padrão (mês atual) e carrega o relatório inicial
    const inicializarPagina = () => {
        const hoje = new Date();
        const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        
        dataFimEl.value = hoje.toISOString().split('T')[0];
        dataInicioEl.value = primeiroDiaDoMes.toISOString().split('T')[0];
        
        gerarRelatorio();
    };

    // Adiciona o evento de clique ao botão
    btnGerarRelatorio.addEventListener('click', gerarRelatorio);
    
    // Inicia a página
    inicializarPagina();
});