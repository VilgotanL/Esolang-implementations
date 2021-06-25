const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const outputInfo = document.getElementById("output_info");
const runBtn = document.getElementById("run_btn");
const minifyBtn = document.getElementById("minify_btn");
const dontFreezeBox = document.getElementById("dont_freeze_checkbox");


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


function minify(code) {
    let newCode = "";
    
    for(let i=0; i<code.length; i++) {
        let lastNewChar = newCode[newCode.length-1];
        if(code[i] === "+") {
            if(lastNewChar === "-") newCode = newCode.slice(0, -1);
            else newCode += "+";
        } else if(code[i] === "-") {
            if(lastNewChar === "+") newCode = newCode.slice(0, -1);
            else newCode += "-";
        } else if(code[i] === ">") {
            if(lastNewChar === "<") newCode = newCode.slice(0, -1);
            else newCode += ">";
        } else if(code[i] === "<") {
            if(lastNewChar === ">") newCode = newCode.slice(0, -1);
            else newCode += "<";
        } else if(".,[]".includes(code[i])) {
            newCode += code[i];
        }
    }

    while(newCode.startsWith("[")) { //remove initial comments
        let inset = 0;
        let end;
        for(let i=0; i<newCode.length; i++) {
            if(newCode[i] === "[") inset++;
            else if(newCode[i] === "]") inset--;
            if(newCode[i] === "]" && inset === 0) {
                end = i;
                break;
            }
        }
        if(!end) err("Error: Unbalanced brackets!");
        newCode = newCode.substring(end+1);
    }

    return newCode;
}

async function run(code) {
    code = minify(code);

    //check if brackets balanced
    let inset = 0;
    for(let i=0; i<code.length; i++) {
        if(code[i] === "[") inset++;
        if(code[i] === "]") inset--;
    }
    if(inset !== 0) err("Error: Unbalanced square brackets");

    //parse
    greenInfo("Parsing...");
    let tokens = [];

    for(let i=0; i<code.length; i++) {
        if(!("+-><,.[]".includes(code[i]))) continue;

        if("+-><".includes(code[i])) {
            let len = 0;
            for(let j=i; j<code.length; j++) {
                if(code[j] === code[i]) {
                    len++;
                } else {
                    break;
                }
            }
            tokens.push([code[i], len]);
            i = i + len - 1;
        } else {
            tokens.push([code[i]]);
        }
    }

    console.log(tokens);

    function inp() {
        return (prompt("Enter a character:") ?? "").charCodeAt(0) || 0;
    }
    
    //generate code
    greenInfo("Generating code...");
    let newCode = `(async function(){let m=[0],p=0;\n`;

    for(let i=0; i<tokens.length; i++) {
        let t = tokens[i];
        if(t[0] === "+") {
            newCode += `m[p]+=${t[1]};while(m[p]>255)(m[p]-=256);`;
        } else if(t[0] === "-") {
            newCode += `m[p]-=${t[1]};while(m[p]<0)(m[p]+=256);`;
        } else if(t[0] === ">") {
            newCode += `p+=${t[1]};p>=m.length&&(m.push(${"0, ".repeat(t[1]).slice(0, -2)}));`;
        } else if(t[0] === "<") {
            newCode += `p-=${t[1]};`;
            newCode += `p<0&&err("Error: Pointer less than zero");`;
        } else if(t[0] === ".") {
            newCode += "output(String.fromCharCode(m[p]));";
        } else if(t[0] === ",") {
            newCode += "m[p]=inp();";
        } else if(t[0] === "[") {
            newCode += "while(m[p]!=0){";
        } else if(t[0] === "]") {
            if(dontFreezeBox.checked) newCode += "await sleep(0);";
            newCode += "};";
        }
        //newCode += "\nawait sleep(0);console.log(m[p]);";
    }
    newCode += `greenInfo("Ran successfully!");})();`;

    console.log(newCode);

    //eval
    greenInfo("Evaluating...");
    eval(newCode);

}


runBtn.addEventListener("click", async function() {
    outputEl.innerText = "";
    greenInfo("Running...");
    
    let code = inputEl.value;
    await run(code);
    
    
});

minifyBtn.addEventListener("click", async function() {
    outputEl.innerText = "";
    greenInfo("Minifying...");
    
    let code = inputEl.value;
    let minified = minify(code);
    
    output(minified);
    greenInfo("Minified successfully!");
});