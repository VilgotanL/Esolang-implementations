let interpreter = createInterpreter({
    title: "Lambda Calculus Simple & Lambda Parens",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
    ],
    options: [
        {useless: "checkbox", text: "Useless checkbox: ", value: true},
    ],
    buttons: [
        {runSimple: "Run Simple"},
        {runParens: "Run Parens"},
        {compileSimple: "Compile Simple => Parens"},
    ],
    code: `T = x.y.x
F = x.y.y
id = x.x
NOT = x.x F T
AND = x.y.x (y T F) F
OR = x.y.x T (y T F)\n\nid T`,
    output: "output here",
    highlight: function(code, append, style) {
        append(code);
    },
});

interpreter.onClick("runSimple", async function() {
    await runParens(compileSimple(interpreter.code));
});
interpreter.onClick("runParens", async function() {
    await runParens(interpreter.code);
});
interpreter.onClick("compileSimple", async function() {
    interpreter.output(compileSimple(interpreter.code));
});

async function runParens(code) {
    code = code.trim();

    function error(str, start) {
        throw new Error(`${str} at ${code.slice(0, start).split("\n").length}:${code.slice(0, start).split("\n").at(-1).length+1}`);
    }
    function parse_ident(start) {
        if(!code.slice(start).startsWith("()")) error("Invalid identifier", start);
        let n = 0;
        while(code.slice(start).startsWith("()")) {
            start += 2;
            n++;
        }
        return [[n], start];
    }
    function parse_func(start) {
        let [[argN], argEnd] = parse_ident(start);
        if(code[argEnd] !== "(") error("Invalid function", start);
        let [expr, exprEnd] = parse_expr(argEnd+1);
        if(code[exprEnd] !== ")") error("Invalid function", start);
        return [[argN, expr], exprEnd+1];
    }
    function parse_call(start) {
        if(code[start] !== "(") error("Invalid function call", start);
        let [func, funcEnd] = parse_expr(start+1);
        if(code[funcEnd] !== ")") error("Invalid function call", funcEnd);
        if(code[funcEnd+1] !== "(") error("Invalid function call", funcEnd);
        let [expr, exprEnd] = parse_expr(funcEnd+2);
        if(code[exprEnd] !== ")") error("Invalid function call", funcEnd);

        return [[func, expr], exprEnd+1];
    }
    function parse_expr(start) {
        try { return parse_func(start); }
        catch(e) {}
        try { return parse_call(start); }
        catch(e) {}
        try { return parse_ident(start); }
        catch(e) {}
        error("Unknown expression", start);
    }

    let expr;
    try {
        let exprEnd;
        [expr, exprEnd] = parse_expr(0);
        console.log(expr);
        if(exprEnd !== code.length) error("Expected EOF", exprEnd);
    } catch(e) {
        interpreter.err(e.message);
    }

    // Validate variables
    function validate(expr, variables) {
        if(expr.length === 1) {
            if(!variables.has(expr[0])) interpreter.err("Unknown variable: " + "()".repeat(expr[0]));
        } else if(typeof expr[0] === "number") {
            variables.add(expr[0]);
            validate(expr[1], variables);
            variables.delete(expr[0]);
        } else {
            validate(expr[0], variables);
            validate(expr[1], variables);
        }
    }
    validate(expr, new Set());


    // Execute
    function stringify(expr) {
        if(expr.length === 1) return "()".repeat(expr[0]);
        else if(typeof expr[0] === "number") return "()".repeat(expr[0]) + "(" + stringify(expr[1]) + ")";
        else return "(" + stringify(expr[0]) + ")(" + stringify(expr[1]) + ")";
    }

    interpreter.output("Code: " + stringify(expr) + "\n");

    async function execute(expr, variables) { // Lazy evaluation is very important for things such as the Y combinator
        if(expr.length === 1) return await variables[expr[0].toString()]();
        else if(typeof expr[0] === "number") return expr;
        else {
            await new Promise(res => requestAnimationFrame(res));
            let func = await execute(expr[0], variables);
            let newVariables = Object.assign({}, variables);
            newVariables[func[0].toString()] = async () => await execute(expr[1], variables);
            let result = await execute(func[1], newVariables);
            return result;
        };
    }

    interpreter.output("Output: " + stringify(await execute(expr, {})));
}



function compileSimple(code) {
    function error(str, line) {
        interpreter.err(`${str} at line ${line}`);
    }
    function isValidIdent(str) {
        return str.length > 0 && str.split("").every(char => "0123456789_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(char)) && !str.startsWith("0123456789");
    }

    function Definition(lineNum, name, exprStr) {
        this.lineNum = lineNum;
        this.name = name;
        this.exprStr = exprStr;
        this.expr = null;
        this.usedDefs = null;
    }

    const lines = code.split("\n");
    const definitions = new Map();
    let initialExprStr;
    let initialExprLineNum;
    for(let i=0; i<lines.length; i++) {
        const lineNum = i+1;
        const line = lines[i].trim();

        if(line.length === 0 || line.startsWith("#")) continue;
        if(line.includes("=")) {
            let parts = line.split("=");
            if(parts.length > 2) error("Invalid definition", lineNum);
            let name = parts[0].trim();
            if(!isValidIdent(name)) error("Invalid definition name", lineNum);
            let expr = parts[1].trim();
            definitions.set(name, new Definition(lineNum, name, expr));
        } else {
            if(initialExprStr) error("Duplicate initial expression", lineNum);
            initialExprStr = line.trim();
            initialExprLineNum = lineNum;
        }
    }
    if(!initialExprStr) error("No initial expression", lines.length);


    function ExprVar(name) { this.name = name }
    function ExprFunc(argName, expr) { this.argName = argName; this.expr = expr; }
    function ExprCall(funcExpr, expr) { this.funcExpr = funcExpr; this.expr = expr; }
    function parseExpr(code) {
        function error(str) {
            throw new Error(str);
        }
        const usedDefs = new Set();

        function parse_ident(start) {
            if(!isValidIdent(code[start])) error("Invalid identifier");
            let str = "";
            while(start < code.length && isValidIdent(code[start])) {
                str += code[start];
                start++;
            }
            return [str, start];
        }
        function parse_var(start) {
            let [str, end] = parse_ident(start);
            return [new ExprVar(str), end];
        }
        function parse_func(start) {
            error("TODO");
        }
        function parse_call(start) {
            error("TODO");
        }
        function parse_group(start) {
            if(code[start] !== "(") error("Invalid grouping using parentheses");
            let [expr, exprEnd] = parse_expr(start+1);
            if(code[exprEnd] !== ")") error("Invalid grouping using parentheses");
            return [expr, exprEnd+1];
        }
        function parse_expr(start) {
            try { return parse_func(start); }
            catch(e) {}
            try { return parse_call(start); }
            catch(e) {}
            try { return parse_var(start); }
            catch(e) {}
            try { return parse_group(start); }
            catch(e) {}
            error("Invalid expression");
        }

        let [expr, exprEnd] = parse_expr(0);
        if(exprEnd !== code.length) error("Expected EOF");
        return [expr, usedDefs];
    }
    let initialExpr;
    try { [initialExpr] = parseExpr(initialExprStr);
    } catch(e) { error(e.message, initialExprLineNum); }
    for(let [name, definition] of definitions.entries()) {
        try {
            [definition.expr, definition.usedDefs] = parseExpr(definition.exprStr);
        } catch(e) {
            error(e.message, definition.lineNum);
        }
    }


    // Remove unused definitions
    // Todo


    console.log(definitions, initialExpr);
}