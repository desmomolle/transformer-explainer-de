import { get } from 'svelte/store';
import {
	expandedBlock,
	weightPopover,
	isBoundingBoxActive,
	textbookCurrentPageId,
	isExpandOrCollapseRunning,
	isFetchingModel,
	userId
} from '~/store';
import {
	highlightElements,
	removeHighlightFromElements,
	applyTransformerBoundingHeight,
	resetElementsHeight,
	highlightAttentionPath,
	removeAttentionPathHighlight,
	removeFingerFromElements
} from '~/utils/textbook';
import { drawResidualLine } from './animation';

export interface TextbookPage {
	id: string;
	title: string;
	content?: string;
	component?: any;
	timeoutId?: number;
	on: () => void;
	out: () => void;
	complete?: () => void;
	/** bisheriger Fachtext, auf Stationen unter „Tiefer einsteigen“ (techchamps-lab#80) */
	fach?: string;
	/** ids der Vertiefungsseiten; diese stehen nicht in der Tour, nur hier verlinkt */
	vertiefung?: string[];
}

const { drawLine, removeLine } = drawResidualLine();

export const textPages: TextbookPage[] = [
	{
		id: 'what-is-transformer',
		title: 'Was passiert hier?',
		content: `<p>Ein Sprachmodell wie ChatGPT macht im Kern nur eines: Es rät das <strong>nächste Wort</strong>. Dann hängt es das Wort an und rät wieder. So entsteht Wort für Wort ein ganzer Text.</p><p>Hier schaust Du einem echten, kleinen Sprachmodell dabei zu: GPT-2 aus dem Jahr 2019. Seine Bauweise heißt <strong>Transformer</strong>. Sie steckt auch in den großen Modellen von heute.</p>`,
		fach: `<p>Der <strong>Transformer</strong> ist die Kernarchitektur moderner KI und steckt hinter Modellen wie ChatGPT und Gemini. Seit seiner Vorstellung 2017 hat er die Verarbeitung von Information in der KI grundlegend verändert. Dieselbe Architektur dient dem Training auf riesigen Datensätzen und der Inferenz, also dem Erzeugen von Ausgaben. Hier verwenden wir das Sprachmodell GPT-2 (small) von 2019. „GPT“ steht für „Generative Pre-trained Transformer“, also ein vortrainierter Transformer, der Text erzeugt. Es ist einfacher als neuere Modelle, aber ideal, um die Grundlagen zu verstehen.</p>
`,
		vertiefung: ['transformer-architecture'],
		on: () => {},
		out: () => {}
	},
	{
		id: 'how-transformers-work',
		title: 'Probier es aus',
		content: `<p>Bei jedem Schritt stellt sich das Modell dieselbe Frage:</p><blockquote class="question">„Welches Wort passt jetzt am wahrscheinlichsten?“</blockquote><p>Wähle oben ein <strong>Beispiel</strong> oder schreib einen eigenen Satzanfang und klicke auf <strong>Generieren</strong>. Lädt das Modell noch, nimm ein anderes Beispiel.</p>`,
		on: () => {
			highlightElements(['.input-form']);
			if (get(isFetchingModel)) {
				highlightElements(['.input-form .select-button']);
			} else {
				highlightElements(['.input-form .generate-button']);
			}
		},
		out: () => {
			removeHighlightFromElements([
				'.input-form',
				'.input-form .select-button',
				'.input-form .generate-button'
			]);
		},
		complete: () => {
			removeFingerFromElements(['.input-form .select-button', '.input-form .generate-button']);
			if (get(textbookCurrentPageId) === 'how-transformers-work') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'how-transformers-work'
				});
			}
		}
	},
	{
		id: 'transformer-architecture',
		title: 'Transformer-Architektur',
		content:
			'<p>Ein Transformer besteht aus drei Hauptteilen:</p><div class="numbered-list"><div class="numbered-item"><span class="number-circle">1</span><div class="item-content"><strong>Embeddings</strong> wandeln Text in Zahlen um.</div></div><div class="numbered-item"><span class="number-circle">2</span><div class="item-content"><strong>Transformer-Blöcke</strong> mischen Information per Self-Attention und verfeinern sie in einer <strong>Verfeinerungs-Schicht</strong>.</div></div><div class="numbered-item"><span class="number-circle">3</span><div class="item-content"><strong>Wahrscheinlichkeiten</strong> bestimmen, wie wahrscheinlich jedes nächste Token ist.</div></div></div>',
		on: () => {
			const selectors = [
				'.step.embedding',
				'.step.softmax',
				'.transformer-bounding',
				'.transformer-bounding-title'
			];
			highlightElements(selectors);
			applyTransformerBoundingHeight(['.softmax-bounding', '.embedding-bounding']);
		},
		out: () => {
			const selectors = [
				'.step.embedding',
				'.step.softmax',
				'.transformer-bounding',
				'.transformer-bounding-title'
			];
			removeHighlightFromElements(selectors);
			resetElementsHeight(['.softmax-bounding', '.embedding-bounding']);
		}
	},
	{
		id: 'embedding',
		title: 'Aus Text werden Zahlen',
		content: `<p>Ein Computer rechnet nur mit Zahlen. Deshalb zerlegt das Modell Deinen Text zuerst in <strong>Tokens</strong>: Wörter oder Wortstücke. Ein langes Wort wie „unglaublich“ kann so in mehrere Stücke zerfallen.</p><p>Jedes Token bekommt eine lange Zahlenreihe, eine Art Fingerabdruck. Wörter mit ähnlicher Bedeutung haben ähnliche Fingerabdrücke. Dazu kommt die Stelle im Satz, denn „Hund beißt Mann“ ist etwas anderes als „Mann beißt Hund“.</p>`,
		fach: `<p>Bevor ein Transformer Text verarbeiten kann, zerlegt er ihn in kleine Einheiten und stellt jede als Liste von Zahlen (Vektor) dar. Dieser Vorgang heißt <strong>Embedding</strong>; der Begriff steht sowohl für den Vorgang als auch für den entstehenden Vektor.</p><p>In diesem Tool erscheint jeder Vektor als Rechteck. Fährst Du mit der Maus darüber, siehst Du seine Größe.</p>`,
		vertiefung: ['token-embedding', 'positional-encoding'],
		on: () => {
			highlightElements(['.step.embedding .title']);
		},
		out: () => {
			removeHighlightFromElements(['.step.embedding .title']);
		},
		complete: () => {
			removeFingerFromElements(['.step.embedding .title']);
			if (get(textbookCurrentPageId) === 'embedding') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'embedding'
				});
			}
		}
	},
	{
		id: 'token-embedding',
		title: 'Token-Embedding',
		content: `<p>Die <strong>Tokenisierung</strong> teilt den Eingabetext in Tokens auf, also kleine Einheiten wie Wörter oder Wortteile. GPT-2 (small) hat ein Vokabular von 50.257 Tokens, jedes mit einer eindeutigen Nummer.</p><p>Beim <strong>Token-Embedding</strong> wird jedem Token ein Vektor aus 768 Zahlen aus einer großen Nachschlagetabelle zugeordnet. Diese Vektoren werden im Training gelernt, damit sie die Bedeutung des jeweiligen Tokens möglichst gut abbilden.</p>`,
		on: function () {
			const selectors = [
				'.token-column .column.token-string',
				'.token-column .column.token-embedding'
			];
			if (get(expandedBlock).id !== 'embedding') {
				expandedBlock.set({ id: 'embedding' });
				this.timeoutId = setTimeout(() => {
					highlightElements(selectors);
				}, 500);
			} else {
				highlightElements(selectors);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			const selectors = [
				'.token-column .column.token-string',
				'.token-column .column.token-embedding'
			];
			removeHighlightFromElements(selectors);
			if (get(textbookCurrentPageId) !== 'positional-encoding') expandedBlock.set({ id: null });
		}
	},
	{
		id: 'positional-encoding',
		title: 'Positional Encoding (Positionskodierung)',
		content: `<p>In Sprache kommt es auf die Wortreihenfolge an. Das <strong>Positional Encoding</strong> gibt jedem Token Information über seine Stelle in der Sequenz.</p><p>GPT-2 addiert dazu ein gelerntes Positions-Embedding auf das Token-Embedding. Neuere Modelle nutzen andere Verfahren, etwa RoPE, das die Position durch Rotation bestimmter Vektoren kodiert. Alle haben das Ziel, dem Modell die Reihenfolge im Text verständlich zu machen.</p>`,
		on: function () {
			const selectors = [
				'.token-column .column.position-embedding',
				'.token-column .column.symbol'
			];
			if (get(expandedBlock).id !== 'embedding') {
				expandedBlock.set({ id: 'embedding' });
				this.timeoutId = setTimeout(() => {
					highlightElements(selectors);
				}, 500);
			} else {
				highlightElements(selectors);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			const selectors = [
				'.token-column .column.position-embedding',
				'.token-column .column.symbol'
			];
			removeHighlightFromElements(selectors);
			if (get(textbookCurrentPageId) !== 'token-embedding') expandedBlock.set({ id: null });
		}
	},
	{
		id: 'blocks',
		title: 'Zwölf Runden Nachdenken',
		content: `<p>Jetzt arbeitet das Modell. Es schickt die Zahlen durch <strong>12 gleich gebaute Runden</strong>. Jede Runde hat zwei Schritte:</p><ul><li><strong>Aufmerksamkeit</strong>: Jedes Wort schaut auf die Wörter davor und holt sich, was es von dort braucht.</li><li><strong>Verfeinerung</strong>: Jedes Wort verarbeitet für sich, was es gerade erfahren hat.</li></ul><p>Nach jeder Runde „versteht“ jedes Wort ein Stück mehr vom ganzen Satz.</p>`,
		fach: `<p>Ein <strong>Transformer-Block</strong> ist die zentrale Verarbeitungseinheit des Modells. Er hat zwei Teile:</p><ul><li><strong>Multi-Head Self-Attention</strong> – lässt Tokens Information austauschen</li><li><strong>Verfeinerung</strong> – ein kleines Rechennetz, das die Details jedes Tokens schärft</li></ul><p>Modelle stapeln viele solcher Blöcke, sodass die Token-Repräsentationen auf dem Weg durch das Modell immer reichhaltiger werden. GPT-2 (small) hat 12 davon.</p>`,
		vertiefung: ['mlp', 'residual', 'layer-normalization', 'dropout'],
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements([
						'.transformer-bounding',
						'.step.transformer-blocks .guide',
						'.attention > .title',
						'.mlp > .title'
					]);
					highlightElements(['.transformer-bounding-title'], 'textbook-button-highlight');
					isBoundingBoxActive.set(true);
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements([
				'.transformer-bounding',
				'.step.transformer-blocks .guide',
				'.attention > .title',
				'.mlp > .title'
			]);
			removeHighlightFromElements(['.transformer-bounding-title'], 'textbook-button-highlight');
			isBoundingBoxActive.set(false);
		},
		complete: () => {
			removeFingerFromElements(['.transformer-bounding-title']);
			if (get(textbookCurrentPageId) === 'blocks') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'blocks'
				});
			}
		}
	},
	{
		id: 'self-attention',
		title: 'Aufmerksamkeit',
		content: `<p>Jedes Wort fragt: „Wer hier im Satz ist für mich wichtig?“ Im Satz „Das Auto springt nicht an, weil <strong>es</strong> kaputt ist“ schaut „es“ besonders stark auf „Auto“. So weiß das Modell, worum es geht.</p><p>Die Linien in der Grafik zeigen, wer auf wen schaut: je kräftiger, desto mehr Aufmerksamkeit. Das Modell macht das mehrmals gleichzeitig, jedes Mal mit einem anderen Blick. Ein Blick achtet zum Beispiel eher auf Grammatik, ein anderer eher auf Bedeutung.</p>`,
		fach: '<p>Mit <strong>Self-Attention</strong> entscheidet das Modell, welche Teile der Eingabe für das jeweilige Token am wichtigsten sind. So erfasst es Bedeutung und Beziehungen, auch zwischen weit entfernten Wörtern.</p><p>In der <strong>Multi-Head</strong>-Form laufen mehrere Attention-Vorgänge parallel, die sich jeweils auf andere Muster im Text konzentrieren.</p>',
		vertiefung: ['qkv', 'multi-head', 'masked-self-attention', 'output-concatenation'],
		on: () => {
			highlightElements(['.step.attention']);
		},
		out: () => {
			removeHighlightFromElements(['.step.attention']);
		}
	},
	{
		id: 'qkv',
		title: 'Query, Key, Value',
		content: `
	<p>Für die Self-Attention wird das Embedding jedes Tokens in
  <span class="highlight">drei neue Embeddings</span> umgewandelt:
  <span class="blue">Query</span>,
  <span class="red">Key</span> und
  <span class="green">Value</span>
  (in der Grafik kurz <span class="blue">Q</span>, <span class="red">K</span>, <span class="green">V</span>). Sinngemäß: „Wonach suche ich?“, „Was biete ich an?“ und „Was gebe ich weiter?“.
  Dazu werden auf jedes Token-Embedding unterschiedliche Gewichte und Biases angewendet. Diese Parameter (Gewichte und Biases) werden im Training optimiert.</p>

<p>Anschließend werden die <span class="blue">Queries</span> mit den <span class="red">Keys</span> verglichen, um die Relevanz zu messen. Mit dieser Relevanz werden die <span class="green">Values</span> gewichtet.</p>
`,
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements(['g.path-group.qkv', '.step.qkv .qkv-column']);
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements(['g.path-group.qkv', '.step.qkv .qkv-column']);
			weightPopover.set(null);
		},
		complete: () => {
			removeFingerFromElements(['.step.qkv .qkv-column']);
			if (get(textbookCurrentPageId) === 'qkv') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'qkv'
				});
			}
		}
	},

	{
		id: 'multi-head',
		title: 'Multi-Head',
		content:
			'<p>Nachdem die <span class="blue">Q</span>-, <span class="red">K</span>- und <span class="green">V</span>-Embeddings erzeugt sind, teilt das Modell sie auf mehrere <strong>Heads</strong> auf (12 bei GPT-2 small). Jeder Head arbeitet mit seinem eigenen, kleineren Satz aus <span class="blue">Q</span>/<span class="red">K</span>/<span class="green">V</span> und konzentriert sich auf andere Muster im Text, etwa Grammatik, Bedeutung oder weitreichende Bezüge.</p><p>Mehrere Heads lassen das Modell viele Arten von Beziehungen parallel lernen. Das macht sein Verständnis reichhaltiger.</p>',
		on: () => {
			highlightAttentionPath();
			highlightElements(['.multi-head .head-title']);
		},
		out: () => {
			removeAttentionPathHighlight();
			removeHighlightFromElements(['.multi-head .head-title']);
		},
		complete: () => {
			removeFingerFromElements(['.multi-head .head-title']);
			if (get(textbookCurrentPageId) === 'multi-head') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'multi-head'
				});
			}
		}
	},
	{
		id: 'masked-self-attention',
		title: 'Masked Self-Attention',
		content: `<p>In jedem Head legt das Modell fest, wie stark sich jedes Token auf andere konzentriert:</p><ul><li><strong>Skalarprodukt (Dot Product)</strong> – Passende Zahlen der <span class="blue">Query</span>-/<span class="red">Key</span>-Vektoren werden multipliziert und summiert. Das ergibt die <span class="purple">Attention-Scores</span>.</li><li><strong>Maske</strong> – Verdeckt zukünftige Tokens, damit das Modell nicht vorausschauen kann.</li><li><strong>Softmax</strong> – Wandelt die Scores in Wahrscheinlichkeiten um. Jede Zeile summiert sich zu 1 und zeigt den Fokus auf frühere Tokens.</li></ul>`,
		on: () => {
			highlightAttentionPath();
			highlightElements(['.attention-matrix.attention-result']);
		},
		out: () => {
			removeAttentionPathHighlight();
			removeHighlightFromElements(['.attention-matrix.attention-result']);
			expandedBlock.set({ id: null });
		},
		complete: () => {
			removeFingerFromElements(['.attention-matrix.attention-result']);
			if (get(textbookCurrentPageId) === 'masked-self-attention') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'masked-self-attention'
				});
			}
		}
	},
	{
		id: 'output-concatenation',
		title: 'Attention-Ausgabe und Konkatenation',
		content:
			'<p>Jeder Head <span class="highlight">multipliziert seine <span class="purple">Attention-Scores</span> mit den <span class="green">Value</span>-Embeddings und erhält so seine Attention-Ausgabe</span>: eine verfeinerte Repräsentation jedes Tokens, die den Kontext berücksichtigt.</p><p>GPT-2 (small) hat 12 solcher Ausgaben, die zu einem einzigen Vektor in der ursprünglichen Größe (768 Zahlen) zusammengefügt (konkateniert) werden.</p>',
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements(['path.to-attention-out.value-to-out', '.attention .column.out']);
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements(['path.to-attention-out.value-to-out', '.attention .column.out']);
			weightPopover.set(null);
		},
		complete: () => {
			removeFingerFromElements(['.attention .column.out']);
			if (get(textbookCurrentPageId) === 'output-concatenation') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'output-concatenation'
				});
			}
		}
	},
	{
		id: 'mlp',
		title: 'Verfeinerung (mehrschichtiges Netz)',
		content:
			'<p>Die Attention-Ausgabe läuft durch die <strong>Verfeinerung</strong>: ein kleines Rechennetz aus mehreren Schichten, das die Token-Repräsentationen schärft. Fachleute nennen es „Multi-Layer Perceptron“, kurz MLP. Eine lineare Schicht verändert Werte und Größe des Embeddings mit gelernten Gewichten und Bias, danach entscheidet eine nichtlineare Aktivierung, wie viel von jedem Wert durchgelassen wird.</p><p>Es gibt viele Aktivierungsfunktionen. GPT-2 nutzt eine weiche Schwelle (Fachname „GELU“): Kleine Werte passieren teilweise, große vollständig. So lassen sich sowohl feine als auch starke Muster erfassen.</p>',
		on: () => {
			highlightElements(['.step.mlp', '.operation-col.activation']);
		},
		out: () => {
			removeHighlightFromElements(['.step.mlp', '.operation-col.activation']);
		}
	},

	{
		id: 'output-logit',
		title: 'Ausgabe-Logits',
		content: `<p>Nach allen Transformer-Blöcken wird das Ausgabe-Embedding des letzten Tokens, angereichert mit dem Kontext aller vorherigen Tokens, in einer letzten Schicht mit gelernten Gewichten multipliziert.</p><p>Das ergibt die <strong>Logits</strong>: 50.257 Zahlen, eine für jedes Token im Vokabular von GPT-2. Sie zeigen an, wie wahrscheinlich es ist, dass das jeweilige Token als Nächstes folgt.</p>`,
		on: () => {
			highlightElements(['g.path-group.softmax', '.column.final']);
		},
		out: () => {
			removeHighlightFromElements(['g.path-group.softmax', '.column.final']);
			weightPopover.set(null);
		},
		complete: () => {
			removeFingerFromElements(['.column.final']);
			if (get(textbookCurrentPageId) === 'output-logit') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'output-logit'
				});
			}
		}
	},
	{
		id: 'output-probabilities',
		title: 'Die Rangliste',
		content: `<p>Nach den zwölf Runden gibt das Modell jedem möglichen nächsten Wort eine <strong>Wahrscheinlichkeit</strong>. Es kennt rund 50.000 Tokens, alle stehen auf dieser Liste.</p><p>Rechts siehst Du die Spitze der Rangliste. Das Modell nimmt aber nicht einfach Platz 1. Wie es auswählt, zeigen die nächsten beiden Stationen.</p>`,
		fach: '<p>Logits sind nur Rohwerte. Damit sie sich besser deuten lassen, wandeln wir sie in <strong>Wahrscheinlichkeiten</strong> zwischen 0 und 1 um, die sich alle zu 1 addieren. So sehen wir, wie wahrscheinlich jedes Token das nächste Wort ist.</p><p>Statt immer das Token mit der höchsten Wahrscheinlichkeit zu nehmen, lassen sich verschiedene Auswahlstrategien einsetzen, um im erzeugten Text Sicherheit und Kreativität auszubalancieren.</p>',
		vertiefung: ['output-logit'],
		on: () => {
			highlightElements(['.step.softmax .title']);
		},
		out: () => {
			removeHighlightFromElements(['.step.softmax .title']);
		},
		complete: () => {
			removeFingerFromElements(['.step.softmax .title']);
			if (get(textbookCurrentPageId) === 'output-probabilities') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'output-probabilities'
				});
			}
		}
	},
	{
		id: 'temperature',
		title: 'Temperatur: vorsichtig oder mutig',
		content: `<p>Die <strong>Temperatur</strong> ist ein Regler für Mut. Niedrig (etwa 0,2): Die Favoriten werden noch stärker, das Modell bleibt vorsichtig und vorhersehbar. Hoch (über 1,0): Die Abstände schrumpfen, auch Außenseiter bekommen eine Chance. Der Text wird kreativer, manchmal auch wirrer.</p><p>Probier den Regler aus und schau, wie sich die Balken verändern.</p>`,
		fach: '<p>Die <strong>Temperatur</strong> skaliert die Logits, bevor sie in Wahrscheinlichkeiten umgerechnet werden. Eine <strong>niedrige Temperatur</strong> (z. B. 0,2) macht große Logits noch größer und kleine noch kleiner. Das bevorzugt die Tokens mit den höchsten Werten und führt zu <strong>vorhersehbareren Entscheidungen</strong>. Eine <strong>hohe Temperatur</strong> (z. B. 1,0 oder mehr) glättet die Unterschiede. Weniger wahrscheinliche Tokens werden konkurrenzfähiger, die Ausgabe wird <strong>kreativer</strong>.</p>',
		on: function () {
			if (get(expandedBlock).id !== 'softmax') {
				expandedBlock.set({ id: 'softmax' });
				this.timeoutId = setTimeout(() => {
					highlightElements([
						'.formula-step.scaled',
						'.title-box.scaled',
						'.content-box.scaled',
						'.temperature-input'
					]);
				}, 500);
			} else {
				highlightElements([
					'.formula-step.scaled',
					'.title-box.scaled',
					'.content-box.scaled',
					'.temperature-input'
				]);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements([
				'.formula-step.scaled',
				'.title-box.scaled',
				'.temperature-input',
				'.content-box.scaled'
			]);
			if (!['temperature', 'sampling'].includes(get(textbookCurrentPageId)))
				expandedBlock.set({ id: null });
		},
		complete: () => {
			removeFingerFromElements(['.temperature-input']);
			if (get(textbookCurrentPageId) === 'temperature') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'temperature'
				});
			}
		}
	},
	{
		id: 'sampling',
		title: 'Auswahl: wer kommt in die Lostrommel',
		content: `<p>Zum Schluss zieht das Modell das nächste Wort wie aus einer Lostrommel. Favoriten haben mehr Lose. Vorher legt es fest, wer überhaupt in die Trommel darf:</p><ul><li><strong>Top-k</strong> („die besten k“): nur die k Wörter mit den höchsten Chancen, etwa die besten 5.</li><li><strong>Top-p</strong> („die besten bis p“): so viele Favoriten, bis sie zusammen auf mindestens p kommen, etwa 50 %.</li></ul><p>Das gezogene Wort wird angehängt, und alles beginnt von vorn.</p>`,
		fach: '<p>Zum Schluss brauchen wir eine Strategie, um das nächste Token auszuwählen. Es gibt viele; hier die gängigen: Die einfachste nimmt immer das wahrscheinlichste Token. <strong>Top-k</strong> („die besten k“) behält nur die k wahrscheinlichsten Tokens, zum Beispiel die besten 5. <strong>Top-p</strong> („die besten bis p Prozent“) behält so lange die wahrscheinlichsten Tokens, bis zusammen mindestens p erreicht ist, zum Beispiel 50 %. Unwahrscheinliche Tokens werden so früh aussortiert.</p><p>Danach wandelt Softmax die verbleibenden Logits in Wahrscheinlichkeiten um, und aus der zugelassenen Menge wird zufällig ein Token gezogen.</p>',
		on: function () {
			if (get(expandedBlock).id !== 'softmax') {
				expandedBlock.set({ id: 'softmax' });
				this.timeoutId = setTimeout(() => {
					highlightElements([
						'.formula-step.sampling',
						'.title-box.sampling',
						'.sampling-input',
						'.content-box.sampling'
					]);
				}, 500);
			} else {
				highlightElements([
					'.formula-step.sampling',
					'.title-box.sampling',
					'.sampling-input',
					'.content-box.sampling'
				]);
			}
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements([
				'.formula-step.sampling',
				'.title-box.sampling',
				'.sampling-input',
				'.content-box.sampling'
			]);
			if (!['temperature', 'sampling'].includes(get(textbookCurrentPageId)))
				expandedBlock.set({ id: null });
		},
		complete: () => {
			removeFingerFromElements(['.sampling-input']);
			if (get(textbookCurrentPageId) === 'sampling') {
				window.dataLayer?.push({
					user_id: get(userId),
					event: `textbook-complete`,
					page_id: 'sampling'
				});
			}
		}
	},
	{
		id: 'residual',
		title: 'Residual Connection',
		content: `<p>Transformer enthalten Hilfsmechanismen, die die Modellleistung verbessern. Eine <strong>Residual Connection</strong> addiert zum Beispiel die Eingabe einer Schicht auf ihre Ausgabe, damit Information über viele Blöcke hinweg nicht verloren geht. In GPT-2 wird sie pro Block zweimal eingesetzt, damit sich tiefere Stapel wirksam trainieren lassen.</p>`,
		on: function () {
			this.timeoutId = setTimeout(
				() => {
					highlightElements(['.operation-col.residual', '.residual-start']);
					drawLine();
				},
				get(isExpandOrCollapseRunning) ? 500 : 0
			);
		},
		out: function () {
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			removeHighlightFromElements(['.operation-col.residual', '.residual-start']);
			removeLine();
		}
	},
	{
		id: 'layer-normalization',
		title: 'Layer Normalization',
		content: `<p><strong>Layer Normalization</strong> stabilisiert Training und Inferenz, indem sie die Eingabezahlen so anpasst, dass Mittelwert und Varianz gleich bleiben. Das macht das Modell weniger empfindlich gegenüber seinen Startgewichten und hilft ihm, effektiver zu lernen. In GPT-2 wird sie vor der Self-Attention, vor der Verfeinerung und noch einmal vor der finalen Ausgabe angewendet.</p>`,
		on: () => {
			highlightElements(['.operation-col.ln']);
		},
		out: () => {
			removeHighlightFromElements(['.operation-col.ln']);
		}
	},
	{
		id: 'dropout',
		title: 'Dropout',
		content: `<p>Beim Training schaltet <strong>Dropout</strong> zufällig einige Verbindungen zwischen Zahlen ab, damit sich das Modell nicht an bestimmte Muster überanpasst (Overfitting). So lernt es Merkmale, die besser verallgemeinern. GPT-2 setzt Dropout ein, neuere große Sprachmodelle verzichten oft darauf, weil sie auf riesigen Datensätzen trainiert werden und Overfitting dort ein kleineres Problem ist. In der Inferenz ist Dropout abgeschaltet.</p>`,
		on: () => {
			highlightElements(['.operation-col.dropout']);
		},
		out: () => {
			removeHighlightFromElements(['.operation-col.dropout']);
		}
	}
	// {
	// 	id: 'final',
	// 	title: `Let's explore!`,
	// 	content: '',
	// 	on: () => {},
	// 	out: () => {}
	// }
];

// ---- Tour mit Stationen (techchamps-lab#80): Vertiefungsseiten bleiben für Tooltips erreichbar, zählen aber nicht zur Tour.
export function stationVon(id: string): TextbookPage | undefined {
	return textPages.find((p) => p.vertiefung?.includes(id));
}
export const tour: number[] = textPages.map((_, i) => i).filter((i) => !stationVon(textPages[i].id));
/** Position in der Tour (0-basiert); eine Vertiefungsseite zählt als ihre Station. */
export function tourPosition(index: number): number {
	const p = textPages[index];
	const station = p ? stationVon(p.id) : undefined;
	const i = station ? textPages.indexOf(station) : index;
	return Math.max(0, tour.indexOf(i));
}
