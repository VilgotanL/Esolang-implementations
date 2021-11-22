function str(str) {
    return str.split("").map(c => "="+c+"!").join("");
}


function bf2the(str) { //doesnt work very well, non-wrapping, no input
    let map = {
        "+": "t+",
        "-": "-",
        ">": ">",
        "<": "<",
        ".": "2(-^t+^t+vv)^^(-vvt+^^)v!0v1",
        "[": "(",
        "]": ")",
    };
    return str.split("").map((char) => map[char] ?? "").join("");
}