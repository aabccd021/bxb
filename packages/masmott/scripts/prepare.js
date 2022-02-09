const fs = require('fs')
const fse = require('fs-extra')
const cp = require("child_process");
const package = require('../package.json');
const { runCmd } = require('../dist/cjs/cli/runCmd');
const { jsonStringify } = require('../dist/cjs/cli/templates/utils')
const { migration } = require('../dist/cjs/cli/templates')
const { overwritePackageJson } = require('../dist/cjs/cli/templates/package-json')
const { write } = require('../dist/cjs/cli/write')


const overwriteDevPackageJson = (packageJson) => jsonStringify({
	...packageJson,
	"dependencies": {
		...packageJson.dependencies,
		masmott: "../../packages/masmott",
	},
	"devDependencies": {
		...packageJson.devDependencies,
		"eslint-config-masmott": "../../packages/eslint-config-masmott",
	}
});

const exampleDir = '../../examples';



const main = async () => {
	for (const projectId of fs.readdirSync(exampleDir)) {
		const log = (x) => console.log(`${projectId} |> PREPARE |> ${x}`)
		log("Start");

		const projectDir = `${exampleDir}/${projectId}`

		const projectPackageJson = `${projectDir}/package.json`;
		const oldPackageJson = fs.existsSync(projectPackageJson)
			? JSON.parse(fs.readFileSync(projectPackageJson, { encoding: 'utf-8' }))
			: overwritePackageJson({});
		write({ paths: [[`${projectDir}/migration/0.1.ts`, migration]] });
		write({ paths: [[projectPackageJson, overwriteDevPackageJson(oldPackageJson)]], force: true });

		if (!fs.existsSync(`${projectDir}/node_modules/.bin`)) {
			log("yarn");
			await runCmd('yarn', { cwd: `${projectDir}`, prefix: projectId });
		}

		const moduleDir = `${projectDir}/node_modules/masmott`;
		await runCmd('chmod 777 -R dist', { prefix: projectId })
		fs.rmSync(moduleDir, { recursive: true, force: true })
		fs.mkdirSync(moduleDir, { recursive: true })

		log("Copy package files");
		fs.copyFileSync('package.json', `${moduleDir}/package.json`)
		package.files.forEach(file => {
			const dirPath = file.replace('/**', '');
			fse.copySync(dirPath, `${moduleDir}/${dirPath}`)
		})

		log("Copy dependencies");
		const mmDir = `${moduleDir}/node_modules`
		fs.mkdirSync(mmDir)
		Object.keys(package.dependencies).forEach(dep => {
			fse.copySync(`node_modules/${dep}`, `${mmDir}/${dep}`)
		})
	}
};

main();
