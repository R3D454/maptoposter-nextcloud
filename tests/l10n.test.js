import assert from 'node:assert/strict';
import test from 'node:test';
import { translate } from '../editor/src/l10n.js';

test('editor messages follow the Nextcloud language and fall back to English', () => {
	let language = 'de_DE';
	const document = { getElementById: () => ({ dataset: { get language() { return language; } } }) };
	const message = 'Saved to Poster/{name}';
	const values = { name: 'Köln.png' };
	globalThis.document = document;
	try {
		assert.equal(translate(message, values), 'Gespeichert in Poster/Köln.png');
		for (const [locale, expected] of Object.entries({
			es: 'Guardado en',
			fr: 'Enregistré dans',
			it: 'Salvato in',
			nl: 'Opgeslagen in',
			pl: 'Zapisano w',
			pt_BR: 'Salvo em',
			'pt-PT': 'Guardado em',
			en: 'Saved to',
			sv: 'Saved to',
		})) {
			language = locale;
			assert.equal(translate(message, values), `${expected} Poster/Köln.png`);
		}
	} finally {
		delete globalThis.document;
	}
});
