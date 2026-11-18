# Offie — design e escopo

Fonte de requisitos: especificação completa fornecida pelo usuário nesta conversa. A solicitação já define stack, direção visual, telas, funcionalidades, limites e ordem; a implementação segue essa autorização sem nova etapa de aprovação.

## Experiência
Rede social de campus em português, para toque em 1080 × 1920, adaptada a desktop e celular. Boas-vindas editorial com creme, azul profundo e amarelo; mascote original preservado como asset local. DM Sans para leitura e Outfit para identidade, empacotadas localmente. Feed com navegação lateral em desktop e inferior em telas estreitas. Tema escuro azul, foco visível e respeito a movimento reduzido.

## Abordagem
Escolha de implementação: React/Vite com Express e SQLite no mesmo computador servidor. Socket.IO invalida snapshots pequenos para todos os totens. Alternativas de armazenamento apenas no navegador e hospedagem em nuvem não atendem à persistência compartilhada em LAN pedida pelo usuário. Não há integrações externas em runtime.

## Regras
20 contas fictícias, PIN demonstrativo 1234, 40 publicações principais e respostas adicionais. Textos até 280 pontos de código Unicode. Curtir, responder, republicar, excluir próprias, seguir, pesquisar, abrir perfis/discussões, tendências e notificações reais. Uma sessão ativa por conta. O servidor persiste validade de 240 segundos e cooldown de 1800 segundos, inclusive ao sair cedo. Recarregar a página retoma a sessão existente sem reiniciar o tempo. Configuração acelerada só por variável de servidor.

## Limites
Protótipo institucional de demonstração. Sem cadastro, mensagens privadas, uploads ou administração. Servidor LAN precisa estar acessível; sem internet significa sem serviços externos, não sem conexão com o servidor local. Sem estado social fictício de sucesso em falhas de rede.
