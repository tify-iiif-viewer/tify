/** @type {import('stylelint').Config} */
export default {
	extends: [
		// NOTE: Order of extends matters
		'@stylistic/stylelint-config',
		'stylelint-config-standard-scss',
		'stylelint-config-recommended-vue/scss',
	],
	plugins: [
		'stylelint-order',
	],
	rules: {
		'declaration-empty-line-before': [
			'never',
			{ ignore: ['after-declaration'] },
		],
		'order/order': [
			'custom-properties',
			'declarations',
		],
		'order/properties-alphabetical-order': true,
		'selector-attribute-quotes': 'never',
		'selector-class-pattern': [
			'^(-?[a-z][a-z0-9-]*[a-z0-9])$',
		],
		'@stylistic/block-closing-brace-newline-after': [
			'always',
			{ ignoreAtRules: ['if', 'else'] },
		],
		'@stylistic/indentation': 'tab',
		'@stylistic/number-leading-zero': 'never',
		'@stylistic/string-quotes': 'single',
	},
};
