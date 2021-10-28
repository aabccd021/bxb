const fs = require('fs')
const fse = require('fs-extra')
const package = require('../package.json')

const exampleDir = '../../examples'

fs.readdirSync(exampleDir).forEach(file => {
	const moduleDir = `${exampleDir}/${file}/node_modules/masmott`;
	fs.rmSync(moduleDir, { recursive: true, force: true })
	fs.mkdirSync(moduleDir)
	fs.copyFileSync('package.json', `${moduleDir}/package.json`)
	package.files.forEach(file => {
		const dirPath = file.replace('/**', '');
		fse.copySync(dirPath, `${moduleDir}/${dirPath}`)
	})
});
