const URL = "https://gaby-essennce-production.up.railway.app";

// Função para upload de imagem para Cloudinary
async function uploadImage(file) {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "back_gaby"); // seu preset
    data.append("cloud_name", "dbedisyll");     // seu cloud name

    try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dbedisyll/image/upload", {
            method: "POST",
            body: data,
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.error?.message || "Erro desconhecido no upload");
        }

        return result.secure_url; // retorna só a URL segura da imagem
    } catch (err) {
        console.error("Erro no upload:", err.message);
        throw err;
    }
}

// Função para preview da imagem selecionada
function previewImage(file) {
    const previewContainer = document.getElementById('preview-container');
    previewContainer.innerHTML = '';

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '200px';
            img.style.maxHeight = '200px';
            img.style.border = '1px solid #ccc';
            img.style.borderRadius = '5px';
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Função para mostrar mensagens
    function showMessage(message, type = 'success') {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) existingMessage.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        const form = document.getElementById('trabalhoForm');
        form.parentNode.insertBefore(messageDiv, form);

        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 4500);
    }

    // Função para mostrar loading
    function showLoading(button) {
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span> Processando...';
    }

    // Função para esconder loading
    function hideLoading(button, text) {
        button.disabled = false;
        button.innerHTML = text;
    }

    // Função para buscar trabalhos do backend
    async function fetchTrabalhos() {
        try {
            const response = await fetch(`${URL}/trabalhos`);
            if (!response.ok) throw new Error('Erro ao buscar trabalhos');
            const trabalhos = await response.json();
            exibirTrabalhos(trabalhos);
        } catch (error) {
            console.error(error);
            showMessage('Erro ao carregar trabalhos. Tente novamente.', 'error');
        }
    }

    // Função para exibir trabalhos na lista
    function exibirTrabalhos(trabalhos) {
        const lista = document.getElementById('trabalhos-lista');
        lista.innerHTML = '';

        if (trabalhos.length === 0) {
            lista.innerHTML = '<div class="trabalho-item" style="text-align: center; grid-column: 1 / -1;"><p style="color: rgba(255,255,255,0.7);">Nenhum trabalho encontrado. Adicione o primeiro trabalho!</p></div>';
            return;
        }

        trabalhos.forEach((trabalho, index) => {
            const div = document.createElement('div');
            div.classList.add('trabalho-item');
            div.style.animationDelay = `${index * 0.1}s`;
            div.innerHTML = `
                <h4>${trabalho.titulo}</h4>
                <p>${trabalho.descricao}</p>
                ${trabalho.link ? `<p><a href="${trabalho.link}" target="_blank">${trabalho.link}</a></p>` : ''}
                <img src="${trabalho.image}" alt="${trabalho.titulo}" />
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button data-id="${trabalho.id}" class="editar-btn">✏️ Editar</button>
                    <button data-id="${trabalho.id}" class="deletar-btn">🗑️ Excluir</button>
                </div>
            `;
            lista.appendChild(div);
        });
        adicionarEventosBotoes();
    }

    // Função para adicionar eventos aos botões editar e excluir
    function adicionarEventosBotoes() {
        document.querySelectorAll('.deletar-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');

                // Modal de confirmação moderno
                if (confirm('🗑️ Tem certeza que deseja excluir este trabalho?\n\nEsta ação não pode ser desfeita.')) {
                    try {
                        const response = await fetch(`${URL}/trabalho/${id}`, {
                            method: 'DELETE'
                        });
                        if (response.status === 404) {
                            showMessage('⚠️ Trabalho não encontrado. Talvez já tenha sido deletado.', 'error');
                            fetchTrabalhos(); // Recarregar lista
                            return;
                        }
                        if (!response.ok) throw new Error('Erro ao deletar trabalho');

                        showMessage('✅ Trabalho deletado com sucesso!');
                        fetchTrabalhos();
                    } catch (error) {
                        console.error(error);
                        showMessage('❌ Erro ao deletar trabalho. Tente novamente.', 'error');
                    }
                }
            });
        });

        document.querySelectorAll('.editar-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');

                // Buscar dados do trabalho para editar
                try {
                    const response = await fetch(`${URL}/trabalho/${id}`);
                    if (!response.ok) throw new Error('Erro ao buscar trabalho');
                    const trabalho = await response.json();
                    preencherFormulario(trabalho);
                    editarId = id;

                    // Scroll para o formulário
                    document.getElementById('novo-trabalho-form').scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });

                    showMessage('📝 Modo de edição ativado. Faça as alterações e salve.');
                } catch (error) {
                    console.error(error);
                    showMessage('❌ Erro ao carregar dados do trabalho.', 'error');
                }
            });
        });
    }

    // Variável para controlar edição
    let editarId = null;

    // Função para preencher formulário com dados para edição
    function preencherFormulario(trabalho) {
        document.getElementById('titulo').value = trabalho.titulo;
        document.getElementById('descricao').value = trabalho.descricao;
        // Para edição, mostrar a imagem atual no preview
        if (trabalho.image) {
            const previewContainer = document.getElementById('preview-container');
            previewContainer.innerHTML = `
                <p style="color: rgba(255,255,255,0.7); font-size: 14px;">Imagem atual:</p>
                <img src="${trabalho.image}" alt="Imagem atual" style="max-width: 200px; max-height: 200px; border: 1px solid #ccc; border-radius: 5px;">
                <p style="color: rgba(255,255,255,0.7); font-size: 12px;">Selecione uma nova imagem para alterar.</p>
            `;
        }

        // Mudar texto do botão
        const submitBtn = document.querySelector('#trabalhoForm button[type="submit"]');
        submitBtn.textContent = '💾 Atualizar Trabalho';

        // Adicionar botão cancelar
        if (!document.getElementById('cancelar-btn')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.id = 'cancelar-btn';
            cancelBtn.textContent = '❌ Cancelar';
            cancelBtn.style.background = 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)';
            cancelBtn.style.marginTop = '10px';
            cancelBtn.onclick = cancelarEdicao;

            submitBtn.parentNode.appendChild(cancelBtn);
        }
    }

    // Função para cancelar edição
    function cancelarEdicao() {
        editarId = null;
        document.getElementById('trabalhoForm').reset();

        const submitBtn = document.querySelector('#trabalhoForm button[type="submit"]');
        submitBtn.textContent = '➕ Adicionar Trabalho';

        const cancelBtn = document.getElementById('cancelar-btn');
        if (cancelBtn) cancelBtn.remove();

        showMessage('📝 Edição cancelada.');
    }

    // Evento para preview da imagem ao selecionar arquivo
    const imagemInput = document.getElementById('imagem');
    imagemInput.addEventListener('change', function() {
        const file = this.files[0];
        previewImage(file);
    });

    // Evento submit do formulário
    const form = document.getElementById('trabalhoForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.querySelector('#trabalhoForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        showLoading(submitBtn);

        const titulo = document.getElementById('titulo').value;
        const descricao = document.getElementById('descricao').value;
        const file = document.getElementById('imagem').files[0];

        let imageUrl = '';
        if (file) {
            // Validações
            if (!file.type.startsWith('image/')) {
                showMessage('❌ Por favor, selecione apenas arquivos de imagem.', 'error');
                hideLoading(submitBtn, originalText);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showMessage('❌ A imagem deve ter no máximo 5MB.', 'error');
                hideLoading(submitBtn, originalText);
                return;
            }

            showMessage('📤 Fazendo upload da imagem...', 'info');
            try {
                imageUrl = await uploadImage(file);
            } catch (err) {
                showMessage('❌ Falha ao enviar imagem: ' + err.message, 'error');
                hideLoading(submitBtn, originalText);
                return;
            }
        } else if (editarId) {
            // Para edição, se não houver novo arquivo, manter a imagem atual
            // Buscar a imagem atual
            try {
                const response = await fetch(`${URL}/trabalho/${editarId}`);
                const trabalho = await response.json();
                imageUrl = trabalho.image;
            } catch (err) {
                console.error(err);
                showMessage('❌ Erro ao obter imagem atual.', 'error');
                hideLoading(submitBtn, originalText);
                return;
            }
        }

        try {
            let response;
            if (editarId) {
                // Atualizar trabalho
                response = await fetch(`${URL}/trabalho/${editarId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        titulo,
                        descricao,
                        link: imageUrl, // Usar a URL da imagem como link
                        image: imageUrl
                    })
                });
            } else {
                // Criar novo trabalho
                response = await fetch(`${URL}/trabalhos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        titulo,
                        descricao,
                        link: imageUrl,
                        image: imageUrl
                    })
                });
            }

            if (!response.ok) throw new Error('Erro ao salvar trabalho');

            const successMessage = editarId ? '✅ Trabalho atualizado com sucesso!' : '✅ Trabalho criado com sucesso!';
            showMessage(successMessage);

            form.reset();
            document.getElementById('preview-container').innerHTML = ''; // Limpar preview
            if (editarId) {
                cancelarEdicao();
            }
            fetchTrabalhos();
        } catch (error) {
            console.error(error);
            showMessage('❌ Erro ao salvar trabalho. Verifique os dados e tente novamente.', 'error');
        } finally {
            hideLoading(submitBtn, originalText);
        }
    });

    // Validação em tempo real
    const inputs = document.querySelectorAll('#trabalhoForm input, #trabalhoForm textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '' && this.hasAttribute('required')) {
                this.style.borderColor = '#e74c3c';
                this.style.boxShadow = '0 0 10px rgba(231, 76, 60, 0.3)';
            } else {
                this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                this.style.boxShadow = 'none';
            }
        });
    });

    // Inicializa carregando trabalhos
    fetchTrabalhos();
});
