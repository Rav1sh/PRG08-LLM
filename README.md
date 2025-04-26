# 📦 Installatie

Volg onderstaande stappen om de server correct op te zetten en te draaien.

## Stap 1: Ga naar de `server` folder

Open je terminal en navigeer naar de server folder

## Stap 2: Installeer het volgende

Voer de volgende commando's uit om alle benodigde npm-pakketten te installeren:

```
npm install @langchain/openai
npm install langchain
npm install express
npm install cors
npm install dotenv
```

## Stap 3: ENV Bestand

Maak een `.env` bestand aan in de `server` folder en voeg de volgende variabelen toe met jouw gegevens:

```
AZURE_OPENAI_API_VERSION=
AZURE_OPENAI_API_INSTANCE_NAME=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_API_DEPLOYMENT_NAME=
AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=
PORT=
```

## Stap 4: De applicatie runnen

Zorg dat je in de `server` folder zit en start vervolgens de server met:

```
node --env-file=.env --watch server.js
```

## Stap 5: Weergave

Open het bestand `index.html` in je browser en stel je vragen.

---
