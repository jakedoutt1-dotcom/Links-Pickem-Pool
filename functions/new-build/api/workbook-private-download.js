import {privateWorkbookDownload} from '../../lib/workbook-private-download.js';
export async function onRequest(context) {return privateWorkbookDownload(context);}
