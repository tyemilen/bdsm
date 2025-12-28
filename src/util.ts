export const TAG = (begin: string, end?: string | boolean): Tag => ({
	begin,
	end: end === true ? '' : (end || begin)
});
export const ATTR = (name: string): Attribute => ({ name });