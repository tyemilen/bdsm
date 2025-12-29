# BDSM
Brain
Dead
Simple
Markup

```js
const html = `
!
	h
		t Cool website
		lk r"stylesheet" h"style.css"
		sc s"script.js"
	bb
		h1 >
			total @cart.length@
		d "cart"
			@for item of cart
				d "cart-item" @item.name@ - @IND@

		// or like this

		d "cart"
			@for item|i of cart
				d "cart-item unique-class-for-@item.name@" @item.name@ - @i@
		@if undefined
			p something real just happened
		@el
			p something not real just happened
			@if cart.length > 2
				p cart is over 2
			@el
				p cart is not over 2

		hdr #header
			div #header-container
				a h"/" Cool website
				a h"/login" t"_blank" Login (doesn't work (busy))
		mn
			i p"cool placeholder"
			b "button button-secondary" Click me pls
			p welcome to cool website >
				welcome to cool website
`;

const template = bdsm.compile(html);

console.log(template({
	cool: 'variable',
	cart: Array.from({ length: 20 }).map((_, i) => ({name: `item-${i * 2}`}))
}));
```

# Aliases

## Tags

| Alias  | Tag Name            |
| ------ | ------------------- |
| !      | html DOCTYPE="html" |
| h      | head                |
| t      | title               |
| bb     | body                |
| d      | div                 |
| s      | span                |
| p      | p                   |
| a      | a                   |
| ul     | ul                  |
| ol     | ol                  |
| li     | li                  |
| br     | br                  |
| hr     | hr                  |
| im     | img                 |
| lk     | link                |
| m      | meta                |
| sc     | script              |
| st     | style               |
| nv     | nav                 |
| hdr    | header              |
| ftr    | footer              |
| sn     | section             |
| ae     | article             |
| ade    | aside               |
| mn     | main                |
| fm     | form                |
| i      | input               |
| ta     | textarea            |
| b      | button              |
| sl     | select              |
| ot     | option              |
| ll     | label               |
| ft     | fieldset            |
| ld     | legend              |
| te     | table               |
| thd    | thead               |
| tby    | tbody               |
| tft    | tfoot               |
| tr     | tr                  |
| th     | th                  |
| td     | td                  |
| vd     | video               |
| ad     | audio               |
| cv     | canvas              |
| fe     | figure              |
| fcn    | figcaption          |
| bq     | blockquote          |
| q      | q                   |
| cte    | cite                |
| cd     | code                |
| pr     | pre                 |
| em     | em                  |
| str    | strong              |
| sml    | small               |
| italic | i                   |
| bdi    | bdi                 |
| bdo    | bdo                 |
| u      | u                   |
| sub    | sub                 |
| sup    | sup                 |
| mrk    | mark                |
| rby    | ruby                |
| rt     | rt                  |
| rp     | rp                  |
| wbr    | wbr                 |
| ifr    | iframe              |
| obj    | object              |
| prm    | param               |
| ebd    | embed               |
| src    | source              |
| trk    | track               |
| mtr    | meter               |
| prs    | progress            |
| dts    | details             |
| sum    | summary             |
| tmpl   | template            |
| slt    | slot                |
| pic    | picture             |
| aa     | area                |
| map    | map                 |

## Attributes

| Alias | Attribute Name  |
| ----- | --------------- |
| ti    | title           |
| hd    | hidden          |
| tab   | tabindex        |
| dr    | draggable       |
| coe   | contenteditable |
| sp    | spellcheck      |
| dir   | dir             |
| ln    | lang            |
| h     | href            |
| t     | target          |
| r     | rel             |
| dl    | download        |
| pg    | ping            |
| s     | src             |
| alt   | alt             |
| ty    | type            |
| ct    | crossorigin     |
| lp    | loop            |
| au    | autoplay        |
| co    | controls        |
| mt    | muted           |
| pst   | poster          |
| wd    | width           |
| hg    | height          |
| n     | name            |
| v     | value           |
| p     | placeholder     |
| rq    | required        |
| rd    | readonly        |
| ds    | disabled        |
| ck    | checked         |
| ml    | multiple        |
| mn    | min             |
| mx    | max             |
| st    | step            |
| ac    | accept          |
| fm    | form            |
| fa    | formaction      |
| fe    | formenctype     |
| fmth  | formmethod      |
| cs    | colspan         |
| rs    | rowspan         |
| dfr   | defer           |
| asc   | async           |
| ch    | charset         |
| cnt   | content         |
| http  | http-equiv      |
