// NOTE: This file should not be edited
const functions = require("firebase-functions");
const { default: next } = require("next");

const nextApp = next({
	dev: false,
	conf: { distDir: ".next" }
});
const handle = nextApp.getRequestHandler();

const server = functions.https.onRequest((request, response) =>
	nextApp.prepare().then(() => handle(request, response))
);

exports.nextjs = { server };