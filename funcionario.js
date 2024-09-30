import { readAllFuncionario, createFuncionario, updateFuncionario, deleteFuncionario } from './funcionarioController.js';
import { readAllSetores } from './setorController.js';

document.addEventListener('DOMContentLoaded', () => {
    const funcionarioTableBody = document.getElementById('funcionarioTableBody');
    const funcionarioModal = new bootstrap.Modal(document.getElementById('funcionarioModal'));
    const funcionarioForm = document.getElementById('funcionarioForm');
    const funcionarioIdInput = document.getElementById('funcionarioId');
    const nomeFuncionarioInput = document.getElementById('nomeFuncionario');
    const emailFuncionarioInput = document.getElementById('emailFuncionario');
    const matriculaFuncionarioInput = document.getElementById('matriculaFuncionario');
    const setorFuncionarioSelect = document.getElementById('setorFuncionario');
    const saveFuncionarioButton = document.getElementById('saveFuncionarioButton');
    const feedbackMessage = document.getElementById('feedbackMessage');
    let isEditMode = false; // Verifica se estamos criando ou editando um funcionário

    // Função para carregar a tabela com a lista de funcionários
    async function loadFuncionarios() {
        const funcionarios = await readAllFuncionario();
        const setores = await readAllSetores();
        const setorMap = setores.reduce((map, setor) => {
            map[setor.id_setor] = setor.nome_setor;
            return map;
        }, {});

        funcionarioTableBody.innerHTML = ''; // Limpa a tabela
        funcionarios.forEach(funcionario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${funcionario.id_funcionario}</td>
                <td>${funcionario.nome_funcionario}</td>
                <td>${funcionario.email_funcionario}</td>
                <td>${funcionario.matricula_funcionario}</td>
                <td>${funcionario.setor_funcionario.nome_setor}</td>
                <td>
                    <button class="btn btn-warning btn-sm updateFuncionarioButton" data-id="${funcionario.id_funcionario}">Update</button>
                    <button class="btn btn-danger btn-sm deleteFuncionarioButton" data-id="${funcionario.id_funcionario}">Delete</button>
                </td>
            `;
            funcionarioTableBody.appendChild(row);
        });
    }

    // Função para carregar o select de setores no modal
    async function loadSetoresSelect() {
        const setores = await readAllSetores();
        setorFuncionarioSelect.innerHTML = '';
        setores.forEach(setor => {
            const option = document.createElement('option');
            option.value = setor.id_setor;
            option.textContent = setor.nome_setor;
            setorFuncionarioSelect.appendChild(option);
        });
    }

    // Função para exibir uma mensagem de sucesso/erro
    function showMessage(message, isSuccess = true) {
        feedbackMessage.textContent = message;
        feedbackMessage.classList.remove('d-none', 'alert-success', 'alert-danger');
        feedbackMessage.classList.add(isSuccess ? 'alert-success' : 'alert-danger');
        setTimeout(() => feedbackMessage.classList.add('d-none'), 3000);
    }

    // Evento para abrir o modal de criação de funcionário
    document.getElementById('createFuncionarioButton').addEventListener('click', async () => {
        await loadSetoresSelect(); // Carregar os setores no select
        funcionarioModal.show();
        funcionarioForm.reset();
        isEditMode = false; // Modo de criação
        document.getElementById('funcionarioModalLabel').textContent = 'Criar Funcionário';
    });

    // Evento para abrir o modal de edição de funcionário
    funcionarioTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('updateFuncionarioButton')) {
            const id = e.target.getAttribute('data-id');
            const funcionario = (await readAllFuncionario()).find(f => f.id_funcionario == id); // Busca o funcionário
            funcionarioIdInput.value = funcionario.id_funcionario;
            nomeFuncionarioInput.value = funcionario.nome_funcionario;
            emailFuncionarioInput.value = funcionario.email_funcionario;
            matriculaFuncionarioInput.value = funcionario.matricula_funcionario;
            await loadSetoresSelect();
            setorFuncionarioSelect.value = funcionario.setor_id;
            isEditMode = true; // Modo de edição
            document.getElementById('funcionarioModalLabel').textContent = 'Atualizar Funcionário';
            funcionarioModal.show();
        }
    });

    // Evento para salvar (criar ou atualizar) funcionário
    saveFuncionarioButton.addEventListener('click', async () => {
        const id_funcionario = funcionarioIdInput.value;
        const nome_funcionario = nomeFuncionarioInput.value;
        const email_funcionario = emailFuncionarioInput.value;
        const matricula_funcionario = matriculaFuncionarioInput.value;
        const setor_funcionario = {id_setor:setorFuncionarioSelect.value};

        try {
            if (isEditMode) {
                await updateFuncionario(id_funcionario, { nome_funcionario, email_funcionario, matricula_funcionario, setor_funcionario });
                showMessage('Funcionário atualizado com sucesso!');
            } else {
                await createFuncionario({ nome_funcionario, email_funcionario, matricula_funcionario, setor_funcionario });
                showMessage('Funcionário criado com sucesso!');
            }
            funcionarioModal.hide();
            loadFuncionarios(); // Recarregar a tabela
        } catch (error) {
            showMessage('Erro ao salvar funcionário!', false);
        }
    });

    // Evento para deletar funcionário
    funcionarioTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('deleteFuncionarioButton')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Tem certeza que deseja deletar este funcionário?')) {
                try {
                    await deleteFuncionario(id);
                    showMessage('Funcionário deletado com sucesso!');
                    loadFuncionarios(); // Recarregar a tabela
                } catch (error) {
                    showMessage('Erro ao deletar funcionário!', false);
                }
            }
        }
    });

    // Carregar os funcionários e setores ao iniciar a página
    loadFuncionarios();
});
