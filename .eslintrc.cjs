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
	parserOptions: {
		ecmaVersion: 'latest',
	},
	ignorePatterns: ['dist'],
	rules: {
		'import/prefer-default-export': 'off',
		'import/no-extraneous-dependencies': ['error', {
			optionalDependencies: ['tests/unit/index.js'],
		}],
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'no-continue': 'off',
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-tabs': 'off',
		'object-curly-newline': ['error', {
			ImportDeclaration: { multiline: true },
		}],
		'vue/html-indent': ['error', 'tab'],
		'vue/max-len': ['error', 120],
		'vue/no-v-html': 'off',
	},
	globals: {
		ENV: true, // defined in vite.config.js
	},
	settings: {
		'import/resolver': {
			typescript: {}, // load <rootdir>/tsconfig.json to eslint, required for @iiif/parser
		},
	},
};
