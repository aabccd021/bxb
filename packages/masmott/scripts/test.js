const fs = require('fs');
const fse = require('fs-extra');
const cp = require("child_process");
const package = require('../package.json')

const examplesDir = '../../examples'

fs.readdirSync(examplesDir).forEach(file => {
	console.log(`Start script test.js on ${file}`)
	const proc = cp.spawn('yarn', ['masmott', 'test'], { cwd: `${examplesDir}/${file}` });

	proc.stdout.on('data', (data) => process.stdout.write(data.toString()));
	proc.stderr.on('data', (data) => process.stderr.write(data.toString()));
	proc.on('exit', (code) => console.log(`Finish script test.js on ${file} with exit code: ${code}`))
});