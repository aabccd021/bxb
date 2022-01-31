const fs = require('fs')
const fse = require('fs-extra')
const cp = require("child_process");
const package = require('../package.json')

const exampleDir = '../../examples'

fs.readdirSync(exampleDir).forEach(file => {
	const moduleDir = `${exampleDir}/${file}/node_modules/masmott`;
	cp.execSync('chmod 777 -R dist')
	fs.rmSync(moduleDir, { recursive: true, force: true })
	fs.mkdirSync(moduleDir)

	fs.copyFileSync('package.json', `${moduleDir}/package.json`)
	package.files.forEach(file => {
		const dirPath = file.replace('/**', '');
		fse.copySync(dirPath, `${moduleDir}/${dirPath}`)
	})
	console.log(file)
});