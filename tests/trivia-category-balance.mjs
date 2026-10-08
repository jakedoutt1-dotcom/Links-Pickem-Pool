import assert from 'node:assert/strict';
import {balancedCategories} from '../functions/lib/trivia-category-balance.js';
import {makeDeck,CATEGORIES} from '../functions/lib/trivia-night.js';
const bank=CATEGORIES.flatMap(category=>Array.from({length:category==='football'?180:12},(_,i)=>({id:category+i,category,difficulty:'easy',text:category+i,answers:['right','wrong1','wrong2','wrong3'],correct:0})));
for(let i=0;i<100;i++){
 const deck=makeDeck(bank,CATEGORIES,'mixed');assert.equal(deck.length,bank.length);assert.equal(new Set(deck.map(q=>q.id)).size,bank.length);
 assert.equal(new Set(deck.slice(0,6).map(q=>q.category)).size,6);
 for(const category of CATEGORIES)assert.equal(deck.slice(0,12).filter(q=>q.category===category).length,2);
 assert.ok(deck.every(q=>q.answers[q.correct]==='right'));
 assert.ok(deck.slice(1,12).every((q,n)=>q.category!==deck[n].category));
}
assert.ok(makeDeck(bank,['football'],'easy').every(q=>q.category==='football'));
assert.equal(balancedCategories([{id:1},{id:2}]).length,2);
assert.equal(balancedCategories([]).length,0);
console.log('PASS 100 mixed decks: 180 sports versus 12 per category still gives two each in first 12; correct answers, explicit category, uniqueness and sparse banks preserved.');
