module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		'plugin:vue/essential',
		'@vue/airbnb',
	],
	parserOptions: {
		parser: 'babel-eslint',
	},
	rules: {
		// don't require .vue extension when importing
		'global-require': 0,
		'import/extensions': ['error', 'always', {
			'js': 'never',
			'vue': 'never',
		}],
		// allow optionalDependencies
		'import/no-extraneous-dependencies': ['error', {
			'optionalDependencies': ['tests/unit/index.js']
		}],
		'indent': [2, 'tab'],
		// allow debugger during development
		'no-continue': 0,
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
		'no-floating-decimal': 0,
		'no-tabs': 0,
		'max-len': ['error', { 'code': 120 }],
		'vue/no-template-key': 'off',
	},
	overrides: [
		{
			files: [
				'**/__tests__/*.{j,t}s?(x)',
				'**/tests/unit/**/*.spec.{j,t}s?(x)',
			],
			env: {
				jest: true,
			},
		},
	],
	root: true,
	env: {
		node: true,
	},
	extends: [
		'plugin:vue/essential',
		'@vue/airbnb',
		'plugin:cypress/recommended',
	],
	parserOptions: {
		parser: 'babel-eslint',
	},
	rules: {
		// don't require .vue extension when importing
		'global-require': 0,
		'import/extensions': ['error', 'always', {
			js: 'never',
			vue: 'never',
		}],
		// allow optionalDependencies
		'import/no-extraneous-dependencies': ['error', {
			optionalDependencies: ['tests/unit/index.js'],
		}],
		indent: [2, 'tab'],
		// allow debugger during development
		'no-continue': 0,
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
		'no-floating-decimal': 0,
		'no-tabs': 0,
		'max-len': ['error', { code: 120 }],
		'vue/no-template-key': 'off',
	},
	overrides: [
		{
			files: [
				'**/__tests__/*.{j,t}s?(x)',
				'**/tests/unit/**/*.spec.{j,t}s?(x)',
			],
			env: {
				jest: true,
			},
		},
	],
};
