const fs = require('fs')

const exampleDir = '../../examples'

fs.readdirSync(exampleDir).forEach(file => {
	const moduleDir = `${exampleDir}/${file}/node_modules/eslint-config-masmott`;
	fs.rmSync(moduleDir, { recursive: true, force: true })
	fs.mkdirSync(moduleDir)
	fs.copyFileSync('index.js', `${moduleDir}/index.js`)
	fs.copyFileSync('package.json', `${moduleDir}/package.json`)
});
