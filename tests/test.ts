import { bench, run } from 'mitata';
import fs from 'fs/promises';

import bdsm from '../src';

const text = await fs.readFile('./index.bdsm', 'utf8');

const cart = Array.from({ length: 4 }, (_, i) => ({
	name: `cart-item-${i}`
}));

const data = {
	cart
};

const template = bdsm.compile(text);

console.log(template(data));