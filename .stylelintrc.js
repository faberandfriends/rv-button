module.exports = {
    extends: [
		'stylelint-config-sass-guidelines'
	],
    plugins: [
		'stylelint-order'
    ],
    rules: {
        'indentation': 4,
		'number-leading-zero': null,
		'block-opening-brace-newline-after': 'always',
		'block-closing-brace-newline-before': 'always',
		'selector-class-pattern': null,
		'order/order': [
			[
				'dollar-variables',
				'custom-properties',
				'at-rules',
				'declarations',
				{
					type: 'at-rule',
					name: 'supports',
				},
				{
					type: 'at-rule',
					name: 'media',
				},
				'rules',
			],
			{ severity: 'warning' },
		],
	},
	ignoreFiles: 'dist/*',
};
