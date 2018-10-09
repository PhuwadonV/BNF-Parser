# Parser
[JsFiddle](https://jsfiddle.net/PhuwadonV/b5gfqyox/)
```js
const whitespace   = OneOf([' ', '\n', '\t'])
const whitespaces  = OneOrMore(whitespace, _ => '')
const digit        = OneOf(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
const alphabet     = OneOf(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'h', 'k', 'l', 'm',
                            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'c', 'w', 'x', 'y', 'z',
                            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])
const alphanumeric = OneOf([alphabet, digit])
const text         = OneOrMore(OneOf([alphanumeric, whitespace]), foldStr)
const open         = OneOf('<', x => '{')
const close        = OneOf('>', x => '}')
const tag          = Sequence([open, undefined, close], foldStr)
const tags         = OneOrMore(Sequence([Option(whitespaces), tag, Option(whitespaces)], foldStr), foldStr)
tag.rule[1]        = Option(OneOf([tags, text]))
```
