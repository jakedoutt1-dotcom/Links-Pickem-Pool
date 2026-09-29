import {sensitiveChangeGuard} from '../../lib/sensitive-change-guard.js';
import {slotWriteGuard} from '../../lib/slot-write-guard.js';
export async function onRequest(context){return await sensitiveChangeGuard(context.request,context.env)||await slotWriteGuard(context.request,context.env)||context.next()}
