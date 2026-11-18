import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const env={...process.env};
if(process.argv.includes('--demo')){env.OFFIE_SESSION_SECONDS='45';env.OFFIE_COOLDOWN_SECONDS='90';env.OFFIE_DB_PATH=resolve(root,'data/offie-demo.sqlite');console.log('Modo de apresentação: 45 segundos de sessão + 90 segundos de pausa. Banco separado.');}
const server=spawn(process.execPath,['server/index.mjs'],{cwd:root,env,stdio:'inherit'});
const frontend=spawn(process.execPath,['node_modules/vite/bin/vite.js'],{cwd:root,env,stdio:'inherit'});
let closing=false;function close(code=0){if(closing)return;closing=true;server.kill();frontend.kill();setTimeout(()=>process.exit(code),250).unref();}
server.on('exit',code=>close(code||0));frontend.on('exit',code=>close(code||0));for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>close());
