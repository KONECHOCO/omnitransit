#!/bin/bash
# OmniTransit / MOTIS: scarica OSM + GTFS, importa in una cartella nuova e scambia i dati senza fermare il servizio a lungo.
# Fonti (uso commerciale consentito): ATM Milano CC-BY-4.0 (Comune di Milano), Trenord CC-BY-4.0 (Regione Lombardia), OSM ODbL.
set -euo pipefail
cd /opt/motis
UA="OmniTransit/1.0 (konechocoproduction@gmail.com)"
BBOX="8.6,44.85,10.3,45.95"   # Milano, Lodi, Pavia, Bergamo, Cremona, Piacenza
mkdir -p src
# OSM: si riscarica solo se Geofabrik ha una versione più recente (una volta a settimana basta)
if [ ! -f src/area.osm.pbf ] || [ -n "$(find src/area.osm.pbf -mtime +6)" ]; then
  for r in nord-ovest nord-est; do curl -sfL -A "$UA" -o src/$r.osm.pbf https://download.geofabrik.de/europe/italy/$r-latest.osm.pbf; done
  osmium merge src/nord-ovest.osm.pbf src/nord-est.osm.pbf -o src/nord.osm.pbf --overwrite
  osmium extract -b "$BBOX" src/nord.osm.pbf -o src/area.osm.pbf --overwrite
  rm -f src/nord.osm.pbf src/nord-ovest.osm.pbf src/nord-est.osm.pbf
fi
curl -sfL -A "$UA" -o src/atm-milano.gtfs.zip https://dati.comune.milano.it/gtfs.zip
curl -sfL -A "$UA" -o src/trenord.gtfs.zip https://www.dati.lombardia.it/download/3z4k-mxz9/application/zip

rm -rf data-new && mkdir data-new
cp src/area.osm.pbf src/atm-milano.gtfs.zip src/trenord.gtfs.zip data-new/
cp config.yml data-new/config.yml
chown -R motis:motis data-new
# Import a bassa priorità e con memoria limitata: il negozio ivoiro sullo stesso server ha la precedenza
systemd-run --wait --collect --quiet --uid=motis --gid=motis -p WorkingDirectory=/opt/motis/data-new \
  -p MemoryHigh=2200M -p Nice=15 -p IOSchedulingClass=idle /opt/motis/motis import
systemctl stop motis 2>/dev/null || true
rm -rf data-old; [ -d data ] && mv data data-old; mv data-new data
systemctl start motis 2>/dev/null || true
rm -rf data-old
echo "$(date -Is) update ok"
