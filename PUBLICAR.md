# Como publicar o Sabor & Arte

O site é estático (HTML/CSS/JS). A pasta que vai pro ar é **`frontend/`**.
Você tem dois caminhos — escolha um.

---

## 🚀 Caminho A — Netlify Drop (o mais rápido, sem git)

Ideal pra ver o site no ar em menos de 1 minuto.

1. Acesse **https://app.netlify.com/drop**
2. Arraste a pasta **`frontend`** inteira pra dentro da página.
3. Pronto — o Netlify te dá um link público na hora (ex.: `random-nome-123.netlify.app`).
4. (Opcional) Crie uma conta grátis pra manter o link e renomeá-lo.

> Sempre que quiser atualizar, é só arrastar a pasta de novo.

---

## 🌐 Caminho B — GitHub Pages (permanente, profissional)

Já deixei um workflow pronto em `.github/workflows/deploy.yml` que publica a
pasta `frontend/` automaticamente. Passo a passo:

### 1. Criar o repositório no GitHub
- Acesse **https://github.com/new**
- Nome sugerido: `sabor-e-arte` → **Create repository**

### 2. Enviar o código (rode no terminal, dentro desta pasta)
```bash
git init
git add .
git commit -m "Remake do site Sabor & Arte"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/sabor-e-arte.git
git push -u origin main
```
> Troque `SEU_USUARIO` pelo seu usuário do GitHub.

### 3. Ativar o Pages
- No repositório: **Settings → Pages**
- Em **Build and deployment → Source**, escolha **GitHub Actions**.
- Pronto. A cada `git push`, o site é republicado.

### 4. Acessar
O link fica assim:
```
https://SEU_USUARIO.github.io/sabor-e-arte/
```
(Aparece também em Settings → Pages depois do primeiro deploy.)

---

## Atualizando o site depois

- **Netlify:** arraste a pasta `frontend` de novo.
- **GitHub Pages:**
  ```bash
  git add .
  git commit -m "Descrição da mudança"
  git push
  ```

---



## Testar localmente antes de publicar

Como o site não usa `fetch`, basta **abrir `frontend/index.html`** no navegador.
Tudo (busca, filtros, tema, login) funciona direto do arquivo.
