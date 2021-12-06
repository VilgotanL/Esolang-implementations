let interpreter = createInterpreter({
    title: "Length Experimental Interpreter",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "Length esolang by Nailuj29", href: "https://esolangs.org/wiki/Length"},
    ],
    options: [
        {slow: "checkbox", text: "Slow: ", value: false},
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


const instrs = [[9, "inp"], [10, "add"], [11, "sub"], [12, "dup"], [13, "cond"], [14, "gotou"], [15, "outn"], [16, "outa"], [17, "rol"], [18, "swap"], [20, "mul"], [21, "div"], [23, "pop"], [24, "gotos"], [25, "push"], [27, "ror"]];    

async function run(code) {
    let program = code.split("\n").map(line => line.length);
    let stack = [];
    let lineNo = 0;

    
    function instr(val) {
        if(typeof val === "number") return instrs.find(([num, _]) => num === val)?.[1] ?? null;
        else return instrs.find(([_, instr]) => instr === val)?.[0] ?? null;
    }
    function push(val) {
        stack.push(val);
    }
    function pop() {
        if(stack.length === 0) interpreter.err(`Stack underflow at line ${lineNo}`);
        return stack.pop();
    }


    let inpBuffer = "";


    let iters = 0;
    for(let i=0; i<program.length; i++) {
        if(!instrs.find(([num, _]) => num === program[i])) continue; 
        let prevI = i;
        lineNo = i;

        switch(instr(program[i])) {
            case "inp": {
                if(inpBuffer.length === 0) {
                    let res = prompt("Enter line of input:");
                    if(res === null) interpreter.err("Program stopped through input cancel");
                    inpBuffer += res+"\n";
                }
                let charCode = inpBuffer.charCodeAt(0);
                inpBuffer = inpBuffer.slice(1);
                push(charCode);
                break;
            }
            case "add": {
                push(pop() + pop());
                break;
            }
            case "sub": {
                let [a, b] = [pop(), pop()];
                push(b - a);
                break;
            }
            case "dup": {
                let a = pop();
                push(a);
                push(a);
                break;
            }
            case "cond": {
                let a = pop();
                if(a === 0) {
                    i++;
                    if(instr(program[i]) === "gotou" || instr(program[i]) === "push") {
                        i++; //skip instruction argument as well
                    }
                }
                break;
            }
            case "gotou": {
                if(i+1 >= program.length) interpreter.err("Expected instruction argument");
                i = program[i+1] - 1; //the - 1 is very important
                break;
            }
            case "outn": {
                interpreter.output(`${pop()}`);
                break;
            }
            case "outa": {
                interpreter.output(`${String.fromCharCode(pop())}`);
                break;
            }
            case "rol": {
                stack.unshift(pop()); //move top element to bottom of stack
                break;
            }
            case "swap": { //possible fail
                let [a, b] = [pop(), pop()];
                push(a);
                push(b);
                break;
            }
            case "mul": {
                push(pop() * pop());
                break;
            }
            case "div": {
                let [a, b] = [pop(), pop()];
                push(Math.trunc(b / a)); //Math.trunc casts to integer
                break;
            }
            case "pop": {
                pop();
                break;
            }
            case "gotos": { //IS QUITE DIFFERENT TO GOTOU (line nums behave differently)
                i = pop(); //NOT minus 1
                break;
            }
            case "push": {
                if(i+1 >= program.length) interpreter.err("Expected instruction argument");
                push(program[i+1]);
                i++;
                break;
            }
            case "ror": {
                if(stack.length === 0) interpreter.err(`Stack underflow at line ${lineNo}`);
                push(stack.shift());
                break;
            }
            case null: {
                //ignore instruction
                break;
            }
            default: {
                interpreter.err("Internal error: (unhandled instr)");
                break;
            }
        }


        interpreter.clearHighlights();
        const programBefore = program.slice(0, prevI).map(n => n+1).reduce((c, p) => c + p, 0); //map and sum
        interpreter.highlight(programBefore, programBefore+program[prevI], "background-color: lawngreen;");
        
        iters++;
        if(interpreter.option("slow")) await sleep(500);
        else if(iters >= 10) {
            await sleep(0);
            iters = 0;
        }
    }
    interpreter.clearHighlights();
}