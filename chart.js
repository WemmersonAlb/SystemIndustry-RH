import { readAllOcorrencias } from './ocorrenciaController.js';
import { readAllSetores } from './setorController.js';

const ctx = document.getElementById('ocorrenciasChart').getContext('2d');
const ctxFiltro = document.getElementById('ocorrenciasChartFiltro').getContext('2d');
let myChart;
let myChartFiltro;

async function populateSetores() {
    const setorSelect = document.getElementById('setorSelect');
    const setores = await readAllSetores();
    const option = document.createElement('option');
    option.value = 0;
    option.textContent = "Todos";
    setorSelect.appendChild(option);

    setores.forEach(setor => {
        const option = document.createElement('option');
        option.value = setor.id_setor;
        option.textContent = setor.nome_setor;
        setorSelect.appendChild(option);
    });
    
}

async function loadChart(date = null, setor = null) {
    const ocorrencias = await readAllOcorrencias();
    const tiposFalhaCounts = {};

    ocorrencias.forEach(ocorrencia => {
        console.log(`date: ${date}\nsetor: ${setor}\ndataOcorrido: ${ocorrencia.dataOcorrido}\nsetorID: ${ocorrencia.setor.id_setor}`)
        if(date && !setor && date!=ocorrencia.dataOcorrido){            
            return;           
        }else if(!date && setor && setor!=ocorrencia.setor.id_setor){
            return;
        }else if(date && setor && (date!=ocorrencia.dataOcorrido || setor!=ocorrencia.setor.id_setor)){
            return;
        }

        const tipoFalhaId = ocorrencia.tipoFalha.id_falha;
        const tipoFalhaNome = ocorrencia.tipoFalha.nome_falha;

        if (!tiposFalhaCounts[tipoFalhaId]) {
            tiposFalhaCounts[tipoFalhaId] = { count: 0, nome: tipoFalhaNome };
        }
        tiposFalhaCounts[tipoFalhaId].count++;
    });

    const labels = Object.values(tiposFalhaCounts).map(item => item.nome);
    const data = Object.values(tiposFalhaCounts).map(item => item.count);
    const backgroundColors = labels.map((_, index) => `hsl(${index * 360 / labels.length}, 70%, 50%)`);

    if (date || setor) {
        // Exibe o gráfico filtrado e oculta o gráfico geral
        //document.getElementById('filtro').style.display = 'block';
        //document.getElementById('ocorrenciasChart').style.display = 'none';

        // Se o gráfico filtrado já existe, destrua-o antes de criar um novo
        if (myChartFiltro) {
            myChartFiltro.destroy();
        }

        // Cria o gráfico filtrado
        myChartFiltro = new Chart(ctxFiltro, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tipos de Falhas (Filtrado)',
                    data: data,
                    backgroundColor: backgroundColors,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        createLegend(labels, backgroundColors, data, 'chartLegendFiltro');
    } else {
        // Exibe o gráfico geral e oculta o gráfico filtrado
        //document.getElementById('filtro').style.display = 'none';
        document.getElementById('ocorrenciasChart').style.display = 'block';

        // Se o gráfico geral já existe, destrua-o antes de criar um novo
        if (myChart) {
            myChart.destroy();
        }

        // Cria o gráfico geral
        myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tipos de Falhas',
                    data: data,
                    backgroundColor: backgroundColors,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        createLegend(labels, backgroundColors, data, 'chartLegend');
    }
}

function createLegend(labels, colors, data, legendId) {
    const legend = document.getElementById(legendId);
    legend.innerHTML = '';
    console.log(labels);
    labels.forEach((label, index) => {
        const legendItem = document.createElement('div');
        legendItem.innerHTML = `<span style="display:inline-block; width:20px; height:20px; background-color:${colors[index]}; margin-right:5px;"></span>${label}:${data[index]}`;
        console.log(`${label}: ${data[index]}`);
        legend.appendChild(legendItem);
    });
}

// Evento para filtrar por setor e data
document.getElementById('filterButton').addEventListener('click', () => {
    const setor = document.getElementById('setorSelect').value;
    const date = document.getElementById('dateInput').value;
    console.log(`setor: ${setor}\ndate: ${date}`)
    if(setor == 0){
        loadChart(date, null);
    }else{
        loadChart(date, setor);
    }
});

// Inicialização
populateSetores();
loadChart(); // Carrega o gráfico inicial
