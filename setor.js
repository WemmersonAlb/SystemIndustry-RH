import { readAllSetores, createSetor, updateSetor, deleteSetor } from './setorController.js';

document.addEventListener('DOMContentLoaded', () => {
    const setorTableBody = document.getElementById('setorTableBody');
    const setorModal = new bootstrap.Modal(document.getElementById('setorModal'));
    const setorForm = document.getElementById('setorForm');
    const setorIdInput = document.getElementById('setorId');
    const nomeSetorInput = document.getElementById('nomeSetor');
    const saveSetorButton = document.getElementById('saveSetorButton');
    const feedbackMessage = document.getElementById('feedbackMessage');
    let isEditMode = false; // Verifica se estamos criando ou editando um setor

    // Função para carregar a tabela com a lista de setores
    async function loadSetores() {
        const setores = await readAllSetores();
        setorTableBody.innerHTML = ''; // Limpa a tabela
        setores.forEach(setor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${setor.id_setor}</td>
                <td>${setor.nome_setor}</td>
                <td>
                    <button class="btn btn-warning btn-sm updateSetorButton" data-id="${setor.id_setor}">Update</button>
                    <button class="btn btn-danger btn-sm deleteSetorButton" data-id="${setor.id_setor}">Delete</button>
                </td>
            `;
            setorTableBody.appendChild(row);
        });
    }

    // Função para exibir uma mensagem de sucesso/erro
    function showMessage(message, isSuccess = true) {
        feedbackMessage.textContent = message;
        feedbackMessage.classList.remove('d-none', 'alert-success', 'alert-danger');
        feedbackMessage.classList.add(isSuccess ? 'alert-success' : 'alert-danger');
        setTimeout(() => feedbackMessage.classList.add('d-none'), 3000);
    }

    // Evento para abrir o modal de criação de setor
    document.getElementById('createSetorButton').addEventListener('click', () => {
        setorModal.show();
        setorForm.reset();
        isEditMode = false; // Modo de criação
        document.getElementById('setorModalLabel').textContent = 'Criar Setor';
    });

    // Evento para abrir o modal de edição de setor
    setorTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('updateSetorButton')) {
            const id = e.target.getAttribute('data-id');
            const setor = (await readAllSetores()).find(s => s.id_setor == id); // Busca o setor
            setorIdInput.value = setor.id_setor;
            nomeSetorInput.value = setor.nome_setor;
            isEditMode = true; // Modo de edição
            document.getElementById('setorModalLabel').textContent = 'Atualizar Setor';
            setorModal.show();
        }
    });

    // Evento para salvar (criar ou atualizar) setor
    saveSetorButton.addEventListener('click', async () => {
        const id = setorIdInput.value;
        const nome = nomeSetorInput.value.trim();
        if (nome === '') {
            showMessage('O nome do setor é obrigatório.', false);
            return;
        }

        if (isEditMode) {
            // Atualizar setor
            const success = await updateSetor(id, { nome_setor: nome });
            showMessage(success ? 'Setor atualizado com sucesso.' : 'Erro ao atualizar setor.', success);
        } else {
            // Criar setor
            const success = await createSetor({ nome_setor: nome });
            showMessage(success ? 'Setor criado com sucesso.' : 'Erro ao criar setor.', success);
        }

        setorModal.hide();
        loadSetores(); // Recarregar a tabela
    });

    // Evento para deletar setor
    setorTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('deleteSetorButton')) {
            const id = e.target.getAttribute('data-id');
            const success = await deleteSetor(id);
            showMessage(success ? 'Setor deletado com sucesso.' : 'Erro ao deletar setor.', success);
            loadSetores(); // Recarregar a tabela
        }
    });

    // Carrega os setores ao iniciar a página
    loadSetores();
});
