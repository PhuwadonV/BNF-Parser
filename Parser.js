function identity(x) { return x }

function ParsedResult(matched, rest) {
  this.matched = matched
  this.rest = rest
}

function parseTerminal(text, terminal) {
  if(text.substring(0, terminal.length) === terminal)
    return new ParsedResult(terminal, text.substring(terminal.length))
  return undefined
}

function parseFromGenerator(text, onMatched = this.onMatched) {
  for(const result of this.internalParse(text, onMatched)) if(result.rest.length === 0) return result.matched
  return undefined
}

// RuleTerminal

function RuleTerminals(terminals) {
  this.terminals = terminals
}

function Terminals(terminals) {
  return new RuleTerminals(terminals)
}

RuleTerminals.prototype.isTerminals = true

RuleTerminals.prototype.internalParse = function(text) {
  for(const terminal of this.terminals)
  	if(text.substring(0, terminal.length) === terminal) 
      return new ParsedResult(terminal, text.substring(terminal.length))
  return undefined
}

RuleTerminals.prototype.parse = RuleTerminals.prototype.internalParse

// RuleOneOrMore

function RuleOneOrMore(rule, onMatched) {
  this.rule = rule
  this.onMatched = onMatched
}

function OneOrMore(terminals, onMatched = identity) {
  return new RuleOneOrMore(terminals, onMatched)
}

RuleOneOrMore.prototype.isTerminals = false

RuleOneOrMore.prototype.internalParse = function*(text, onMatched = this.onMatched, nodes = []) {
  if(typeof this.rule === 'string' || this.rule instanceof String) {
    do{
      const result = parseTerminal(text, rule)
      if(result === undefined) break;
      else {
        nodes.push(result.matched)
        text = result.rest
        yield new ParsedResult(onMatched(nodes), text)
      }
    }while(text !== '');
  }
  else if(this.rule.isTerminals) {
    do{
      const result = this.rule.internalParse(text)
      if(result === undefined) break;
      else {
        nodes.push(result.matched)
        text = result.rest
        yield new ParsedResult(onMatched(nodes), text)
      }
    }while(text !== '');
  }
  else {
    let success = false
    do{
      for(const result of this.rule.internalParse(text)) {
        if(result !== undefined) {
          success = true
          nodes.push(result.matched)
          text = result.rest
          yield new ParsedResult(onMatched(nodes), text)
        }
      }
      if(!success) break
      success = false
    }while(text !== '');
  }
}

RuleOneOrMore.prototype.parse = parseFromGenerator

// RuleZeroOrMore

function RuleZeroOrMore(rule, onMatched) {
  this.rule = rule
  this.onMatched = onMatched
}

function ZeroOrMore(terminals, onMatched = identity) {
  return new RuleZeroOrMore(terminals, onMatched)
}

RuleZeroOrMore.prototype.isTerminals = false

RuleZeroOrMore.prototype.internalParse = function*(text, onMatched = this.onMatched) {
  const nodes = []
  yield new ParsedResult(onMatched(nodes), text)
  for(const result of RuleOneOrMore.prototype.internalParse.call(this, text, onMatched, nodes)) yield result
}

RuleZeroOrMore.prototype.parse = parseFromGenerator

// RuleOption

function RuleOption(rule, onMatched) {
  this.rule = rule
  this.onMatched = onMatched
}

function Option(terminals, onMatched = identity) {
  return new RuleOption(terminals, onMatched)
}

RuleOption.prototype.isTerminals = false

RuleOption.prototype.internalParse = function*(text, onMatched = this.onMatched) {
  yield new ParsedResult(onMatched([]), text)
  if(typeof this.rule === 'string' || this.rule instanceof String) {
    const result = parseTerminal(text, this.rule)
    if(result !== undefined) yield new ParsedResult(onMatched(result.matched), result.rest)
  }
  else if(this.rule.isTerminals) {
    const result = this.rule.internalParse(text)
    if(result !== undefined) yield new ParsedResult(onMatched(result.matched), result.rest)
  }
  else {
    for( const result of this.rule.internalParse(text))
      if(result !== undefined) yield new ParsedResult(onMatched(result.matched), result.rest)
  }
}

RuleOption.prototype.parse = parseFromGenerator

// RuleMultiple

function RuleMultiple(rules, onMatched) {
  this.rules = rules
  this.onMatched = onMatched
}

function Multiple(terminals, onMatched = identity) {
  return new RuleMultiple(terminals, onMatched)
}

RuleMultiple.prototype.isTerminals = false

RuleMultiple.prototype.internalParse = function*(text, onMatched = this.onMatched) {
   for(const rule of this.rules) {
     if(typeof rule === 'string' || rule instanceof String) {
       const result = parseTerminal(text, rule)
       if(result !== undefined) yield new ParsedResult(onMatched(result.matched), result.rest)
     }
     else if(rule.isTerminals) {
       const result = rule.internalParse(text)
       if(result !== undefined) yield new ParsedResult(onMatched(result.matched), result.rest)
     }
     else {
       for(const result of rule.internalParse(text))
         if(result !== undefined) yield new ParsedResult(onMatched(result.matched), result.rest)
     }
   }
}

RuleMultiple.prototype.parse = parseFromGenerator

// RuleSequence

function RuleSequence(rules, onMatched) {
  this.rules = rules
  this.onMatched = onMatched
}

function Sequence(terminals, onMatched = identity) {
  return new RuleSequence(terminals, onMatched)
}

RuleSequence.prototype.isTerminals = false

RuleSequence.prototype.internalParse = function*(text, onMatched = this.onMatched) {
  const nodes = []
  let i = 0
  for(const rule of this.rules) {
    if(typeof rule === 'string' || rule instanceof String) {
      const result = parseTerminal(text, rule)
      if(result === undefined) return
      else {
        nodes.push(result.matched)
        text = result.rest
      }
    }
    else if(rule.isTerminals) {
      const result = rule.internalParse(text)
      if(result === undefined) return
      else {
        nodes.push(result.matched)
        text = result.rest
      }
    }
    else {
      for(const result of rule.internalParse(text)) {
        if(result === undefined) return
        else {
          yield new ParsedResult(onMatched(nodes.concat(result.matched)), result.rest)
          const nextSequence = Sequence(this.rules.slice(i + 1, this.rules.length))
          for(const nextResult of nextSequence.internalParse(result.rest, onMatched)) {
            if(result === undefined) return
            else yield new ParsedResult(onMatched(nodes.concat(result.matched).concat(nextResult.matched)), nextResult.rest)
          }
        }
      }
    }
    i++
  }
  yield new ParsedResult(onMatched(nodes), text)
}

RuleSequence.prototype.parse = parseFromGenerator