import {slotWriteGuard} from '../../lib/slot-write-guard.js';
export async function onRequest(context){return await slotWriteGuard(context.request,context.env)||context.next()}
