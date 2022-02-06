const fs = require('fs')
const fse = require('fs-extra')
const cp = require("child_process");
const package = require('../package.json')

const exampleDir = '../../examples'

fs.readdirSync(exampleDir).forEach(file => {
	console.log(`Start script prepare.ts on ${file}`)
	const moduleDir = `${exampleDir}/${file}/node_modules/eslint-config-masmott`;
	fs.rmSync(moduleDir, { recursive: true, force: true })
	fs.mkdirSync(moduleDir)

	fs.copyFileSync('package.json', `${moduleDir}/package.json`)
	package.files.forEach(file => {
		const dirPath = file.replace('/**', '');
		fse.copySync(dirPath, `${moduleDir}/${dirPath}`)
	})

	const mmDir = `${moduleDir}/node_modules`
	fs.mkdirSync(mmDir)
	Object.keys(package.dependencies).forEach(dep => {
		fse.copySync(`node_modules/${dep}`, `${mmDir}/${dep}`)
	})
	console.log(`Finish script prepare.ts on ${file}`)
});