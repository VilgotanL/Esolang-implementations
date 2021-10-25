//updated untill bogus repo commit a3350364ab

let interpreter = createInterpreter({
    title: "Bogus Interpreter",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "Bogus", href: "https://git.unix.lgbt/matthilde/bogus"},
    ],
    options: [
        {slow: "checkbox", text: "Slow: ", value: false},
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
    let callStack = [];

    let spice = rand_unsigned() & 255;

    function push(...args) {
        stack.push(...args);
    }
    function pop() {
        assertLen(1, `Stack underflow!`);
        return stack.pop();
    }
    function pushB(...args) {
        stackB.push(...args);
    }
    function popB() {
        assertLenB(1, `Stack B underflow!`);
        return stackB.pop();
    }
    function rand_unsigned() {
        return Math.floor(Math.random()*(2**50)); //seems to generate good random numbers (Number.MAX_SAFE_INTEGER generated only odd numbers)
    }
    function bool(n) {
        if(n !== 0) {
            return rand_unsigned() + 1;
        } else {
            return 0 - rand_unsigned();
        }
    }
    function isFuncName(char) {
        let ch = char.charCodeAt(0);
        return (ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122) || (ch >= 48 && ch <= 57);
    }
    function assertLen(n, str) {
        if(stack.length < n) err(str);
    }
    function assertLenB(n, str) {
        if(stackB.length < n) err(str);
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

    let iters = 0;
    for(let i=0; i<code.length; i++) {
        interpreter.clearHighlights();
        interpreter.highlight(i, i+1, "background-color: lawngreen;");
        
        if(code[i] === "\n") lineNum++;
        if(code[i].trim() === "") continue;

        if(code[i] === "d") { //dup
            assertLen(1, `Stack underflow at dup`);
            push(stack.at(-1));
        } else if(code[i] === "s") { //swap
            assertLen(2, `Stack underflow at swap`);
            let [a, b] = [pop(), pop()];
            push(a, b);
        } else if(code[i] === "r") { //rot (bring 3rd to top)
            assertLen(3, `Stack underflow at rot`);
            let a = stack.at(-3);
            a.splice(stack.length-3, 1);
            push(a);
        } else if(code[i] === "o") { //over (a b -- a b a)
            assertLen(2, `Stack underflow at over`);
            let a = stack.at(-2);
            push(a);
        } else if(code[i] === "y") { //yeet (pop/discard)
            assertLen(1, `Stack underflow at yeet`);
            pop();
        } else if(code[i] === "R") { //random unsigned integer
            push(rand_unsigned());
        } else if(code[i] === "+") { //add
            assertLen(2, `Stack underflow at add`);
            push(pop() + pop());
        } else if(code[i] === "-") { //sub
            assertLen(2, `Stack underflow at sub (-)`);
            let [a, b] = [pop(), pop()];
            push(b - a);
        } else if(code[i] === "%") { //% (AND 255 or mod 256)
            assertLen(1, `Stack underflow at %`);
            push(pop() & 255);
        } else if(code[i] === ";") { //comment
            while(code[i] !== "\n" && i < code.length) i++;
        } else if(code[i] === "?") { //if >0
            if(code[i+1] !== "(") err("? expected codeblock");
            let end = findClosingParen(i+1);
            if(pop() > 0) {
                i++; //skip (
            } else {
                i = end; //go to )
            }
        } else if(code[i] === "!") { //while >0
            if(code[i+1] !== "(") err("! expected codeblock");
            let end = findClosingParen(i+1);
            if(pop() > 0) {
                i++; //skip (
            } else {
                i = end; //go to )
            }
        } else if(code[i] === "~") { //logical NOT
            assertLen(1, `Stack underflow at logical NOT`);
            push(bool(!pop()));
        } else if(code[i] === "&") { //logical AND
            assertLen(2, `Stack underflow at logical AND`);
            push(bool(pop() && pop()));
        } else if(code[i] === "|") { //logical OR
            assertLen(2, `Stack underflow at logical OR`);
            push(bool(pop() || pop()));
        } else if(code[i] === ".") { //print
            assertLen(1, `Stack underflow at print`);
            interpreter.output(String.fromCharCode(pop() & 255));
        } else if(code[i] === ",") { //input
            if(inpBuffer === "\0") {
                push(0);
            } else {
                if(inpBuffer.length <= 0) {
                    let inp = prompt("Input line:");
                    if(inp === null) {
                        inpBuffer = "\0";
                    } else {
                        inpBuffer = inp+"\n";
                    }
                }
                push(inpBuffer.charCodeAt(0)+spice);
                inpBuffer = inpBuffer.slice(1);
            }
        } else if(code[i] === ")") {
            let start = findOpeningParen(i);
            if(code[start-1] === "!") {
                i = start-2;
            } else if(code[start-1] === "?") {
                //nop
            } else if(isFuncName(code[start-1])) {
                if(callStack.length <= 0) err("internal error callstack size < 0");
                i = callStack.pop();
            } else err("Invalid use of parenthesis )");
        } else if(code[i] === "(") {
            err("Invalid use of parenthesis (");
        } else if(code[i] === ">") { //> to B
            assertLen(1, `Stack underflow at >`);
            pushB(pop());
        } else if(code[i] === "<") { //< to A
            assertLenB(1, `Stack underflow at <`);
            push(popB());
        } else if(code[i] === ":") { //: copy to A
            assertLenB(1, `Stack underflow at :`);
            push(stackB.at(-1));
        } else if(code[i] === "`") {
            let next = code[i+1];
            if(next === "b") {
                let breakpoint = `\n== Breakpoint line=${lineNum} spice=${spice}\n== stack a: [${stack.join(",")}]\n== stack b: [${stackB.join(",")}]\n`;
                if(interpreter.option("debug")) interpreter.output(breakpoint);
            } else if(next === "d") {
                assertLen(1, `Stack underflow at \`d`);
                interpreter.output(pop());
            } else err(`Invalid debugger command`);
            i++; //skip
        } else {
            if(isFuncName(code[i])) {
                let name = code[i];
                if(code[i+1] === "(") { //function definition
                    let start = i+1;
                    let end = findClosingParen(start);
                    i = end;
                    functions[name] = start;
                } else { //function call
                    if(!functions[name]) err(`Undefined function: '${name}'`);
                    let start = functions[name];
                    callStack.push(i);
                    i = start;
                    if(callStack.length > 1000) err(`Call stack exceeded at running function '${name}'`);
                }
            } else err(`Invalid instruction: '${code[i]}'`);
        }

        
        if(interpreter.option("slow")) await sleep(100);
        iters++;
        if(iters >= 100) {
            iters = 0;
            await sleep(0);
        }
    }
    interpreter.clearHighlights();
}