import german from '../../l10n/de.json' with { type: 'json' };
import spanish from '../../l10n/es.json' with { type: 'json' };
import french from '../../l10n/fr.json' with { type: 'json' };
import italian from '../../l10n/it.json' with { type: 'json' };
import dutch from '../../l10n/nl.json' with { type: 'json' };
import polish from '../../l10n/pl.json' with { type: 'json' };
import brazilianPortuguese from '../../l10n/pt_BR.json' with { type: 'json' };
import europeanPortuguese from '../../l10n/pt_PT.json' with { type: 'json' };

const catalogs = {
	de: german.translations,
	es: spanish.translations,
	fr: french.translations,
	it: italian.translations,
	nl: dutch.translations,
	pl: polish.translations,
	pt: europeanPortuguese.translations,
	'pt-br': brazilianPortuguese.translations,
};

export function translate(message, values = {}) {
	const language = globalThis.document?.getElementById('maptoposter')?.dataset.language ?? '';
	const locale = language.toLowerCase().replaceAll('_', '-');
	const base = locale.split('-')[0];
	const translations = Object.hasOwn(catalogs, locale) ? catalogs[locale] : (
		Object.hasOwn(catalogs, base) ? catalogs[base] : {}
	);
	const text = Object.hasOwn(translations, message) ? translations[message] : message;
	return text.replace(/\{(\w+)\}/g, (placeholder, name) =>
		Object.hasOwn(values, name) ? String(values[name]) : placeholder);
}
