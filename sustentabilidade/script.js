// ================= CONFIGURAÇÃO =================
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycby5efGi1pmyh7DFCGWPQNtES7a3uuwTC2CaTe8U5IumOR8EjbsNveGOChmT0xVl7zB-wA/exec";

const mandatoryQuestions = [
    { q: "Qual a importância da sustentabilidade para a Fleximedical?", options: ["Apenas estética", "Redução de impactos ambientais e responsabilidade social", "Aumento de gastos", "Não é prioridade"], answer: 1 },
    { q: "Como a empresa contribui para a preservação do meio ambiente?", options: ["Descarte irregular", "Uso ineficiente de energia", "Gestão de resíduos e unidades eco-eficientes", "Aumento do uso de plástico"], answer: 2 }
];

const generalQuestions = [
    { q: "Qual foi o projeto na Operação dos Desabrigados pelas Chuvas no Rio Grande do Sul?", options: ["Projeto União BR", "Carreta Ipiranga", "Renovation", "CIES"], answer: 0 },
    { q: "Qual foi o Ano de Fundação da Fleximedical?", options: ["2007", "2003", "2006", "2005"], answer: 3 },
    { q: "Qual Numeração da Carreta que mais impactou o Outubro Rosa?", options: ["CDS-31", "CDS-32", "CDS-33"], answer: 1 },
    { q: "Qual certificado de Sustentabilidade da Empresa ?", options: ["Sistema B", "ISO 9001", "Selo Verde", "Sistema C"], answer: 0 },
    { q: "Quantas Unidades teve no Projeto das Vítimas do Rio Grande do Sul ? ", options: ["4", "3", "2", "1"], answer: 2 },
    { q: "Qual unidade foi a Primeira Unidade Customizada/Construida ?", options: ["BDS-1", "CDS-1", "TDS-3", "CDS-2"], answer: 0 },
    { q: "Qual o nome do compromisso socioambiental deixado pelo Dr. Roberto Kikawa?", options: ["Empatia", "DNA do Amor", "Inovação", "Bem-Estar e Cidadania"], answer: 1 },
    { q: "Qual a cor da unidade Mercedes-Benz?", options: ["Branco", "Ciano", "Roxo", "Azul"], answer: 3 },
    { q: "Quais as cores da Fleximedical?", options: ["Roxo e azul", "Laranja e verde", "Azul e amarelo", "Verde e azul"], answer: 1 }
];

let perguntasAtuais = [];
let currentIdx = 0;
let setorSelecionado = "";
let respostasUsuario = [];

// --- FUNÇÕES DA TOPBAR (ATIVADAS) ---
function voltarPagina() {
    const quizContainer = document.getElementById("quiz-container");
    const setorSelector = document.getElementById("setor-selector");

    // Se o quiz estiver visível, volta para a seleção de setores
    if (!quizContainer.classList.contains("hidden")) {
        quizContainer.classList.add("hidden");
        setorSelector.classList.remove("hidden");
        // Reseta o progresso para evitar bugs ao reiniciar
        document.getElementById("next-btn").classList.add("hidden");
    } else {
        // Se já estiver na tela inicial, recarrega a página
        location.reload();
    }
}

// Configuração dos eventos do Modal de Colaboradores
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-doc");
    const infoBtn = document.getElementById("info-btn");
    const closeBtn = document.querySelector(".close-btn");

    infoBtn.onclick = () => modal.classList.remove("hidden");
    closeBtn.onclick = () => modal.classList.add("hidden");
    
    window.onclick = (event) => {
        if (event.target == modal) modal.classList.add("hidden");
    };
});

// --- LÓGICA DO QUIZ ---
function iniciarQuiz(setor) {
    setorSelecionado = setor;
    const sorteadasGerais = [...generalQuestions].sort(() => Math.random() - 0.5).slice(0, 3);
    perguntasAtuais = [...mandatoryQuestions, ...sorteadasGerais].sort(() => Math.random() - 0.5);
    
    currentIdx = 0;
    respostasUsuario = [];

    document.getElementById("setor-selector").classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");
    document.getElementById("question-container").classList.remove("hidden");
    document.getElementById("result-container").classList.add("hidden");
    
    loadQuestion();
}

function loadQuestion() {
    const q = perguntasAtuais[currentIdx];
    document.getElementById("question-text").innerText = q.q;
    const container = document.getElementById("options-container");
    container.innerHTML = "";
    
    q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.classList.add("option-btn");
        btn.onclick = () => registrarResposta(i, btn);
        container.appendChild(btn);
    });

    const progress = (currentIdx / perguntasAtuais.length) * 100;
    document.getElementById("progress-fill").style.width = `${progress}%`;
}

function registrarResposta(idx, btn) {
    const botoes = document.querySelectorAll(".option-btn");
    botoes.forEach(b => b.disabled = true);
    btn.classList.add("selected-blue");

    respostasUsuario.push({
        pergunta: perguntasAtuais[currentIdx].q,
        escolha: perguntasAtuais[currentIdx].options[idx],
        correta: idx === perguntasAtuais[currentIdx].answer
    });

    document.getElementById("next-btn").classList.remove("hidden");
}

document.getElementById("next-btn").onclick = () => {
    currentIdx++;
    if (currentIdx < perguntasAtuais.length) {
        loadQuestion();
        document.getElementById("next-btn").classList.add("hidden");
    } else {
        finalizarQuiz();
    }
};

function finalizarQuiz() {
    document.getElementById("question-container").classList.add("hidden");
    document.getElementById("next-btn").classList.add("hidden");
    document.getElementById("result-container").classList.remove("hidden");
    document.getElementById("score-text").innerText = "Obrigado por colaborar com nossa pesquisa de cultura!";
    // Atualiza barra de progresso para 100%
    document.getElementById("progress-fill").style.width = `100%`;
}

function reiniciarQuiz() {
    location.reload();
}

async function enviarParaPlanilha() {
    const btnFinal = document.querySelector(".btn-final");
    btnFinal.innerText = "⏳ Gravando dados...";
    btnFinal.disabled = true;

    const totalAcertos = respostasUsuario.filter(r => r.correta).length;
    const listaErros = respostasUsuario
        .filter(r => !r.correta)
        .map((r, i) => `${i + 1}. ${r.pergunta} (Respondeu: ${r.escolha})`)
        .join("\n");

    const payload = {
        data: new Date().toLocaleString('pt-BR'),
        setor: setorSelecionado,
        acertos: `${totalAcertos} de ${perguntasAtuais.length}`,
        erros: listaErros || "Nenhum erro"
    };

    try {
        await fetch(GOOGLE_SHEET_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        alert("✅ Respostas salvas com sucesso!");
        location.reload(); 
    } catch (error) {
        alert("❌ Erro ao conectar com a planilha.");
        btnFinal.disabled = false;
    }
}
