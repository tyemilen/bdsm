export class Tokenizer {
	lines: string[];

	constructor(source: string) {
		this.lines = source
			.split('\n')
			.map(l => l.replace(/\r$/, ''))
			.filter(l => l.trim().length > 0);
	}

	*tokenize(): Generator<[number, string]> {
		let buffer = '';
		let bufferIndent = 0;
		let pending = false;

		for (const line of this.lines) {
			let indent = 0;
			while (line[indent] === '\t') ++indent;

			const content = line.slice(indent).trim();

			if (pending) {
				buffer += ' ' + content;
			} else {
				buffer = content;
				bufferIndent = indent;
			}

			if (content.endsWith('>')) {
				buffer = buffer.slice(0, -1).trim();
				pending = true;
			} else {
				yield [bufferIndent, buffer];
				pending = false;
				buffer = '';
			}
		}

		if (pending && buffer) {
			yield [bufferIndent, buffer];
		}
	}
}