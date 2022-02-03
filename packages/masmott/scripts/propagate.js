const fs = require('fs');
const fse = require('fs-extra');
const cp = require("child_process");
const package = require('../package.json')

const examplesDir = '../../examples'

fs.readdirSync(examplesDir).forEach(file => {
	const script = process.argv.slice(2).join(' ')
	console.log(`PROPAGATE ${file}: \`masmott ${script}\``)
	const cmd = cp.spawn(`yarn masmott ${script}`, { cwd: `${examplesDir}/${file}`, shell: true });
	cmd.stdout.on('data', (data) => process.stdout.write(data.toString()));
	cmd.stderr.on('data', (data) => process.stderr.write(data.toString()));
	cmd.on('exit', process.exit)
});