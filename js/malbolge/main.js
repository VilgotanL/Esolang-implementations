const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const outputInfo = document.getElementById("output_info");
const runBtn = document.getElementById("run_btn");


const max = 59048;
const validInstrs = [4, 5, 23, 39, 40, 62, 68, 81];
const crz_table = [1, 0, 0, 1, 0, 2, 2, 2, 1];


function crz(a, b) { //the crazy operation, a and b are actually swapped here, TODO
    let ans = 0;
    let mult = 1;
    for(let i=0; i < 10; i++) {
        ans += crz_table[((a % 3) * 3) + (b % 3)] * mult;
        a = Math.trunc(a / 3);
        b = Math.trunc(b / 3);
        mult *= 3;
    }
    return ans;
}

async function runMalbolge(code) { //thx to malbolge.doleczek.pl for help
    let mem = [];
    let end = false;
    let c = 0; //pc
    let d = 0; //data register (data manipulation)
    let a = 0; //accumulator (data manipulation)

    //initialize memory
    let e = 0; //current instruction ignoring whitespace
    for(let i=0; i<code.length; i++) {
        let charCode = code.charCodeAt(i);
        if(charCode > 32) { //make sure it's not whitespace
            mem[e] = charCode;
            if(validInstrs.indexOf((charCode + e) % 94) === -1) { //if not valid instruction
                err("Invalid instruction!");
            }
            e++;
        }
    }
    if(e < 2) err("Program must be atleast two non-whitespace instructions!");
    //initialize rest of memory
    for(; e <= max; e++) {
        mem[e] = crz(mem[e - 2], mem[e - 1]); //set next cell to the crazy operation of the second previous cell and the previous cell
    }

    console.log(mem, mem.length);

    function encrypt(t) {
        //t = (t + (max + 1)) % (max + 1); //why t + (max + 1) and not just t?
        t %= max + 1;
        const someArray = [57, 109, 60, 46, 84, 86, 97, 99, 96, 117, 89, 42, 77, 75, 39, 88, 126, 120, 68, 108, 125, 82, 69, 111, 107, 78, 58, 35, 63, 71, 34, 105, 64, 53, 122, 93, 38, 103, 113, 116, 121, 102, 114, 36, 40, 119, 101, 52, 123, 87, 80, 41, 72, 45, 90, 110, 44, 91, 37, 92, 51, 100, 76, 43, 81, 59, 62, 85, 33, 112, 74, 83, 55, 50, 70, 104, 79, 65, 49, 67, 66, 54, 118, 94, 61, 73, 95, 48, 47, 56, 124, 106, 115, 98];
        mem[t] = someArray[mem[t] % 94];
    }

    //main loop
    let iters = 0;
    while(!end) {
        c %= max + 1; //make sure c and d are words in the valid range
        d %= max + 1;
        let instr = (mem[c] + c) % 94;

        switch(instr) {
            case 4: //c = [d]
                c = mem[d];
                encrypt(c);
                c++;
                d++;
                break;
            case 5: //output to stdout
                output(String.fromCharCode(a % 256));
                encrypt(c);
                c++;
                d++;
                await sleep(0);
                break;
            case 23: { //input from stdin
                let charCode = await input();
                if(charCode > 255) charCode = 0;
                a = charCode;
                encrypt(c);
                c++;
                d++;
                break;
            }
            case 39: { //tritwise rotate right
                let e = mem[d];
                e = (e % 3 * 19683) + Math.trunc(e / 3);
                mem[d] = e;
                a = e;
                encrypt(c);
                c++;
                d++;
                break;
            }
            case 40: //d = [d]
                d = mem[d];
                encrypt(c);
                c++;
                d++;
                break;
            case 62: { //crazy op
                let e = crz(mem[d], a);
                mem[d] = e;
                a = e;
                encrypt(c);
                c++;
                d++;
                break;
            }
            case 68: //nop
                encrypt(c);
                c++;
                d++;
                break;
            case 81: //stop execution
                encrypt(c);
                end = true;
                break;
            default: //nop
                encrypt(c);
                c++;
                d++;
                break;
        }
        iters++;
        if(iters > 1000) {
            iters = 0;
            await sleep(0);
        }
    }
}


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


runBtn.addEventListener("click", async function() {
    outputEl.innerText = "";
    greenInfo("Running...");
    
    let code = inputEl.value;
    await runMalbolge(code);

    greenInfo("Ran successfully!");
});