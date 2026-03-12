# UX Improvement Plan — Dashboard v3.0

## Quelle: UX-Audit + User Journey Analyse + Kundenwert-Bewertung
## Datum: 12.03.2026
## Aktueller Stand: 5/10 (UX), 4/10 (Kundenwert)

---

## Prinzip: Von "Data Dashboard" zu "Action Dashboard"

**Leitsatz:** Jedes Element auf der Seite muss eine von 3 Fragen beantworten:
1. **Wo stehe ich?** (Einordnung + Emotion)
2. **Was bedeutet das?** (Interpretation + Kontext)
3. **Was tue ich als nächstes?** (Konkrete Handlung + Link)

Wenn ein Element keine dieser Fragen beantwortet → streichen oder umbauen.

---

## Phase 1: Kritische Fixes (Impact: Hoch, Aufwand: Gering)

### 1.1 Mobile ROI Card Fix
**Problem:** ROI Detail-Boxen overflow horizontal auf Mobile (375px)
**Fix:** `flex-wrap` auf Mobile, 2x2 Grid statt horizontal Row
**Aufwand:** 10 Min, 1 Zeile CSS

### 1.2 "Umsatzsteigerung: 0 EUR" ausblenden
**Problem:** Null-Werte untergraben Vertrauen
**Fix:** Nur Werte > 0 anzeigen in der ROI Card
**Aufwand:** 5 Min, 1 Bedingung

### 1.3 Ist-Analyse CTA nach oben verschieben
**Problem:** Steht nach Quick-Wins, 70% der User sehen es nicht
**Fix:** Direkt nach den Score Cards (vor ROI Card) als Banner
**Aufwand:** 15 Min, Block verschieben

### 1.4 "V 2.9 • Modulare Architektur" aus Header entfernen
**Problem:** Entwickler-Detail verwirrt Kunden
**Fix:** Entfernen oder nur in Admin-Modus zeigen
**Aufwand:** 5 Min

---

## Phase 2: Wert-Steigerung (Impact: Sehr Hoch, Aufwand: Mittel)

### 2.1 Score-Einordnung mit Benchmark
**Problem:** 53/100 sagt dem Kunden nichts
**Lösung:** Unter jedem Score eine Einordnung:
- "Du bist auf Stufe 6 von 10 — besser als der Durchschnitt deiner Branche"
- Oder: Farbcodierung (rot < 30, orange 30-50, gelb 50-70, grün > 70)
- Oder: "Das entspricht dem Level eines etablierten Integrators"
**Aufwand:** 30 Min (Texte bereits in MATURITY_LEVELS vorhanden)

### 2.2 Quick-Wins mit konkreten CTAs
**Problem:** "Identifiziere die 3 zeitintensivsten Prozesse..." — und dann?
**Lösung:** Jeder Quick-Win bekommt einen konkreten CTA-Link:
- "Session buchen" → Link zu Calendly/Buchung
- "Blueprint ansehen" → Link zum passenden Blueprint
- "Tool testen" → Link zum empfohlenen Tool
- Fallback: "In der nächsten Session besprechen" → Session-Reminder

**Aufwand:** 1-2h (CTA-Mapping pro Quick-Win Typ)
**Hinweis:** Kann erstmal mit generischem "In Session besprechen" starten

### 2.3 Empfehlung von Vertriebssprache zu Kundensprache
**Problem:** "Anschlussprodukt+" ist internes Vokabular
**Lösung:** Kundennutzen kommunizieren:
- Statt "Anschlussprodukt+": "Dein nächster Schritt: Wöchentliche 1:1 KI-Strategie"
- Statt "Anschlussprodukt": "Dein nächster Schritt: Show & Build Sessions (Di)"
- Beschreibung: Nicht "Fortgeschrittene Integration" sondern "In 4 Wochen baust du deinen ersten KI-Workflow, der dir 5h/Woche spart"
**Aufwand:** 30 Min (Texte in constants ändern)

### 2.4 ROI Card mit Kontext-Tooltip
**Problem:** 160.600 EUR wirkt unglaubwürdig ohne Erklärung
**Lösung:** Info-Icon mit Tooltip/Expandable:
- "Basierend auf deinem Stundensatz (X EUR), deiner KI-Nutzung und Branche"
- "Berechnet nach dem Corporate Economic Calculator (CEC) Modell"
- Link: "Berechnung verstehen" → öffnet CEC Detail-Section
**Aufwand:** 30 Min

---

## Phase 3: Struktur-Optimierung (Impact: Hoch, Aufwand: Mittel-Hoch)

### 3.1 Neue Seitenstruktur (Above the Fold → Action)

```
ABOVE THE FOLD:
┌─────────────────────────────────────────────┐
│ Header: "Hallo Max, hier ist dein Status."  │
│ (kein "Neues Assessment" Button hier)       │
├──────────────────┬──────────────────────────┤
│  KI: 53/100      │  Zukunft: 44/100         │
│  "Integrator"    │  "Zukunftsstratege"       │
│  ■■■■■■□□□□      │  ■■■■■□□□□□              │
│  [Details ▾]     │  [Details ▾]              │
├──────────────────┴──────────────────────────┤
│  💰 Dein KI-Effekt: 160.600 €/Jahr          │
│     Zeiteinsparung 145k · Kosten 15k        │
├─────────────────────────────────────────────┤
│  ⚡ DEIN NÄCHSTER SCHRITT:                   │
│  [Ist-Analyse starten (10 Min)] ODER        │
│  [Nächste Session buchen]                    │
└─────────────────────────────────────────────┘

SCROLL 1: "Was das für dich bedeutet"
┌─────────────────────────────────────────────┐
│  Deine Stärken → Deine Potenziale           │
│  (mit Interpretation, nicht nur Zahlen)      │
├─────────────────────────────────────────────┤
│  Top-3 Quick-Wins (mit CTAs)                │
│  [1] ... → [Session buchen]                 │
│  [2] ... → [Blueprint öffnen]               │
│  [3] ... → [In Session besprechen]          │
└─────────────────────────────────────────────┘

SCROLL 2: "Dein Weg nach vorne"
┌─────────────────────────────────────────────┐
│  Level-Up Checkliste (OFFEN, nicht collapsed)│
│  ☑ Aufgabe 1 (erledigt)                    │
│  ☐ Aufgabe 2 (offen)                       │
│  ☐ Aufgabe 3 (offen)                       │
├─────────────────────────────────────────────┤
│  Profil (nach Ist-Analyse)                  │
└─────────────────────────────────────────────┘

SCROLL 3: "Details" (collapsed)
┌─────────────────────────────────────────────┐
│  [▸] Radar-Übersicht                        │
│  [▸] Wirtschaftlicher KI-Effekt             │
│  [▸] Alle Assessment-Daten                  │
│  [▸] Neues Assessment starten               │
└─────────────────────────────────────────────┘
```

**Kernänderungen:**
1. "Nächster Schritt" CTA prominent above the fold
2. Level-Up Checkliste OFFEN (nicht collapsed)
3. "Neues Assessment" nach unten in Details
4. Empfehlung wird zum "Nächsten Schritt" umgebaut

**Aufwand:** 2-3h (Reorder + Texte)

### 3.2 Level-Up als permanenter Fortschritts-Tracker
**Problem:** Checklist-Items sind nur session-basiert (useState), gehen beim Reload verloren
**Lösung:** Checked-State in Firestore speichern
- Collection: `user_progress/{userId}`
- Felder: `checkedItems: Record<string, boolean>`
- Sync bei jedem Toggle
**Aufwand:** 1h (dbService + useEffect)

### 3.3 "Neues Assessment" entprominentisieren
**Problem:** Steht als Button im Header, suggeriert Haupt-Aktion
**Lösung:** In den Detail-Bereich verschieben als letzte Collapsible Section:
"Assessment wiederholen — Starte ein neues Assessment um deinen Fortschritt zu messen"
**Aufwand:** 15 Min

---

## Phase 4: Polish (Impact: Mittel, Aufwand: Gering)

### 4.1 Font-Size Konsolidierung
**Problem:** 13 verschiedene Font-Sizes
**Lösung:** Auf 7 reduzieren:
- `text-xs` (12px) → Body-Text
- `text-sm` (14px) → Card-Descriptions
- `text-base` (16px) → Card-Titles
- `text-lg` (18px) → Section-Headers
- `text-xl` (20px) → nicht verwendet
- `text-3xl` (30px) → Score-Zahlen
- `text-5xl` (48px) → Hero-Score

Custom sizes (`text-[7px]` bis `text-[11px]`) durch Standardgrößen ersetzen.

### 4.2 font-black sparmsamer einsetzen
**Problem:** Alles ist weight 900, nichts sticht hervor
**Lösung:**
- `font-black` (900) → nur Scores, Zahlen, Headlines
- `font-bold` (700) → Labels, Badges, wichtige Infos
- `font-semibold` (600) → Body Text
- `font-medium` (500) → sekundäre Infos

### 4.3 Skeleton Loading
**Problem:** Dashboard springt von null zu voller Ansicht
**Lösung:** 2-3 graue Skeleton-Blocks während Daten laden
**Aufwand:** 30 Min

---

## Implementierungsreihenfolge (nach ROI sortiert)

| Prio | Task | Impact | Aufwand | Phase |
|------|------|--------|---------|-------|
| 1 | Mobile ROI Card Fix | Kritisch | 10 Min | 1.1 |
| 2 | 0-Werte ausblenden | Hoch | 5 Min | 1.2 |
| 3 | Ist-Analyse CTA hochziehen | Hoch | 15 Min | 1.3 |
| 4 | Score-Einordnung | Sehr Hoch | 30 Min | 2.1 |
| 5 | Empfehlung → Kundensprache | Sehr Hoch | 30 Min | 2.3 |
| 6 | ROI Kontext-Tooltip | Hoch | 30 Min | 2.4 |
| 7 | Neue Seitenstruktur | Sehr Hoch | 2-3h | 3.1 |
| 8 | Quick-Win CTAs | Hoch | 1-2h | 2.2 |
| 9 | Checklist in Firestore | Mittel | 1h | 3.2 |
| 10 | Assessment Button runter | Mittel | 15 Min | 3.3 |
| 11 | Font Konsolidierung | Niedrig | 1h | 4.1 |
| 12 | Skeleton Loading | Niedrig | 30 Min | 4.3 |
| 13 | V2.9 Label entfernen | Niedrig | 5 Min | 1.4 |

**Geschätzter Gesamtaufwand:** ~8-10h
**Erwarteter UX-Score danach:** 7.5-8/10
**Erwarteter Kundenwert-Score danach:** 7/10

---

## Metriken zur Erfolgsmessung

1. **Ist-Analyse Completion Rate:** Aktuell unbekannt → Ziel: > 60%
2. **Session Buchungsrate nach Dashboard:** Aktuell unbekannt → Ziel: > 30%
3. **Scroll Depth:** Aktuell vermutlich < 50% → Ziel: > 70%
4. **Return Rate:** Wie oft kommt der User zurück? → Ziel: 1x/Woche (wegen Checklist)
5. **Quick-Win CTA Klickrate:** → Ziel: > 40%
