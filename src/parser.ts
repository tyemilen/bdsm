import type { TagRegistry, AttributeRegistry } from './registry';

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

export class AttributeParser {
	constructor(private registry: AttributeRegistry) { }

	parse(input: string): { tagName: string; attrs: AttributeMap; text?: string } {
		const attrs: AttributeMap = {};
		let rest = input.trim();

		const [tagName, ...tail] = rest.split(' ');
		rest = tail.join(' ');

		const classMatch = rest.match(/(?:^|\s)(?:"([^"]+)"|'([^']+)')/);
		if (classMatch && classMatch[1]) {
			attrs['class'] = classMatch[1];
			rest = rest.replace(classMatch[0], '');
		}

		const idMatch = rest.match(/#([^\s]+)/);
		if (idMatch && idMatch[1]) {
			attrs['id'] = idMatch[1];
			rest = rest.replace(idMatch[0], '');
		}

		const attrRegex = /([a-zA-Z0-9_:.-]+)(?:"([^"]+)"|'([^']+)')/g;
		let m: RegExpExecArray | null;
		while ((m = attrRegex.exec(rest))) {
			if (!m[1]) continue;
			const value = m[2] || m[3] || 'true';

			const hyphenated = m[1].split('-');
			const isHyperhenated = hyphenated.length > 1;

			let spec = isHyperhenated ? this.registry.get(`${hyphenated[0]}-`) : this.registry.get(m[1]);

			if (isHyperhenated) {
				const replace = spec.name.endsWith('*');
				if (replace) attrs[`${spec.name.slice(0, -1)}${hyphenated[1]}`] = value;
				else attrs[spec.name] = value;
			} else {
				attrs[spec.name] = value;
			}
		}

		rest = rest.replace(attrRegex, '').trim();
		const text = rest.length ? rest : undefined;
		return { tagName: tagName!, attrs, text };
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