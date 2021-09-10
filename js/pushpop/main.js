let interpreter = createInterpreter({
    title: "PushPop Interpreter",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "PushPop", href: "https://esolangs.org/wiki/PushPop"},
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
        /*let prevBf = false;
        for(let i=0; i<code.length; i++) {
            let isBf = "+-><.,[]".includes(code[i]);
            if(isBf && !prevBf) {
                style("color: #0055FF;");
            } else if(!isBf && prevBf) {
                style(); //reset
            }
            append(code[i]);
            prevBf = isBf;
        }*/
        append(code);
    }
});

interpreter.onClick("run", async function() {
    await run(interpreter.code);
});

async function run(code) {
    let lines = code.split("\n");

    const vars = {};

    function get(name) {
        let list = vars[name];
        if(list) return list[list.length-1];
        else return 0;
    }
    function set(name, num) {
        let list = vars[name];
        if(list) list[list.length-1] = num;
        else vars[name] = [num];
    }

    function parseArg(str, lineNum) {
        let numPercentSigns = 0;
        while(str.startsWith("%")) {
            numPercentSigns++;
            str = str.substring(1);
        }

        let n = Number(str);
        if(!isFinite(n)) interpreter.err(`invalid number (at line ${lineNum+1})`);

        while(numPercentSigns--) n = get(n);

        return n;
    }

    for(let i=0; i<lines.length; i++) {
        if(lines[i].trim() === "") continue;

        interpreter.clearHighlights();
        interpreter.highlight(lines.slice(0, i).join("\n").length, lines.slice(0, i).join("\n").length+1 + lines[i].length, "background-color: lawngreen;");


        let args = lines[i].trim().split(" ");
        let instr = args.shift();

        if(instr === "push") {
            console.log(args);
            if(args.length !== 2) interpreter.err(`push: expected 2 arguments (at line ${i+1})`);

            if(args[0] === "io") {
                let num = parseArg(args[1], i);
                interpreter.output(String.fromCharCode(num));
            } else if(args[0] === "pc") {
                
            } else {
                let [name, num] = [parseArg(args[0], i), parseArg(args[1], i)];
                let list = vars[name];
                if(list) list.push(num);
                else vars[name] = [num];
            }
        } else if(instr === "pop") {
            if(args.length !== 1) interpreter.err(`pop: expected 1 argument (at line ${i+1})`);
            let name = parseArg(args[0], i);

            let list = vars[name];
            if(list) {
                list.pop();
                if(list.length === 0) list.push(0);
            } else vars[name] = [0];
        } else if(instr === "map") {

        }

        if(interpreter.option("slow")) await sleep(200);
    }
    interpreter.clearHighlights();

    console.log(vars);
}