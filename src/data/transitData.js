export const citiesData = [
  {
    id: "piacenza",
    name: "Piacenza",
    country: "Italia",
    flag: "🇮🇹",
    coords: [45.0526, 9.6930],
    zoom: 14,
    description: "Rete integrata SETA Urbano/Extraurbano, Tempi e Trenitalia Piacenza Centrale.",
    operators: [
      { name: "SETA Piacenza", type: "Bus Urbano / Suburbano", color: "#e11d48", logo: "🚌" },
      { name: "Tempi Pass", type: "Bigliettazione Integrata", color: "#0284c7", logo: "🎟️" },
      { name: "Trenitalia / FS", type: "Treni Regionali & Alta Velocità", color: "#15803d", logo: "🚆" },
      { name: "RadioTaxi Piacenza", type: "Servizio Taxi 24h", color: "#eab308", logo: "🚕" }
    ],
    sampleStops: [
      { id: "p01", name: "Piacenza Stazione FS", type: "train", lat: 45.0537, lng: 9.7028 },
      { id: "p02", name: "Piazza Cavalli", type: "bus", lat: 45.0526, lng: 9.6930 },
      { id: "p03", name: "Ospedale Guglielmo da Saliceto", type: "bus", lat: 45.0450, lng: 9.6820 },
      { id: "p04", name: "Cheope / Barriera Genova", type: "bus", lat: 45.0485, lng: 9.6980 },
      { id: "p05", name: "Stadio Garilli", type: "bus", lat: 45.0340, lng: 9.7110 },
      { id: "p06", name: "Barriera Torino", type: "bus", lat: 45.0580, lng: 9.6810 }
    ],
    vehicles: [
      { id: "v-p1", line: "Linea 2 (SETA)", type: "bus", number: "Bus #204", lat: 45.0530, lng: 9.6980, heading: 240, status: "On Time", crowding: "Low", nextStop: "Piazza Cavalli" },
      { id: "v-p2", line: "Linea 5 (SETA)", type: "bus", number: "Bus #512", lat: 45.0490, lng: 9.6890, heading: 180, status: "On Time", crowding: "Medium", nextStop: "Ospedale Guglielmo da Saliceto" },
      { id: "v-p3", line: "Regionale 2078 (Trenitalia)", type: "train", number: "R 2078", lat: 45.0545, lng: 9.7080, heading: 90, status: "+2 min", crowding: "Medium", nextStop: "Milano Rogoredo" },
      { id: "v-p4", line: "RadioTaxi #14", type: "taxi", number: "Taxi 14", lat: 45.0510, lng: 9.6950, heading: 45, status: "Available", crowding: "Low", nextStop: "Piazza Borgo" }
    ],
    sampleRoutes: [
      {
        id: "r-p1",
        origin: "Piacenza Stazione FS",
        destination: "Ospedale Guglielmo da Saliceto",
        durationMinutes: 11,
        transfers: 0,
        price: "€ 1,50",
        co2SavedKg: 0.9,
        category: "fastest",
        rainSafeScore: 70,
        accessible: true,
        operator: "SETA Piacenza",
        operatorColor: "#e11d48",
        steps: [
          { mode: "walk", title: "Cammina verso la fermata Stazione FS (Piazzale Marconi)", duration: "2 min", distance: "120m" },
          { mode: "bus", line: "Linea 2", title: "Prendi Bus SETA Linea 2 (dir. Ospedale)", duration: "7 min", stops: 4, vehicle: "Bus hybrid #204", status: "In arrivo fra 3 min" },
          { mode: "walk", title: "Arrivo all'ingresso principale Ospedale Saliceto", duration: "2 min", distance: "150m" }
        ]
      },
      {
        id: "r-p2",
        origin: "Piacenza Stazione FS",
        destination: "Milano Centrale",
        durationMinutes: 38,
        transfers: 0,
        price: "€ 7,10",
        co2SavedKg: 4.5,
        category: "fastest",
        rainSafeScore: 95,
        accessible: true,
        operator: "Trenitalia Frecciarossa / RV",
        operatorColor: "#15803d",
        steps: [
          { mode: "walk", title: "Raggiungi il Binario 2 Stazione Piacenza", duration: "3 min", distance: "80m" },
          { mode: "train", line: "RV 2462", title: "Treno Regionale Veloce 2462 per Milano Centrale", duration: "33 min", stops: 2, status: "Binario 2 - In orario" },
          { mode: "walk", title: "Arrivo a Milano Centrale", duration: "2 min", distance: "100m" }
        ]
      }
    ]
  },
  {
    id: "paris",
    name: "Parigi (Paris)",
    country: "Francia",
    flag: "🇫🇷",
    coords: [48.8566, 2.3522],
    zoom: 13,
    description: "Integrazione completa RATP Métro/Bus, RER Île-de-France, SNCF Transilien/TGV e Taxi G7.",
    operators: [
      { name: "RATP Métro", type: "Métro & Tramway Paris", color: "#059669", logo: "🚇" },
      { name: "RATP Bus", type: "Bus Île-de-France", color: "#2563eb", logo: "🚌" },
      { name: "RER / SNCF", type: "RER Régional & Transilien", color: "#7c3aed", logo: "🚆" },
      { name: "Taxi G7 Paris", type: "Taxi & VTC Officielles", color: "#ca8a04", logo: "🚕" }
    ],
    sampleStops: [
      { id: "pa01", name: "Gare de Lyon", type: "train", lat: 48.8443, lng: 2.3744 },
      { id: "pa02", name: "Châtelet - Les Halles", type: "metro", lat: 48.8614, lng: 2.3470 },
      { id: "pa03", name: "Tour Eiffel / Champ de Mars", type: "metro", lat: 48.8584, lng: 2.2945 },
      { id: "pa04", name: "Gare du Nord", type: "train", lat: 48.8809, lng: 2.3553 },
      { id: "pa05", name: "Opéra / Haussmann", type: "metro", lat: 48.8708, lng: 2.3322 }
    ],
    vehicles: [
      { id: "v-pa1", line: "Métro 1 (RATP)", type: "metro", number: "RATP M1-14", lat: 48.8550, lng: 2.3500, heading: 90, status: "On Time", crowding: "Medium", nextStop: "Bastille" },
      { id: "v-pa2", line: "RER A (SNCF/RATP)", type: "train", number: "RER A-88", lat: 48.8480, lng: 2.3700, heading: 270, status: "+1 min", crowding: "High", nextStop: "Châtelet - Les Halles" },
      { id: "v-pa3", line: "Bus 72 (RATP)", type: "bus", number: "Bus 72-03", lat: 48.8600, lng: 2.3200, heading: 120, status: "On Time", crowding: "Low", nextStop: "Louvre - Rivoli" }
    ],
    sampleRoutes: [
      {
        id: "r-pa1",
        origin: "Gare de Lyon",
        destination: "Tour Eiffel",
        durationMinutes: 22,
        transfers: 1,
        price: "€ 2,15",
        co2SavedKg: 1.8,
        category: "fastest",
        rainSafeScore: 90,
        accessible: true,
        operator: "RATP Métro + RER C",
        operatorColor: "#059669",
        steps: [
          { mode: "walk", title: "Marchez jusqu'au quai Métro 14 à Gare de Lyon", duration: "3 min", distance: "180m" },
          { mode: "metro", line: "Métro 14", title: "Métro Line 14 dir. Saint-Denis", duration: "4 min", stops: 1, status: "Départ immédiat" },
          { mode: "metro", line: "Métro 6 / RER C", title: "Changement à Châtelet vers RER C dir. Champ de Mars", duration: "12 min", stops: 3, status: "À l'heure" },
          { mode: "walk", title: "Arrivée au pied de la Tour Eiffel", duration: "3 min", distance: "200m" }
        ]
      }
    ]
  },
  {
    id: "london",
    name: "Londra (London)",
    country: "Regno Unito",
    flag: "🇬🇧",
    coords: [51.5074, -0.1278],
    zoom: 13,
    description: "TfL Underground (Tube), Elizabeth Line, Red Double-Deckers, Thames Clippers & Black Cabs.",
    operators: [
      { name: "TfL Underground", type: "London Tube", color: "#dc2626", logo: "🚇" },
      { name: "TfL Buses", type: "Double-Decker Bus", color: "#e11d48", logo: "🚌" },
      { name: "Elizabeth Line", type: "Crossrail Express", color: "#9333ea", logo: "💜" },
      { name: "London Black Cabs", type: "Licensed Taxi", color: "#18181b", logo: "🚕" }
    ],
    sampleStops: [
      { id: "ld01", name: "Paddington Station", type: "train", lat: 51.5154, lng: -0.1754 },
      { id: "ld02", name: "Piccadilly Circus", type: "metro", lat: 51.5100, lng: -0.1344 },
      { id: "ld03", name: "London Bridge", type: "train", lat: 51.5048, lng: -0.0860 },
      { id: "ld04", name: "King's Cross St. Pancras", type: "train", lat: 51.5309, lng: -0.1233 }
    ],
    vehicles: [
      { id: "v-ld1", line: "Central Line (TfL)", type: "metro", number: "Tube #910", lat: 51.5130, lng: -0.1400, heading: 90, status: "Good Service", crowding: "Medium", nextStop: "Oxford Circus" },
      { id: "v-ld2", line: "Elizabeth Line", type: "train", number: "Liz #402", lat: 51.5160, lng: -0.1500, heading: 90, status: "Good Service", crowding: "Low", nextStop: "Tottenham Court Road" }
    ],
    sampleRoutes: [
      {
        id: "r-ld1",
        origin: "Paddington Station",
        destination: "London Bridge",
        durationMinutes: 14,
        transfers: 0,
        price: "£ 2,80",
        co2SavedKg: 2.1,
        category: "fastest",
        rainSafeScore: 95,
        accessible: true,
        operator: "TfL Elizabeth Line",
        operatorColor: "#9333ea",
        steps: [
          { mode: "walk", title: "Walk to Elizabeth Line platform Paddington", duration: "2 min", distance: "100m" },
          { mode: "train", line: "Elizabeth Line", title: "Elizabeth Line towards Abbey Wood", duration: "10 min", stops: 2, status: "Good Service" },
          { mode: "walk", title: "Arrive at London Bridge Station", duration: "2 min", distance: "120m" }
        ]
      }
    ]
  },
  {
    id: "milan",
    name: "Milano",
    country: "Italia",
    flag: "🇮🇹",
    coords: [45.4642, 9.1900],
    zoom: 13,
    description: "ATM Metropolitana M1-M5, Tram storici, Trenord, Frecciarossa, Taxi & E-Scooters.",
    operators: [
      { name: "ATM Milano", type: "Metro, Tram & Bus", color: "#f59e0b", logo: "🚇" },
      { name: "Trenord", type: "Servizio Ferroviario Regionale", color: "#16a34a", logo: "🚆" },
      { name: "FreeNow Taxi", type: "Taxi & Rides", color: "#2563eb", logo: "🚕" }
    ],
    sampleStops: [
      { id: "mi01", name: "Milano Centrale FS", type: "train", lat: 45.4858, lng: 9.2045 },
      { id: "mi02", name: "Duomo M1 M3", type: "metro", lat: 45.4641, lng: 9.1919 },
      { id: "mi03", name: "Cadorna FN", type: "train", lat: 45.4684, lng: 9.1764 }
    ],
    vehicles: [
      { id: "v-mi1", line: "M3 Gialla (ATM)", type: "metro", number: "M3-21", lat: 45.4750, lng: 9.2000, heading: 180, status: "In orario", crowding: "Medium", nextStop: "Montenapoleone" }
    ],
    sampleRoutes: [
      {
        id: "r-mi1",
        origin: "Milano Centrale FS",
        destination: "Piazza Duomo",
        durationMinutes: 7,
        transfers: 0,
        price: "€ 2,20",
        co2SavedKg: 1.2,
        category: "fastest",
        rainSafeScore: 100,
        accessible: true,
        operator: "ATM Metro M3 Gialla",
        operatorColor: "#f59e0b",
        steps: [
          { mode: "walk", title: "Scendi al piano ammezzato M3 Centrale FS", duration: "2 min", distance: "100m" },
          { mode: "metro", line: "M3 Gialla", title: "Metropolitana Linea 3 dir. San Donato", duration: "4 min", stops: 4, status: "Treno ogni 2 min" },
          { mode: "walk", title: "Uscita sul sagrato di Piazza Duomo", duration: "1 min", distance: "50m" }
        ]
      }
    ]
  },
  {
    id: "newyork",
    name: "New York City",
    country: "Stati Uniti",
    flag: "🇺🇸",
    coords: [40.7128, -74.0060],
    zoom: 12,
    description: "MTA New York City Subway, Regional Bus, LIRR, NJ Transit & Yellow Cabs.",
    operators: [
      { name: "MTA Subway", type: "NYC Subway 24/7", color: "#2563eb", logo: "🗽" },
      { name: "MTA Bus", type: "Express & Local Bus", color: "#0284c7", logo: "🚌" },
      { name: "NYC Yellow Cab", type: "Iconic NYC Taxi", color: "#eab308", logo: "🚕" }
    ],
    sampleStops: [
      { id: "ny01", name: "Grand Central Terminal", type: "train", lat: 40.7527, lng: -73.9772 },
      { id: "ny02", name: "Times Square - 42 St", type: "metro", lat: 40.7580, lng: -73.9855 },
      { id: "ny03", name: "Penn Station", type: "train", lat: 40.7506, lng: -73.9935 }
    ],
    vehicles: [
      { id: "v-ny1", line: "Subway 7 Train", type: "metro", number: "7-Express", lat: 40.7550, lng: -73.9800, heading: 90, status: "On Time", crowding: "High", nextStop: "Grand Central" }
    ],
    sampleRoutes: [
      {
        id: "r-ny1",
        origin: "Penn Station",
        destination: "Grand Central Terminal",
        durationMinutes: 8,
        transfers: 0,
        price: "$ 2.90",
        co2SavedKg: 1.5,
        category: "fastest",
        rainSafeScore: 90,
        accessible: true,
        operator: "MTA Shuttle / Subway",
        operatorColor: "#2563eb",
        steps: [
          { mode: "walk", title: "Walk to Subway platform", duration: "2 min", distance: "100m" },
          { mode: "metro", line: "Subway 1/2/3", title: "Take Subway 2 Train to Times Square Shuttle", duration: "4 min", stops: 1, status: "On time" },
          { mode: "walk", title: "Arrive Grand Central Terminal", duration: "2 min", distance: "80m" }
        ]
      }
    ]
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Giappone",
    flag: "🇯🇵",
    coords: [35.6762, 139.6503],
    zoom: 13,
    description: "Tokyo Metro, Toei Subway, JR Yamanote Line, Shinkansen Bullet Trains & Japan Taxi.",
    operators: [
      { name: "Tokyo Metro", type: "Subway Network", color: "#0ea5e9", logo: "🚅" },
      { name: "JR East Yamanote Line", type: "Loop Train", color: "#16a34a", logo: "🟢" },
      { name: "Japan Taxi", type: "Taxi & Rides", color: "#475569", logo: "🚕" }
    ],
    sampleStops: [
      { id: "tk01", name: "Tokyo Station", type: "train", lat: 35.6812, lng: 139.7671 },
      { id: "tk02", name: "Shinjuku Station", type: "train", lat: 35.6896, lng: 139.7006 },
      { id: "tk03", name: "Shibuya Station", type: "train", lat: 35.6580, lng: 139.7016 }
    ],
    vehicles: [
      { id: "v-tk1", line: "JR Yamanote Line", type: "train", number: "JY-12", lat: 35.6700, lng: 139.7100, heading: 45, status: "On Time (Punctual 100%)", crowding: "Low", nextStop: "Harajuku" }
    ],
    sampleRoutes: [
      {
        id: "r-tk1",
        origin: "Tokyo Station",
        destination: "Shinjuku Station",
        durationMinutes: 13,
        transfers: 0,
        price: "¥ 210",
        co2SavedKg: 2.5,
        category: "fastest",
        rainSafeScore: 100,
        accessible: true,
        operator: "JR Chuo Line Rapid",
        operatorColor: "#ea580c",
        steps: [
          { mode: "walk", title: "Walk to JR Chuo Line Platform 1-2", duration: "2 min", distance: "90m" },
          { mode: "train", line: "JR Chuo Rapid", title: "JR Chuo Rapid Train to Shinjuku", duration: "9 min", stops: 2, status: "Departing Platform 2" },
          { mode: "walk", title: "Arrive at Shinjuku Station East Exit", duration: "2 min", distance: "110m" }
        ]
      }
    ]
  }
];

export const mockTickets = [
  {
    id: "tck-001",
    cityName: "Piacenza",
    countryFlag: "🇮🇹",
    operator: "SETA Piacenza & Tempi",
    type: "Biglietto Urbano Corsa Semplice (75 min)",
    price: "€ 1,50",
    purchaseDate: "2026-10-10 10:15",
    expiresAt: "2026-10-10 11:30",
    status: "Active",
    qrCodeData: "SETA-PC-2026-991823-VALIDATED",
    remainingMinutes: 65,
    zone: "Zona 1 Urbano Piacenza"
  },
  {
    id: "tck-002",
    cityName: "Parigi",
    countryFlag: "🇫🇷",
    operator: "RATP Île-de-France",
    type: "Ticket t+ Métro/Bus/Tram",
    price: "€ 2,15",
    purchaseDate: "2026-10-09 14:00",
    expiresAt: "2026-10-09 15:30",
    status: "Used",
    qrCodeData: "RATP-PARIS-88219-EXPIRED",
    remainingMinutes: 0,
    zone: "Zone 1-2 Paris Intramuros"
  }
];

export const mockDisruptions = [
  {
    id: "alert-1",
    city: "Piacenza",
    line: "Bus Linea 2 SETA",
    title: "Deviazione per Lavori in Corso Vittorio Emanuele",
    severity: "warning",
    time: "10 min fa",
    reporter: "Ufficio Mobilita SETA",
    details: "I bus della Linea 2 deviano temporaneamente via Stradone e via Giordani. Fermate sospese: Piazza Cavalli Ovest."
  },
  {
    id: "alert-2",
    city: "Piacenza",
    line: "Trenitalia Stazione FS",
    title: "Ascensore Binario 2 Sospeso per Manutenzione",
    severity: "info",
    time: "25 min fa",
    reporter: "Passeggero Luca M.",
    details: "Ascensore binario 2 fuori servizio. Disponibile montascale assistito contattando il personale di stazione."
  },
  {
    id: "alert-3",
    city: "Parigi",
    line: "Métro Ligne 14",
    title: "Trafic Fluide et Régulier",
    severity: "success",
    time: "2 min fa",
    reporter: "RATP Live Bot",
    details: "Tutti i treni automatici della linea 14 circolano regolarmente con frequenza di 85 secondi."
  }
];
