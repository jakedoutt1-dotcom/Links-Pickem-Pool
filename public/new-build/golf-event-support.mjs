// These pools score individual stroke-play events, not team or match-play formats.
export function supportedGolfEvent(name){return !!String(name||'').trim()&&!/presidents? cup|ryder cup|solheim cup|zurich classic|qbe shootout|grant thornton|pnc championship|match[ -]?play|team championship/i.test(String(name));}
