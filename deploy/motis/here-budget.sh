#!/bin/bash
# OmniTransit — tetto di spesa mensile per HERE. Gira ogni 5 minuti (cron di root).
# Conta le richieste HERE del mese arrivate davvero a HERE (non servite dalla cache) e, se la spesa
# stimata supera la soglia, fa rispondere al proxy 503 fino al mese successivo.
# Prezzi PRUDENTI (da aggiornare con quelli reali della console HERE):
BUDGET_USD=45                 # 50 EUR al mese meno un margine di sicurezza
TRANSIT_FREE=5000;  TRANSIT_PER_1000=2.50   # Public Transit (routes, departures, stations)
SEARCH_FREE=5000;   SEARCH_PER_1000=1.00    # Geocoding & Search (discover, geocode, revgeocode)
set -euo pipefail
LOG=/var/log/omnitransit/here-$(date -u +%Y-%m).log
FLAG=/etc/nginx/secrets/here-budget.conf
STATE=/var/log/omnitransit/here-budget.status
count() { [ -f "$LOG" ] && awk -v re="$1" '$2 ~ re && $3 == 200 && $4 != "HIT" {n++} END {print n+0}' "$LOG" || echo 0; }
T=$(count "^(router|transit)$"); S=$(count "^(discover|geocode|revgeocode)$")
COST=$(awk -v t=$T -v s=$S -v tf=$TRANSIT_FREE -v tp=$TRANSIT_PER_1000 -v sf=$SEARCH_FREE -v sp=$SEARCH_PER_1000 \
  'BEGIN { ct=(t>tf)?(t-tf)/1000*tp:0; cs=(s>sf)?(s-sf)/1000*sp:0; printf "%.2f", ct+cs }')
OVER=$(awk -v c=$COST -v b=$BUDGET_USD 'BEGIN { print (c>=b) ? 1 : 0 }')
echo "$(date -Is) transit=$T search=$S cost_usd=$COST budget_usd=$BUDGET_USD over=$OVER" > "$STATE"
if [ "$OVER" = 1 ]; then
  WANT="return 503; # budget mensile HERE raggiunto"
else
  WANT="# budget ok"
fi
if [ "$(cat "$FLAG")" != "$WANT" ]; then
  echo "$WANT" > "$FLAG"
  nginx -t -q && systemctl reload nginx
  echo "$(date -Is) here-budget -> $WANT (cost_usd=$COST)" >> /var/log/omnitransit/here-budget-changes.log
fi
