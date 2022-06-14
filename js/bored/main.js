let interpreter = createInterpreter({
    title: "Bored Interpreter",
    theme: "light",
    titlebar: [
        {a: "Bored on Esolangs", href: "https://esolangs.org/wiki/Bored"},
    ],
    options: [
        {useless: "checkbox", text: "Useless checkbox: ", value: true},
    ],
    buttons: [
        {run: "Run"},
    ],
    code: "printLn \"Hello, world!\"",
    output: "output here",
    highlight: function(code, append, style) {
        append(code);
    }
});

interpreter.onClick("run", async function() {
    await run(interpreter.code);
});

async function run(code) {
    try {
        let compiled = compile(code);
        console.log(compiled);
        await (async _ => _).constructor(compiled)();
    } catch(e) {
        if(e === 0) return;
        console.error(e);
        interpreter.err("ERROR! "+(e?.message ?? ""+e));
    }
}