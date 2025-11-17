document.addEventListener('DOMContentLoaded', () => {
    // Vistas e formulários
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const statusMessage = document.getElementById('status-message');

    // Links para alternar entre vistas
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Modal "Quem Somos"
    const quemSomosModal = document.getElementById('quem-somos-modal');
    const quemSomosBtn = document.getElementById('quem-somos-btn');
    const closeModal = quemSomosModal.querySelector('.close-button');

    // Garante que o status message comece invisível
    statusMessage.style.display = 'none';
    statusMessage.textContent = '';


    // --- Funções para alternar formulários ---
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        registerView.style.display = 'block';
        statusMessage.style.display = 'none';
        statusMessage.textContent = '';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.style.display = 'none';
        loginView.style.display = 'block';
        statusMessage.style.display = 'none';
        statusMessage.textContent = '';
    });
    
    // --- Lógica do Modal ---
    quemSomosBtn.addEventListener('click', (e) => {
        e.preventDefault();
        quemSomosModal.style.display = 'flex';
    });
    closeModal.addEventListener('click', () => {
        quemSomosModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === quemSomosModal) {
            quemSomosModal.style.display = 'none';
        }
    });

    // Função para exibir mensagem
    function showStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.className = isError ? 'status-message error' : 'status-message success';
        statusMessage.style.display = 'block';
    }
    
    // --- Lógica do Login ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            const result = await response.json();

            if (!response.ok) throw new Error(result.erro || 'Falha no login.');
            
            localStorage.setItem('authToken', result.token);
            window.location.href = result.usuario.role === 'admin' ? '/admin.html' : '/index.html';

        } catch (error) {
            showStatus(error.message, true);
        }
    });
    
    // --- Lógica de Cadastro ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('register-nome').value;
        const telefone = document.getElementById('register-telefone').value;
        const endereco = document.getElementById('register-endereco').value;
        const email = document.getElementById('register-email').value;
        const senha = document.getElementById('register-senha').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, telefone, email, senha, endereco })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.erro || 'Não foi possível cadastrar.');
            }

            showStatus('Cadastro realizado com sucesso! Faça o login.', false);
            registerForm.reset();
            showLoginLink.click();

        } catch (error) {
            showStatus(error.message, true);
        }
    });
});