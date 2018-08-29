// API
function OneOf(rule, onMatched) {
  return new OneOfClass(rule, onMatched)
}

function Sequence(rule, onMatched) {
  return new SequenceClass(rule, onMatched)
}

function Option(rule, onMatched) {
  return new OptionClass(rule, onMatched)
}

function ZeroOrMore(rule, onMatched) {
  return new ZeroOrMoreClass(rule, onMatched)
}

function OneOrMore(rule, onMatched) {
  return new OneOrMoreClass(rule, onMatched)
}

// Implement
function MatchedPrefix(matched, rest) {
  this.matched = matched
  this.rest = rest
}

function OneOfClass(rule, onMatched) {
  this.rule = rule
  if(onMatched !== undefined) this.onMatched = onMatched
}

function SequenceClass(rule, onMatched) {
  OneOfClass.call(this, rule, onMatched)
}

function OptionClass(rule, onMatched) {
  OneOfClass.call(this, rule, onMatched)
}

function ZeroOrMoreClass(rule, onMatched) {
  OneOfClass.call(this, rule, onMatched)
}

function OneOrMoreClass(rule, onMatched) {
  OneOfClass.call(this, rule, onMatched)
}

OneOfClass.prototype.onMatchedFx = function(matched, ...args) {
  return this.onMatched === undefined ? matched : this.onMatched(matched, ...args)
}

OneOfClass.prototype.parse = function(text) {
  for(const result of this.parsePrefix(text)) if(result.rest.length === 0) return result.matched
}

SequenceClass.prototype.onMatchedFx   = OneOfClass.prototype.onMatchedFx
OptionClass.prototype.onMatchedFx     = OneOfClass.prototype.onMatchedFx
ZeroOrMoreClass.prototype.onMatchedFx = OneOfClass.prototype.onMatchedFx
OneOrMoreClass.prototype.onMatchedFx  = OneOfClass.prototype.onMatchedFx
SequenceClass.prototype.parse         = OneOfClass.prototype.parse
OptionClass.prototype.parse           = OneOfClass.prototype.parse
ZeroOrMoreClass.prototype.parse       = OneOfClass.prototype.parse
OneOrMoreClass.prototype.parse        = OneOfClass.prototype.parse

OneOfClass.prototype.parsePrefix = function*(text) {
  for(const rule of this.rule) {
    if(typeof rule === 'string' || rule instanceof String) {
      if(text.substring(0, rule.length) === rule)
        yield new MatchedPrefix(this.onMatchedFx(rule), text.substring(rule.length))
    }
    else {
      for(const result of rule.parsePrefix(text))
        yield new MatchedPrefix(this.onMatchedFx(result.matched), result.rest)
    }
  }
}

OptionClass.prototype.parsePrefix = function*(text) {
  yield new MatchedPrefix([], text)
  if(typeof this.rule === 'string' || this.rule instanceof String) {
    if(text.substring(0, this.rule.length) === this.rule)
      yield new MatchedPrefix(this.onMatchedFx(this.rule), text.substring(this.rule.length))
  }
  else {
    for(const result of this.rule.parsePrefix(text))
      yield new MatchedPrefix(this.onMatchedFx(result.matched), result.rest)
  }
}

SequenceClass.prototype.parsePrefix = function*(text, nodes = [], index = 0) {
  for(let i = index; i < this.rule.length; i++) {
    const rule = this.rule[i]
    if(typeof rule === 'string' || rule instanceof String) {
      if(text.substring(0, rule.length) === rule) {
        nodes.push(rule)
        text = text.substring(rule.length)
      }
      else return
    }
    else {
      for(const result of rule.parsePrefix(text)) {
        for(const nextResult of this.parsePrefix(result.rest, nodes.concat(result.matched), i + 1))
          yield new MatchedPrefix(this.onMatchedFx(nextResult.matched), nextResult.rest)
      }
      return
    }
  }
  yield new MatchedPrefix(this.onMatchedFx(nodes), text)
}

OneOrMoreClass.prototype.parsePrefix = function*(text, nodes = []) {
  if(typeof this.rule === 'string' || this.rule instanceof String) {
    while(text.length !== 0 && text.substring(0, this.rule.length) === this.rule) {
      nodes.push(this.rule)
      text = text.substring(this.rule.length)
      yield new MatchedPrefix(this.onMatchedFx(nodes), text)
    }
  }
  else {
    for(const result of this.rule.parsePrefix(text)) {
      const buff = nodes.concat(result.matched)
      yield new MatchedPrefix(this.onMatchedFx(buff), result.rest)
      for(const nextResult of this.parsePrefix(result.rest, buff))
        yield new MatchedPrefix(this.onMatchedFx(nextResult.matched), nextResult.rest)
    }
  }
}

ZeroOrMoreClass.prototype.parsePrefix = function*(text, nodes) {
  if(nodes === undefined) {
    const nodes = []
    yield new MatchedPrefix(nodes, text)
    for(const result of OneOrMoreClass.prototype.parsePrefix.call(this, text, nodes)) yield result
  }
  else for(const result of OneOrMoreClass.prototype.parsePrefix.call(this, text, nodes)) yield result
}

// Helper function
function fold(reducer, initialValue) {
  return (matched) => matched.reduce !== undefined ? 
    matched.reduce(reducer, initialValue) :
    matched
}

const foldStr = fold((a, c) => a + c, '')