import Fastify from 'fastify';
import pointOfView from '@fastify/view';
import path from 'path';
import { fileURLToPath } from 'url';
import bdsm from '../src';

import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

fastify.register(pointOfView, {
	engine: {
		handlebars: bdsm
	},
	root: path.join(__dirname, ''),
});

fastify.get('/', (request, reply) => {
	let cart = [];

	for (let i = 0; i < 4; ++i) cart.push({name: 'cart-item-' + i});
	reply.view('index.bdsm', {
		hello: 'world',
		cart
	});
});

fastify.get('/style.css', async (_, reply) => reply.send(await fs.readFile(path.join(__dirname, '/style.css'))))
fastify.listen({ port: 3000 }, (err, address) => {
	if (err) throw err;
	console.log(`Server listening on ${address}`);
});