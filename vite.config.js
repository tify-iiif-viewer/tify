import { defineConfig } from 'vite';

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import componentsAutoImport from 'unplugin-vue-components/vite'; // eslint-disable-line import/no-unresolved
import banner from 'vite-plugin-banner';
import eslint from 'vite-plugin-eslint';
import sassGlobImport from 'vite-plugin-sass-glob-import';

import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		rollupOptions: {
			output: {
				// https://rollupjs.org/guide/en/#outputentryfilenames
				entryFileNames: 'tify.js',
				// https://rollupjs.org/guide/en/#outputassetfilenames
				assetFileNames: 'tify.[ext]',
			},
		},
	},
	// https://vitejs.dev/config/#environment-variables
	define: {
		ENV: {
			version: pkg.version,
			license: pkg.license,
			bugsUrl: pkg.bugs.url,
			contributorsUrl: `${pkg.repository.url}/blob/v${pkg.version}/CONTRIBUTORS.md`,
			docsUrl: `${pkg.repository.url}/blob/v${pkg.version}/doc`,
			docsLanguages: [
				...new Set(readdirSync('./doc').map((file) => file.split('.')[1])),
			],
			repositoryUrl: pkg.repository.url,
		},
	},
	plugins: [
		// Prepend copyright notice to each compiled file
		banner(
			'/*!'
			+ `\nTIFY v${pkg.version}`
			+ `\n(c) 2017-${new Date().getFullYear()}`
			+ ' Göttingen State and University Library (https://www.sub.uni-goettingen.de/)'
			+ `\n${pkg.license}`
			+ `\n${pkg.homepage}`
			+ '\n*/',
		),
		componentsAutoImport({
			resolvers: [
				(componentName) => {
					// Replacing "\" with "/" in import paths so unit tests work on Windows
					// NOTE: path.normalize cannot help here
					const baseDir = __dirname.replaceAll('\\', '/');
					const dir = `${baseDir}/src/components${componentName.startsWith('Icon') ? '/icons' : ''}`;
					return {
						name: componentName,
						from: `${dir}/${componentName}.vue`,
					};
				},
			],
		}),
		eslint({
			cache: true,
			// Poor man's ignore file parser, since --ignore-path is not supported
			exclude: readFileSync('.gitignore')
				.toString()
				.split('\n')
				.filter((line) => line && !line.startsWith('#'))
				.map((line) => (!line.endsWith('*') ? `${line}/**` : line)),
			fix: true,
		}),
		sassGlobImport(),
		vue(),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	server: {
		port: 8080,
	},
	test: {
		include: ['../tests/unit/**/*.spec.js'],
		deps: {
			inline: ['vitest-canvas-mock'],
		},
		threads: false,
		environment: 'jsdom',
	},
});
