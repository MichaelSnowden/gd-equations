function integrationTest() {
    var equations = getEquations(true);
    // var str = "";
    // for (var i = 0; i < equations.length; ++i) {
    //   str += equations[i];
    // }
    var tokenizedEquations = [];
    for (var i = 0; i < equations.length; ++i) {
        tokenizedEquations.push(tokenize(equations[i]));
    }

    var parsedEquations = [];
    var str = "";
    for (var i = 0; i < equations.length; ++i) {
        parsedEquations.push(parse(tokenize(equations[i])));
        str += parse(tokenize(equations[i]));
        str += "\n";
    }

    return;
}

function tokenize(text) {
    var tokens = [];
    var i = 0;
    var c;

    function pop() {
        var old = text[i++];
        c = new Character(peek());
        return old;
    };

    function peek() {
        return text[i];
    };

    function token() {
        if (i >= text.length) {
            return tokens;
        }
        var type = undefined;
        var value = "";
        c = new Character(peek());

        function digit() {
            if (c.is("digit")) {
                value += pop();
                digit();
            }
        }

        function character() {
            if (c.is("alphabetic")) {
                value += pop();
                character();
            }
        }

        if (c.is("fluff")) {
            pop();
            token();
        } else if (c.is("digit")) {
            type = "Number";
            digit();
            if (peek() == ".") {
                value += pop();
                digit();
            }
            tokens.push({type: type, value: parseFloat(value)});
            token();
        } else if(c.is("alphabetic")) {
            type = "Identifier";
            character();
            digit();
            tokens.push({type: type, value: value});
            token();
        } else if(c.is("punctuator")) {
            tokens.push({type: "Punctuator", value: pop()});
            token();
        }
    }

    token();
    return tokens;
}

function Character(c) {
    var type;
    if ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(c) != -1) {
        type = "alphabetic";
    } else if (" \n\r\t".indexOf(c) != -1) {
        type = "fluff";
    } else if ("0123456789".indexOf(c) != -1) {
        type = "digit";
    } else if ("(,)+-*/^='".indexOf(c) != -1) {
        type = "punctuator";
    } else {
        type = "unknown";
    }
    this.type = type;
    this.value = c;
}

Character.prototype.is = function(type) {
    return this.type == type;
}

function parse(tokens) {
    var i = 0;

    return Binary(4);

    function empty() {
        return i >= tokens.length;
    }

    function peek() {
        return tokens[i];
    }

    function pop() {
        return tokens[i++];
    }

    function expect(what) {
        if (pop().value == what) {
            return true;
        } else {
            // TODO: handle error
        }
    }

    function Binary(pre) {
        if (pre == 0) return Primary();
        var exp = Binary(pre - 1);
        while (!empty() && Operator.defined(peek().value) && Operator.get(peek().value).precedence == pre) {
            var func = pop().value;
            var args = [exp, Binary(pre - 1)];
            exp = {
                func: func,
                args: args,
                type: "Function",
                leaf: args == undefined
            }
        }
        return exp;
    }

    function Primary() {
        if (peek().value == "-" || peek().value == "neg" || peek().value == "not") {
            return Unary();
        }
        if (peek().value == "(") {
            return Parenthetical();
        }
        if (peek().type == "Number") {
            return Number();
        }
        if (peek().type == "Identifier" || peek().func == "subscript") {
            var identifier = Identifier();
            if (empty()) {
                identifier.type = "Variable";
                return identifier;
            }
            if (peek().value == "(") {
                var args = Arguments();
                return {
                    func: identifier.value,
                    args: args,
                    type: "Function",
                    leaf: args == undefined
                }
            }
            identifier.type = "Variable";
            return identifier;
        }
        return undefined;
    }

    function Unary() {
        var func = pop().value == "not" ? "not" : "neg";
        var right = Primary();
        return {
            func: func,
            args: [right],
            type: "Function",
            leaf: false
        }
    }

    function Parenthetical() {
        pop();
        var exp = Binary(3);
        expect(")");
        return exp;
    }

    function Number() {
        return {
            value: pop().value,
            type: "Number",
            leaf: true
        }
    }

    function Function() {
        var identifier = Identifier();
        if (!empty() && peek().value == "(") {
            var args = Arguments();
            return {
                func: identifier.value,
                type: "Function",
                leaf: args == undefined
            }
        }
        return identifier;
    }

    function Identifier() {
        var value = "";
        while (!empty() && (peek().type == "Identifier" || peek().value == "subscript" || peek().value == "'")) {
            if (peek().value == "subscript") {
                pop();
                var args = Arguments();
                value += args[0] + "_" + args[1];
            } else if (peek().value =="'") {
                pop();
                value += "'";
            } else {
                value += pop().value;
            }
        }
        return {
            value: value,
            type: "Identifier",
            leaf: true
        }
    }

    function Arguments() {
        pop();
        var expression = Binary(3);
        var args = [expression];
        while(peek().value == ",") {
            pop();
            expression = Binary(3);
            args.push(expression);
        }
        expect(")");
        return args;
    }
}

function Operator(func, precedence) {
    this.func = func;
    this.precedence = precedence;
}
Operator.operators = {};
Operator.define = function(keys, func, precedence) {
    var operator = new Operator(func, precedence);
    for (var i = 0; i < keys.length; ++i) {
        Operator.operators[keys[i]] = operator;
    }
}
Operator.define(["^", "pow"], "pow", 1);
Operator.define(["*", "x", "mul"], "mul", 2);
Operator.define(["/", "div"], "div", 2);
Operator.define(["&", "&&", "and", "wedge"], "and", 2);
Operator.define(["+", "add"], "add", 3);
Operator.define(["-", "sub"], "sub", 3);
Operator.define(["|", "||", "or", "vee", "or"], "or", 3);
Operator.define(["=", "assign"], "assign", 4);

Operator.get = function(key) {
    return Operator.operators[key.toLowerCase()];
}
Operator.defined = function(key) {
    return Operator.operators[key.toLowerCase()] != undefined;
}