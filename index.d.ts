interface Tag {
	begin: string;
	end: string;
}

interface Attribute {
	name: string;
}

type AttributeMap = Record<string, string>;

type NodeType = 'ROOT' | 'HTML' | 'FOR' | 'IF' | 'ELSE' | 'TEXT';