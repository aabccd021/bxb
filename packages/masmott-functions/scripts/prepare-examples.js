const fs = require('fs')
const fse = require('fs-extra')

const exampleDir = '../../examples'

fs.readdirSync(exampleDir).forEach(file => {
	const moduleDir = `${exampleDir}/${file}/node_modules/masmott-functions`;
	fs.rmSync(moduleDir, { recursive: true, force: true })
	fse.copySync('dist', `${moduleDir}/dist`)
	fs.copyFileSync('package.json', `${moduleDir}/package.json`)
});
