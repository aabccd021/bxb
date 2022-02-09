const fs = require('fs')
const fse = require('fs-extra')
const cp = require("child_process");
const package = require('../package.json');
const { runCmd } = require('../dist/cjs/cli/runCmd');


const examplePackageJson = (projectId) => `{
	"name": "demo-${projectId}",
	"main": ".masmott/functions/index.js",
	"private": true,
	"engines": {
		"node": "16"
	},
	"scripts": {
		"build": "masmott build",
		"test": "masmott test",
		"start": "masmott start",
		"lint": "masmott lint"
	},
	"dependencies": {
		"firebase-admin": "^10.0.2",
		"firebase-functions": "^3.17.1",
		"masmott": "../../packages/masmott",
		"next": "^12.0.1",
		"react": "17.0.2",
		"react-dom": "^17.0.2"
	},
	"devDependencies": {
		"@types/jest": "^27.4.0",
		"@types/react": "17.0.32",
		"autoprefixer": "^10.4.2",
		"cypress": "^9.4.1",
		"eslint": "^8.8.0",
		"eslint-config-masmott": "../../packages/eslint-config-masmott",
		"firebase-tools": "^10.1.2",
		"jest": "^27.4.7",
		"postcss": "^8.4.6",
		"prettier": "^2.5.1",
		"tailwindcss": "^3.0.18",
		"ts-jest": "^27.1.3",
		"typescript": "^4.5.5"
	},
	"jest": {
		"preset": "ts-jest",
		"testMatch": [
			"**/test/**/*.test.ts"
		]
	},
	"version": "0.1.0",
	"eslintConfig": {
		"extends": "masmott"
	}
}`

const migration = (projectId) => `export const migration = {
  firebase: {
    projectId: 'demo-${projectId}',
  },
  spec: {
	}
}
`

const webHelloWorld = `export const Page = <div>Hello World</div>;`;


const exampleDir = '../../examples';

const main = async () => {
	for (const projectId of fs.readdirSync(exampleDir)) {
		console.log(`PREPARE ${projectId}`)

		const projectDir = `${exampleDir}/${projectId}`

		fs.writeFileSync(`${projectDir}/package.json`, examplePackageJson(projectId))
		if (!fs.existsSync(`${projectDir}/node_modules/.bin`)) {
			await runCmd('yarn', { cwd: `${projectDir}`, prefix: projectId });
		}

		const projectMigrationDir = `${projectDir}/migration`;
		const initialMigrationFile = `${projectMigrationDir}/0.1.ts`;
		if (!fs.existsSync(initialMigrationFile)) {
			fs.mkdirSync(projectMigrationDir, { recursive: true })
			fs.writeFileSync(initialMigrationFile, migration(projectId), { recursive: true })
		}

		const webDir = `${projectDir}/web`;
		if (!fs.existsSync(webDir)) {
			fs.mkdirSync(webDir, { recursive: true })
			fs.writeFileSync(`${webDir}/index.tsx`, webHelloWorld, { recursive: true })
		}

		const moduleDir = `${projectDir}/node_modules/masmott`;
		await runCmd('chmod 777 -R dist', { prefix: projectId })
		fs.rmSync(moduleDir, { recursive: true, force: true })
		fs.mkdirSync(moduleDir, { recursive: true })

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
	}
};

main();
