import { createOffie } from './app.mjs';
const sessionMs=process.env.OFFIE_SESSION_SECONDS ? Number(process.env.OFFIE_SESSION_SECONDS)*1000 : 240000;
const cooldownMs=process.env.OFFIE_COOLDOWN_SECONDS ? Number(process.env.OFFIE_COOLDOWN_SECONDS)*1000 : 1800000;
const app=createOffie({sessionMs,cooldownMs,...(process.env.OFFIE_DB_PATH?{dbPath:process.env.OFFIE_DB_PATH}:{})});
const port=Number(process.env.PORT||3001);
app.server.listen(port,'0.0.0.0',()=>console.log(`Offie está no ar: http://localhost:${port}\nSessão: ${sessionMs/1000}s · Pausa: ${cooldownMs/1000}s · SQLite local`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,async()=>{await app.close();process.exit(0);});
