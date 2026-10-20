// Test-only access to the generator's reference solution; never served with the game.
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../public/new-build/circuit-rush-engine.mjs',import.meta.url),'utf8').replace(/(?:export )?const createSolvedBoard=/,'export const createSolvedBoard=');
export const {createSolvedBoard}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
