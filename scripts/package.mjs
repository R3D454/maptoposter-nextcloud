import { cp, mkdir, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { create } from 'tar';

const target = 'dist/maptoposter';
for (const path of ['appinfo', 'lib', 'templates', 'img', 'LICENSE', 'README.md']) {
    await cp(path, join(target, path), { recursive: true });
}
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
for (const [path, metadata] of Object.entries(lock.packages)) {
    if (!path || (metadata.dev && !path.startsWith('node_modules/@fontsource/'))) continue;
    const licenses = (await readdir(path)).filter(name => /^(licen[cs]e|copying|ofl|notice)(\.|$)/i.test(name));
    if (!licenses.length) continue;
    const dest = join(target, 'licenses', path.replaceAll('node_modules/', ''));
    await mkdir(dest, { recursive: true });
    for (const name of licenses) await cp(join(path, name), join(dest, name));
}
await create({ file: 'dist/maptoposter.tar.gz', cwd: 'dist', gzip: true, portable: true }, ['maptoposter']);
console.log('Nextcloud-App: dist/maptoposter.tar.gz');
