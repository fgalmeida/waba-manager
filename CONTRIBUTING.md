# 🤝 Contribuindo

Obrigado pelo interesse em contribuir com o WhatsApp Template Manager! Toda ajuda e bem-vinda.

---

## Reportando Bugs

1. Verifique se o bug ja foi reportado na aba de [Issues](../../issues)
2. Use o template de bug para descrever:
   - O que aconteceu
   - O que voce esperava
   - Passos para reproduzir
   - Ambiente (SO, Node.js, navegador)

## Sugerindo Features

1. Verifique se a sugestao ja existe nas [Issues](../../issues)
2. Use o template de feature request
3. Descreva o problema que a feature resolve e como ela funcionaria

## Fluxo de Pull Request

1. **Fork** o repositorio
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/waba-manager.git`
3. Crie uma **branch**: `git checkout -b feature/minha-feature`
4. Faca suas alteracoes
5. Siga os padroes de codigo (veja abaixo)
6. **Commit**: `git commit -m "feat: descricao da feature"`
7. **Push**: `git push origin feature/minha-feature`
8. Abra um **Pull Request** descrevendo suas mudancas

## Padroes de Codigo

- **TypeScript strict** — sem `any`, tipos explicitos
- **Componentes** — use `"use client"` apenas quando necessario
- **Tailwind** — evite CSS inline, use classes utilitarias
- **Nomes** — camelCase para variaveis, PascalCase para componentes
- **Commits** — use [conventional commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`

## Rodando Localmente

```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
npm install
npm run dev
```

## Duvidas?

Abra uma [Issue](../../issues) com a tag `question`.
