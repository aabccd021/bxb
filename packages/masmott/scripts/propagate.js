const fs = require('fs');
const fse = require('fs-extra');
const cp = require("child_process");
const package = require('../package.json');
const { runCmd } = require('../dist/cjs/cli/runCmd');
const { prefixProjectId } = require('./util');

const examplesDir = '../../examples'

const main = async () => {
	for (const projectId of fs.readdirSync(examplesDir)) {
		const script = process.argv.slice(2).join(' ')
		const exitCode = await runCmd(`yarn masmott ${script}`,
			prefixProjectId(projectId),
			{
				cwd: `${examplesDir}/${projectId}`,
				shell: true,
			});
		if (exitCode !== 0) {
			process.exit(exitCode);
		}
	}
};

main();