export class TagRegistry {
	private tags: Map<string, Tag>;

	constructor(defaults: Record<string, Tag>) {
		this.tags = new Map<string, Tag>(Object.entries(defaults));
	}

	register(source: string, begin: string, end: string): void {
		this.tags.set(source, { begin, end });
	}

	get(source: string): Tag {
		return this.tags.get(source) || {begin: source, end: source};
	}
}

export class AttributeRegistry {
	private attrs: Map<string, Attribute>;

	constructor(defaults: Record<string, Attribute>) {
		this.attrs = new Map<string, Attribute>(Object.entries(defaults));
	}

	register(alias: string, real: string): void {
		this.attrs.set(alias, { name: real });
	}

	get(alias: string): Attribute {
		return this.attrs.get(alias) || {name: alias};
	}

	has(alias: string): boolean {
		return this.attrs.has(alias);
	}
}