module.exports = {
	env: {
		browser: true,
		node: true,
	},
	root: true,
	parser: 'babel-eslint',
	parserOptions: {
		sourceType: 'module',
	},
	extends: 'airbnb-base',
	// required to lint *.vue files
	plugins: [
		'html',
	],
	// check if imports actually resolve
	'settings': {
		'import/resolver': {
			'webpack': {
				'config': 'build/webpack.base.conf.js',
			},
		},
	},
	// add your custom rules here
	'rules': {
		// don't require .vue extension when importing
		'global-require': 0,
		'import/extensions': ['error', 'always', {
			'js': 'never',
			'vue': 'never',
		}],
		'indent': [2, 'tab'],
		// allow debugger during development
		'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
		'no-floating-decimal': 0,
		'no-tabs': 0,
	},
};
