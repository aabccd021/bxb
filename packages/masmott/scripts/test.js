const fs = require('fs');
const fse = require('fs-extra');
const cp = require("child_process");
const package = require('../package.json')

const examplesDir = '../../examples'

fs.readdirSync(examplesDir).forEach(file => {
	console.log(file)
	var ls = cp.spawn('yarn', ['masmott', 'test'], { cwd: `${examplesDir}/${file}` });

  ls.stdout.on('data', (data) => process.stdout.write(data.toString()));
  ls.stderr.on('data', (data) => process.stderr.write(data.toString()));
});