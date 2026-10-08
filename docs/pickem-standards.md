# Pick’em display standards

User preference: show team logos, win–loss records and moneyline odds for every supported Pick’em sport. Reuse the paid SportsGameOdds gateway (`api/playmaker-odds`) and `pickem-moneylines.mjs` for new pools. Match both teams, league and scheduled start time; never guess which doubleheader a price belongs to. Display unavailable odds honestly. Odds are informational, not scoring multipliers. Keep API keys server-side, cache requests, and allow picks when the odds provider is unavailable.

Existing NFL rendering uses ESPN moneylines; the NBA and MLB additions use the paid gateway. Do not claim NFL was migrated by this change.
