# Verificação do protótipo

## Testes automatizados

`node --test tests/*.test.mjs` utiliza servidores e bancos reais, com relógio controlado para verificar limites sem esperar 34 minutos.

Resultado final: **11 testes aprovados, 0 falhas**. TypeScript e Vite concluíram a compilação de produção.

- Dados iniciais e login/PIN, sem exposição do hash.
- 240 segundos de sessão; refresh não estende; conta bloqueada em outro cliente durante cooldown de 1800 segundos.
- Saída antecipada invalida token e inicia pausa.
- Configuração acelerada 45/90 segundos.
- Limites Unicode, campos inválidos, autoria e exclusão em cascata.
- Curtidas, republicações, respostas, seguidores, notificações e tendências.
- Atualizações para dois clientes Socket.IO já conectados.
- Persistência de publicações/cooldown após reinício do servidor SQLite.
- Respostas atrasadas de sessão antiga não afetam a próxima conta.
- Contador recuperado sem reiniciar prazo ao restaurar a aba.

## Verificação no navegador

- Tema claro e escuro; 1440×1000, 1080×1920 e 390×844.
- Mascote carregado sem alterações; todos os avatares sem falhas de carregamento.
- Login, publicação e confirmação; duas abas com contas diferentes, atualização sem recarregar, resposta e notificações.
- Pesquisa por pessoa, seguir, abrir perfil e pesquisa por hashtag presente apenas numa resposta.
- Central de notificações, marcar como lidas e estado vazio de não lidas.
- Excluir publicação de teste dentro da discussão; Escape fecha somente a confirmação superior; rolagem liberada após fechar as janelas.
- Saída antecipada e mensagem de recarga; novo login bloqueado; retorno automático à abertura.
- Recarregamento da aba mantém cronômetro. Sem erros de JavaScript observados na versão compilada.
- Modo acelerado executado em servidor de QA separado: 45 segundos de sessão, aviso de tempo, encerramento automático e contador de pausa de 90 segundos observados. Servidor de QA encerrado depois da verificação.

## Limites da verificação

Os dois terminais foram representados por clientes/abas independentes no mesmo computador. A comunicação em aparelhos físicos depende da LAN e do firewall locais. Não houve teste em hardware touchscreen físico; layouts e controles foram verificados em viewport equivalente. A duração normal de 4/30 minutos foi verificada com relógio controlado; a expiração também foi observada no navegador com tempo acelerado e nas sessões normais usadas durante a revisão.

## Original do mascote

SHA256 do arquivo fornecido e da cópia local:

`83FD13CB692D15BBB2D32D0D60A867636B6902AF0DAA8FF758987E7075F22C33`

Capturas visuais em `docs/screenshots/`. Fontes WOFF2, ícones Lucide e todo o conteúdo são empacotados localmente; nenhuma API externa é usada em execução.
