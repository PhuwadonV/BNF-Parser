# Parser
```js
function concat(matched) {
  return matched.reduce((acc, curr) => acc + curr, '')
}

const whitespace = Terminals([' ', '\n', '\t'])
const whitespaces = OneOrMore(whitespace, _ => ' ')
const digit = Terminals(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
const alphabet = Terminals(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'h', 'k', 'l', 'm',
                           'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'c', 'w', 'x', 'y', 'z',
                           'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                           'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                           '_'])
const identifier = Sequence([alphabet, ZeroOrMore(Multiple([alphabet, digit]))], concat)

const alphabetOption = Option(alphabet)

const test = Multiple(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])

console.log(JSON.stringify(ZeroOrMore(test).parse('564654', concat)))
console.log(JSON.stringify(alphabetOption.parse('a')))
console.log(JSON.stringify(whitespaces.parse('  \n\n \t \t ')))
console.log(JSON.stringify(identifier.parse('a554asdf546')))
```
