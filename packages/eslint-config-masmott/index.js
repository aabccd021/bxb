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
	]
}