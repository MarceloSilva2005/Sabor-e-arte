/*
 * receita.js — Renderiza uma única receita a partir do parâmetro ?id= da URL.
 * Depende de RECIPES (data.js).
 */

/* ---------- Tema (mesma lógica da home) ---------- */
const THEME_KEY = "saborarte:tema";
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const icon = document.querySelector("#themeToggle i");
  if (icon) icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
}
(function initTheme() {
  applyTheme(localStorage.getItem(THEME_KEY) || "light");
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector("#themeToggle");
    btn.addEventListener("click", () => {
      const next =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  });
})();

function stars(rating) {
  const full = Math.round(rating);
  return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
}

/* ---------- Escala de porções ---------- */
let baseServings = 1;
let currentServings = 1;
let recipeIngredients = [];

/* Multiplica quantidades numéricas encontradas no início do ingrediente. */
function scaleIngredient(text, factor) {
  if (factor === 1) return text;
  return text.replace(
    /(\d+(?:[.,]\d+)?)(½|¼|¾)?/,
    (match, num, frac) => {
      let value = parseFloat(num.replace(",", "."));
      if (frac === "½") value += 0.5;
      if (frac === "¼") value += 0.25;
      if (frac === "¾") value += 0.75;
      const scaled = value * factor;
      const rounded = Math.round(scaled * 100) / 100;
      return Number.isInteger(rounded) ? String(rounded) : String(rounded);
    }
  );
}

function renderIngredients() {
  const factor = currentServings / baseServings;
  const ul = document.querySelector("#ingredientsList");
  ul.innerHTML = recipeIngredients
    .map((i) => `<li>${scaleIngredient(i, factor)}</li>`)
    .join("");
  document.querySelector("#servingsCount").textContent = currentServings;
}

/* ---------- Render principal ---------- */
function getRecipeId() {
  return new URLSearchParams(location.search).get("id");
}

function renderNotFound() {
  document.querySelector("#recipeRoot").innerHTML = `
    <div class="empty-state" style="padding: 5rem 1rem">
      <i class="fas fa-circle-question"></i>
      <h2 style="font-family: var(--font)">Receita não encontrada</h2>
      <p>A receita que você procura não existe ou foi removida.</p>
      <a href="index.html" class="btn btn-primary" style="margin-top:1rem">
        <i class="fas fa-arrow-left"></i> Voltar ao início
      </a>
    </div>`;
}

function renderRecipe(recipe) {
  document.title = `${recipe.title} — Sabor & Arte`;

  const tags = recipe.tags
    .map((t) => {
      const cls = t === "Halloween" ? "tag tag--halloween" : "tag";
      return `<span class="${cls}">${t}</span>`;
    })
    .join("");

  const steps = recipe.steps.map((s) => `<li>${s}</li>`).join("");

  const tips = recipe.tips && recipe.tips.length
    ? `<div class="tips">
        <h3><i class="fas fa-lightbulb"></i> Dicas do chef</h3>
        <ul>${recipe.tips.map((t) => `<li>${t}</li>`).join("")}</ul>
      </div>`
    : "";

  document.querySelector("#recipeRoot").innerHTML = `
    <nav class="breadcrumb">
      <a href="index.html">Início</a> ›
      <a href="index.html#receitas">Receitas</a> ›
      <span>${recipe.title}</span>
    </nav>

    <section class="recipe-hero">
      <div>
        <div class="card__tags" style="margin-bottom:1rem">${tags}</div>
        <h1>${recipe.title}</h1>
        <p style="color:var(--text-muted)">${recipe.description}</p>
        <div class="recipe-stats">
          <div class="recipe-stat"><i class="far fa-clock"></i><strong>${recipe.time}</strong><small>Tempo</small></div>
          <div class="recipe-stat"><i class="fas fa-gauge-high"></i><strong>${recipe.difficulty}</strong><small>Dificuldade</small></div>
          <div class="recipe-stat"><i class="fas fa-utensils"></i><strong>${recipe.servings}</strong><small>Porções</small></div>
          <div class="recipe-stat"><i class="fas fa-star"></i><strong>${stars(recipe.rating)} ${recipe.rating.toFixed(1)}</strong><small>Avaliação</small></div>
        </div>
      </div>
      <div class="recipe-hero__media">
        <img src="${recipe.image}" alt="${recipe.title}" />
      </div>
    </section>

    <section class="recipe-body">
      <div class="panel">
        <h2><i class="fas fa-list"></i> Ingredientes</h2>
        <div class="servings-tool">
          Porções:
          <button id="servingsMinus" aria-label="Diminuir">−</button>
          <strong id="servingsCount">${recipe.servings}</strong>
          <button id="servingsPlus" aria-label="Aumentar">+</button>
        </div>
        <ul class="ingredients" id="ingredientsList"></ul>
      </div>
      <div>
        <div class="panel">
          <h2><i class="fas fa-list-ol"></i> Modo de preparo</h2>
          <ol class="steps">${steps}</ol>
        </div>
        ${tips}
      </div>
    </section>`;

  // Configura escala de porções
  baseServings = recipe.servings;
  currentServings = recipe.servings;
  recipeIngredients = recipe.ingredients;
  renderIngredients();

  document.querySelector("#servingsPlus").addEventListener("click", () => {
    currentServings++;
    renderIngredients();
  });
  document.querySelector("#servingsMinus").addEventListener("click", () => {
    if (currentServings > 1) currentServings--;
    renderIngredients();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const recipe = RECIPES.find((r) => r.id === getRecipeId());
  if (recipe) renderRecipe(recipe);
  else renderNotFound();
});
