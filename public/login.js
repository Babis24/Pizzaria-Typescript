document.addEventListener('DOMContentLoaded', () => {
    // --- Referências do DOM ---
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const statusMessage = document.getElementById('status-message');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const quemSomosModal = document.getElementById('quem-somos-modal');
    const quemSomosBtn = document.getElementById('quem-somos-btn');
    const closeModal = quemSomosModal ? quemSomosModal.querySelector('.close-button') : null;

    if(statusMessage) { statusMessage.style.display = 'none'; }

    // --- Lógica da Busca por CEP ---
    const cepInput = document.getElementById('register-cep');
    const ruaInput = document.getElementById('register-rua');
    const bairroInput = document.getElementById('register-bairro');
    const cidadeInput = document.getElementById('register-cidade');
    const ufInput = document.getElementById('register-uf');
    const numeroInput = document.getElementById('register-numero');
    const cepStatus = document.getElementById('cep-status');

    if (cepInput) {
        cepInput.addEventListener('input', (e) => {
            let cep = e.target.value.replace(/\D/g, '');
            if (cep.length > 8) cep = cep.slice(0, 8);
            e.target.value = cep;

            if (cep.length === 8) {
                buscarCEP(cep);
            } else {
                limparFormularioEndereco();
            }
        });
    }

    async function buscarCEP(cep) {
        cepStatus.textContent = 'Buscando...';
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (data.erro) throw new Error('CEP não encontrado.');
            
            ruaInput.value = data.logradouro;
            bairroInput.value = data.bairro;
            cidadeInput.value = data.localidade;
            ufInput.value = data.uf;
            cepStatus.textContent = '';
            numeroInput.focus();
        } catch (error) {
            cepStatus.textContent = error.message;
        }
    }

    function limparFormularioEndereco() {
        ruaInput.value = '';
        bairroInput.value = '';
        cidadeInput.value = '';
        ufInput.value = '';
        cepStatus.textContent = '';
    }

    // --- Funções Auxiliares ---
    function showStatus(message, isError = false) { statusMessage.textContent = message; statusMessage.className = `status-message ${isError ? 'error' : 'success'}`; statusMessage.style.display = 'block'; }
    function toggleForms(showRegister) {
        loginView.style.display = showRegister ? 'none' : 'block';
        registerView.style.display = showRegister ? 'block' : 'none';
        statusMessage.style.display = 'none';
    }

    // --- Lógica Principal (Login, Cadastro, Modal) ---
    if(showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); toggleForms(true); });
    if(showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleForms(false); });
    
    if(quemSomosBtn && quemSomosModal) { quemSomosBtn.addEventListener('click', (e) => { e.preventDefault(); quemSomosModal.style.display = 'flex'; }); }
    if(closeModal) closeModal.addEventListener('click', () => { quemSomosModal.style.display = 'none'; });
    if(quemSomosModal) window.addEventListener('click', (e) => { if (e.target === quemSomosModal) quemSomosModal.style.display = 'none'; });
    
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const senha = document.getElementById('login-senha').value;
            try {
                const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha }) });
                const result = await response.json();
                if (!response.ok) throw new Error(result.erro || 'Falha no login.');
                localStorage.setItem('authToken', result.token);
                window.location.href = result.usuario.role === 'admin' ? '/admin.html' : '/index.html';
            } catch (error) {
                showStatus(error.message, true);
            }
        });
    }
    
    if(registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const enderecoCompleto = `${ruaInput.value}, ${numeroInput.value} - ${bairroInput.value}, ${cidadeInput.value} - ${ufInput.value}`;

            const payload = {
                nome: document.getElementById('register-nome').value,
                telefone: document.getElementById('register-telefone').value.replace(/\D/g, ''),
                endereco: ruaInput.value ? enderecoCompleto : '', // Só envia o endereço se a rua foi preenchida
                email: document.getElementById('register-email').value,
                senha: document.getElementById('register-senha').value
            };

            try {
                const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) { const result = await response.json(); throw new Error(result.erro || 'Não foi possível cadastrar.'); }
                
                showStatus('Cadastro realizado com sucesso! Faça o login.', false);
                registerForm.reset();
                toggleForms(false);
            } catch (error) {
                showStatus(error.message, true);
            }
        });
    }
});