//updated untill bogus repo commit a3350364ab

let interpreter = createInterpreter({
    title: "Bogus Interpreter",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "Bogus", href: "https://git.unix.lgbt/matthilde/bogus"},
    ],
    options: [
        {debug: "checkbox", text: "Debug: ", value: true},
    ],
    buttons: [
        {run: "Run"},
    ],
    code: "code here",
    output: "output here",
    highlight: function(code, append, style) {
        append(code);
    }
});

interpreter.onClick("run", async function() {
    await run(interpreter.code);
});

async function run(code) {
    let stack = [];
    let stackB = [];
    let lineNum = 1;
    let inpBuffer = "";
    let functions = {};

    let spice = rand_unsigned() & 255;

    let a, b, c, breakpoint; //used at runtime
    
    function rand_unsigned() {
        return Math.floor(Math.random()*(2**50)); //seems to generate good random numbers (Number.MAX_SAFE_INTEGER generated only odd numbers)
    }
    function fromBool(n) {
        if(n === true) {
            return rand_unsigned() + 1;
        } else if(n === false) {
            return 0 - rand_unsigned();
        }
    }
    function isFuncName(char) {
        let ch = char.charCodeAt(0);
        return (ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122) || (ch >= 48 && ch <= 57);
    }
    function err(str) {
        interpreter.err(`${str} (at line ${lineNum})`);
    }

    function findClosingParen(startParen) {
        let inset = 0;
        let i = startParen;
        while(true) {
            if(i >= code.length) err("Missing closing parenthesis )");
            if(code[i] === "(") inset++;
            else if(code[i] === ")") inset--;
            if(code[i] === ")" && inset === 0) return i;
            i++;
        }
    }
    function findOpeningParen(startParen) {
        let inset = 0;
        let i = startParen;
        while(true) {
            if(i < 0) err("Missing opening parenthesis (");
            if(code[i] === ")") inset++;
            else if(code[i] === "(") inset--;
            if(code[i] === "(" && inset === 0) return i;
            i--;
        }
    }

    let compiled = "";
    for(let i=0; i<code.length; i++) {

        if(code[i] === "\n") lineNum++;
        if(code[i].trim() === "") continue;

        if(code[i] === "d") { //dup
            compiled += `
            if(stack.length < 1) throw ("Stack underflow at dup (at line ${lineNum})");
            stack.push(stack.at(-1));
            `;
        } else if(code[i] === "s") { //swap
            compiled += `
            if(stack.length < 2) throw ("Stack underflow at swap (at line ${lineNum})");
            stack.push(stack.pop(), stack.pop());
            `;
        } else if(code[i] === "r") { //rot (bring 3rd to top)
            compiled += `
            if(stack.length < 3) throw ("Stack underflow at rot (at line ${lineNum})");
            [c, b, a] = [stack.pop(), stack.pop(), stack.pop()];
            stack.push(b, c, a);
            `;
        } else if(code[i] === "o") { //over (a b -- a b a)
            compiled += `
            if(stack.length < 2) throw ("Stack underflow at over (at line ${lineNum})");
            stack.push(stack.at(-2));
            `;
        } else if(code[i] === "y") { //yeet (pop/discard)
            compiled += `
            if(stack.length < 1) throw ("Stack underflow at yeet (at line ${lineNum})");
            stack.pop();
            `;
        } else if(code[i] === "R") { //random unsigned integer
            compiled += `
            stack.push(rand_unsigned());
            `;
        } else if(code[i] === "+") { //add
            compiled += `
            if(stack.length < 2) throw ("Stack underflow at add (at line ${lineNum})");
            stack.push(stack.pop() + stack.pop());
            `;
        } else if(code[i] === "-") { //sub
            compiled += `
            if(stack.length < 2) throw ("Stack underflow at sub (at line ${lineNum})");
            [a, b] = [stack.pop(), stack.pop()];
            stack.push(b - a);
            `;
        } else if(code[i] === "%") { //% (AND 255 or mod 256)
            compiled += `
            if(stack.length < 1) throw ("Stack underflow at % (at line ${lineNum})");
            stack.push(stack.pop() & 255);
            `;
        } else if(code[i] === ";") { //comment
            while(code[i] !== "\n" && i < code.length) i++;
            i--;
        } else if(code[i] === "?") { //if >0
            if(code[i+1] !== "(") err("? expected codeblock");
            let end = findClosingParen(i+1);
            compiled += `
            if(stack.length < 1) throw ("Stack underflow at ? (at line ${lineNum})");
            if(stack.pop() > 0) {
            `;
            i++;
        } else if(code[i] === "!") { //while >0
            if(code[i+1] !== "(") err("! expected codeblock");
            let end = findClosingParen(i+1);
            compiled += `
            if(stack.length < 1) throw ("Stack underflow at ! (at line ${lineNum})");
            while(stack.pop() > 0) {
            `;
            i++;
        } else if(code[i] === "~") { //logical NOT
            compiled += `
            if(stack.length < 1) throw ("Stack underflow at NOT (at line ${lineNum})");
            a = stack.pop();
            stack.push(fromBool(!(a > 0)));
            `;
        } else if(code[i] === "&") { //logical AND
            compiled += `
            if(stack.length < 2) throw ("Stack underflow at AND (at line ${lineNum})");
            [a, b] = [stack.pop(), stack.pop()];
            stack.push(fromBool((a > 0) && (b > 0)));
            `;
        } else if(code[i] === "|") { //logical OR
            compiled += `
            if(stack.length < 2) throw ("Stack underflow at OR (at line ${lineNum})");
            [a, b] = [stack.pop(), stack.pop()];
            stack.push(fromBool((a > 0) || (b > 0)));
            `;
        } else if(code[i] === ".") { //print
            compiled += `
            if(stack.length < 1) throw ("Stack underflow at print (at line ${lineNum})");
            interpreter.output(String.fromCharCode(stack.pop() & 255));
            `;
        } else if(code[i] === ",") { //input
            compiled += `
            if(inpBuffer === "\0") {
                stack.push(0);
            } else {
                if(inpBuffer.length <= 0) {
                    let inp = prompt("Input line:");
                    if(inp === null) {
                        inpBuffer = "\0";
                    } else {
                        inpBuffer = inp+"\n";
                    }
                }
                stack.push(inpBuffer.charCodeAt(0)+spice);
                inpBuffer = inpBuffer.slice(1);
            }
            `;
        } else if(code[i] === ")") {
            let start = findOpeningParen(i);
            if(code[start-1] === "!") {
                compiled += "\n}\n";
            } else if(code[start-1] === "?") {
                compiled += "\n}\n";
            } else if(isFuncName(code[start-1])) {
                compiled += "\n}\n";
            } else err("Invalid use of parenthesis )");
        } else if(code[i] === "(") {
            err("Invalid use of parenthesis (");
        } else if(code[i] === ">") { //> to B
            compiled += `
            if(stack.length < 1) throw ("Stack underflow at > (at line ${lineNum})");
            stackB.push(stack.pop());
            `;
        } else if(code[i] === "<") { //< to A
            compiled += `
            if(stackB.length < 1) throw ("Stack underflow at < (at line ${lineNum})");
            stack.push(stackB.pop());
            `;
        } else if(code[i] === ":") { //: copy to A
            compiled += `
            if(stackB.length < 1) throw ("Stack underflow at : (at line ${lineNum})");
            stack.push(stackB.at(-1));
            `;
        } else if(code[i] === "`") {
            let next = code[i+1];
            if(next === "b") {
                if(interpreter.option("debug")) {
                    compiled += `
                    breakpoint = "\\n";
                    breakpoint += "== Breakpoint line=${lineNum} spice=${spice}\\n";
                    breakpoint += "== stack a: ["+stack.join(",")+"]\\n";
                    breakpoint += "== stack b: ["+stackB.join(",")+"]\\n";
                    interpreter.output(breakpoint);
                    `;
                }
            } else if(next === "d") {
                compiled += `
                if(stack.length < 1) throw ("Stack underflow at \`d (at line ${lineNum})");
                interpreter.output(stack.pop());
                `;
            } else err(`Invalid debugger command`);
            i++; //skip
        } else if(code[i] === "@") { //TMP!!!!!
            compiled += `
            stack.push(1);
            `;
        } else {
            if(isFuncName(code[i])) {
                let name = code[i];
                if(code[i+1] === "(") { //function definition
                    let start = i+1;
                    let end = findClosingParen(start);
                    compiled += `
                    functions["${name}"] = function() {
                    `;
                    i++;
                } else { //function call
                    compiled += `
                    if(!functions["${name}"]) throw ("Undefined function: '${name}' (at line ${lineNum})");
                    functions["${name}"]();
                    `;
                }
            } else err(`Invalid instruction: '${code[i]}'`);
        }
    }
    
    console.log(compiled);
    
    try {
        eval(compiled);
    } catch(e) {
        console.log(e);
        interpreter.err("Error: "+e);
    }
}