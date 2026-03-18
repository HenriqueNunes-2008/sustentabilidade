// ================= CONFIGURAÇÃO =================
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycby5efGi1pmyh7DFCGWPQNtES7a3uuwTC2CaTe8U5IumOR8EjbsNveGOChmT0xVl7zB-wA/exec";

// 1. Perguntas de Sustentabilidade (Obrigatórias para todos)
const mandatoryQuestions = [
    { q: "Qual a importância da sustentabilidade para a Fleximedical?", options: ["Apenas estética", "Redução de impactos ambientais e responsabilidade social", "Aumento de gastos", "Não é prioridade"], answer: 1 },
    { q: "Como a empresa contribui para a preservação do meio ambiente?", options: ["Descarte irregular", "Uso ineficiente de energia", "Gestão de resíduos e unidades eco-eficientes", "Aumento do uso de plástico"], answer: 2 }
];

// 2. Banco de Perguntas Gerais
const generalQuestions = [
    { q: "Qual foi o projeto na Operação dos Desabrigados pelas Chuvas no Rio Grande do Sul?", options: ["Projeto União BR", "Carreta Ipiranga", "Renovation", "CIES"], answer: 0 },
    { q: "Qual foi o Ano de Fundação da Fleximedical?", options: ["2007", "2003", "2006", "2005"], answer: 3 },
    { q: "Qual Numeração da Carreta que mais impactou o Outubro Rosa?", options: ["CDS-31", "CDS-32", "CDS-33"], answer: 1 },
    { q: "Qual certificado de Sustentabilidade da Empresa ?", options: ["Sistema B", "ISO 9001", "Selo Verde", "Sistema C"], answer: 0 }, // Ajustado para refletir a resposta correta Sistema B
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

// ... (Mantenha as funções de voltarPagina e Modal iguais)

// --- LÓGICA DO QUIZ ATUALIZADA ---
function iniciarQuiz(setor) {
    setorSelecionado = setor;
    
    // Sorteia 3 perguntas do banco geral
    const sorteadasGerais = [...generalQuestions].sort(() => Math.random() - 0.5).slice(0, 3);
    
    // Une as 2 obrigatórias com as 3 sorteadas (Total 5) e embaralha a ordem final
    perguntasAtuais = [...mandatoryQuestions, ...sorteadasGerais].sort(() => Math.random() - 0.5);
    
    currentIdx = 0;
    respostasUsuario = [];

    document.getElementById("setor-selector").classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");
    document.getElementById("question-container").classList.remove("hidden");
    document.getElementById("result-container").classList.add("hidden");
    
    loadQuestion();
}

// ... (Mantenha as funções loadQuestion, registrarResposta e finalizarQuiz iguais)

function reiniciarQuiz() {
    location.reload(); // Reinicia para resetar estados e sorteios
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

    // Ajuste: Apenas cor Azul para indicar seleção
    btn.classList.add("selected-blue");

  // Salva a pergunta, a escolha e se está correto para o cálculo final
    respostasUsuario.push({
        pergunta: perguntasAtuais[currentIdx].q,
        escolha: perguntasAtuais[currentIdx].options[idx],
        correta: idx === perguntasAtuais[currentIdx].answer // Verifica o acerto aqui
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
}

async function enviarParaPlanilha() {
    const btnFinal = document.querySelector(".btn-final");
    btnFinal.innerText = "⏳ Gravando dados...";
    btnFinal.disabled = true;

// Calcula quantos o usuário acertou (mesmo sem mostrar para ele)
    const totalAcertos = respostasUsuario.filter(r => r.correta).length;
    
    // Filtra apenas as perguntas que ele errou para a coluna de Erros
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
