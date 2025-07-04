/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:cypress/recommended',
		'plugin:vue/vue3-recommended',
		'@vue/airbnb',
	],
	globals: {
		ENV: true, // defined in vite.config.js
	},
	ignorePatterns: ['dist'],
	overrides: [
		{
			files: ['*.html'],
			parser: '@html-eslint/parser',
			extends: ['plugin:@html-eslint/recommended'],
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
	},
	plugins: [
		'@html-eslint',
		'html',
	],
	rules: {
		'@html-eslint/indent': ['error', 'tab', {
			tagChildrenIndent: { html: 0 },
		}],
		'@html-eslint/require-closing-tags': ['error', {
			selfClosingCustomPatterns: ['html'],
		}],
		'import/prefer-default-export': 'off',
		'import/no-extraneous-dependencies': ['error', {
			optionalDependencies: ['tests/unit/index.js'],
		}],
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-tabs': 'off',
		'vue/attribute-hyphenation': ['error', 'never'],
		'vue/component-name-in-template-casing': ['error', 'PascalCase', {
			registeredComponentsOnly: false,
		}],
		'vue/html-indent': ['error', 'tab'],
		'vue/max-attributes-per-line': ['error', {
			singleline: {
				max: 1,
			},
			multiline: {
				max: 1,
			},
		}],
		'vue/max-len': ['error', 120],
		'vue/no-v-html': 'off',
	},
	settings: {
		'import/resolver': {
			typescript: {}, // load <rootdir>/tsconfig.json to eslint, required for @iiif/parser
		},
	},
};
