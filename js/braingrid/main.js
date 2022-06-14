let interpreter = createInterpreter({
    title: "BrainGrid Interpreter",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "BrainGrid", href: "https://esolangs.org/wiki/BrainGrid"},
    ],
    options: [
        {slow: "checkbox", text: "Slow: ", value: true},
    ],
    buttons: [
        {run: "Run"},
    ],
    code: "code here",
    output: "output here",
    highlight: function(code, append, style) {
        for(let i=0; i<code.length; i++) {
            if(code[i] === "#") {
                style("color: #00a900");
                while(i < code.length && code[i] !== "\n") {
                    append(code[i]);
                    i++;
                }
                i--;
            } else if(code[i] === '"') {
                style("color: forestgreen");
                append(code[i]);
                i++;
                while(i < code.length && code[i] !== '"') {
                    append(code[i]);
                    i++;
                }
                if(i < code.length) append(code[i]);
            } else if("0123456789".includes(code[i])) {
                style("color: dodgerblue");
                while(i < code.length && "0123456789".includes(code[i])) {
                    append(code[i]);
                    i++;
                }
                i--;
            } else {
                style("color: black");
                append(code[i]);
            }
        }
    },
});

interpreter.onClick("run", async function() {
    await run(interpreter.code);
});

async function run(code) {
    let input_buffer = "";
    let mem = {};
    let px = 0;
    let py = 0;
    let acc = 0;

    function get(x = px, y = py) {
        return mem[x + "," + y] ?? 0;
    }
    function set(x, y, value) {
        mem[x + "," + y] = value;
    }

    for(let i=0; i<code.length; i++) {
        let prevI = i;

        if(code[i].trim() === "") {
            //pass
        } else if(code[i] === ">") {
            px++;
        } else if(code[i] === "<") {
            px--;
        } else if(code[i] === "^") {
            py--;
        } else if(code[i] === "v") {
            py++;
        } else if(code[i] === "<") {
            px--;
        } else if(code[i] === ",") {
            if(input_buffer === "") {
                input_buffer = (prompt("Enter line of input: ") ?? "") + "\n";
                interpreter.output(input_buffer);
            }
            let char_code = input_buffer.charCodeAt(0);
            input_buffer = input_buffer.slice(1);
            set(px, py, char_code);
        } else if(code[i] === ".") {
            interpreter.output(String.fromCharCode(get()));
        } else if(code[i] === "[") {
            if(get() === 0) {
                let inset = 1;
                while(inset > 0) {
                    i++;
                    if(code[i] === "[") inset++;
                    if(code[i] === "]") inset--;
                    if(i >= code.length) interpreter.err("Unbalanced [ ]");
                }
            }
        } else if(code[i] === "]") {
            if(get() !== 0) {
                let inset = 1;
                while(inset > 0) {
                    i--;
                    if(code[i] === "]") inset++;
                    if(code[i] === "[") inset--;
                    if(i < 0) interpreter.err("Unbalanced [ ]");
                }
            }
        } else if(code[i] === "(") {
            if(get() === 0) {
                let inset = 1;
                while(inset > 0) {
                    i++;
                    if(code[i] === "(") inset++;
                    if(code[i] === ")") inset--;
                    if(i >= code.length) interpreter.err("Unbalanced ( )");
                }
            }
        } else if(code[i] === ")") {
            //pass
        } else if(code[i] === ";") {
            acc = get();
        } else if(code[i] === ":") {
            set(px, py, acc);
        } else if("0123456789".includes(code[i])) {
            let str = "";
            while("0123456789".includes(code[i])) {
                str += code[i];
                i++;
            }
            i--;
            acc = parseInt(str);
        } else if(code[i] === "+") {
            set(px, py, get() + acc);
        } else if(code[i] === "-") {
            set(px, py, get() - acc);
        } else if(code[i] === "*") {
            set(px, py, get() * acc);
        } else if(code[i] === "/") {
            set(px, py, Math.trunc(get() / acc));
        } else if(code[i] === "%") {
            let [m, n] = [get(), acc];
            set(px, py, ((m % n) + n) % n); //not remainder
        } else if(code[i] === "@") {
            let [newx, newy] = [get(px, py), get(px+1, py)];
            px = newx, py = newy;
        } else if(code[i] === '"') {
            i++;
            while(code[i] !== '"') {
                if(i >= code.length) interpreter.err("Unclosed string");
                set(px, py, code.charCodeAt(i));
                px++;
                i++;
            }
        } else if(code[i] === "~") {
            if(acc > 0) set(px, py, 1);
            if(acc === 0) set(px, py, 0);
            if(acc < 0) set(px, py, -1);
        } else if(code[i] === "!") {
            set(px, py, get() !== 0 ? 0 : 1);
        } else if(code[i] === "#") {
            while(i < code.length && code[i] !== "\n") i++;
        } else interpreter.err("Unknown instruction: " + code[i]);

        interpreter.clearHighlights();
        interpreter.highlight(prevI, prevI+1, ";background-color: lawngreen;");

        if(interpreter.option("slow")) await sleep(1);

        console.log(mem);
    }
    interpreter.clearHighlights();
}