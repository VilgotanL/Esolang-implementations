const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const outputInfo = document.getElementById("output_info");
const transpileBtn = document.getElementById("transpile_btn");


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
async function input() {
    return (prompt("Enter a character of input:") ?? "").charCodeAt(0) || 0;
}
function output(str) {
    outputEl.innerText += str;
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}


let currId = 1;
function getId() {
    return currId++;
}

async function transpile(code) {
    let newCode = "";
    let lineNum = 1;

    let loopStack = [];

    for(let i=0; i<code.length; i++) {
        if("+-><,.".includes(code[i])) {
            newCode += code[i];
        } else if(code[i] === "[") {
            let id = getId();
            newCode += ":@" + id + "\n";
            lineNum++;
            loopStack.push([id, lineNum]);
        } else if(code[i] === "]") {
            if(loopStack.length === 0) err("Error: Unbalanced square brackets");
            let data = loopStack.pop();
            let id = data[0];
            let n = data[1];
            newCode += ":" + (lineNum+1) + ":" + n + "\n";
            lineNum++;
            newCode = newCode.replaceAll("@" + id, ""+lineNum);
        }
    }
    if(loopStack.length !== 0) err("Error: Unbalanced square brackets");

    return newCode;
}


transpileBtn.addEventListener("click", async function() {
    outputEl.innerText = "";
    greenInfo("Transpiling...");
    
    let code = inputEl.value;
    let transpiled = await transpile(code);
    output(transpiled);

    greenInfo("Transpiled successfully!");
});