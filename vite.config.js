import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import prefixSelector from 'postcss-prefix-selector';

export default defineConfig({
    base: './',
    publicDir: false,
    build: {
        outDir: 'dist/maptoposter',
        cssCodeSplit: false,
        assetsInlineLimit: 0,
        rollupOptions: {
            input: 'editor/main.js',
            output: {
                format: 'iife',
                inlineDynamicImports: true,
                entryFileNames: 'js/editor.js',
                assetFileNames: asset => asset.name?.endsWith('.css') ? 'css/editor.css' : 'assets/[name]-[hash][extname]',
            },
        },
    },
    css: {
        postcss: {
            plugins: [
                tailwindcss({
                    content: ['./templates/main.php', './editor/**/*.js'],
                    theme: { extend: { fontFamily: { sans: ['Outfit', 'sans-serif'], serif: ['Playfair Display', 'serif'] } } },
                }),
                autoprefixer(),
                prefixSelector({
                    prefix: '#maptoposter',
                    transform(prefix, selector, prefixed) {
                        if (selector.startsWith(prefix)) return selector;
                        if (/^(:root|:host|html|body)$/.test(selector)) return prefix;
                        return prefixed;
                    },
                }),
            ],
        },
    },
});
