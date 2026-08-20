import { defineConfig } from 'vite';

import fs from 'node:fs';

import vue from '@vitejs/plugin-vue';

import banner from 'vite-plugin-banner';
import eslint from 'vite-plugin-eslint';
import sassGlobImport from 'vite-plugin-sass-glob-import';
import unpluginIcons from 'unplugin-icons/vite'; // eslint-disable-line import/no-extraneous-dependencies
import unpluginVueComponents from 'unplugin-vue-components/vite';

import 'dotenv/config';

import pkg from './package.json';

const repositoryUrl = pkg.repository.url.replace(/git\+(.+)\.git/, '$1');

// https://vitejs.dev/config/
export default defineConfig({
	base: process.env.BASE || '/',
	build: {
		outDir: process.env.OUTDIR || './dist',
		rollupOptions: {
			input: {
				demo: 'index.html',
				tify: 'src/main.js',
			},
			output: {
				// https://rollupjs.org/guide/en/#outputentryfilenames
				entryFileNames: '[name].js',
				// https://rollupjs.org/guide/en/#outputassetfilenames
				assetFileNames: '[name].[ext]',
			},
			preserveEntrySignatures: 'preserve',
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				silenceDeprecations: ['import'],
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
			&& '/*!'
				+ `\nTIFY v${pkg.version}`
				+ `\n(c) 2017-${new Date().getFullYear()}`
				+ ' Göttingen State and University Library (https://www.sub.uni-goettingen.de/)'
				+ `\n${pkg.license}`
				+ `\n${pkg.homepage}`
				+ '\n*/'
		)),
		// https://github.com/unplugin/unplugin-icons
		unpluginIcons({
			autoInstall: false,
			scale: 1,
			iconCustomizer(collectionName, iconName, props) {
				/* eslint-disable no-param-reassign, no-underscore-dangle */
				props.__iconify_loader_height = '';
				props.__iconify_loader_width = '';
				props.class = `tify-icon -${iconName}`;
				props['aria-hidden'] = true;
			},
		}),
		// https://github.com/unplugin/unplugin-vue-components
		unpluginVueComponents({
			dts: false, // disable generating components.d.ts file
			resolvers: [
				(componentName) => {
					if (componentName.startsWith('Icon')) {
						return {
							from: `~icons/mdi/${componentName.replace(/^Icon/, '')}`,
						};
					}

					return undefined;
				},
			],
		}),

		eslint({
			cache: true,
			// Poor man’s ignore file parser, since --ignore-path is not supported
			exclude: fs.readFileSync('.gitignore')
				.toString()
				.split('\n')
				.filter((line) => line && !line.startsWith('#'))
				.map((line) => (!line.endsWith('*') ? `${line}/**` : line)),
			fix: true,
		}),
		sassGlobImport(),
		vue(),
		{
			transformIndexHtml(html) {
				return process.env.NODE_ENV !== 'production'
					? html
					: html
						// Replace ghastly spaces with tabs :)
						.replace(/^ {2}/gm, '\t')
						// Append current version to all assets for cache busting
						.replace(/(<(?:link.+?href|script.+?src)=".+?)(")/g, `$1?${pkg.version}$2`);
			},
		},
	],
});
