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
function input() {
    return (prompt("Enter a character of input:") ?? "").charCodeAt(0) || 0;
}
function output(str) {
    outputEl.innerText += str;
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function nextNum(str) {
    let str2 = "";
    for(let i=0; i<str.length; i++) {
        if("0123456789".includes(str[i])) {
            str2 += str[i];
        } else {
            break;
        }
    }
    let n = Number(str2);
    if(isNaN(n)) n = 0;
    return n;
}

function removeComments(code) { //also removes numbers for the goto instruction if outside line numbers
    let lines = code.split("\n");
    let newLines = [];
    for(let i=0; i<lines.length; i++) {
        let line = lines[i];
        let newLine = "";
        for(let j=0; j<line.length; j++) {
            if("+-><.,".includes(line[j])) {
                newLine += line[j];
            } else if(line[j] === ":") {
                let n = nextNum(line.substring(j+1));
                if(n < 1 || n > lines.length) {
                    newLine += ":"; //remove number
                } else {
                    newLine += ":" + n; //keep number
                }
            }
        }
        newLines.push(newLine);
    }
    return newLines.join("\n");
}

function makeLabels(code) {
    let lines = code.split("\n");

    for(let i=0; i<lines.length; i++) {
        lines[i] = (i+1)+"#"+lines[i];
    }
    return lines.join("\n");
}

async function transpile(code) {
    //remove comments and remove numbers from : if outside lines range
    code = removeComments(code);

    console.log(code);

    //make labels on each line
    code = makeLabels(code);

    console.log(code);

    //split into goto sections
    let lines = code.split("\n");
    let sections = [];

    for(let i=0; i<lines.length; i++) {
        let line = lines[i];
        let section = "";
        for(let j=0; j<line.length; j++) {
            if(line[j] === ":") {
                let n = nextNum(line.substring(j+1));
                
                section += ":" + (n === 0 ? "" : ""+n);
                sections.push(section);
                section = "";

                j++;
                while("0123456789".includes(line[j])) { //skip past numbers for :
                    j++;
                }
                j--;
            } else {
                section += line[j];
            }
        }
        if(section.trim() !== "") sections.push(section);
    }

    //replace # stuff
    let newSections = [];
    for(let i=0; i<sections.length; i++) {
        let parts = sections[i].split("#");

        if(parts.length === 1) {
            newSections.push(sections[i]);
        } else if(parts.length === 2) {
            for(let j=0; j<newSections.length; j++) {
                newSections[j] = newSections[j].replaceAll(":" + parts[0], ";"+(i+1));
            }
            for(let j=0; j<sections.length; j++) {
                sections[j] = sections[j].replaceAll(":" + parts[0], ";"+(i+1));
            }

            console.log(sections[i].split("#")[1]);
            newSections.push(sections[i].split("#")[1]);
        } else {
            err("INTERNAL ERR");
        }
    }

    //replace back ; with :
    for(let i=0; i<newSections.length; i++) {
        newSections[i] = newSections[i].replaceAll(";", ":");
    }
    
    console.log(newSections);

    return newSections.join("\n");
}


transpileBtn.addEventListener("click", async function() {
    outputEl.innerText = "";
    greenInfo("Transpiling...");
    
    let code = inputEl.value;
    let transpiled = await transpile(code);
    output(transpiled);

    greenInfo("Transpiled successfully!");
});