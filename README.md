<p align="center">
  <img src="public/assets/offie-logo.png" width="280" alt="Offie">
</p>

<h1 align="center">A conexão acontece aqui!</h1>

O **Offie** é uma rede social para totens touchscreen no campus. Em quatro minutos, dá para compartilhar uma ideia, descobrir um projeto e responder a alguém do outro lado da instituição. Os totens conversam pela rede local, mesmo sem internet.

## Comece por aqui

Você precisa do **Node.js 24 ou superior** no computador que vai servir a aplicação. Confira a instalação com `node --version`. Ao clonar o repositório, execute na pasta do projeto:

```sh
npm install
npm run build
npm start
```

Abra [o Offie neste computador](http://localhost:3001) e pressione **F11** para usar em tela cheia. A instalação inicial das dependências usa internet. Depois da compilação, até as fontes, os avatares e as animações são servidos localmente.

No Windows, com as dependências instaladas, você também pode abrir **Iniciar Offie.cmd**. Deixe o terminal aberto durante a apresentação. Para encerrar o servidor, pressione **Ctrl+C**.

## Um passeio pelo campus

<img align="right" src="public/assets/offie-wave.png" width="115" alt="Offie acenando">

- **Entre na conversa.** Crie um perfil, escolha entre 24 avatares e publique até 280 caracteres. Alterne entre a comunidade inteira e as pessoas que você segue.
- **Descubra o que está acontecendo.** Pesquise pessoas, publicações e hashtags. Os assuntos em alta vêm das conversas salvas no próprio campus.
- **Acompanhe as respostas.** Curtidas, republicações, respostas e novos seguidores aparecem nas notificações. As interações chegam aos outros totens em tempo real.

<br clear="all">

## Contas para experimentar

| Conta | PIN inicial | Quando o relógio chega a zero |
| --- | --- | --- |
| Qualquer estudante de exemplo | `1234` | A sessão termina e a conta entra em pausa por 30 minutos. |
| Conta criada no totem | Escolhido no cadastro | A mesma pausa vale em todos os totens. |
| Offie Oficial · `@offie` | `1234` | O relógio volta a quatro minutos e a sessão continua. |
| Vlad · `@vlad` | `12345` | O relógio volta a quatro minutos e a sessão continua. |

As duas contas administrativas podem editar perfis e publicações, moderar respostas e excluir contas comuns. Os PINs acima são demonstrativos, para uso acadêmico em uma LAN de confiança.

Para estudantes, sair antes dos quatro minutos inicia a pausa imediatamente. Recarregar a página preserva o tempo restante. O servidor mantém esses prazos em SQLite.

## Demonstração em dois totens

1. Conecte os dois totens à mesma LAN e inicie o Offie em um único computador.
2. No servidor Windows, use `ipconfig` para encontrar o IPv4. Nos totens, abra `http://IP-DO-SERVIDOR:3001`. Se necessário, permita a porta TCP 3001 no firewall da rede privada.
3. Entre como Marina em um totem e Lucas no outro. Publique como Marina, responda como Lucas e abra as notificações de Marina para acompanhar a conversa.

Com um computador, abra a mesma URL em duas abas novas e entre com contas diferentes. Para demonstrar o fim da sessão mais rápido no Windows, use **Modo de apresentacao.cmd**. Ele usa sessões de 45 segundos, pausas de 90 segundos e um banco separado.

## Desenvolvimento

O frontend usa React, TypeScript, Vite, Tailwind CSS, Motion e Lucide. O Express serve a aplicação compilada, o SQLite guarda os dados e o Socket.IO avisa os totens quando algo muda. Uma base nova começa com 21 contas, 40 publicações e 12 respostas.

| Comando | Uso |
| --- | --- |
| `npm run dev` | Abre o frontend na porta 5173 e a API na porta 3001. |
| `npm run demo` | Inicia o ambiente de desenvolvimento com o relógio acelerado. |
| `npm run build` | Verifica o TypeScript e compila o frontend em `dist/`. |
| `npm test` | Verifica a API, as permissões, as notificações, o relógio e a sincronização. |

<details>
<summary><strong>Configuração do servidor e cópia do banco</strong></summary>

| Variável | Padrão |
| --- | --- |
| `PORT` | `3001` |
| `OFFIE_SESSION_SECONDS` | `240` |
| `OFFIE_COOLDOWN_SECONDS` | `1800` |
| `OFFIE_DB_PATH` | `data/offie.sqlite` |

Os dados persistem entre execuções. Para guardar uma demonstração, encerre o servidor e copie a pasta `data/`. Para experimentar com uma base nova, defina outro caminho em `OFFIE_DB_PATH`.

</details>
