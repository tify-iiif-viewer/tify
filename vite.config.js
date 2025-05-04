import { defineConfig } from 'vite';

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { inspect } from 'node:util';

import vue from '@vitejs/plugin-vue';
import componentsAutoImport from 'unplugin-vue-components/vite'; // eslint-disable-line import/no-unresolved
import banner from 'vite-plugin-banner';
import eslint from 'vite-plugin-eslint';
import sassGlobImport from 'vite-plugin-sass-glob-import';

import 'dotenv/config';

import pkg from './package.json';

const repositoryUrl = pkg.repository.url.replace(/git\+(.+)\.git/, '$1');

const transformIndexPlugin = () => ({
	transformIndexHtml(html) {
		const translationsDir = './public/translations';

		const languages = { en: 'English' };
		readdirSync(translationsDir).forEach((file) => {
			languages[file.split('.')[0]] = JSON.parse(readFileSync(`${translationsDir}/${file}`)).$language;
		});

		const languagesString = inspect(languages, { breakLength: Infinity, compact: false });
		const hash = Date.now();

		return html
			.replace(
				'// VITE_LANGUAGES',
				`window.tifyLanguages = ${languagesString.replace(/\n/gm, '\n\t\t')};`,
			)
			.replace(/((?:href|src)=".+?.(?:css|js))(")/g, `$1?${hash}$2`)
			.replace(/[ ]{2}/g, '\t');
	},
});

// https://vitejs.dev/config/
export default defineConfig({
	base: process.env.BASE || '/',
	build: {
		outDir: process.env.OUTDIR || './dist',
		rollupOptions: {
			input: {
				'demo-app': 'index.html',
				tify: 'src/main.js',
			},
			output: {
				// https://rollupjs.org/guide/en/#outputentryfilenames
				entryFileNames: '[name].js',
				// https://rollupjs.org/guide/en/#outputassetfilenames
				assetFileNames: '[name].[ext]',
			},
		},
	},
	// https://vitejs.dev/config/#environment-variables
	define: {
		ENV: {
			blobBaseUrl: `${repositoryUrl}/blob/v${pkg.version}`,
			bugsUrl: pkg.bugs.url,
			license: pkg.license,
			repositoryUrl,
			version: pkg.version,
		},
	},
	plugins: [
		// Prepend copyright notice to each compiled file
		banner((fileName) => (fileName.startsWith('tify')
			? '/*!'
				+ `\nTIFY v${pkg.version}`
				+ `\n(c) 2017-${new Date().getFullYear()}`
				+ ' Göttingen State and University Library (https://www.sub.uni-goettingen.de/)'
				+ `\n${pkg.license}`
				+ `\n${pkg.homepage}`
				+ '\n*/'
			: ''
		)),
		componentsAutoImport({
			dts: false, // disable generating components.d.ts file
			resolvers: [
				(componentName) => {
					// NOTE: Full path required for unit tests with Vitest
					// Replacing "\" with "/" so it works on Windows; path.normalize cannot help here
					const baseDir = __dirname.replaceAll('\\', '/');
					const dir = `${baseDir}/src/components${componentName.startsWith('Icon') ? '/icons' : ''}`;
					const path = `${dir}/${componentName}.vue`;

					if (!existsSync(path)) {
						return false;
					}

					return {
						name: componentName,
						from: path,
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
		transformIndexPlugin(),
		vue(),
	],
});
