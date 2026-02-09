# Deployment Guide: KI-Onboarding App

Diese Anleitung erklärt, wie du die App produktiv deployest (Firebase Hosting, Vercel, Netlify, etc.).

---

## 🔐 Schritt 1: Firestore Security Rules deployen

Die App nutzt Firebase Firestore als Datenbank. **Wichtig:** Ohne Security Rules ist deine Datenbank für jeden im Internet zugänglich!

### 1.1 Firebase CLI installieren (falls noch nicht geschehen)

```bash
npm install -g firebase-tools
```

### 1.2 Login bei Firebase

```bash
firebase login
```

### 1.3 Firebase-Projekt initialisieren

```bash
firebase init
```

Wähle aus:
- **Firestore** (Setup Firestore)
- **Hosting** (falls du auf Firebase Hosting deployen willst)

Wenn nach `firestore.rules` gefragt wird, wähle die bestehende Datei.

### 1.4 Security Rules deployen

```bash
firebase deploy --only firestore:rules
```

✅ **Fertig!** Deine Firestore-Datenbank ist jetzt geschützt.

---

## 🌍 Schritt 2: Environment Variables einrichten

### 2.1 Lokale Entwicklung

Erstelle eine `.env` Datei im Root-Verzeichnis:

```bash
cp .env.example .env
```

Fülle die Werte aus:

```env
# Google Gemini API Key
GEMINI_API_KEY=dein_echter_gemini_key

# Admin Key (mindestens 20 Zeichen, zufällig)
VITE_ADMIN_KEY=dein_sicherer_admin_key_hier

# Firebase Configuration (aus Firebase Console)
VITE_FIREBASE_API_KEY=dein_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dein-projekt-id
VITE_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 2.2 Production Deployment

**Wichtig:** Die `.env` Datei wird NICHT committet (steht in `.gitignore`). Setze die Environment Variables direkt im Hosting-Dashboard:

#### Firebase Hosting

Firebase Hosting unterstützt keine Environment Variables zur Build-Zeit. Du musst die Werte **vor dem Build** setzen:

```bash
export GEMINI_API_KEY="dein_key"
export VITE_ADMIN_KEY="dein_admin_key"
export VITE_FIREBASE_API_KEY="dein_firebase_key"
# ... alle anderen VITE_* Variablen

npm run build
firebase deploy
```

**Alternative:** Nutze einen CI/CD Service (GitHub Actions, GitLab CI) und setze die Secrets dort.

#### Vercel

1. Gehe zu deinem Vercel-Projekt → Settings → Environment Variables
2. Füge alle Variablen aus `.env.example` hinzu
3. Deploy mit `vercel --prod` oder via Git-Push

#### Netlify

1. Gehe zu deinem Netlify-Projekt → Site Settings → Environment Variables
2. Füge alle Variablen aus `.env.example` hinzu
3. Deploy mit `netlify deploy --prod` oder via Git-Push

---

## 🚀 Schritt 3: Build & Deploy

### Option A: Firebase Hosting (empfohlen für Firebase-Projekte)

```bash
# 1. Build erstellen
npm run build

# 2. Deployen
firebase deploy
```

Die App ist jetzt unter `https://dein-projekt.web.app` erreichbar.

### Option B: Vercel

```bash
# 1. Vercel CLI installieren
npm install -g vercel

# 2. Projekt verlinken (beim ersten Mal)
vercel link

# 3. Production-Deploy
vercel --prod
```

### Option C: Netlify

```bash
# 1. Netlify CLI installieren
npm install -g netlify-cli

# 2. Build erstellen
npm run build

# 3. Deployen
netlify deploy --prod --dir=dist
```

### Option D: Eigener Server (Node.js, Apache, nginx)

```bash
# 1. Build erstellen
npm run build

# 2. `dist/` Ordner auf Server hochladen
# 3. Webserver konfigurieren (alle Routen auf index.html umleiten)
```

**nginx Beispiel-Konfiguration:**

```nginx
server {
    listen 80;
    server_name deine-domain.de;
    root /pfad/zu/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔑 Schritt 4: Admin Key sicher setzen

**Wichtig:** Der Admin Key sollte NICHT im Code stehen!

### 4.1 Sicheren Admin Key generieren

```bash
# macOS/Linux
openssl rand -base64 32

# Oder online: https://randomkeygen.com/
```

### 4.2 Admin Key setzen

Setze `VITE_ADMIN_KEY` in deiner `.env` (lokal) bzw. im Hosting-Dashboard (production).

### 4.3 Admin Key an Team verteilen

Teile den Admin Key **NIEMALS** öffentlich (GitHub, Slack, E-Mail im Klartext). Nutze:
- 1Password / Bitwarden (Passwort-Manager)
- Encrypted Slack-Channel
- Persönliches Gespräch

---

## 🧪 Schritt 5: Production-Test

Nach dem Deployment:

1. ✅ **Login testen** (Teilnehmer-Registrierung)
2. ✅ **Assessment durchlaufen** (alle 8 Module)
3. ✅ **Dashboard prüfen** (Score, Radar, Tool-Empfehlung)
4. ✅ **Admin-Portal testen** (3× auf Logo klicken, Admin Key eingeben)
5. ✅ **CSV-Export testen** (Admin-Panel)
6. ✅ **Firestore Rules prüfen** (nur autorisierte Nutzer können Daten lesen)

---

## 🔧 Troubleshooting

### Problem: "Firebase: Error (auth/configuration-not-found)"

**Lösung:** Firebase Environment Variables fehlen. Setze alle `VITE_FIREBASE_*` Variablen.

### Problem: "Admin Key ungültig"

**Lösung:** `VITE_ADMIN_KEY` ist nicht gesetzt. Setze die Variable im Hosting-Dashboard.

### Problem: "Firestore: Missing or insufficient permissions"

**Lösung:** Security Rules sind nicht deployed. Führe `firebase deploy --only firestore:rules` aus.

### Problem: Build-Fehler "process.env.FIREBASE_API_KEY is undefined"

**Lösung:** Environment Variables müssen VOR dem Build gesetzt werden (siehe Schritt 2.2).

---

## 📚 Weitere Ressourcen

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Bei Fragen:** Erstelle ein Issue im GitHub-Repository oder kontaktiere das 2b AHEAD Team.
