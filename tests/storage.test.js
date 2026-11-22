import assert from 'node:assert/strict';
import test from 'node:test';
import { posterFilename, savePoster } from '../editor/src/nextcloud.js';

const config = { davFolder: '/nc/remote.php/dav/files/mia/Poster', folderUrl: '/nc/files?dir=/Poster' };
const png = new Blob(['png'], { type: 'image/png' });

test('filenames preserve city names and cannot contain path segments', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    assert.equal(posterFilename('../São Paulo/東京', date), 'MapToPoster-São-Paulo-東京-2026-01-01T00-00-00-000Z.png');
    assert.match(posterFilename('...', date), /^MapToPoster-Karte-/);
    assert.ok(Buffer.byteLength(posterFilename('🌍漢'.repeat(200), date)) < 255);
});

test('an existing folder and file collision are handled without overwriting', async t => {
    const statuses = [405, 412, 201, 503];
    const mock = t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: statuses.shift() }));
    const result = await savePoster(png, 'Köln.png', config, 'session-token');
    assert.deepEqual(result, { name: 'Köln (2).png', href: config.folderUrl, label: 'Open folder' });
    assert.deepEqual(mock.mock.calls.map(c => c.arguments[1].method), ['MKCOL', 'PUT', 'PUT', 'PROPFIND']);
    const [url, options] = mock.mock.calls[2].arguments;
    assert.equal(url, config.davFolder + '/K%C3%B6ln%20(2).png');
    assert.equal(options.headers['If-None-Match'], '*');
    assert.equal(options.headers.requesttoken, 'session-token');
    assert.equal(options.body, png);
    assert.equal(options.mode, 'same-origin');
});

test('quota failures are surfaced after successful folder creation', async t => {
    const statuses = [201, 507];
    t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: statuses.shift() }));
    await assert.rejects(savePoster(png, 'Berlin.png', config, 'token'), /storage/);
});

test('denied folder creation prevents any upload', async t => {
    const mock = t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 403 }));
    await assert.rejects(savePoster(png, 'Berlin.png', config, 'token'), /write access/);
    assert.equal(mock.mock.callCount(), 1);
});
