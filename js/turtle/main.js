let interpreter = createInterpreter({
    title: "🐢 Interpreter",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "🐢 esolang", href: "https://esolangs.org/wiki/🐢"},
    ],
    options: [
        {slow: "checkbox", text: "Slow: ", value: false},
        {input: "text", text: "Input: ", value: "Input Here"},
    ],
    buttons: [
        {run: "Run"},
        {text2code: "Text to Code"},
    ],
    code: "code here",
    output: "output here",
    highlight: function(code, append, style) {
        let lines = code.split("\n");
        for(let i=0; i<lines.length; i++) {
            let start = lines[i].split("#")[0];
            append(start);
            style("color: blue"); //comment
            append(lines[i].substring(start.length));
            style();
            if(i < lines.length-1) append("\n");
        }
    }
});

interpreter.onClick("run", async function() {
    await run(interpreter.code, interpreter.option("input"));
});
interpreter.onClick("text2code", async function() {
    let str = interpreter.code;
    let curr = 0;
    for(let i=0; i<str.length; i++) {
        let target = str[i].charCodeAt(0);
        if(target > curr) {
            interpreter.output("🐢 " + "🐢".repeat(target-curr) + "\n");
        } else if(target < curr) {
            interpreter.output("🐢🐢 " + "🐢".repeat(curr-target) + "\n");
        }
        interpreter.output("🐢🐢🐢\n");
        curr = target;
    }
});

function turtleLen(str, lineNum) {
    let len = 0;
    for(let i=0; i<str.length; i++) {
        if(str.substring(i).startsWith("🐢")) {
            len++;
            i += "🐢".length - 1;
        } else interpreter.err("Expected 🐢 at line "+(lineNum+1));
    }
    return len;
}

async function run(code, input) {
    let lines = code.split("\n");
    
    let labels = [];
    for(let i=0; i<lines.length; i++) {
        let line = lines[i].split("#")[0].trim();
        let parts = line.split(" ");
        if(parts.length === 2 && parts[0] === "🐢🐢🐢🐢🐢") { //label
            console.log(parts[1], turtleLen(parts[1], i));
            let n = turtleLen(parts[1], i);
            labels[n] = i;
        }
    }
    console.log("labels", labels);

    let a = 0;
    let mem = [0];
    let p = 0;

    for(let i=0; i<lines.length; i++) {
        let line = lines[i].split("#")[0].trim();
        let parts = line.split(" ");
        if(parts.length > 3) interpreter.err("Unknown instruction at line "+(i+1));
        let instrN = turtleLen(parts[0], i);
        let arg1 = turtleLen(parts[1] || "", i);
        let arg2 = turtleLen(parts[2] || "", i);
        console.log(instrN, arg1, arg2);

        if(instrN === 1) { //increment
            a += arg1;
        } else if(instrN === 2) { //decrement
            a -= arg1;
        } else if(instrN === 3) { //output
            if(arg1 === 1) {
                interpreter.output(""+a); //base 10
            } else {
                interpreter.output(String.fromCharCode(a)); //ascii
            }
        } else if(instrN === 4) { //input
            a = (input.charCodeAt(0) || 0) % 256;
            input = input.substring(1);
        } else if(instrN === 5) { //label
            //do nothing since we parsed labels before
        } else if(instrN === 6) { //goto if not zero
            if(a !== 0) {
                if(labels[arg1] === undefined) interpreter.err("Unknown label: '"+"🐢".repeat(arg1)+"'");
                i = labels[arg1];
                await sleep(0);
            }
        } else if(instrN === 7) {
            if(arg1 === 1) {
                p -= arg2;
                if(p < 0) interpreter.err("Error: Pointer out of bounds!");
            } else if(arg1 === 2) {
                p += arg2;
                while(p >= mem.length) mem.push(0);
            } else interpreter.err("Unknown instruction at line "+(i+1));
        } else if(instrN === 8) {
            if(arg1 === 1) {
                mem[p] = a;
            } else if(arg1 === 2) {
                a = mem[p];
            } else interpreter.err("Unknown instruction at line "+(i+1));
        } else if(line !== "") interpreter.err("Unknown instruction at line "+(i+1));

        interpreter.clearHighlights();
        let charNum = lines.slice(0, i).join("\n").length;
        if(interpreter.option("slow")) interpreter.highlight(charNum, charNum+lines[i].split("#")[0].trimEnd().length, "background-color: lawngreen;");

        if(interpreter.option("slow") && line !== "") await sleep(200);
    }
    interpreter.clearHighlights();
}


interpreter.code = `#this is a comment
#here is a truth-machine, type the input into the box above

🐢🐢🐢🐢 #input ascii to accumulator
🐢🐢🐢 #output accumulator as ascii char
🐢🐢🐢🐢🐢🐢🐢🐢 🐢 #set current cell to accumulator
#decrement accumulator by 49 '1':
🐢🐢 🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢🐢
🐢🐢🐢🐢🐢🐢 🐢 #if not zero (if input not '1'), go to label 1 (exit)
🐢🐢🐢🐢🐢 🐢🐢 #label 2
🐢🐢🐢🐢🐢🐢🐢🐢 🐢🐢 #set accumulator to current cell
🐢🐢🐢 #output accumulator as ascii char
🐢🐢🐢🐢🐢🐢 🐢🐢 #go to label 2 if not zero (loop infinitely)
🐢🐢🐢🐢🐢 🐢 #label 1`;