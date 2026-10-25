import {fixture as baseFixture} from './pool-format-fixture.mjs';
// D1 batches execute serially; the shared in-memory SQLite fixture needs this queue.
export function fixture(){const value=baseFixture(),batch=value.db.batch.bind(value.db);let pending=Promise.resolve();value.db.batch=statements=>{const task=pending.then(()=>batch(statements));pending=task.catch(()=>{});return task};return value}
