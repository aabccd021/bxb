module.exports = {
	plugins: [
		'@typescript-eslint',
		'only-warn',
		'functional',
		'cypress',
		'mocha',
		'unused-imports'
	],
	ignorePatterns: [
		"**/*.js",
		"generated.ts",
		"masmott.ts",
		"pages/**/*.tsx",
	],
	overrides: [
		{
			files: [
				'web/**/*.tsx'
			],
			extends: [
				'eslint:recommended',
				'plugin:@typescript-eslint/all',
				'plugin:mocha/recommended',
				'plugin:prettier/recommended',
				'plugin:functional/lite',
				'next',
				'prettier'
			],
			rules: {
				'no-unsafe-optional-chaining': 'warn',
				'no-use-before-define': 'warn',
				'no-else-return': 'warn',
				'no-useless-return': 'warn',
				'no-undef-init': 'warn',
				'no-useless-rename': 'warn',
				'object-shorthand': 'warn',
				'prefer-arrow-callback': 'warn',
				'prefer-destructuring': 'warn',
				'prefer-template': 'warn',
				'eqeqeq': 'warn',
				'max-len': [
					'warn',
					{
						'code': 100,
						'comments': 100,
						'ignoreStrings': true,
						'ignoreTemplateLiterals': true
					}
				],
				'curly': [
					'warn',
					'all'
				],
				'prettier/prettier': [
					'warn',
					{
						'singleQuote': true,
						'printWidth': 100
					}
				],
				'functional/no-return-void': 'off',
				'functional/no-mixed-type': 'off',
				'@typescript-eslint/no-unused-vars': 'off',
				'@typescript-eslint/no-magic-numbers': 'off',
				'@typescript-eslint/no-floating-promises': 'off',
				'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
				'@typescript-eslint/prefer-readonly-parameter-types': 'off',
				'@typescript-eslint/prefer-readonly-parameter-types': 'off',
				'@typescript-eslint/no-type-alias': [
					'error',
					{
						allowLiterals: "always",
						allowGenerics: "always",
					}
				],
				'@typescript-eslint/naming-convention': [
					'error',
					{
						selector: 'default',
						format: ['strictCamelCase', 'PascalCase']
					}
				],
				'unused-imports/no-unused-imports': 'error',
				'unused-imports/no-unused-vars': [
					'error',
					{ 'vars': 'all', 'varsIgnorePattern': '^_', 'args': 'after-used', 'argsIgnorePattern': '^_' }
				]
			},
		},
		{
			files: [
				'cypress/**/*.spec.ts'
			],
			extends: [
				'plugin:cypress/recommended',
			],
		}
	],
}