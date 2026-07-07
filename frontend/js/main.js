/*
 * main.js — Lógica da página inicial.
 * Depende de RECIPES (definido em data.js).
 */

/* ---------- Utilidades ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function stars(rating) {
  const full = Math.round(rating);
  return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
}

/* ---------- Favoritos (localStorage) ---------- */
const FAVS_KEY = "saborarte:favoritos";
const getFavs = () => JSON.parse(localStorage.getItem(FAVS_KEY) || "[]");
function toggleFav(id) {
  const favs = getFavs();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  localStorage.setItem(FAVS_KEY, JSON.stringify(next));
  return next.includes(id);
}

/* ---------- Estado dos filtros ---------- */
const CATEGORIES = [
  "Todas",
  "Doces",
  "Salgadas",
  "Veganas",
  "Sem Glúten",
  "Low Carb",
  "Sobremesas",
  "Bebidas",
  "Favoritos",
];

let activeCategory = "Todas";
let searchTerm = "";

/* ---------- Renderização dos cards ---------- */
function cardTemplate(recipe) {
  const isFav = getFavs().includes(recipe.id);
  const tags = recipe.tags
    .map((t) => {
      const cls = t === "Halloween" ? "tag tag--halloween" : "tag";
      return `<span class="${cls}">${t}</span>`;
    })
    .join("");

  return `
    <article class="card" data-id="${recipe.id}">
      <div class="card__media">
        <img src="${recipe.image}" alt="${recipe.title}" loading="lazy" />
        <button class="card__fav" data-fav="${recipe.id}" title="Favoritar" aria-label="Favoritar">
          <i class="${isFav ? "fas" : "far"} fa-heart"></i>
        </button>
      </div>
      <div class="card__body">
        <h3 class="card__title">${recipe.title}</h3>
        <div class="card__meta">
          <span><i class="far fa-clock"></i> ${recipe.time}</span>
          <span><i class="fas fa-gauge-high"></i> ${recipe.difficulty}</span>
          <span><i class="fas fa-utensils"></i> ${recipe.servings} porções</span>
        </div>
        <div class="card__tags">${tags}</div>
        <p class="card__desc">${recipe.description}</p>
        <div class="card__footer">
          <span class="rating">${stars(recipe.rating)} <span>${recipe.rating.toFixed(1)}</span></span>
          <a class="btn btn-primary" href="receita.html?id=${recipe.id}">Ver receita</a>
        </div>
      </div>
    </article>`;
}

function getFiltered() {
  const term = normalize(searchTerm.trim());
  const words = term.split(/\s+/).filter(Boolean);
  const favs = getFavs();

  return RECIPES.filter((r) => {
    // Categoria
    if (activeCategory === "Favoritos") {
      if (!favs.includes(r.id)) return false;
    } else if (activeCategory !== "Todas") {
      if (!r.tags.includes(activeCategory)) return false;
    }

    // Busca textual
    if (words.length) {
      const haystack = normalize(
        [r.title, r.description, ...r.tags, ...r.ingredients].join(" ")
      );
      return words.every((w) => haystack.includes(w));
    }
    return true;
  });
}

function renderRecipes() {
  const grid = $("#recipesGrid");
  const list = getFiltered();

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-utensils"></i>
        <h3>Nenhuma receita encontrada</h3>
        <p>Tente outro termo de busca ou categoria.</p>
      </div>`;
    return;
  }
  grid.innerHTML = list.map(cardTemplate).join("");
}

function renderFilters() {
  const box = $("#filters");
  box.innerHTML = CATEGORIES.map(
    (c) =>
      `<button class="chip ${c === activeCategory ? "active" : ""}" data-cat="${c}">${c}</button>`
  ).join("");
}

/* ---------- Tema claro/escuro ---------- */
const THEME_KEY = "saborarte:tema";
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const icon = $("#themeToggle i");
  if (icon) icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(saved);
  $("#themeToggle").addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

/* ---------- Autenticação simulada (localStorage) ---------- */
const USERS_KEY = "saborarte:usuarios";
const SESSION_KEY = "saborarte:sessao";
const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const saveUsers = (u) => localStorage.setItem(USERS_KEY, JSON.stringify(u));

let authMode = "login"; // "login" | "signup"

function refreshLoginButton() {
  const session = localStorage.getItem(SESSION_KEY);
  const btn = $("#loginOpen");
  if (session) {
    btn.innerHTML = `<i class="fas fa-user"></i> ${session}`;
  } else {
    btn.innerHTML = `<i class="fas fa-user"></i> Entrar`;
  }
}

function setAuthMode(mode) {
  authMode = mode;
  const signup = mode === "signup";
  $("#authTitle").textContent = signup ? "Criar conta" : "Entrar";
  $("#authSubmit").textContent = signup ? "Cadastrar" : "Entrar";
  $("#nameField").hidden = !signup;
  $("#authName").required = signup;
  $("#authSwitch").innerHTML = signup
    ? `Já tem conta? <a id="authSwitchLink">Entrar</a>`
    : `Não tem uma conta? <a id="authSwitchLink">Cadastre-se</a>`;
  $("#authSwitchLink").addEventListener("click", () =>
    setAuthMode(signup ? "login" : "signup")
  );
  showAuthMsg("", "");
}

function showAuthMsg(text, type) {
  const el = $("#authMsg");
  el.textContent = text;
  el.className = "modal__msg" + (type ? " " + type : "");
}

function openAuth() {
  const session = localStorage.getItem(SESSION_KEY);
  if (session) {
    // Já logado → logout
    if (confirm(`Sair da conta de ${session}?`)) {
      localStorage.removeItem(SESSION_KEY);
      refreshLoginButton();
    }
    return;
  }
  $("#authModal").classList.add("open");
  setAuthMode("login");
}

function closeAuth() {
  $("#authModal").classList.remove("open");
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const name = $("#authName").value.trim();
  const email = $("#authEmail").value.trim().toLowerCase();
  const password = $("#authPassword").value;
  const users = getUsers();

  if (authMode === "signup") {
    if (users.some((u) => u.email === email)) {
      return showAuthMsg("Este e-mail já está cadastrado.", "error");
    }
    users.push({ name: name || email.split("@")[0], email, password });
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, name || email.split("@")[0]);
    showAuthMsg("Conta criada com sucesso!", "success");
  } else {
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return showAuthMsg("E-mail ou senha incorretos.", "error");
    }
    localStorage.setItem(SESSION_KEY, user.name);
    showAuthMsg(`Bem-vindo(a), ${user.name}!`, "success");
  }

  refreshLoginButton();
  setTimeout(closeAuth, 900);
}

/* ---------- Eventos globais ---------- */
function initEvents() {
  // Filtros (delegação)
  $("#filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    activeCategory = chip.dataset.cat;
    renderFilters();
    renderRecipes();
  });

  // Busca
  $("#searchInput").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderRecipes();
  });

  // Favoritar (delegação no grid)
  $("#recipesGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav]");
    if (!btn) return;
    e.preventDefault();
    const active = toggleFav(btn.dataset.fav);
    btn.querySelector("i").className = active ? "fas fa-heart" : "far fa-heart";
    if (activeCategory === "Favoritos") renderRecipes();
  });

  // Menu mobile
  $("#navToggle").addEventListener("click", () =>
    $("#navLinks").classList.toggle("open")
  );

  // Login / cadastro
  $("#loginOpen").addEventListener("click", openAuth);
  $("#authClose").addEventListener("click", closeAuth);
  $("#authModal").addEventListener("click", (e) => {
    if (e.target.id === "authModal") closeAuth();
  });
  $("#authForm").addEventListener("submit", handleAuthSubmit);

  // Newsletter
  $("#newsletterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    alert("Inscrição realizada! Obrigado por assinar. 🍽️");
  });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderFilters();
  renderRecipes();
  refreshLoginButton();
  initEvents();
});
