// Kopiert die onnxruntime-web-Laufzeit (WASM + Loader) nach static/ort/, damit der Browser sie
// von der eigenen Adresse lädt statt von jsdelivr (techchamps-lab#75). Läuft vor jedem Build.
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
const quelle = 'node_modules/onnxruntime-web/dist';
const ziel = 'static/ort';
mkdirSync(ziel, { recursive: true });
const dateien = readdirSync(quelle).filter((f) => /^ort-wasm.*\.(wasm|mjs)$/.test(f));
if (!dateien.length) throw new Error('keine ort-wasm-Dateien gefunden');
for (const f of dateien) cpSync(`${quelle}/${f}`, `${ziel}/${f}`);
console.log(`ort: ${dateien.length} Dateien nach ${ziel}`);
