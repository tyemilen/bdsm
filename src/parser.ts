import type { TagRegistry, AttributeRegistry } from './registry';

const CLASS_RE = /(?:^|\s)(?:"([^"]+)"|'([^']+)')/;
const ID_RE = /#([^\s]+)/;
const ATTR_RE = /([a-zA-Z0-9_:.-]+)(?:"([^"]+)"|'([^']+)')/g;

export class Node {
	spec: Tag;
	type: NodeType = 'HTML';
	attributes: AttributeMap = {};
	children: Node[] = [];
	text?: string;
	expression?: string;

	textPaths?: Array<string[] | string>;
	attrPaths?: Record<string, Array<string[] | string>>;

	constructor(spec: Tag) {
		this.spec = spec;
	}

	addChild(node: Node): void {
		this.children.push(node);
	}
}

interface ParsedElement {
	tagName: string;
	attrs: AttributeMap;
	text?: string
};

export class AttributeParser {
	constructor(private registry: AttributeRegistry) { }

	parse(input: string): ParsedElement {
		const el: ParsedElement = {
			tagName: '',
			attrs: {},
			text: undefined
		};
		const len = input.length;
		let i = 0;

		let start = 0;
		while (i < len && input[i] !== ' ') i++;
		el.tagName = input.slice(start, i);

		while (i < len) {
			while (i < len && input[i] === ' ') i++;
			if (i >= len) break;

			const c = input[i];

			if (c === '#') {
				i++;
				start = i;
				while (i < len && input[i] !== ' ') i++;
				el.attrs.id = input.slice(start, i);
			} else if (c === '"' || c === "'") {
				const q = input[i++];
				start = i;
				while (i < len && input[i] !== q) i++;
				el.attrs.class = input.slice(start, i);
				i++;
			} else {
				start = i;
				while (i < len && input[i] !== ' ' && input[i] !== '"' && input[i] !== "'") i++;
				const name = input.slice(start, i);
				if (i < len && (input[i] === '"' || input[i] === "'")) {
					const q = input[i++];
					start = i;
					while (i < len && input[i] !== q) i++;
					el.attrs[this.registry.get(name).name] = input.slice(start, i) || 'true';
					i++;
				} else {
					el.text = (name + input.slice(i)).trim();
					break;
				}
			}
		}

		return el;
	}
}

export class Parser {
	constructor(private tags: TagRegistry, private attrParser: AttributeParser) { }

	parse(tokens: Generator<[number, string]>): Node {
		const root = new Node({ begin: '', end: '' });
		root.type = 'ROOT';

		const stack: Array<[number, Node]> = [[-1, root]];

		for (const [indent, raw] of tokens) {
			const trimmed = raw.trim();
			let node: Node;

			if (trimmed.startsWith('//')) continue;

			if (trimmed.startsWith('@for ')) {
				node = new Node({ begin: '', end: '' });
				node.type = 'FOR';
				node.expression = trimmed.slice(5).trim();
			} else if (trimmed.startsWith('@if ')) {
				node = new Node({ begin: '', end: '' });
				node.type = 'IF';
				node.expression = trimmed.slice(4).trim();
			} else if (trimmed.startsWith('@el')) {
				const elseNode = new Node({ begin: '', end: '' });
				elseNode.type = 'ELSE';
				for (let i = stack.length - 1; i >= 0; --i) {
					const [_, n] = stack[i]!;
					if (n.type === 'IF') {
						n.addChild(elseNode);
						stack.push([indent, elseNode]);
						break;
					}
				}
				continue;
			} else if (trimmed.startsWith('@')) {
				node = new Node({ begin: '', end: '' });
				node.type = 'TEXT';
				node.text = trimmed;
			} else {
				const parsed = this.attrParser.parse(raw);
				node = new Node(this.tags.get(parsed.tagName));
				node.attributes = parsed.attrs;
				node.text = parsed.text;
			}

			while (stack[stack.length - 1]![0] >= indent) {
				stack.pop();
			}

			stack[stack.length - 1]![1].addChild(node);
			stack.push([indent, node]);
		}

		return root;
	}
}