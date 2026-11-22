import { translate } from "./l10n.js";
const messages = {
    401: "Please sign in to Nextcloud again.",
    403: "Nextcloud denied write access. Check your session and permissions for the Poster folder.",
    409: "The Poster folder is unavailable. Check whether a file already has that name.",
    413: "The PNG exceeds the server upload limit.",
    423: "The file is locked. Try again.",
    507: 'There is not enough Nextcloud storage for this poster.',
};

export function posterFilename(city, date = new Date()) {
    const safeCity = Array.from(city.normalize('NFC').replace(/[^\p{L}\p{N}\p{M}-]+/gu, '-'))
        .slice(0, 45).join('').replace(/^-+|-+$/g, '') || 'Karte';
    const timestamp = date.toISOString().replace(/[:.]/g, '-');
    return `MapToPoster-${safeCity}-${timestamp}.png`;
}

function check(response, expected) {
    if (!expected.includes(response.status)) {
        const message = messages[response.status] ?? 'Nextcloud could not save the poster (HTTP {status}).';
        throw new Error(translate(message, { status: response.status }));
    }
}

export async function savePoster(blob, filename, config, token) {
    const headers = { requesttoken: token, 'X-Requested-With': 'XMLHttpRequest' };
    const request = (url, options) => fetch(url, {
        credentials: 'same-origin',
        mode: 'same-origin',
        redirect: 'error',
        ...options,
        headers: { ...headers, ...options.headers },
    });
    // WebDAV also returns 405 when another tab created the collection first.
    check(await request(config.davFolder, { method: 'MKCOL' }), [201, 405]);
    for (let index = 1; index <= 20; index++) {
        const name = index === 1 ? filename : filename.replace(/\.png$/, ` (${index}).png`);
        const url = `${config.davFolder}/${encodeURIComponent(name)}`;
        const upload = await request(url, {
            method: 'PUT',
            body: blob,
            headers: { 'Content-Type': 'image/png', 'If-None-Match': '*' },
        });
        if (upload.status === 412) continue;
        check(upload, [201, 204]);

        // The DAV OC-FileId header may contain an instance suffix. Files uses the numeric id.
        const result = { name, href: config.folderUrl, label: translate("Open folder") };
        try {
            const properties = await request(url, {
                method: 'PROPFIND',
                headers: { Depth: '0', 'Content-Type': 'application/xml' },
                body: '<d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns"><d:prop><oc:fileid/></d:prop></d:propfind>',
            });
            if (properties.status === 207) {
                const xml = new DOMParser().parseFromString(await properties.text(), 'application/xml');
                const id = xml.getElementsByTagNameNS('http://owncloud.org/ns', 'fileid')[0]?.textContent?.trim();
                if (/^\d+$/.test(id)) {
                    result.href = config.fileUrl.replace('__FILE_ID__', id);
                    result.label = translate("Open in Files");
                }
            }
        } catch {
            // The file is committed even when the optional link lookup fails.
        }
        return result;
    }
    throw new Error(translate("The filename is already taken. Save the poster again."));
}
