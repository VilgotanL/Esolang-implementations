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
async function input() {
    return (prompt("Enter a character of input:") ?? "").charCodeAt(0) || 0;
}
function output(str) {
    outputEl.innerText += str;
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}



async function run(code) {
    let mem = [0];
    let p = 0;

    let iters = 0;
    for(let i=0; i<code.length; i++) {
        if(i < 0 || i >= code.length) break;

        if(code[i] === "+") {
            mem[p]++;
            if(mem[p] > 255) mem[p] = 0;
        } else if(code[i] === "-") {
            mem[p]--;
            if(mem[p] < 0) mem[p] = 255;
        } else if(code[i] === ">") {
            p++;
            if(p >= mem.length) mem.push(0);
        } else if(code[i] === "<") {
            p--;
            if(p < 0) err("Error: Pointer less than zero");
        } else if(code[i] === ".") {
            let char = String.fromCharCode(mem[p]);
            output(char);
            await sleep(0);
        } else if(code[i] === ",") {
            let charCode = (prompt("Enter a character:") ?? "").charCodeAt(0) || 0;
            mem[p] = charCode;
        } else if(code[i] === "[") {
            if(mem[p] === 0) {
                let found = false;
                let inset = 0;
                for(let j=i; j<code.length; j++) {
                    if(code[j] === "[") {
                        inset++;
                    } else if(code[j] === "]") {
                        inset--;
                    }
                    if(code[j] === "]" && inset === 0) {
                        i = j;
                        found = true;
                        break;
                    }
                }
                if(!found) err("Error: Unbalanced square brackets");
            }
        } else if(code[i] === "]") {
            if(mem[p] !== 0) {
                let found = false;
                let inset = 0;
                for(let j=i; j>=0; j--) {
                    if(code[j] === "]") {
                        inset++;
                    } else if(code[j] === "[") {
                        inset--;
                    }
                    if(code[j] === "[" && inset === 0) {
                        i = j;
                        found = true;
                        break;
                    }
                }
                if(!found) err("Error: Unbalanced square brackets");
            }
        }

        iters++;
        if(iters > 1000) {
            iters = 0;
            await sleep(0);
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