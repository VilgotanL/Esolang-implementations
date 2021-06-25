let interpreter = createInterpreter({
    title: "BadCode Interpreter",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "BadCode by JUSTANITALIANGUY", href: "./source.txt"},
    ],
    options: [
        {slow: "checkbox", text: "Slow: ", value: true},
        //{input: "text", text: "Input: ", value: "Hello, world!\\na"},
    ],
    buttons: [
        {run: "Run"},
    ],
    code: "1112111222o000o1111111o00000001111111o111o00000000000000000000000000000000000000000000000o0000000000000000000000000000000011212212121o00000000o111o000000o00000000o",
    output: "output here",
    highlight: function(code, append, style) {
        let prevIsCode = false;
        for(let i=0; i<code.length; i++) {
            let isCode = "102oO".includes(code[i]);
            if(isCode && !prevIsCode) {
                style("color: #0000BB;");
            } else if(!isCode && prevIsCode) {
                style(); //reset
            }
            append(code[i]);
            prevIsCode = isCode;
        }
    }
});

interpreter.onClick("run", async function() {
    await run(interpreter.code);
});

async function run(code) {
    let num = 0;

    for(let i=0; i<code.length; i++) {
        let prevI = i;

        if(code[i] === "1") {
            num++;
        } else if(code[i] === "0") {
            num--;
        } else if(code[i] === "2") {
            num *= 2;
        } else if(code[i] === "o") {
            interpreter.output(String.fromCharCode(num));
        } else if(code[i] === "O") {
            interpreter.output(num);
        }

        interpreter.clearHighlights();
        interpreter.highlight(prevI, prevI+1, "background-color: lawngreen;");

        if(interpreter.option("slow")) await sleep(1);
    }
    interpreter.clearHighlights();
}