const URL = "https://gaby-essennce-production.up.railway.app";
// const URL = "http://localhost:3000"

let trabalhos = [];

async function exibirTodosTrabalhos() {
  const container = document.getElementById("trabalho-container");
  if (!container) return;

  container.innerHTML = "<p>Carregando projetos...</p>";

  try {
    const resposta = await fetch(`${URL}/trabalhos`);
    if (!resposta.ok) throw new Error("Erro ao carregar trabalhos");

    trabalhos = await resposta.json();

    mostrarTodosTrabalhos();
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Erro ao carregar projetos.</p>";
  }
}

function mostrarTodosTrabalhos() {
  const container = document.getElementById("trabalho-container");
  if (!container || trabalhos.length === 0) return;

  container.innerHTML = "";

  trabalhos.forEach((trabalho) => {
    const divTrabalho = document.createElement("div");
    // Adicionamos a classe 'animated-card' para a animação
    divTrabalho.className = "projeto-item animated-card";
    divTrabalho.innerHTML = `
            <img src="${trabalho.image}" alt="${trabalho.titulo}">
            <div class="overlay">
                <h3>${trabalho.titulo}</h3>
                <p>${trabalho.descricao}</p>
                <a href="${trabalho.link}" target="_blank">Ver Projeto</a>
            </div>
        `;
    container.appendChild(divTrabalho);
  });

  // Chama a função de animação após os cards serem criados
  animateCardsOnScroll();
}

gsap.registerPlugin(ScrollTrigger);

function animateCardsOnScroll() {
  const cards = document.querySelectorAll(".animated-card");

  cards.forEach((card) => {
    gsap.fromTo(
      card,
      { autoAlpha: 0, y: 50 }, // Estado inicial (transparente, 50px para baixo)
      {
        autoAlpha: 1, // Estado final (visível)
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%", // Começa a animação quando o card entra na tela
          toggleActions: "play none none none", // Apenas 'play' quando entra
        },
      }
    );
  });
}

// JS do modal
function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "block";
}

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}

window.onclick = function (event) {
  const modal = document.getElementById("modalLogin");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Validação do formulário de login
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value.trim();
  const mensagem = document.getElementById("loginMessage");

  if (email === "teste@exemplo.com" && senha === "123456") {
    mensagem.style.color = "green";
    mensagem.textContent = "Login realizado com sucesso!";
    setTimeout(() => fecharModal("modalLogin"), 1500);
  } else {
    mensagem.style.color = "red";
    mensagem.textContent = "E-mail ou senha incorretos!";
  }
});

document.querySelectorAll(".alternar").forEach((btn) => {
  btn.addEventListener("click", () => {
    const login = document.getElementById("modalLogin");
    const cadastro = document.getElementById("modalCadastro");

    if (login.style.display === "flex") {
      login.style.display = "none";
      cadastro.style.display = "flex";
    } else {
      cadastro.style.display = "none";
      login.style.display = "flex";
    }
  });
});

window.addEventListener("dblclick", (event) => {
  const modalLogin = document.getElementById("modalLogin");
  const modalCadastro = document.getElementById("modalCadastro");

  // só fecha se o clique duplo for exatamente no fundo escuro do modal
  if (event.target === modalLogin) {
    modalLogin.style.display = "none";
  }
  if (event.target === modalCadastro) {
    modalCadastro.style.display = "none";
  }
});


window.onload = exibirTodosTrabalhos;
