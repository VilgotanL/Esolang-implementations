//Vague interpreter by VilgotanL

function err(str) {
    alert("Error! "+str);
    throw new Error(str);
}
function run(code) {
    let tape = {};
    let ptr = [0, 0];
    let d = "1d";

    let out = "";

    function curr_stack() {
        let index = `${ptr[0]},${ptr[1]}`;
        if(!tape[index]) tape[index] = [0];
        return tape[index];
    }
    function push(stack, value) {
        stack.push(value);
    }
    function pop(stack) {
        if(stack.length < 1) err("Stack underflow!");
        return stack.pop();
    }

    for(let i=0; i<code.length; i++) {
        let stack = curr_stack();

        if(code[i] === "+") {
            push(stack, pop(stack) + pop(stack));
        } else if(code[i] === "-") {
            push(stack, pop(stack) - 1);
        } else if(code[i] === "!") {
            out += String.fromCharCode(pop(stack));
            if(out.length > 30) {
                alert(out);
                out = "";
            }
        } else if(code[i] === ">") {
            ptr[0]++;
        } else if(code[i] === "<") {
            ptr[0]--;
        } else if(d === "2d" && code[i] === "^") {
            ptr[0]--;
        } else if(d === "2d" && code[i] === "v") {
            ptr[0]++;
        } else if(code[i] === "&") {
            push(stack, ~(pop(stack) & pop(stack)));
        } else if(code[i] === "=") {
            let char = code[++i] ?? "\0";
            push(stack, char.charCodeAt(0));
        } else if(code[i] === "_") {
            pop(stack);
        } else if(code[i] === ".") {
            return;
        } else if(code[i] === "0") {
            push(stack, 0);
        } else if(code[i] === "*") {
            if(d === "1d") {
                ptr = [stack[0]];
            } else if(d === "2d") {
                ptr = stack;
            }
        } else if(code[i] === "2") {
            d = "2d";
        } else if(code[i] === "1") {
            d = "1d";
        } else if(code[i] === "t") {
            push(stack, 1);
        } else if(code[i] === "f") {
            push(stack, -2);
        } else if(code[i] === "(") {
            let val = pop(stack);
            push(stack, val);
            if(val === 0) {
                let inset = 0;
                for(let j=i; j<code.length; j++) {
                    if(code[j] === "(") inset++;
                    if(code[j] === ")") inset--;
                    if(inset === 0) {
                        i = j;
                        break;
                    }
                }
                if(inset !== 0) err("Error: Expected )");
            }
        } else if(code[i] === ")") {
            let val = pop(stack);
            push(stack, val);
            if(val !== 0) {
                let inset = 0;
                for(let j=i; j>=0; j--) {
                    if(code[j] === ")") inset++;
                    if(code[j] === "(") inset--;
                    if(inset === 0) {
                        i = j;
                        break;
                    }
                }
                if(inset !== 0) err("Error: Expected (");
            }
        }
        if(stack.length > 0) {
            let val = pop(stack);
            if(false, val === -1 || val === 256) {
                push(stack, 0);
            } else {
                push(stack, val);
            }
        }
    }
    console.table(tape);

    alert(out);
}

run(prompt("Enter code") ?? err("No code entered"));
