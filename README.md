# Offie — a conexão acontece aqui

Protótipo funcional de rede social para totens de uma instituição de ensino. Interface em português, mascote original, temas claro/escuro, navegação por toque e funcionamento em rede local sem internet.

## Abrir neste computador

O projeto já inclui as dependências instaladas e a versão compilada em `dist/`.

1. Abra **Iniciar Offie.cmd**.
2. Acesse **http://localhost:3001** no navegador.
3. Escolha uma das 20 contas. O PIN demonstrativo de todas elas é **1234**.
4. Para tela cheia, pressione **F11**. Deixe o terminal do servidor aberto durante a apresentação.

Se houver outro servidor Offie em execução na porta 3001, encerre-o antes de usar o lançador. Ctrl+C encerra o processo no terminal. Não é preciso executar um servidor por totem.

## Instalação em outro computador

Requisito: **Node.js 24 ou superior**. Instale dependências uma vez enquanto há internet; a execução posterior não faz requisições a serviços externos.

```sh
npm install
npm run build
npm start
```

Também é possível usar `pnpm install`, `pnpm build` e `pnpm start`; o lockfile do projeto é `pnpm-lock.yaml`. `node:sqlite` é o SQLite embutido no Node, evitando instalação de compiladores nativos adicionais. Documentação: [SQLite no Node](https://nodejs.org/api/sqlite.html) e [Vite](https://vite.dev/guide/).

## Demonstração em dois totens

1. Conecte servidor e totens à mesma LAN. Uma rede sem acesso à internet funciona normalmente.
2. No servidor, execute `npm start` ou **Iniciar Offie.cmd**.
3. Use `ipconfig` para descobrir o IPv4 do servidor.
4. Em cada totem, abra `http://IP-DO-SERVIDOR:3001`.
5. Use **contas diferentes** nos dois terminais. Exemplo: Marina no A e Lucas no B.
6. Publique no A. A publicação aparece no B via Socket.IO. Curta, responda, republique e siga a autora no B; veja as notificações no A.

Se o Windows pedir acesso de rede para o Node, permita a rede privada utilizada pela demonstração. Se os outros terminais não acessarem, confira a porta TCP 3001 no firewall da rede privada. O protótipo não usa internet, mas precisa da conexão com o servidor LAN. Sem essa conexão, a interface informa a interrupção e evita confirmar alterações não salvas. Ao reconectar, recarrega o estado compartilhado.

Com apenas um computador, abra duas abas separadas ou dois navegadores, usando contas diferentes. A sessão é guardada no `sessionStorage` de cada aba. Não duplique uma aba já autenticada para simular um novo usuário; abra a URL em uma nova aba.

## Tempo e modo de apresentação

- Regra normal: **4 minutos de sessão + 30 minutos de pausa por conta**.
- O servidor valida os prazos e persiste as sessões e o cooldown em SQLite. Recarregar a página não reinicia o relógio; sair antes do prazo inicia a pausa imediatamente.
- Uma conta só pode ter uma sessão ativa. Se o navegador fechar sem logout, a sessão expira no prazo original e o cooldown começa nesse instante.
- Ao restar 1 minuto, aparece um aviso; nos últimos 15 segundos, o aviso ganha destaque. A tela de despedida retorna à abertura após 12 segundos.
- **Modo de apresentacao.cmd** usa 45 segundos + 90 segundos, com banco separado `data/offie-demo.sqlite`. Não há controle de aceleração na interface comum.
- Para desenvolver com tempo acelerado: `npm run demo`.

Configurações opcionais do servidor:

| Variável | Padrão | Função |
| --- | --- | --- |
| `PORT` | `3001` | Porta do servidor |
| `OFFIE_SESSION_SECONDS` | `240` | Duração da sessão |
| `OFFIE_COOLDOWN_SECONDS` | `1800` | Duração da pausa |
| `OFFIE_DB_PATH` | `data/offie.sqlite` | Arquivo SQLite |

## Funcionalidades

- Boas-vindas, seleção de conta, PIN e mensagens de erro/cooldown.
- Feed Comunidade/Seguindo e publicação de texto com até 280 pontos de código Unicode.
- Curtir/descurtir, responder, republicar/desfazer, excluir próprias publicações com confirmação.
- Discussões, perfis, seguidores/seguindo e histórico de publicações, respostas e republicações.
- Pesquisa local por nome, usuário, conteúdo e hashtag; tendências calculadas a partir dos textos.
- Notificações reais de curtida, resposta, republicação e novo seguidor; filtro de não lidas e marcar como lidas.
- Sincronização Socket.IO, persistência SQLite, reconexão e validação de tempo no servidor.
- 20 contas fictícias, 40 publicações principais, 12 respostas iniciais, seguidores, curtidas e notificações.
- Assets, fontes, ícones e animações locais. O mascote fornecido foi copiado sem edição para `public/assets/offie-mascot.png`.
- Layout para 1080×1920, monitores horizontais e celulares; preferência por movimento reduzido respeitada.

## Desenvolvimento e testes

```sh
npm run dev     # frontend :5173 + servidor :3001
npm run build   # TypeScript + bundle de produção
npm test        # testes reais HTTP, SQLite, Socket.IO e relógio de sessão
```

O Vite encaminha `/api` e `/socket.io` para o servidor no modo desenvolvimento. A versão compilada é servida pelo próprio Express: apenas a porta 3001 é necessária na apresentação.

```text
src/components/    Telas e componentes visuais
src/App.tsx        Navegação, sessão, sincronização e ações
src/styles.css     Identidade, temas e layouts responsivos
src/session-clock.ts  Proteção contra respostas de sessões antigas
server/            API, SQLite, dados iniciais e Socket.IO
public/assets/     Mascote e avatares vetoriais locais
tests/             Verificação automatizada
docs/screenshots/  Capturas de verificação visual
data/              Banco criado automaticamente na primeira execução
```

O banco não é reinicializado ao reiniciar o servidor. Para guardar uma demonstração, encerre o servidor e copie a pasta `data`. Para uma nova base sem apagar a anterior, use outro caminho em `OFFIE_DB_PATH`; uma base vazia recebe os dados fictícios automaticamente.

Este projeto tem autenticação demonstrativa e foi feito para apresentação acadêmica numa LAN confiável. Não é um serviço de produção nem uma aplicação para exposição à internet. Não há cadastro, e-mail, upload, mensagens privadas ou painel administrativo.
