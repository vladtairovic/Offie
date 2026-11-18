import { scryptSync } from 'node:crypto';
export const people = [
  ['Marina Costa','marina.costa','Design','Entre um café e uma ideia nova. Design, fotografia e um campus mais criativo. ☕','#e7d6c3'],
  ['Lucas Ferreira','lucas.dev','Sistemas de Informação','Transformando café em código e dúvidas em projetos. Bora criar algo juntos?','#c9d9cf'],
  ['Júlia Santos','julia.s','Arquitetura','Observando os detalhes que ninguém vê. Rabiscos, cidades e boas conversas.','#ebd7b7'],
  ['Pedro Almeida','pedro.a','Engenharia','No laboratório ou na quadra. Curioso por tudo que a gente pode construir.','#cad7e4'],
  ['Offie Oficial','offie','Comunidade','A conexão acontece aqui! 💛 Novidades, ideias e um lugar para todo mundo do campus.','#ffebaa'],
  ['Beatriz Lima','bia.lima','Letras','Uma história boa merece ser compartilhada. Clube do livro e poesia no intervalo.','#e2c8c4'],
  ['Rafael Oliveira','rafa.oli','Educação Física','Movimento muda o dia. Vôlei, corrida e energia boa pelo campus.','#d3dac0'],
  ['Camila Rocha','camila.r','Biologia','Plantas, ciência e pequenas descobertas. Cuidando do que conecta a gente. 🌱','#b9d4c4'],
  ['Gabriel Souza','gabs','Música','Sempre tem uma música na cabeça. Violão no intervalo e som autoral.','#d6cbe4'],
  ['Ana Martins','ana.m','Psicologia','Ouvir também é uma forma de conectar. Um dia e uma conversa de cada vez.','#ebd2ba'],
  ['Diego Ribeiro','diegor','Engenharia','Robótica, impressão 3D e ideias que saem do papel.','#c3d5db'],
  ['Lara Nunes','lara.n','Design','Design acessível, ilustração e uma coleção infinita de referências.','#e5c7af'],
  ['Thiago Mendes','thi.mendes','Administração','Gente, projetos e soluções simples. Na equipe da Semana Acadêmica.','#d4d1bc'],
  ['Sofia Carvalho','sofia.c','Biblioteconomia','Seu próximo livro favorito está esperando. Me encontre na biblioteca!','#c9cfdf'],
  ['Bruno Dias','bruno.d','Sistemas de Informação','Software livre, jogos e trabalho em equipe. Sempre pronto para um hackathon.','#d5dbb5'],
  ['Isabela Melo','isa.melo','Comunicação','Registrando histórias que acontecem aqui. Fotografia e jornal do campus.','#e4c2be'],
  ['Matheus Azevedo','matheusa','Matemática','A beleza está nos padrões. Monitoria e xadrez nas horas vagas.','#c6d7c7'],
  ['Luiza Freitas','lu.freitas','Nutrição','Comida de verdade, ciência e receitas que cabem na rotina.','#ead6aa'],
  ['Henrique Alves','henrique.a','História','O passado encontra o presente em cada conversa. Cinema e pesquisa.','#d2c5ba'],
  ['Clara Pereira','clara.p','Pedagogia','Aprender junto é sempre melhor. Educação, inclusão e projetos de extensão.','#d2c5db'],
];

const messages = [
 [5,'O campus está cheio de histórias. Qual é a sua? 💛\nBem-vindos ao Offie: um lugar para compartilhar ideias, encontrar pessoas e fazer a conversa acontecer. #VidaNoCampus'],
 [1,'Tem coisa melhor que ver uma ideia saindo do papel? Nosso mural colaborativo ganhou vida hoje! ✨\nQuem passar pelo bloco B, deixa sua marca. #Projetos #VidaNoCampus'],
 [2,'Alguém mais acha que o melhor jeito de aprender é quebrando a cabeça junto? Montando um grupo de estudos de programação. Bora? 💻 #Tecnologia'],
 [3,'O sol entrando na biblioteca às 16h é minha nova referência de iluminação. Às vezes a inspiração está bem na nossa frente. #Biblioteca'],
 [8,'A horta do campus ganhou novos moradores 🌱 Manjericão, hortelã e muita vontade de cuidar. Quem quiser participar, nos encontramos na quinta depois da aula! #Sustentabilidade'],
 [6,'Terminei o livro do clube e PRECISO conversar sobre aquele final. Sem spoilers por aqui, combinado? Sexta, 17h, na biblioteca. 📚 #Biblioteca'],
 [13,'A Semana Acadêmica está chegando! Qual tema vocês gostariam de ver nas rodas de conversa? A programação também é feita por vocês. #SemanaAcadêmica'],
 [7,'Vôlei na quadra às 17h30. Não precisa saber jogar, só aparecer com vontade. O time mais importante é o que acolhe todo mundo. 🏐 #VidaNoCampus'],
 [12,'Pequena vitória do dia: testamos nosso protótipo com pessoas de verdade. Três ajustes simples deixaram tudo mais acessível. Design é ouvir. #Projetos'],
 [4,'Nosso carrinho passou pelo circuito sem bater em NADA. Depois de 23 tentativas, tá permitido comemorar? 😂 #Tecnologia #Projetos'],
 [9,'Levei o violão para o intervalo e saí com uma banda quase formada. O campus entrega encontros que a gente nem planeja. 🎶 #VidaNoCampus'],
 [10,'Lembrete carinhoso: descansar também faz parte do processo. Um copo d’água, uma caminhada curta e respirar. Você não precisa dar conta de tudo hoje.'],
 [14,'Chegaram livros novos! Tem literatura brasileira, design e ciência. A estante de novidades fica logo na entrada. Vem descobrir sua próxima leitura. #Biblioteca'],
 [15,'Ideia para o hackathon: um mapa acessível do campus feito por quem usa o campus. Quem toparia construir? #Tecnologia #Projetos'],
 [16,'Fotografei os bastidores da feira de projetos. Meu clique favorito não foi de um projeto, foi de duas pessoas comemorando juntas. 📷 #SemanaAcadêmica'],
 [17,'Monitoria de cálculo amanhã, sala 204, das 14h às 16h. Tragam as dúvidas, a gente desenrola junto. Ninguém nasce sabendo integral.'],
 [18,'Testamos uma receita de bolo de banana sem desperdício no laboratório. A casca também entrou e ficou incrível! 🍌 #Sustentabilidade'],
 [19,'Cineclube de hoje me fez pensar por horas. Que bom quando um filme termina e a conversa começa. Sugestões para a próxima sessão? #VidaNoCampus'],
 [20,'Hoje uma criança no projeto de extensão me perguntou se aprender tem fim. Acho que encontrei minha frase favorita do semestre. 💛 #Projetos'],
 [11,'Primeira peça impressa em 3D do nosso laboratório aberto! A impressora parece lenta até você lembrar que ela está fabricando uma ideia. #Tecnologia'],
 [1,'Procurando gente de outras áreas para pensar uma campanha de acolhimento aos calouros. Quanto mais olhares, melhor o resultado. #Projetos'],
 [2,'Dica que salvou meu trabalho: explicar o código em voz alta. Pode ser para um colega, para a parede ou para o Offie. Funciona. #Tecnologia'],
 [3,'O banco debaixo da árvore perto do bloco C virou meu escritório favorito. Ar fresco, sombra e um caderno. #VidaNoCampus'],
 [4,'Quem mais vai apresentar na mostra? Estou entre o nervosismo e a vontade de mostrar tudo logo. #SemanaAcadêmica'],
 [5,'Seu momento aqui tem 4 minutos. Uma ideia, uma resposta, uma nova conexão. Depois, uma pausa de 30 minutos para viver o campus. Combinado? ⚡'],
 [6,'Deixei uma poesia no mural da biblioteca. Se você encontrar, escreva uma palavra ao lado. Vamos fazer um poema coletivo? #Biblioteca'],
 [7,'Turma da caminhada: amanhã a gente sai do portão principal às 7h30. Ritmo de conversa, sem competição. ☀️'],
 [8,'Uma borboleta pousou na bancada durante a aula de campo. A natureza também quer participar da pesquisa. #Sustentabilidade'],
 [9,'Playlist colaborativa do campus: qual música não pode faltar? Vou começar com uma que sempre melhora meu dia. 🎧'],
 [10,'A roda de acolhimento de hoje teve mais escuta que conselho. Às vezes é exatamente isso que a gente precisa. #VidaNoCampus'],
 [11,'Abrimos o laboratório para quem quiser conhecer robótica. Não precisa entender de circuitos. Curiosidade já é um ótimo começo. #Tecnologia'],
 [12,'Uma paleta de cores inspirada nas flores do campus. O melhor banco de referências é o caminho até a sala. 🌼'],
 [13,'Precisamos de voluntários para receber os visitantes na feira. Uma hora do seu dia pode fazer muita diferença. #SemanaAcadêmica'],
 [14,'Sabia que a biblioteca tem jogos de tabuleiro? Uma pausa também pode ser um convite para conhecer alguém. #Biblioteca'],
 [15,'Conseguimos rodar o projeto inteiro sem internet. Tecnologia também é inventar com o que está perto. #Tecnologia #Projetos'],
 [16,'Qual cantinho do campus tem uma história especial para você? Estou montando uma série para o jornal. #VidaNoCampus'],
 [17,'O clube de xadrez ganhou três participantes novos hoje. A melhor jogada foi deixar uma cadeira vazia convidando quem passava. ♟️'],
 [18,'Uma dica simples para os dias corridos: levar uma fruta na mochila. Seu eu do intervalo vai agradecer. 🍎'],
 [19,'Encontrei uma foto antiga do campus no arquivo. A árvore que hoje faz sombra era só uma mudinha. O tempo tem dessas. #VidaNoCampus'],
 [20,'Encerramos a oficina com uma pergunta: o que você aprendeu com alguém hoje? Fiquei pensando nas respostas o caminho inteiro. #Projetos'],
];

export function seed(db, now) {
  if (db.prepare('SELECT count(*) as n FROM users').get().n) return;
  db.exec('BEGIN');
  try {
    people.forEach(([name,handle,course,bio,color],i) => db.prepare('INSERT INTO users (id,name,handle,course,bio,color,avatar,official,pin_hash) VALUES (?,?,?,?,?,?,?,?,?)').run(i+1,name,handle,course,bio,color,i===4?'/assets/offie-mascot.png':`/assets/avatar-${i+1}.svg`,i===4?1:0,scryptSync('1234',`offie-demo-${i+1}`,32).toString('hex')));
    messages.forEach(([userId,text],i) => db.prepare('INSERT INTO posts (user_id,text,created_at) VALUES (?,?,?)').run(userId,text,now-(i+1)*180000));
    for(let id=1;id<=40;id++) for(let j=0;j<3+(id%7);j++) { const actor=((id*3+j*7)%20)+1; db.prepare('INSERT OR IGNORE INTO likes (user_id,post_id) VALUES (?,?)').run(actor,id); }
    for(let id=1;id<=20;id++) for(let j=1;j<=4;j++) { const target=((id+j*3)%20)+1; if(target!==id) db.prepare('INSERT OR IGNORE INTO follows (follower_id,following_id) VALUES (?,?)').run(id,target); }
    const replies=['Essa ideia merece ganhar o campus inteiro! 💛','Eu topo! Vamos combinar depois da aula?','Passei por lá hoje. Ficou muito bom!','Pode contar comigo na próxima. 🙌','É por essas conexões que eu gosto daqui.','Já anotei na agenda. Até lá!','Que bom ver esse projeto crescendo.','Tenho uma sugestão! Vamos conversar no intervalo?','A biblioteca é meu lugar favorito também.','Obrigada por compartilhar isso. Precisava ler hoje.','Nossa turma vai participar!','Adorei. Pequenas ideias fazem diferença.'];
    replies.forEach((text,i)=>db.prepare('INSERT INTO posts (user_id,text,created_at,parent_id) VALUES (?,?,?,?)').run((i+6)%20+1,text,now-(i+1)*90000,(i%9)+1));
    for(const [actor,post] of [[2,2],[3,1],[7,3],[12,5],[15,4],[16,7]]) db.prepare('INSERT INTO reposts (user_id,post_id,created_at) VALUES (?,?,?)').run(actor,post,now-45000);
    for(const [actor,type,post] of [[2,'like',2],[6,'reply',2],[3,'follow',null],[12,'repost',2]]) db.prepare('INSERT INTO notifications (user_id,actor_id,type,post_id,created_at,is_read) VALUES (?,?,?,?,?,?)').run(1,actor,type,post,now-90000*actor,actor===3?1:0);
    db.exec('COMMIT');
  } catch(err) { db.exec('ROLLBACK'); throw err; }
}
