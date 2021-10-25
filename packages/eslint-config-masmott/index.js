module.exports = {
	plugins: [
		'@typescript-eslint',
		'only-warn',
		'ts-immutable'
	],
	ignorePatterns: [
		"**/*.js"
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
		'plugin:ts-immutable/recommended',
		'next',
		'prettier'
	],
	rules: {
		"no-unsafe-optional-chaining": "warn",
		"no-use-before-define": "warn",
		"no-else-return": "warn",
		"no-useless-return": "warn",
		"no-undef-init": "warn",
		"no-useless-rename": "warn",
		"object-shorthand": "warn",
		"prefer-arrow-callback": "warn",
		"prefer-destructuring": "warn",
		"prefer-template": "warn",
		"eqeqeq": "warn",
		"max-len": [
			"warn",
			{
				"code": 100,
				"comments": 100,
				"ignoreStrings": true,
				"ignoreTemplateLiterals": true
			}
		],
		"curly": [
			"warn",
			"all"
		],
		"prettier/prettier": [
			"warn",
			{
				"singleQuote": true,
				"printWidth": 100
			}
		]
	}
}