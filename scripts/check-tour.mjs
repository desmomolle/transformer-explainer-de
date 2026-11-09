// Prüft die einfache Tour (techchamps-lab#80): höchstens 8 Stationen, Stationstexte ohne Fachwörter,
// jede Vertiefung existiert. Fachtexte stehen unter „Tiefer einsteigen“ (Feld fach / Vertiefungsseiten).
import { readFileSync } from 'node:fs';

const MAX_STATIONEN = 8;
const FACHWOERTER = ['Skalar', 'Vektor', 'Bias', 'Head', 'Embedding', 'Logit', 'Matrix', 'Softmax', 'Parameter', 'Layer'];

const quelle = readFileSync('src/utils/textbookPages.ts', 'utf8');
const seiten = quelle
	.split(/\n\t\{\n(?=\t\tid: ')/)
	.slice(1)
	.map((block) => {
		const feld = (name) => block.match(new RegExp(`\\t\\t${name}:\\s*(['\`])([\\s\\S]*?)\\1,\\n`))?.[2] ?? '';
		return { id: feld('id'), titel: feld('title'), text: feld('content'), rest: block };
	});
const ids = new Set(seiten.map((s) => s.id));
const vertiefungen = new Set();
const fehler = [];
for (const s of seiten) {
	const v = s.rest.match(/vertiefung: \[([^\]]*)\]/);
	for (const id of v ? [...v[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : []) {
		if (!ids.has(id)) fehler.push(`${s.id}: Vertiefung „${id}“ gibt es nicht`);
		vertiefungen.add(id);
	}
}
const stationen = seiten.filter((s) => !vertiefungen.has(s.id));
if (stationen.length > MAX_STATIONEN) fehler.push(`${stationen.length} Stationen, erlaubt sind ${MAX_STATIONEN}`);
for (const s of stationen) {
	const sichtbar = (s.titel + ' ' + s.text).replace(/<[^>]+>/g, ' ');
	for (const w of FACHWOERTER) if (sichtbar.includes(w)) fehler.push(`Station ${s.id}: Fachwort „${w}“ gehört unter „Tiefer einsteigen“`);
}
if (seiten.length < 15) fehler.push(`nur ${seiten.length} Seiten erkannt, Prüfung passt nicht mehr zur Datei`);
if (fehler.length) {
	console.error(fehler.join('\n'));
	process.exit(1);
}
console.log(`Tour ok: ${stationen.length} Stationen (${stationen.map((s) => s.titel).join(' · ')}), ${vertiefungen.size} Vertiefungen.`);
