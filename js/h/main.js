let interpreter = createInterpreter({
    title: "H Interpreter",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "H", href: "https://esolangs.org/wiki/H"},
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
        let lines = code.split("\n");
        for(let i=0; i<lines.length; i++) {
            let start = lines[i].split("#")[0];
            append(start);
            style("color: #00a900;");
            append(lines[i].substring(start.length));
            style();
            if(i !== lines.length-1) append("\n");
        }
    }
});

interpreter.onClick("run", async function() {
    await run(interpreter.code);
});

function assemble(code) {
    let tokens = [];
    let strs = code.split(",");

    for(let i=0; i<strs.length; i++) {
        let str = strs[i];
        let num = Number(str);
        tokens.push({num: num, start: strs.slice(0, i).concat([""]).join(",").length, end: strs.slice(0, i+1).join(",").length});
        if(!isFinite(num)) interpreter.err("Invalid number: '"+str+"'");
    }

    return tokens;
}
async function run(code, input) {
    let tokens = assemble(code);
    let a = 0;
    let pc = 0;
    let mem = tokens.map((token) => token.num);
    let strs = tokens.map((token) => [token.start, token.end]);

    console.log(mem);

    while(pc >= 0 && pc < mem.length) {
        let prevPc = pc;

        if(pc === mem.length-1) interpreter.err("pc cannot be exactly at last integer");

        a = mem[mem[pc]] - a;
        mem[mem[pc]] = a;
        if(a < 0) pc = mem[pc+1];
        else pc += 2;

        interpreter.clearHighlights();
        let start = tokens[prevPc].start;
        let end = tokens[prevPc].end;
        interpreter.highlight(start, end, "background-color: lawngreen;");

        interpreter.output(`A=${a}, PC=${prevPc}\n`);
        interpreter.output(mem.join(", ")+"\n");
        interpreter.output(" ".repeat(mem.slice(0, prevPc).concat([""]).join(", ").length) + "^\n\n");
        if(interpreter.option("slow")) await sleep(1000);
        else await sleep(0);
    }
    interpreter.clearHighlights();

    interpreter.output("======= OUTPUT =======\n");
    interpreter.output(mem.join(", "));
}