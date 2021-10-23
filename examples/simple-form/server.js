// NOTE: This file should not be edited
const functions = require("firebase-functions");
const next = require("next");
const { masmott } = require('./.functions')

exports.masmott = masmott;

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({
	dev,
	// the absolute directory from the package.json file that initialises this module
	// IE: the absolute path from the root of the Cloud Function
	conf: { distDir: ".next" }
});
const handle = nextApp.getRequestHandler();

const server = functions.https.onRequest((request, response) => {
	// log the page.js file or resource being requested
	return nextApp.prepare().then(() => handle(request, response));
});

exports.nextjs = { server };