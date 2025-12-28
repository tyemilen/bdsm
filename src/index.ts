import { AttributeParser, Parser } from './parser';
import { Compiler } from './compiler';
import { Tokenizer } from './tokenizer';

import { attributes, tags } from './defaults';

export default {
	compile(source: string) {
		const tokenizer = new Tokenizer(source);
		const attrParser = new AttributeParser(attributes);
		const parser = new Parser(tags, attrParser);
		const ast = parser.parse(tokenizer.tokenize());

		return new Compiler().compile(ast);
	}
}