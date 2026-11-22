const SHEET_SECTIONS = {
	'mobile-sheet-a': ['section-location', 'section-marker'],
	'mobile-sheet-b': ['section-style', 'section-composition', 'section-typography'],
	'mobile-sheet-c': ['section-mat', 'section-output'],
};

const placeholders = {};
let activeSheet = null;
let activeNavBtn = null;

function openSheet(sheetId) {
	if (sheetId === 'credits-modal') {
		document.getElementById('credits-modal').classList.add('show');
		return;
	}

	const sheet = document.getElementById(sheetId);
	if (!sheet) return;

	const contentEl = document.getElementById(sheetId + '-content');
	const sectionIds = SHEET_SECTIONS[sheetId];

	sectionIds.forEach(function (id) {
		const section = document.getElementById(id);
		if (!section || !section.parentNode) return;
		const ph = document.createElement('div');
		ph.id = id + '-ph';
		ph.style.display = 'none';
		section.parentNode.insertBefore(ph, section);
		placeholders[id] = ph;
		contentEl.appendChild(section);
	});

	sheet.classList.add('show');
	activeSheet = sheetId;
}

function closeSheet(sheetId) {
	if (!sheetId || sheetId === 'credits-modal') return;

	const sheet = document.getElementById(sheetId);
	if (!sheet) return;

	const sectionIds = SHEET_SECTIONS[sheetId];

	sectionIds.forEach(function (id) {
		const section = document.getElementById(id);
		const ph = placeholders[id] || document.getElementById(id + '-ph');
		if (!ph || !section) return;
		ph.parentNode.insertBefore(section, ph);
		ph.remove();
		delete placeholders[id];
	});

	sheet.classList.remove('show');

	if (activeNavBtn) {
		activeNavBtn.classList.remove('active');
		activeNavBtn = null;
	}
	activeSheet = null;
}

function closeActiveSheet() {
	if (activeSheet) closeSheet(activeSheet);
}

document.querySelectorAll('.mobile-nav-btn').forEach(function (btn) {
	btn.addEventListener('click', function () {
		const target = btn.getAttribute('data-target');

		if (activeSheet === target) {
			closeActiveSheet();
			btn.classList.remove('active');
			return;
		}

		closeActiveSheet();

		btn.classList.add('active');
		activeNavBtn = btn;

		openSheet(target);
	});
});

document.addEventListener('click', function (e) {
	const btn = e.target.closest('.close-sheet-btn');
	if (btn) {
		const sheetId = btn.getAttribute('data-sheet');
		closeSheet(sheetId);
		document.querySelectorAll('.mobile-nav-btn').forEach(function (nb) {
			if (nb.getAttribute('data-target') === sheetId) nb.classList.remove('active');
		});
	}
});

document.querySelectorAll('.mobile-settings-modal .sheet-backdrop').forEach(function (bd) {
	bd.addEventListener('click', function () {
		const sheet = bd.closest('.mobile-settings-modal');
		if (sheet) {
			closeSheet(sheet.id);
			document.querySelectorAll('.mobile-nav-btn').forEach(function (nb) {
				if (nb.getAttribute('data-target') === sheet.id) nb.classList.remove('active');
			});
		}
	});
});

document.getElementById('close-credits')?.addEventListener('click', function () {
	document.querySelectorAll('.mobile-nav-btn').forEach(function (nb) {
		nb.classList.remove('active');
	});
	activeNavBtn = null;
});
document.getElementById('credits-overlay')?.addEventListener('click', function () {
	document.querySelectorAll('.mobile-nav-btn').forEach(function (nb) {
		nb.classList.remove('active');
	});
	activeNavBtn = null;
});
