import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SessionClock } from '../src/session-clock.ts';

const session=(token,expiresAt=240000)=>({token,userId:1,expiresAt,serverNow:0,duration:240000,cooldown:1800000});
test('resposta atrasada de uma conta anterior não encerra nem altera o tempo da nova conta',()=>{
  const clock=new SessionClock(session('old'),()=>1000);
  clock.start(session('new',200000)); const deadline=clock.deadline;
  assert.equal(clock.reconcile('old',session('old',1000000)),false);
  assert.equal(clock.deadline,deadline); assert.equal(clock.end('old'),false); assert.equal(clock.accepts('new'),true);
  assert.equal(clock.end('new'),true); assert.equal(clock.accepts('new'),false);
});
test('relógio sincroniza com servidor e cooldown acelerado acompanha a duração configurada',()=>{
  const clock=new SessionClock({...session('demo',45000),cooldown:90000},()=>1000);
  assert.equal(clock.deadline,46000); assert.equal(clock.cooldownUntil,136000);
  clock.reconcile('demo',{...session('demo',45000),serverNow:20000,cooldown:90000});
  assert.equal(clock.deadline,26000);assert.equal(clock.cooldownUntil,116000);
});
test('restaurar a aba mantém o instante original de expiração e o restante da pausa',()=>{
  const clock=new SessionClock({...session('restored'),clientSavedAt:1000},()=>600000);
  assert.equal(clock.deadline,241000);
  assert.equal(clock.cooldownUntil-600000,1441000);
});
