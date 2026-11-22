import { translate } from "./src/l10n.js";
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './fonts.css';
import './style.css';
import './src/ui/mobile.js';
import { posterFilename, savePoster } from './src/nextcloud.js';

import { subscribe, state, getSelectedTheme } from './src/core/state.js';
import { initMap, updateMapTheme, invalidateMapSize, waitForTilesLoad, waitForArtisticIdle, updateMarkerStyles, updateRouteStyles } from './src/map/map-init.js';
import { setupControls, updatePreviewStyles } from './src/ui/form.js';
import { renderPosterPNG } from './src/core/export.js';

const initialTheme = getSelectedTheme();
try {
	initMap('map-preview', [state.lat, state.lon], state.zoom, initialTheme.tileUrl);
} catch (err) {
	console.error('Failed to initialize map:', err);
}

const syncUI = setupControls();

subscribe((currentState) => {
	if (currentState.renderMode === 'tile') {
		const theme = getSelectedTheme();
		const tileUrl = currentState.showLabels ? theme.tileUrl : theme.tileUrlNoLabels;
		updateMapTheme(tileUrl);
	}

	updatePreviewStyles(currentState);

	updateMarkerStyles(currentState);
	updateRouteStyles(currentState);

	syncUI(currentState);
});

const editor = document.getElementById('maptoposter');
const feedback = document.getElementById('poster-feedback');
const actions = editor.querySelectorAll('[data-save-poster], #export-btn, #mobile-export-btn');
let exporting = false;

function showStatus(message, result) {
	const link = feedback.querySelector('a');
	feedback.querySelector('span').textContent = message;
	link.hidden = !result;
	if (result) {
		link.href = result.href;
		link.textContent = result.label;
	}
	feedback.hidden = false;
}

async function exportPoster(save) {
	if (exporting) return;
	exporting = true;
	for (const button of actions) button.disabled = true;
	try {
		showStatus(translate("Preparing poster …"));
		const filename = posterFilename(state.cityOverride || state.city);
		if (state.renderMode === 'artistic') await waitForArtisticIdle(30000);
		else await waitForTilesLoad(30000);
		const png = await renderPosterPNG(document.getElementById('poster-container'));
		if (save) {
			showStatus(translate("Saving PNG to Nextcloud …"));
			const result = await savePoster(png, filename, editor.dataset, document.head.dataset.requesttoken);
			showStatus(translate("Saved to Poster/{name}", { name: result.name }), result);
		} else {
			const url = URL.createObjectURL(png);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			link.click();
			setTimeout(() => URL.revokeObjectURL(url), 30000);
			showStatus(translate("PNG download started."));
		}
	} catch (error) {
		console.error('MapToPoster export', error);
		showStatus(error instanceof TypeError ? translate("Export failed. Check your connection and try again.") : error.message);
	} finally {
		exporting = false;
		for (const button of actions) button.disabled = false;
	}
}

for (const button of actions) {
	button.addEventListener('click', () => exportPoster(button.hasAttribute('data-save-poster')));
}
feedback.querySelector('button').addEventListener('click', () => { feedback.hidden = true; });
new ResizeObserver(() => {
	updatePreviewStyles(state);
	invalidateMapSize();
}).observe(editor);
