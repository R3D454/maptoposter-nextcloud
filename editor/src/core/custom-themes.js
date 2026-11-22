import { artisticThemes } from './artistic-themes.js';

const STORAGE_KEY = ['maptoposter', document.getElementById('maptoposter').dataset.davFolder, 'custom-themes'].join(':');

export function loadCustomThemes() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch { return {}; }
}

export function saveCustomTheme(key, theme) {
	const all = loadCustomThemes();
	all[key] = theme;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteCustomTheme(key) {
	const all = loadCustomThemes();
	delete all[key];
	localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function newCustomThemeKey() {
	return 'custom_' + Date.now();
}

export function exportCustomThemes() {
	const all = loadCustomThemes();
	const json = JSON.stringify(all, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'map-to-poster-custom-themes.json';
	a.click();
	URL.revokeObjectURL(url);
}

export function clearCustomThemes() {
	localStorage.removeItem(STORAGE_KEY);
}

export function importCustomThemesFromJSON(jsonString) {
	const parsed = JSON.parse(jsonString);
	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		throw new Error('Invalid format');
	}
	const all = loadCustomThemes();
	let imported = 0;
	let skipped = 0;
	for (const [key, theme] of Object.entries(parsed)) {
		if (!theme || typeof theme.name !== 'string' || !theme.name.trim()) {
			skipped++;
			continue;
		}
		const clean = { ...artisticThemes.cyber_noir, name: theme.name, description: String(theme.description || '') };
		for (const field of Object.keys(clean)) {
			if (/^#[\da-f]{6}$/i.test(theme[field]) && field !== 'name' && field !== 'description') {
				clean[field] = theme[field];
			}
		}
		const finalKey = /^custom_[\w-]+$/.test(key) && !Object.hasOwn(all, key) ? key : 'custom_' + crypto.randomUUID();
		all[finalKey] = clean;
		imported++;
	}
	localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
	return { imported, skipped };
}
