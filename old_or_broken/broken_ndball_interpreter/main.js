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
function input(str) {
    return (prompt(str) ?? "");
}
function output(str) {
    outputEl.innerText += str;
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}


class Vector {
    constructor(dim, length) {
        this.dim = dim;
        this.length = length;
    }

    equals(other) {
        if(other === this) return true;
        if(!(other instanceof Vector)) return false;
        return other.dim === this.dim && other.length === this.length;
    }

    toString() {
        return "("+this.dim+", "+this.length+")";
    }
}

class Pos {
    constructor(ints) {
        if(!(ints[0] instanceof Pos)) { //ints
            this.list = [];
            this.highestDim = 0;

            for(let i=0; i<ints.length; i++) {
                if(ints[i] !== 0) {
                    this.list.push(new Vector(i, ints[i]));
                    this.highestDim = i;
                }
            }
        } else { //Pos
            let p = ints[0];
            this.list = p.list;
            this.highestDim = p.highestDim;
        }
    }

    getLength(dim) {
        for(let i=0; i<this.list.length; i++) {
            if(this.list[i].dim === dim) {
                return this.list[i].length;
            }
        }
        return 0;
    }

    setLength(dim, length) {
        for(let i=0; i<this.list.length; i++) {
            if(this.list[i].dim === dim) {
                this.list[i].length = length;
            }
        }
        this.list.push(new Vector(dim, length));
    }

    equals(o) {
        if(o === this) return true;
        if(!(o instanceof Pos)) return false;
        if(o.highestDim !== this.highestDim) return false;
        if(this.list.length != o.list.length) return false;
        
        for(let i=0; i<o.list.length; i++) {
            let v = o.list[i];
            if(!this.list.find((x) => x.equals(v))) {
                return false;
            }
        }
        return true;
    }

    updateHighestDim() {
        this.highestDim = 0;
        for(let i=0; i<this.list.length; i++) {
            let v = this.list[i];
            if(v.dim > this.highestDim) {
                this.highestDim = v.dim;
            }
        }
    }

    shift(dim, amount) {
        for(let i=0; i<this.list.length; i++) {
            let v = this.list[i];
            if(v.dim === dim) {
                v.length += amount;

                if(v.length === 0 && this.highestDim === v.dim) {
                    this.list.pop(i);
                    this.updateHighestDim();
                } else if(v.length === 0) {
                    this.list.pop(i);
                }
                return;
            }
        }
        this.list.push(new Vector(dim, amount));
        if(dim > this.highestDim) {
            this.highestDim = dim;
        }
    }

    toString() {
        return "{" + this.list.join(", ") + "}";
    }
}

class Instr {
    constructor(pos, name, ...inputs) {
        this.pos = pos;
        this.name = name;
        this.info = inputs;
    }

    compareTo(instr) {
        return this.pos.highestDim - instr.pos.highestDim;
    }

    toString() {
        return "Instr: "+this.name+", "+this.pos+", ["+this.info.join(", ")+"]";
    }
}

function parseInteger(str, lineNum) {
    let n = Math.floor(Number(str));
    if(str.trim().length === 0) n = NaN;
    if(isNaN(n)) {
        err("\""+str+"\" could not be converted to a number (at line "+(lineNum+1)+")");
    }
    return n;
}

function checkLength(str, len, lineNum) {
    if(str.length !== len) err("Unknown or malformed instruction (at line "+(lineNum+1)+")");
}
function parse(code) {
    let lines = code.split("\n");
    let instrs = [];

    for(let lineNum=0; lineNum<lines.length; lineNum++) {
        let line = lines[lineNum].replaceAll(" ", "").replaceAll("\t", "");

        if(line.length === 0) continue;

        let pos = null;

        if(line[0] === "/") { //comment
            continue;
        } else if(line[0] === "(") {
            let end = -1;
            for(let i=1; i<line.length; i++) {
                if(line[i] === ")") {
                    end = i;
                    break;
                }
            }

            if(end === -1) err("Invalid position statement, missing closing ) (at line "+(lineNum+1)+")");

            let inputs = line.substring(1, end).split(",");
            let ints = inputs.map(() => 0);
            
            inputs.forEach((input, i) => {
                ints[i] = parseInteger(input, lineNum);
                if(ints[i] > 4 || ints[i] < 0) {
                    err("Invalid dimensional length, must be from 0 to 4 (at line "+(lineNum+1)+")");
                }
            });
            pos = new Pos(ints);
            line = line.substring(end+1).trim();
        } else if(line[0] === "{") {
            let end = -1;
            for(let i=1; i<line.length; i++) {
                if(line[i] === "}") {
                    end = i;
                    break;
                }
            }

            if(end === -1) err("Invalid position statement, missing closing } (at line "+(lineNum+1)+")");

            let inputs = line.substring(1, end).replaceAll("|", ",").split(",");
            let ints = [];
            
            inputs.forEach((input, i) => {
                ints[i] = parseInteger(input, lineNum);
            });
            if(ints.length % 2 === 1 || ints.length === 0) {
                err("Invalid position syntax (at line "+(lineNum+1)+")");
            }
            pos = new Pos([0]);
            for(let i=0; i<ints.length; i+=2) {
                if(ints[i+1] === 0) continue;

                pos.shift(ints[i], ints[i+1]);
                if(ints[i+1] > 4 || ints[i+1] < 0) {
                    err("Invalid dimensional length, must be from 0 to 4 (at line "+(lineNum+1)+")");
                }
            }

            line = line.substring(end+1).trim();
        } else {
            err("Invalid start of new line (at line "+(lineNum+1)+")");
        }

        //parse instruction
        if(line.length === 0) err("No instruction provided (at line "+(lineNum+1)+")");

        let dim = 0;

        switch(line[0]) {
            case ">":
                dim = parseInteger(line.substring(1), lineNum);
                instrs.push(new Instr(pos, ">", dim));
                break;
            case "<":
                dim = parseInteger(line.substring(1), lineNum);
                instrs.push(new Instr(pos, "<", dim));
                break;
            case "P":
                if(line.length === 1) {
                    instrs.push(new Instr(pos, "P"));
                } else if(line.substring(0, 4) === "PSt[" && line[line.length-1] === "]") {
                    instrs.push(new Instr(pos, "PSt", parseInteger(line.substring(4, line.length-1), lineNum)));
                } else {
                    err("Unknown instruction (at line "+(lineNum+1)+")");
                }
                break;
            case "E":
                if(line.length === 1) {
                    instrs.push(new Instr(pos, "E"));
                } else if(line === "ESt") {
                    instrs.push(new Instr(pos, "ESt"));
                } else {
                    err("Unknown instruction (at line "+(lineNum+1)+")");
                }
                break;
            case "%":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "%"));
                break;
            case "Y":
                if(line.length < 10) {
                    err("Y logic instruction malformed (at line "+(lineNum+1)+")");
                }
                if(line[1] !== "[") {
                    err("Y logic instruction expected [ (at line "+(lineNum+1)+")");
                }
                if(line[line.length-1] !== "]") {
                    err("Y logic instruction expected ] (at line "+(lineNum+1)+")");
                }
                let inputs = line.substring(2, line.length-1).split(",");
                let value = 0;
                let dim1 = 0;
                let dim2 = 0;
                value = parseInteger(inputs[0], lineNum);
                if(value < 0 || value > 255) {
                    err("Y logic instruction expected value from 0 to 255 (at line "+(lineNum+1)+")");
                }
                if(inputs[1][0] === ">" || inputs[1][0] === "<") {
                    dim1 = parseInteger(inputs[1].substring(1), lineNum);
                } else {
                    err("Y logic instruction requires a directional input (at line "+(lineNum+1)+")");
                }
                if(inputs[2][0] === ">" || inputs[2][0] === "<") {
                    dim2 = parseInteger(inputs[2].substring(1), lineNum);
                } else {
                    err("Y logic instruction requires a directional input (at line "+(lineNum+1)+")");
                }
                instrs.push(new Instr(pos, "Y", value, ""+inputs[1][0], dim1, ""+inputs[2][0], dim2));
                break;
            case "+":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "+"));
                break;
            case "-":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "-"));
                break;
            case "#":
                if(line[1] !== ">" && line[1] !== "<") {
                    err("Memory cell requires a direction (at line "+(lineNum+1)+")");
                }
                dim = parseInteger(line.substring(2), lineNum);
                instrs.push(new Instr(pos, "#", 0, line[1], dim));
                break;
            case "$":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "$"));
                break;
            case "p":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "p"));
                break;
            case "|":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "|"));
                break;
            case "R":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "R"));
                break;
            case "a":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "a"));
                break;
            case "f":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "f"));
                break;
            case "q":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "q"));
                break;
            case "H":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "H"));
                break;
            case "K": //possible bug: doesnt check for > or <
                instrs.push(new Instr(pos, "K", line[1], parseInteger(line.substring(2), lineNum)));
                break;
            case "n":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "n"));
                break;
            case "L":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "L", []));
                break;
            case "s":
                checkLength(line, 1, lineNum);
                instrs.push(new Instr(pos, "s", 0));
                break;
            case "S":
                if(line[1] === "[") {
                    if(line[line.length-1] !== "]") {
                        err("Instruction S needs an ending ] (at line "+(lineNum+1)+")");
                    }
                    instrs.push(new Instr(pos, "S", parseInteger(line.substring(2, line.length-1), lineNum)*1000000, 0));
                } else if(line[1] === "t") {
                    if(line[2] !== "[") {
                        err("Instruction St needs a starting [ (at line "+(lineNum+1)+")");
                    }
                    if(line[line.length-1] !== "]") {
                        err("Instruction St needs an ending ] (at line "+(lineNum+1)+")");
                    }
                    let n = parseInteger(line.substring(3, line.length-1), lineNum);
                    if(n < 0) err("Instruction St only accepts non-negative integers (at line "+(lineNum+1)+")");
                    instrs.push(new Instr(pos, "St", n));
                } else {
                    err("Instruction S missing next char (at line "+(lineNum+1)+")");
                }
                err("Unimplemented instruction S, St");
                break;
            default:
                err("Unknown instruction (at line "+(lineNum+1)+")");
                break;
        }
    }

    instrs.sort((a, b) => a.compareTo(b));

    //check for duplicate pos instructions
    for(let i=0; i<instrs.length; i++) {
        if(instrs.find((instr, index) => instr.pos.equals(instrs[i].pos) && !(i === index))) {
            err("Duplicate instruction (multiple instructions at the same position) (at line "+(i+1)+")");
        }
    }

    return instrs;
}

function matchMove(mov, dir, dim) {
    return (dim === mov[0] && ((dir === ">" && mov[1] === 1) || (dir === "<" && mov[1] === -1)));
}
async function run(code) {
    
    let instrs = parse(code);

    console.log(instrs);

    //run

    let startPos = new Map([]);
    for(let i=0; i<instrs.length; i++) {
        if(!startPos.has(instrs[i].pos.highestDim)) {
            startPos.set(instrs[i].pos.highestDim, i);
        }
    }

    let outputN = -1;
    let strings = [];

    let inp = "";

    let ball = new Pos([0]);
    let ballVal = 0;
    let movement = [0, 0];
    let hiveVal = 0;
    let newVal = 0;

    function out(str) {
        if(outputN === -1) {
            output(str);
        } else {
            if(strings[outputN] === undefined) {
                strings[outputN] = str;
            } else {
                strings[outputN] += str;
            }
        }
    }

    while(true) {
        if(startPos.get(ball.highestDim) === undefined) {
            err("Travelled into a new highest dimension, which has no instructions");
        }

        for(let i=startPos.get(ball.highestDim); i<instrs.length; i++) {
            if(ball.highestDim !== instrs[i].pos.highestDim) break;

            if(ball.equals(instrs[i].pos)) { //found matching instruction
                console.log("NAME: "+instrs[i].name+", pos: "+instrs[i].pos+", movement: ("+movement[0]+", "+movement[1]+")");
                switch(instrs[i].name) {
                    case ">":
                        movement[0] = instrs[i].info[0];
                        movement[1] = 1;
                        break;
                    case "<":
                        movement[0] = instrs[i].info[0];
                        movement[1] = -1;
                        break;
                    case "P":
                        out(""+ballVal);
                        break;
                    case "E": //exit
                        return;
                        break;
                    case "%":
                        newVal = 0;
                        inp = input("Enter an integer:");
                        try {
                            newVal = parseInteger(inp, -1);
                        } catch(e) {
                            console.log(e);
                            newVal = 0;
                        }
                        while(newVal < 0) newVal += 256;
                        ballVal = newVal % 256;
                        console.log("got input number: "+ballVal);
                        break;
                    case "Y":
                        if(ballVal < instrs[i].info[0]) {
                            if(instrs[i].info[1] === ">") {
                                movement[0] = instrs[i].info[2];
                                movement[1] = 1;
                            } else {
                                movement[0] = instrs[i].info[2];
                                movement[1] = -1;
                            }
                        } else {
                            if(instrs[i].info[3] === ">") {
                                movement[0] = instrs[i].info[4];
                                movement[1] = 1;
                            } else {
                                movement[0] = instrs[i].info[4];
                                movement[1] = -1;
                            }
                        }
                        break;
                    case "+":
                        ballVal++;
                        if(ballVal > 255) {
                            ballVal = 0;
                        }
                        break;
                    case "-":
                        ballVal--;
                        if(ballVal < 0) {
                            ballVal = 255;
                        }
                        break;
                    case "#":
                        if(matchMove(movement, instrs[i].info[1], instrs[i].info[2])) {
                            instrs[i].info[0] = ballVal;
                        } else {
                            ballVal = instrs[i].info[0];
                        }
                        break;
                    case "$":
                        newVal = input("Input a character:").charCodeAt(0) || 0;
                        while(newVal < 0) newVal += 256;
                        ballVal = newVal % 256;
                        break;
                    case "p":
                        out(String.fromCharCode(ballVal));
                        break;
                    case "|":
                        movement[1] = -movement[1];
                        break;
                    case "K":
                        if(matchMove(movement, instrs[i].info[0], instrs[i].info[1])) {
                            //nothing
                        } else {
                            movement[1] = -movement[1]
                        }
                        break;
                    case "R":
                        ballVal = Math.floor(Math.random()*256);
                        break;
                    case "a":
                        hiveVal = (hiveVal+1) % 256;
                        break;
                    case "f":
                        hiveVal--;
                        if(hiveVal < 0) hiveVal = 255;
                        break;
                    case "q":
                        hiveVal = 0;
                        break;
                    case "H":
                        ballVal = hiveVal;
                        break;
                    case "n":
                        hiveVal = ballVal;
                        break;
                    case "L":
                        if(instrs[1].info[0].length === 0) {
                            inp = input("Input a string:");
                            inp.split("\n").forEach((c) => {
                                c = c.charCodeAt(0) || 0;
                                if(c < 0 || c > 255) c = 1;
                                instrs[1].info[0].push(c);
                            });
                            instrs[1].info[0].push(0);
                        }
                        ballVal = instrs[1].info[0].pop(0);
                        break;
                    case "s":
                        newVal = instrs[i].info[0];
                        instrs[i].info[0] = ballVal;
                        ballVal = newVal;
                        break;
                    case "S":
                        if(instrs[i].info[1] !== 0) {
                            while((new Date().getTime() * 1000 < instrs[i].info[1])) {
                                await sleep(10);
                            }
                            instrs[i].info[1] = 0;
                            break;
                        }
                        instrs[i].info[1] = (new Date().getTime() * 1000) + instrs[i].info[0];
                        break;
                    case "St":
                        outputN = instrs[i].info[0];
                        break;
                    case "ESt":
                        outputN = -1;
                        break;
                    case "PSt":
                        output(strings[instrs[i].info[0]]);
                        break;
                    default:
                        err("Internal error, unsupported instr at runtime: "+instrs[i].name);
                        break;
                }
            }
        }

        if(movement[1] === 0) {
            err("Ball failed to start moving, put a movement instruction at (0)");
        }

        ball.shift(movement[0], movement[1]);

        if(ball.getLength(movement[0] > 4) || ball.getLength(movement[0]) < 0) {
            err("The ball hit the wall at "+ball.toString());
        }
        await sleep(0);
    }
}


runBtn.addEventListener("click", async function() {
    outputEl.innerText = "";
    greenInfo("Running...");
    
    let code = inputEl.value;
    await run(code);

    greenInfo("Ran successfully!");
});