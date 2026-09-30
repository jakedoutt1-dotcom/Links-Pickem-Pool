import {initializeWeeklyAccess} from '../lib/weekly-access-default.js';
import {sensitiveChangeGuard} from '../lib/sensitive-change-guard.js';
import {slotWriteGuard} from '../lib/slot-write-guard.js';
export async function onRequest(context){try{await initializeWeeklyAccess(context)}catch{console.warn("Weekly access default could not be initialized")}return await sensitiveChangeGuard(context.request,context.env)||await slotWriteGuard(context.request,context.env)||context.next()}
