# iPhone-Setup: GitHub Codespaces + Safari

Dieses Projekt ist so vorbereitet, dass du es ohne laufenden PC in GitHub Codespaces entwickeln und auf dem iPhone testen kannst.

## Empfohlener Ablauf

### Variante A – am bequemsten: Repository einmal zu GitHub bringen, danach nur noch iPhone

Sobald das Repository auf GitHub liegt:

1. Öffne das Repository in Safari oder der GitHub-App.
2. Öffne **Code → Codespaces**.
3. Erstelle einen neuen Codespace auf `main`.
4. Der Codespace öffnet VS Code im Browser.
5. Öffne das Terminal und führe aus:

```bash
npm install
npm run dev -- --host 0.0.0.0
```

6. Vite läuft auf Port `5173`.
7. Öffne in Codespaces den Bereich **Ports**.
8. Öffne Port `5173` im Browser.
9. Teste die App in Safari auf dem iPhone.

Die Datei `.devcontainer/devcontainer.json` ist bereits so vorbereitet, dass Port `5173` weitergeleitet werden kann.

## Arbeiten unterwegs

Typischer Ablauf:

```text
iPhone
  ├─ ChatGPT / Codex → Änderungen planen oder erzeugen
  ├─ GitHub Codespace → Dateien, Terminal, Git
  └─ Safari → laufende Vite-Preview testen
```

Dein Rechner zu Hause muss dabei nicht eingeschaltet sein.

## Änderungen speichern

Im Codespace-Terminal:

```bash
git status
git add .
git commit -m "Beschreibung der Änderung"
git push
```

Damit ist der Stand im GitHub-Repository gespeichert und später auch auf deinem Rechner verfügbar.

## Später wieder am Rechner

Im lokalen Repository:

```bash
git pull
npm install
npm run dev
```

## Hinweise für iPhone

- Für die eigentliche App-Preview Safari verwenden.
- Chrome auf iOS verwendet ebenfalls WebKit; für echtes Chromium-Testing später zusätzlich Desktop-Chrome oder Android testen.
- Codespaces kann bei Inaktivität stoppen. Beim nächsten Öffnen Codespace wieder starten und gegebenenfalls `npm run dev -- --host 0.0.0.0` erneut ausführen.
- Für MapLibre/Three.js ist ein iPhone als echtes Testgerät besonders nützlich, weil WebGL-Leistung, Touch-Gesten und Speicherlimits direkt sichtbar werden.

## Nächster technischer Entwicklungsschritt

Die aktuelle Basis ist für den nächsten Ausbau vorbereitet:

1. GLB/GLTF-Loader integrieren.
2. Baum- und Felsmodelle auf wiederverwendbare Geometrien/Materialien reduzieren.
3. InstancedMesh pro Modell-/LOD-Gruppe aufbauen.
4. GeoJSON aus `public/data/` laden.
5. Terrainhöhe über `queryTerrainElevation()` übernehmen.
6. Danach räumliche Kachelung, Culling und LOD für 100.000+ Instanzen ergänzen.
