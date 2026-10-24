# WYD Artemis — Portal Épico de MMORPG Medieval

Portal web oficial do servidor de MMORPG **WYD Artemis**, combinando atmosfera medieval clássica, efeitos cinematográficos e arquitetura moderna com React, TypeScript e Tailwind CSS.

- **Repositório:** [https://github.com/malaca7/wydartemis](https://github.com/malaca7/wydartemis)
- **Deploy GitHub Pages:** [https://malaca7.github.io/wydartemis/](https://malaca7.github.io/wydartemis/)

---

## ⚔️ Tecnologias Utilizadas

- **React 19 & TypeScript**
- **Vite** com `@tailwindcss/vite` (Tailwind CSS v4)
- **React Router** (`HashRouter` para compatibilidade total com GitHub Pages)
- **Lucide React** (Ícones coerentes e sem emojis para controles principais)
- **Cinzel & Cinzel Decorative** (Tipografia display medieval)
- **Plus Jakarta Sans** (Tipografia moderna de alta legibilidade)
- **Canvas de Partículas/Brasas** com respeito a acessibilidade e `prefers-reduced-motion`

---

## 🚀 Como Executar Localmente

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse em `http://localhost:5173/`.

3. **Gerar build de produção:**
   ```bash
   npm run build
   ```

---

## 🌐 Publicação no GitHub Pages

O projeto está configurado com `gh-pages` para publicação automática no branch `gh-pages`.

Para fazer o deploy:
```bash
npm run deploy
```
Esse comando executa automaticamente `npm run build` (gerando os arquivos na pasta `dist/` com o caminho base `/wydartemis/`) e publica a pasta `dist` na branch `gh-pages` do repositório remoto.

---

## 📜 Licença e Direitos

Projeto de portal demonstrativo para o servidor WYD Artemis. As marcas originais associadas a With Your Destiny pertencem aos seus respectivos detentores de direitos.
