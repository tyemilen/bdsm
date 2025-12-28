import type { Node } from './parser';

type RenderFn = (ctx: Record<string, any>, out: string[]) => void;

function escapeHTML (str: string) {
	return str.replace(/[&<>"']/g, s =>
		({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]!)
	);
}

function precomputePaths(text?: string): Array<string[] | string> {
	if (!text) return [];

	return text.split(/(@[\w$.]+@)/g).map(seg =>
		seg.startsWith('@') ? seg.slice(1, -1).split('.') : seg
	);
}

function getValue(ctx: Record<string, any>, path: string[]): any {
	let val = ctx;
	for (const p of path) {
		if (!val) return undefined;
		val = val[p];
	}
	return val;
}

function safeEvalExpr(ctx: Record<string, any>, expr: string): boolean {
	const tokens = expr.trim().split(/\s+/);
	const left = getValue(ctx, tokens[0]!.split('.'));

	if (tokens.length === 1) return !!left;

	const op = tokens[1];
	const right = isNaN(Number(tokens[2])) ? getValue(ctx, tokens[2]!.split('.')) : Number(tokens[2]);

	switch (op) {
		case '==': return left == right;
		case '===': return left === right;
		case '!=': return left != right;
		case '!==': return left !== right;
		case '>': return left > right;
		case '>=': return left >= right;
		case '<': return left < right;
		case '<=': return left <= right;
		case '&&': return !!(left && right);
		case '||': return !!(left || right);
		default: return !!left;
	}
}

function compileNode(n: Node): RenderFn {
	n.textPaths = precomputePaths(n.text);
	n.attrPaths = {};
	for (const [k, v] of Object.entries(n.attributes)) {
		n.attrPaths[k] = precomputePaths(v);
	}
	const childFns = n.children.map(compileNode);

	switch (n.type) {
		case 'TEXT':
			return (ctx, out) => {
				for (const seg of n.textPaths!) {
					if (typeof seg === 'string') out.push(seg);
					else out.push(escapeHTML(String(getValue(ctx, seg))));
				}
			};

		case 'FOR': {
			const [itemExpr, _, iterableExpr] = n.expression!.split(' ');
			const [itemName, indexName = 'IND'] = itemExpr!.split('|');
			const iterablePath = iterableExpr!.split('.');
			return (ctx, out) => {
				const arr = getValue(ctx, iterablePath);
				if (!Array.isArray(arr)) return;
				for (let i = 0; i < arr.length; i++) {
					const childCtx = { ...ctx, [itemName!]: arr[i], [indexName]: i };
					for (const fn of childFns) fn(childCtx, out);
				}
			};
		}

		case 'IF': {
			const childFnsIf = childFns.filter((_, idx) => n.children[idx]!.type !== 'ELSE');
			const elseNode = n.children.find(c => c.type === 'ELSE');
			const childFnsElse = elseNode ? elseNode.children.map(compileNode) : [];
			return (ctx, out) => {
				if (safeEvalExpr(ctx, n.expression!)) {
					for (const fn of childFnsIf) fn(ctx, out);
				} else {
					for (const fn of childFnsElse) fn(ctx, out);
				}
			};
		}

		case 'ELSE':
			return () => { };

		case 'HTML':
		default:
			return (ctx, out) => {
				const attrs = Object.entries(n.attrPaths!).map(([k, v]) => {
					const val = v.map(seg => (typeof seg === 'string' ? seg : String(getValue(ctx, seg)))).join('');
					return `${k}="${escapeHTML(val)}"`;
				}).join(' ');

				if (n.spec.end) out.push(`<${n.spec.begin}${attrs ? ' ' + attrs : ''}>`);
				else out.push(`<${n.spec.begin}${attrs ? ' ' + attrs : ''} />`);

				if (n.textPaths) {
					for (const seg of n.textPaths) {
						if (typeof seg === 'string') out.push(seg);
						else out.push(escapeHTML(String(getValue(ctx, seg))));
					}
				}

				for (const fn of childFns) fn(ctx, out);

				if (n.spec.end) out.push(`</${n.spec.end}>`);
			};
	}
}

export class Compiler {
	compile(node: Node): (context?: Record<string, any>) => string {
		const fn = compileNode(node.children[0]!);

		return (ctx: Record<string, any> = {}) => {
			const out: string[] = [];
			fn(ctx, out);
			return out.join('');
		};
	}
}