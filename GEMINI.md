# WYD ARTEMIS — KNOWLEDGE DE IDENTIDADE CINEMATOGRÁFICA & DIRETRIZES DE ENGENHARIA

## Visão geral

O WYD Artemis é um projeto com identidade de fantasia medieval inspirada no universo de MMORPGs clássicos. A interface deve transmitir nobreza, magia, aventura e imersão, sem perder clareza ou usabilidade.

## Direção visual aprovada

- Estilo: medieval clássico, real e majestoso.
- Atmosfera: iluminação dourada, magia sutil e profundidade em camadas.
- Partículas: intensidade equilibrada, sem poluição visual (`EmbersCanvas` com partículas controladas).
- Parallax: moderado, limitado principalmente ao banner (`HeroSection`).
- Animações de scroll: revelação gradual com opacidade e pequenos deslocamentos (`useScrollReveal`).
- Microinterações: discretas, coerentes e rápidas.
- Mobile: efeitos cinematográficos concentrados no banner; restante da página prioriza leveza e legibilidade.

## Regras de preservação

1. Não substituir a identidade visual aprovada.
2. Não reconstruir componentes que já atendem aos requisitos.
3. Não modificar rotas, textos, dados ou funcionalidades sem necessidade.
4. Não remover recursos existentes para simplificar a implementação dos efeitos.
5. Priorizar alterações localizadas, fáceis de revisar e reverter.

## Regras técnicas

- Inspecionar a stack e os componentes existentes antes de implementar.
- Preferir CSS, pseudo-elementos e APIs nativas do navegador.
- Reutilizar dependências existentes (`lucide-react`, `tailwindcss`, `react-router-dom`).
- Não instalar bibliotecas apenas para partículas, transições ou parallax simples.
- Utilizar `IntersectionObserver` para revelações ao scroll quando adequado.
- Limitar animações a propriedades eficientes, como `transform` e `opacity`.
- Limpar observers, listeners e ciclos de animação corretamente.
- Evitar atualizações excessivas durante o scroll (`requestAnimationFrame`).
- Não deixar conteúdo dependente da execução de uma animação para se tornar acessível.

## Acessibilidade

- Respeitar `prefers-reduced-motion: reduce`.
- Remover ou reduzir parallax e movimentos contínuos quando necessário.
- Garantir foco visível e navegação por teclado.
- Manter contraste suficiente entre conteúdo e fundo.
- Não comunicar estados exclusivamente por animação ou cor.
- Evitar flashes e movimentos intensos.
- Manter links, botões e formulários funcionais independentemente dos efeitos.

## Desempenho responsivo

- Desktop: efeitos completos, porém discretos.
- Tablet: reduzir camadas e densidade se necessário.
- Mobile: priorizar o banner; minimizar efeitos nas outras seções.
- Evitar partículas em excesso, filtros custosos e animações simultâneas desnecessárias.
- Não presumir resultados de performance sem medição.
- Documentar as condições e ferramentas usadas nos testes.

## Processo de alteração

1. Inspecionar o estado atual do projeto.
2. Identificar componentes e estilos afetados.
3. Implementar uma etapa por vez.
4. Executar verificações relevantes.
5. Corrigir regressões causadas pelas alterações.
6. Repetir os testes pertinentes.
7. Relatar arquivos alterados, resultados e limitações.

## Regra de honestidade técnica

Nunca declarar que um teste passou sem executá-lo. Diferenciar explicitamente:
- Executado e aprovado.
- Executado e reprovado.
- Parcialmente executado.
- Não executado.
- Bloqueado por falta de ferramenta ou ambiente.

## Critério de qualidade

O resultado deve ser bonito, harmônico, intuitivo, moderno, responsivo e coerente com práticas contemporâneas de design e UX. Os efeitos cinematográficos devem elevar a experiência sem comprometer acessibilidade, desempenho, navegação ou manutenção do código.
