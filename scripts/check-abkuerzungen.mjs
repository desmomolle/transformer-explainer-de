// Prüft sichtbare Texte auf Abkürzungen ohne Erklärung (techchamps-lab#79).
// Erlaubt ist eine Abkürzung nur in Klammern oder in „Anführungszeichen“ bzw. nach „kurz“,
// also dort, wo das Alltagswort davor steht.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const VERBOTEN = ['MLP', 'QKV', 'Q·K·V', 'LLM', 'LLMs', 'FFN', 'ONNX', 'BPE', 'GELU', 'ReLU', 'ID', 'NLP', 'RNN'];
const AUSGENOMMEN = ['src/components/article/']; // englischer Originalartikel, wird nicht angezeigt

function dateien(dir) {
	return readdirSync(dir).flatMap((n) => {
		const p = join(dir, n);
		return statSync(p).isDirectory() ? dateien(p) : [p];
	});
}

export function sichtbareTexte(pfad, quelle) {
	const texte = [];
	if (pfad.endsWith('.svelte')) {
		const skript = (quelle.match(/<script[\s\S]*?<\/script>/g) || []).join('\n');
		for (const m of skript.matchAll(/tooltip\.set\((['"`])([\s\S]*?)\1/g)) texte.push(m[2]);
		const markup = quelle
			.replace(/<script[\s\S]*?<\/script>/g, '')
			.replace(/<style[\s\S]*?<\/style>/g, '')
			.replace(/<\/?[A-Za-z][\w.:-]*/g, ' ') // Tag-Namen wie <QKV>
			.replace(/\b(class|className|id|data-[\w-]+|bind:[\w]+|on:[\w]+)=("[^"]*"|\{[^}]*\})/g, ' ')
			.replace(/\{[A-Za-z_$][\w.$]*\}/g, ' '); // {variable}
		texte.push(markup);
	} else {
		for (const m of quelle.matchAll(/\b(title|content):\s*(['`])([\s\S]*?)\2/g)) texte.push(m[3]);
	}
	return texte;
}

export function fundstellen(text) {
	const ohneErlaubt = text
		.replace(/\([^()]*\)/g, ' ')
		.replace(/„[^“]*“/g, ' ')
		.replace(/\bkurz\s+\S+/g, ' ');
	return VERBOTEN.filter((a) => new RegExp(`(^|[^\\wÄÖÜäöüß-])${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\wÄÖÜäöüß])`).test(ohneErlaubt));
}

const ziele = dateien('src').filter(
	(p) => (p.endsWith('.svelte') || p.endsWith('textbookPages.ts')) && !AUSGENOMMEN.some((a) => p.startsWith(a))
);
let fehler = 0;
for (const p of ziele) {
	for (const t of sichtbareTexte(p, readFileSync(p, 'utf8'))) {
		const f = fundstellen(t);
		if (f.length) {
			fehler++;
			console.error(`${p}: unerklärte Abkürzung ${f.join(', ')} in „${t.trim().slice(0, 90)}…“`);
		}
	}
}
if (fehler) {
	console.error(`\n${fehler} Stelle(n). Alltagswort zuerst, Abkürzung höchstens in Klammern (techchamps-lab#79).`);
	process.exit(1);
}
console.log(`Abkürzungen ok (${ziele.length} Dateien geprüft).`);
