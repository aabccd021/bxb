const fs = require('fs');
const { runCmd } = require('../dist/cjs/cli/runCmd');

const examplesDir = '../../examples'

const main = async () => {
	for (const projectId of fs.readdirSync(examplesDir)) {
		const script = process.argv.slice(2).join(' ')
		const exitCode = await runCmd(`yarn masmott ${script}`,
			{
				cwd: `${examplesDir}/${projectId}`,
				shell: true,
				prefix: projectId,
			});
		if (exitCode !== 0) {
			process.exit(exitCode);
		}
	}
};

main();