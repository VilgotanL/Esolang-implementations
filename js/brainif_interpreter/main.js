const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const outputInfo = document.getElementById("output_info");
const runBtn = document.getElementById("run_btn");


function setInfoClass(str) {
    outputInfo.classList.remove("output_info_green", "output_info_red");
    outputInfo.classList.add(str);
}
function greenInfo(str) {
    outputInfo.innerText = str;
    setInfoClass("output_info_green");
}
function err(str) {
    outputInfo.innerText = str;
    setInfoClass("output_info_red");
    throw new Error(str);
}
function input() {
    return (prompt("Enter a character of input:") ?? "").charCodeAt(0) || 0;
}
function output(str) {
    outputEl.innerText += str;
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}



async function run(code) {
    let lines = code.split("\n");

    let mem = [0];
    let p = 0;

    for(let i=0; i<lines.length; i++) {
        if(i < 0 || i >= lines.length) break;

        lines[i] = lines[i].trim();
        if(lines[i] === "") continue;
        
        let parts = lines[i].split(" ");
        if(parts[0] !== "if") {
            err("Error: Invalid instruction at line " + (i+1));
        }

        let n = Math.floor(Number(parts[1]));
        if(isNaN(n)) err("Error: Invalid number for if at line " + (i+1));

        if(mem[p] === n) {
            if(parts[2] === "increment") {
                mem[p]++;
                if(mem[p] === 255) mem[p] = 0;
            } else if(parts[2] === "move" && parts[3] === "right") {
                p++;
                if(p >= mem.length) mem.push(0);
            } else if(parts[2] === "move" && parts[3] === "left") {
                p--;
                if(p < 0) err("Error: Pointer out of bounds");
            } else if(parts[2] === "goto") {
                let n = Math.floor(Number(parts[3]));
                if(isNaN(n)) err("Error: Invalid number for goto at line " + (i+1));
                i = n - 2;
                console.log(n);
            } else if(parts[2] === "input") {
                mem[p] = input();
            } else if(parts[2] === "output") {
                output(String.fromCharCode(mem[p]));
            } else {
                err("Error: Invalid instruction at line " + (i+1));
            }
        }
    }
}


runBtn.addEventListener("click", async function() {
    outputEl.innerText = "";
    greenInfo("Running...");
    
    let code = inputEl.value;
    await run(code);

    greenInfo("Ran successfully!");
});