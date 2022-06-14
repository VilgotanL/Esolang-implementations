function compile(code) {
    const memoTable = new Map();
    let greatestSuccessIndex = 0;
    
    function Ctx(i) {
        this.i = i;
        this.line = code.slice(0, i).split("\n").length;
        this.column = code.slice(0, i).split("\n").at(-1).length+1;
    }
    function Res(result, consumed, start) {
        this.result = result; //string or false
        this.consumed = consumed;
        this.start = start;
        this.end = start + consumed;
    }
    function str(s) {
        return (start) => {
            if(code.slice(start).startsWith(s)) {
                if(start + s.length > greatestSuccessIndex) greatestSuccessIndex = start + s.length;
                return new Res("", s.length, start);
            }
            return new Res(false, 0, start);
        };
    }
    function choice(...funcs) {
        return (start) => {
            for(let i=0; i<funcs.length; i++) {
                let res = funcs[i](start);
                if(res.result !== false) return res;
            }
            return new Res(false, 0, start);
        };
    }
    function join(...funcs) {
        return (start) => {
            let consumed = 0;
            let str = "";
            for(let i=0; i<funcs.length; i++) {
                let res = funcs[i](start + consumed);
                if(res.result === false) return new Res(false, 0, start);
                str += res.result;
                consumed += res.consumed;
            }
            return new Res(str, consumed, start);
        };
    }
    function not(f) {
        return (start) => {
            if(f(start).result === false) return new Res("", 0, start);
            return new Res(false, 0, start);
        };
    }
    function and(f) {
        return (start) => {
            if(f(start).result !== false) return new Res("", 0, start);
            return new Res(false, 0, start);
        };
    }
    function optional(f) {
        return (start) => {
            let res = f(start);
            if(res.result !== false) return res;
            return new Res("", 0, start);
        };
    }
    function repeat(f) {
        return (start) => {
            let consumed = 0;
            let str = "";
            while(true) {
                let res = f(start + consumed);
                if(res.result === false) return new Res(str, consumed, start);
                str += res.result;
                consumed += res.consumed;
            }
        };
    }
    function repeat_plus(f) {
        return (start) => {
            let res1 = f(start);
            if(res1.result === false) return new Res(false, 0, start);
            let consumed = res1.consumed;
            let str = res1.result;
            while(true) {
                let res = f(start + consumed);
                if(res.result === false) return new Res(str, consumed, start);
                str += res.result;
                consumed += res.consumed;
            }
        };
    }
    function char_range(chars) {
        return (start) => {
            let index = chars.indexOf(code.slice(start, start+1));
            if(start < code.length && index >= 0) return new Res("", 1, start);
            return new Res(false, 0, start);
        };
    }
    function out_code(str) {
        return (start) => {
            return new Res(str, 0, start);
        };
    }
    function noconsume(f) {
        return (start) => {
            let res = f(start);
            return new Res(res.result, 0, start);
        };
    }
    function noemit(f) {
        return (start) => {
            let res = f(start);
            return new Res(res.result === false ? false : "", res.consumed, start);
        };
    }
    function emit_range(chars) {
        return (start) => {
            let index = chars.indexOf(code.slice(start, start+1));
            if(start < code.length && index >= 0) return new Res(chars[index], 1, start);
            return new Res(false, 0, start);
        };
    }
    
    function parse__(start) {
        if(memoTable.has("_ "+start)) return memoTable.get("_ "+start);
        memoTable.set("_ "+start, repeat(choice(str("\x20"), str("\x09"), str("\x0a"), parse_comment))(start));
        return memoTable.get("_ "+start);
    }
    function parse_comment(start) {
        if(memoTable.has("comment "+start)) return memoTable.get("comment "+start);
        memoTable.set("comment "+start, join(str("\x23"), repeat(join(not(str("\x0a")), parse_ANY)))(start));
        return memoTable.get("comment "+start);
    }
    function parse_ANY(start) {
        if(memoTable.has("ANY "+start)) return memoTable.get("ANY "+start);
        memoTable.set("ANY "+start, char_range("\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff")(start));
        return memoTable.get("ANY "+start);
    }
    function parse_ANY_as_hex(start) {
        if(memoTable.has("ANY_as_hex "+start)) return memoTable.get("ANY_as_hex "+start);
        memoTable.set("ANY_as_hex "+start, choice(join(str("\x00"), out_code("\x30\x30")), join(str("\x01"), out_code("\x30\x31")), join(str("\x02"), out_code("\x30\x32")), join(str("\x03"), out_code("\x30\x33")), join(str("\x04"), out_code("\x30\x34")), join(str("\x05"), out_code("\x30\x35")), join(str("\x06"), out_code("\x30\x36")), join(str("\x07"), out_code("\x30\x37")), join(str("\x08"), out_code("\x30\x38")), join(str("\x09"), out_code("\x30\x39")), join(str("\x0a"), out_code("\x30\x61")), join(str("\x0b"), out_code("\x30\x62")), join(str("\x0c"), out_code("\x30\x63")), join(str("\x0d"), out_code("\x30\x64")), join(str("\x0e"), out_code("\x30\x65")), join(str("\x0f"), out_code("\x30\x66")), join(str("\x10"), out_code("\x31\x30")), join(str("\x11"), out_code("\x31\x31")), join(str("\x12"), out_code("\x31\x32")), join(str("\x13"), out_code("\x31\x33")), join(str("\x14"), out_code("\x31\x34")), join(str("\x15"), out_code("\x31\x35")), join(str("\x16"), out_code("\x31\x36")), join(str("\x17"), out_code("\x31\x37")), join(str("\x18"), out_code("\x31\x38")), join(str("\x19"), out_code("\x31\x39")), join(str("\x1a"), out_code("\x31\x61")), join(str("\x1b"), out_code("\x31\x62")), join(str("\x1c"), out_code("\x31\x63")), join(str("\x1d"), out_code("\x31\x64")), join(str("\x1e"), out_code("\x31\x65")), join(str("\x1f"), out_code("\x31\x66")), join(str("\x20"), out_code("\x32\x30")), join(str("\x21"), out_code("\x32\x31")), join(str("\x22"), out_code("\x32\x32")), join(str("\x23"), out_code("\x32\x33")), join(str("\x24"), out_code("\x32\x34")), join(str("\x25"), out_code("\x32\x35")), join(str("\x26"), out_code("\x32\x36")), join(str("\x27"), out_code("\x32\x37")), join(str("\x28"), out_code("\x32\x38")), join(str("\x29"), out_code("\x32\x39")), join(str("\x2a"), out_code("\x32\x61")), join(str("\x2b"), out_code("\x32\x62")), join(str("\x2c"), out_code("\x32\x63")), join(str("\x2d"), out_code("\x32\x64")), join(str("\x2e"), out_code("\x32\x65")), join(str("\x2f"), out_code("\x32\x66")), join(str("\x30"), out_code("\x33\x30")), join(str("\x31"), out_code("\x33\x31")), join(str("\x32"), out_code("\x33\x32")), join(str("\x33"), out_code("\x33\x33")), join(str("\x34"), out_code("\x33\x34")), join(str("\x35"), out_code("\x33\x35")), join(str("\x36"), out_code("\x33\x36")), join(str("\x37"), out_code("\x33\x37")), join(str("\x38"), out_code("\x33\x38")), join(str("\x39"), out_code("\x33\x39")), join(str("\x3a"), out_code("\x33\x61")), join(str("\x3b"), out_code("\x33\x62")), join(str("\x3c"), out_code("\x33\x63")), join(str("\x3d"), out_code("\x33\x64")), join(str("\x3e"), out_code("\x33\x65")), join(str("\x3f"), out_code("\x33\x66")), join(str("\x40"), out_code("\x34\x30")), join(str("\x41"), out_code("\x34\x31")), join(str("\x42"), out_code("\x34\x32")), join(str("\x43"), out_code("\x34\x33")), join(str("\x44"), out_code("\x34\x34")), join(str("\x45"), out_code("\x34\x35")), join(str("\x46"), out_code("\x34\x36")), join(str("\x47"), out_code("\x34\x37")), join(str("\x48"), out_code("\x34\x38")), join(str("\x49"), out_code("\x34\x39")), join(str("\x4a"), out_code("\x34\x61")), join(str("\x4b"), out_code("\x34\x62")), join(str("\x4c"), out_code("\x34\x63")), join(str("\x4d"), out_code("\x34\x64")), join(str("\x4e"), out_code("\x34\x65")), join(str("\x4f"), out_code("\x34\x66")), join(str("\x50"), out_code("\x35\x30")), join(str("\x51"), out_code("\x35\x31")), join(str("\x52"), out_code("\x35\x32")), join(str("\x53"), out_code("\x35\x33")), join(str("\x54"), out_code("\x35\x34")), join(str("\x55"), out_code("\x35\x35")), join(str("\x56"), out_code("\x35\x36")), join(str("\x57"), out_code("\x35\x37")), join(str("\x58"), out_code("\x35\x38")), join(str("\x59"), out_code("\x35\x39")), join(str("\x5a"), out_code("\x35\x61")), join(str("\x5b"), out_code("\x35\x62")), join(str("\x5c"), out_code("\x35\x63")), join(str("\x5d"), out_code("\x35\x64")), join(str("\x5e"), out_code("\x35\x65")), join(str("\x5f"), out_code("\x35\x66")), join(str("\x60"), out_code("\x36\x30")), join(str("\x61"), out_code("\x36\x31")), join(str("\x62"), out_code("\x36\x32")), join(str("\x63"), out_code("\x36\x33")), join(str("\x64"), out_code("\x36\x34")), join(str("\x65"), out_code("\x36\x35")), join(str("\x66"), out_code("\x36\x36")), join(str("\x67"), out_code("\x36\x37")), join(str("\x68"), out_code("\x36\x38")), join(str("\x69"), out_code("\x36\x39")), join(str("\x6a"), out_code("\x36\x61")), join(str("\x6b"), out_code("\x36\x62")), join(str("\x6c"), out_code("\x36\x63")), join(str("\x6d"), out_code("\x36\x64")), join(str("\x6e"), out_code("\x36\x65")), join(str("\x6f"), out_code("\x36\x66")), join(str("\x70"), out_code("\x37\x30")), join(str("\x71"), out_code("\x37\x31")), join(str("\x72"), out_code("\x37\x32")), join(str("\x73"), out_code("\x37\x33")), join(str("\x74"), out_code("\x37\x34")), join(str("\x75"), out_code("\x37\x35")), join(str("\x76"), out_code("\x37\x36")), join(str("\x77"), out_code("\x37\x37")), join(str("\x78"), out_code("\x37\x38")), join(str("\x79"), out_code("\x37\x39")), join(str("\x7a"), out_code("\x37\x61")), join(str("\x7b"), out_code("\x37\x62")), join(str("\x7c"), out_code("\x37\x63")), join(str("\x7d"), out_code("\x37\x64")), join(str("\x7e"), out_code("\x37\x65")), join(str("\x7f"), out_code("\x37\x66")), join(str("\x80"), out_code("\x38\x30")), join(str("\x81"), out_code("\x38\x31")), join(str("\x82"), out_code("\x38\x32")), join(str("\x83"), out_code("\x38\x33")), join(str("\x84"), out_code("\x38\x34")), join(str("\x85"), out_code("\x38\x35")), join(str("\x86"), out_code("\x38\x36")), join(str("\x87"), out_code("\x38\x37")), join(str("\x88"), out_code("\x38\x38")), join(str("\x89"), out_code("\x38\x39")), join(str("\x8a"), out_code("\x38\x61")), join(str("\x8b"), out_code("\x38\x62")), join(str("\x8c"), out_code("\x38\x63")), join(str("\x8d"), out_code("\x38\x64")), join(str("\x8e"), out_code("\x38\x65")), join(str("\x8f"), out_code("\x38\x66")), join(str("\x90"), out_code("\x39\x30")), join(str("\x91"), out_code("\x39\x31")), join(str("\x92"), out_code("\x39\x32")), join(str("\x93"), out_code("\x39\x33")), join(str("\x94"), out_code("\x39\x34")), join(str("\x95"), out_code("\x39\x35")), join(str("\x96"), out_code("\x39\x36")), join(str("\x97"), out_code("\x39\x37")), join(str("\x98"), out_code("\x39\x38")), join(str("\x99"), out_code("\x39\x39")), join(str("\x9a"), out_code("\x39\x61")), join(str("\x9b"), out_code("\x39\x62")), join(str("\x9c"), out_code("\x39\x63")), join(str("\x9d"), out_code("\x39\x64")), join(str("\x9e"), out_code("\x39\x65")), join(str("\x9f"), out_code("\x39\x66")), join(str("\xa0"), out_code("\x61\x30")), join(str("\xa1"), out_code("\x61\x31")), join(str("\xa2"), out_code("\x61\x32")), join(str("\xa3"), out_code("\x61\x33")), join(str("\xa4"), out_code("\x61\x34")), join(str("\xa5"), out_code("\x61\x35")), join(str("\xa6"), out_code("\x61\x36")), join(str("\xa7"), out_code("\x61\x37")), join(str("\xa8"), out_code("\x61\x38")), join(str("\xa9"), out_code("\x61\x39")), join(str("\xaa"), out_code("\x61\x61")), join(str("\xab"), out_code("\x61\x62")), join(str("\xac"), out_code("\x61\x63")), join(str("\xad"), out_code("\x61\x64")), join(str("\xae"), out_code("\x61\x65")), join(str("\xaf"), out_code("\x61\x66")), join(str("\xb0"), out_code("\x62\x30")), join(str("\xb1"), out_code("\x62\x31")), join(str("\xb2"), out_code("\x62\x32")), join(str("\xb3"), out_code("\x62\x33")), join(str("\xb4"), out_code("\x62\x34")), join(str("\xb5"), out_code("\x62\x35")), join(str("\xb6"), out_code("\x62\x36")), join(str("\xb7"), out_code("\x62\x37")), join(str("\xb8"), out_code("\x62\x38")), join(str("\xb9"), out_code("\x62\x39")), join(str("\xba"), out_code("\x62\x61")), join(str("\xbb"), out_code("\x62\x62")), join(str("\xbc"), out_code("\x62\x63")), join(str("\xbd"), out_code("\x62\x64")), join(str("\xbe"), out_code("\x62\x65")), join(str("\xbf"), out_code("\x62\x66")), join(str("\xc0"), out_code("\x63\x30")), join(str("\xc1"), out_code("\x63\x31")), join(str("\xc2"), out_code("\x63\x32")), join(str("\xc3"), out_code("\x63\x33")), join(str("\xc4"), out_code("\x63\x34")), join(str("\xc5"), out_code("\x63\x35")), join(str("\xc6"), out_code("\x63\x36")), join(str("\xc7"), out_code("\x63\x37")), join(str("\xc8"), out_code("\x63\x38")), join(str("\xc9"), out_code("\x63\x39")), join(str("\xca"), out_code("\x63\x61")), join(str("\xcb"), out_code("\x63\x62")), join(str("\xcc"), out_code("\x63\x63")), join(str("\xcd"), out_code("\x63\x64")), join(str("\xce"), out_code("\x63\x65")), join(str("\xcf"), out_code("\x63\x66")), join(str("\xd0"), out_code("\x64\x30")), join(str("\xd1"), out_code("\x64\x31")), join(str("\xd2"), out_code("\x64\x32")), join(str("\xd3"), out_code("\x64\x33")), join(str("\xd4"), out_code("\x64\x34")), join(str("\xd5"), out_code("\x64\x35")), join(str("\xd6"), out_code("\x64\x36")), join(str("\xd7"), out_code("\x64\x37")), join(str("\xd8"), out_code("\x64\x38")), join(str("\xd9"), out_code("\x64\x39")), join(str("\xda"), out_code("\x64\x61")), join(str("\xdb"), out_code("\x64\x62")), join(str("\xdc"), out_code("\x64\x63")), join(str("\xdd"), out_code("\x64\x64")), join(str("\xde"), out_code("\x64\x65")), join(str("\xdf"), out_code("\x64\x66")), join(str("\xe0"), out_code("\x65\x30")), join(str("\xe1"), out_code("\x65\x31")), join(str("\xe2"), out_code("\x65\x32")), join(str("\xe3"), out_code("\x65\x33")), join(str("\xe4"), out_code("\x65\x34")), join(str("\xe5"), out_code("\x65\x35")), join(str("\xe6"), out_code("\x65\x36")), join(str("\xe7"), out_code("\x65\x37")), join(str("\xe8"), out_code("\x65\x38")), join(str("\xe9"), out_code("\x65\x39")), join(str("\xea"), out_code("\x65\x61")), join(str("\xeb"), out_code("\x65\x62")), join(str("\xec"), out_code("\x65\x63")), join(str("\xed"), out_code("\x65\x64")), join(str("\xee"), out_code("\x65\x65")), join(str("\xef"), out_code("\x65\x66")), join(str("\xf0"), out_code("\x66\x30")), join(str("\xf1"), out_code("\x66\x31")), join(str("\xf2"), out_code("\x66\x32")), join(str("\xf3"), out_code("\x66\x33")), join(str("\xf4"), out_code("\x66\x34")), join(str("\xf5"), out_code("\x66\x35")), join(str("\xf6"), out_code("\x66\x36")), join(str("\xf7"), out_code("\x66\x37")), join(str("\xf8"), out_code("\x66\x38")), join(str("\xf9"), out_code("\x66\x39")), join(str("\xfa"), out_code("\x66\x61")), join(str("\xfb"), out_code("\x66\x62")), join(str("\xfc"), out_code("\x66\x63")), join(str("\xfd"), out_code("\x66\x64")), join(str("\xfe"), out_code("\x66\x65")), join(str("\xff"), out_code("\x66\x66")))(start));
        return memoTable.get("ANY_as_hex "+start);
    }
    function parse_HEX(start) {
        if(memoTable.has("HEX "+start)) return memoTable.get("HEX "+start);
        memoTable.set("HEX "+start, choice(emit_range("\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39"), emit_range("\x41\x42\x43\x44\x45\x46"), emit_range("\x61\x62\x63\x64\x65\x66"))(start));
        return memoTable.get("HEX "+start);
    }
    function parse_identifier(start) {
        if(memoTable.has("identifier "+start)) return memoTable.get("identifier "+start);
        memoTable.set("identifier "+start, join(choice(emit_range("\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a"), emit_range("\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a"), join(str("\x5f"), out_code("\x5f"))), repeat(choice(emit_range("\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a"), emit_range("\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a"), emit_range("\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39"), join(str("\x5f"), out_code("\x5f")))))(start));
        return memoTable.get("identifier "+start);
    }
    function parse_integer(start) {
        if(memoTable.has("integer "+start)) return memoTable.get("integer "+start);
        memoTable.set("integer "+start, join(out_code("\x28\x66\x72\x6f\x6d\x49\x6e\x74\x28"), choice(join(emit_range("\x31\x32\x33\x34\x35\x36\x37\x38\x39"), repeat(emit_range("\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39"))), join(str("\x30"), out_code("\x30"))), out_code("\x29\x29"))(start));
        return memoTable.get("integer "+start);
    }
    function parse_char(start) {
        if(memoTable.has("char "+start)) return memoTable.get("char "+start);
        memoTable.set("char "+start, join(out_code("\x5c\x78"), parse_ANY_as_hex)(start));
        return memoTable.get("char "+start);
    }
    function parse_string(start) {
        if(memoTable.has("string "+start)) return memoTable.get("string "+start);
        memoTable.set("string "+start, join(out_code("\x28\x66\x72\x6f\x6d\x53\x74\x72\x28\x22"), choice(join(str("\x22"), repeat(join(not(str("\x22")), parse_char)), str("\x22")), join(str("\x27"), repeat(join(not(str("\x27")), parse_char)), str("\x27"))), out_code("\x22\x29\x29"))(start));
        return memoTable.get("string "+start);
    }
    function parse_idend(start) {
        if(memoTable.has("idend "+start)) return memoTable.get("idend "+start);
        memoTable.set("idend "+start, not(choice(char_range("\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a"), char_range("\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a"), char_range("\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39"), str("\x5f")))(start));
        return memoTable.get("idend "+start);
    }
    function parse_main(start) {
        if(memoTable.has("main "+start)) return memoTable.get("main "+start);
        memoTable.set("main "+start, join(out_code("\x0a\x63\x6f\x6e\x73\x74\x20\x76\x61\x72\x69\x61\x62\x6c\x65\x73\x20\x3d\x20\x7b\x7d\x3b\x0a\x63\x6f\x6e\x73\x74\x20\x66\x75\x6e\x63\x74\x69\x6f\x6e\x73\x20\x3d\x20\x7b\x0a\x09\x6e\x75\x6d\x32\x73\x74\x72\x3a\x20\x61\x73\x79\x6e\x63\x20\x66\x75\x6e\x63\x74\x69\x6f\x6e\x28\x6e\x29\x20\x7b\x0a\x09\x09\x69\x66\x28\x61\x72\x67\x75\x6d\x65\x6e\x74\x73\x2e\x6c\x65\x6e\x67\x74\x68\x20\x3c\x20\x31\x29\x20\x74\x68\x72\x6f\x77\x20\x22\x6e\x75\x6d\x32\x73\x74\x72\x20\x6d\x69\x73\x73\x69\x6e\x67\x20\x61\x72\x67\x75\x6d\x65\x6e\x74\x22\x3b\x0a\x09\x09\x72\x65\x74\x75\x72\x6e\x20\x66\x72\x6f\x6d\x53\x74\x72\x28\x22\x22\x2b\x6e\x2e\x6c\x65\x6e\x67\x74\x68\x29\x3b\x0a\x09\x7d\x2c\x0a\x09\x67\x65\x74\x69\x3a\x20\x61\x73\x79\x6e\x63\x20\x66\x75\x6e\x63\x74\x69\x6f\x6e\x28\x61\x72\x72\x2c\x20\x6e\x29\x20\x7b\x0a\x09\x09\x69\x66\x28\x61\x72\x67\x75\x6d\x65\x6e\x74\x73\x2e\x6c\x65\x6e\x67\x74\x68\x20\x3c\x20\x32\x29\x20\x74\x68\x72\x6f\x77\x20\x22\x67\x65\x74\x69\x20\x6d\x69\x73\x73\x69\x6e\x67\x20\x61\x72\x67\x75\x6d\x65\x6e\x74\x73\x22\x3b\x0a\x09\x09\x69\x66\x28\x6e\x2e\x6c\x65\x6e\x67\x74\x68\x20\x3e\x3d\x20\x61\x72\x72\x2e\x6c\x65\x6e\x67\x74\x68\x29\x20\x74\x68\x72\x6f\x77\x20\x22\x67\x65\x74\x69\x20\x69\x6e\x64\x65\x78\x20\x6f\x75\x74\x20\x6f\x66\x20\x72\x61\x6e\x67\x65\x22\x3b\x0a\x09\x09\x72\x65\x74\x75\x72\x6e\x20\x61\x72\x72\x5b\x6e\x2e\x6c\x65\x6e\x67\x74\x68\x5d\x3b\x0a\x09\x7d\x2c\x0a\x09\x73\x65\x74\x69\x3a\x20\x61\x73\x79\x6e\x63\x20\x66\x75\x6e\x63\x74\x69\x6f\x6e\x28\x61\x72\x72\x2c\x20\x6e\x2c\x20\x76\x61\x6c\x29\x20\x7b\x0a\x09\x09\x69\x66\x28\x61\x72\x67\x75\x6d\x65\x6e\x74\x73\x2e\x6c\x65\x6e\x67\x74\x68\x20\x3c\x20\x33\x29\x20\x74\x68\x72\x6f\x77\x20\x22\x73\x65\x74\x69\x20\x6d\x69\x73\x73\x69\x6e\x67\x20\x61\x72\x67\x75\x6d\x65\x6e\x74\x73\x22\x3b\x0a\x09\x09\x69\x66\x28\x6e\x2e\x6c\x65\x6e\x67\x74\x68\x20\x3e\x3d\x20\x61\x72\x72\x2e\x6c\x65\x6e\x67\x74\x68\x29\x20\x74\x68\x72\x6f\x77\x20\x22\x73\x65\x74\x69\x20\x69\x6e\x64\x65\x78\x20\x6f\x75\x74\x20\x6f\x66\x20\x72\x61\x6e\x67\x65\x22\x3b\x0a\x09\x09\x61\x72\x72\x5b\x6e\x2e\x6c\x65\x6e\x67\x74\x68\x5d\x20\x3d\x20\x76\x61\x6c\x3b\x0a\x09\x7d\x2c\x0a\x7d\x3b\x0a\x0a\x66\x75\x6e\x63\x74\x69\x6f\x6e\x20\x66\x72\x6f\x6d\x49\x6e\x74\x28\x6e\x29\x20\x7b\x0a\x09\x69\x66\x28\x21\x4e\x75\x6d\x62\x65\x72\x2e\x69\x73\x53\x61\x66\x65\x49\x6e\x74\x65\x67\x65\x72\x28\x6e\x29\x29\x20\x7b\x0a\x09\x09\x63\x6f\x6e\x73\x6f\x6c\x65\x2e\x6c\x6f\x67\x28\x6e\x29\x3b\x0a\x09\x09\x74\x68\x72\x6f\x77\x20\x22\x45\x72\x6f\x72\x72\x6f\x72\x31\x6f\x21\x20\x69\x6e\x74\x65\x67\xeb\x72\x20\x69\x73\x20\x6e\x6f\x74\x20\x69\x6e\x74\x65\x67\x65\x72\x22\x3b\x0a\x09\x7d\x0a\x09\x69\x66\x28\x6e\x20\x3c\x20\x30\x29\x20\x74\x68\x72\x6f\x77\x20\x22\x49\x6e\x74\x65\x67\x65\x72\x20\x2c\x6d\x75\x73\x74\x20\x62\x65\x20\x6e\x6f\x6e\x6e\x65\x67\x61\x74\x69\x76\x65\x21\x22\x3b\x0a\x09\x72\x65\x74\x75\x72\x6e\x20\x41\x72\x72\x61\x79\x28\x6e\x29\x2e\x66\x69\x6c\x6c\x28\x30\x29\x2e\x6d\x61\x70\x28\x5f\x20\x3d\x3e\x20\x5b\x5d\x29\x3b\x0a\x7d\x0a\x66\x75\x6e\x63\x74\x69\x6f\x6e\x20\x66\x72\x6f\x6d\x53\x74\x72\x28\x73\x74\x72\x29\x20\x7b\x0a\x09\x72\x65\x74\x75\x72\x6e\x20\x73\x74\x72\x2e\x73\x70\x6c\x69\x74\x28\x22\x22\x29\x2e\x6d\x61\x70\x28\x63\x20\x3d\x3e\x20\x66\x72\x6f\x6d\x49\x6e\x74\x28\x63\x2e\x63\x68\x61\x72\x43\x6f\x64\x65\x41\x74\x28\x30\x29\x29\x29\x3b\x0a\x7d\x0a\x66\x75\x6e\x63\x74\x69\x6f\x6e\x20\x74\x6f\x53\x74\x72\x28\x61\x72\x72\x29\x20\x7b\x0a\x09\x72\x65\x74\x75\x72\x6e\x20\x61\x72\x72\x2e\x6d\x61\x70\x28\x63\x20\x3d\x3e\x20\x53\x74\x72\x69\x6e\x67\x2e\x66\x72\x6f\x6d\x43\x68\x61\x72\x43\x6f\x64\x65\x28\x63\x2e\x6c\x65\x6e\x67\x74\x68\x29\x29\x2e\x6a\x6f\x69\x6e\x28\x22\x22\x29\x3b\x0a\x7d\x0a"), parse__, repeat(join(parse_statement, parse__)))(start));
        return memoTable.get("main "+start);
    }
    function parse_statement(start) {
        if(memoTable.has("statement "+start)) return memoTable.get("statement "+start);
        memoTable.set("statement "+start, choice(join(str("\x70\x72\x69\x6e\x74\x4c\x6e"), parse__, out_code("\x69\x6e\x74\x65\x72\x70\x72\x65\x74\x65\x72\x2e\x6f\x75\x74\x70\x75\x74\x28\x74\x6f\x53\x74\x72\x28"), parse_expr, out_code("\x29\x2b\x22\x5c\x6e\x22\x29\x3b")), join(str("\x70\x72\x69\x6e\x74"), parse__, out_code("\x69\x6e\x74\x65\x72\x70\x72\x65\x74\x65\x72\x2e\x6f\x75\x74\x70\x75\x74\x28\x74\x6f\x53\x74\x72\x28"), parse_expr, out_code("\x29\x29\x3b")), join(str("\x67\x69\x76\x65\x20\x75\x70"), out_code("\x74\x68\x72\x6f\x77\x20\x30\x3b")), join(str("\x73\x6c\x65\x65\x70\x20\x6d\x73"), parse__, out_code("\x61\x77\x61\x69\x74\x20\x6e\x65\x77\x20\x50\x72\x6f\x6d\x69\x73\x65\x28\x72\x65\x73\x20\x3d\x3e\x20\x73\x65\x74\x54\x69\x6d\x65\x6f\x75\x74\x28\x72\x65\x73\x2c\x20\x28"), parse_expr, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x29\x29\x3b")), join(str("\x61\x6d\x6f\x67\x6e\x20\x75\x73"), out_code("\x77\x69\x6e\x64\x6f\x77\x2e\x6f\x70\x65\x6e\x28\x22\x73\x74\x65\x61\x6d\x3a\x2f\x2f\x72\x75\x6e\x67\x61\x6d\x65\x69\x64\x2f\x39\x34\x35\x33\x36\x30\x22\x2c\x20\x22\x5f\x62\x6c\x61\x6e\x6b\x22\x29\x3b")), join(out_code("\x76\x61\x72\x69\x61\x62\x6c\x65\x73\x5b\x22"), parse_identifier, out_code("\x22\x5d\x20\x3d\x20\x28"), parse__, str("\x3d"), parse__, parse_expr, out_code("\x29\x3b")), join(str("\x64\x65\x66"), parse__, out_code("\x66\x75\x6e\x63\x74\x69\x6f\x6e\x73\x5b\x22"), parse_identifier, out_code("\x22\x5d\x20\x3d\x20\x61\x73\x79\x6e\x63\x20\x66\x75\x6e\x63\x74\x69\x6f\x6e\x28\x2e\x2e\x2e\x61\x72\x67\x73\x29\x20\x7b\x20\x76\x61\x72\x69\x61\x62\x6c\x65\x73\x5b\x22\x61\x72\x67\x4c\x65\x6e\x22\x5d\x20\x3d\x20\x66\x72\x6f\x6d\x49\x6e\x74\x28\x61\x72\x67\x73\x2e\x6c\x65\x6e\x67\x74\x68\x29\x3b\x20\x66\x6f\x72\x28\x6c\x65\x74\x20\x69\x3d\x30\x3b\x20\x69\x3c\x61\x72\x67\x73\x2e\x6c\x65\x6e\x67\x74\x68\x3b\x20\x69\x2b\x2b\x29\x20\x76\x61\x72\x69\x61\x62\x6c\x65\x73\x5b\x22\x61\x72\x67\x22\x2b\x28\x69\x2b\x31\x29\x5d\x20\x3d\x20\x61\x72\x67\x73\x5b\x69\x5d\x3b\x20\x76\x61\x72\x69\x61\x62\x6c\x65\x73\x5b\x22\x72\x65\x74\x56\x61\x6c\x22\x5d\x20\x3d\x20\x5b\x5d\x3b\x20"), parse__, parse_block, out_code("\x20\x72\x65\x74\x75\x72\x6e\x20\x76\x61\x72\x69\x61\x62\x6c\x65\x73\x5b\x22\x72\x65\x74\x56\x61\x6c\x22\x5d\x3b\x20\x7d\x3b")), join(str("\x69\x66"), parse__, str("\x28"), parse__, out_code("\x69\x66\x28\x28"), parse_expr, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x29\x20\x7b"), parse__, str("\x29"), parse__, parse_block, out_code("\x7d")), join(str("\x77\x68\x69\x6c\x65"), parse__, str("\x28"), parse__, out_code("\x77\x68\x69\x6c\x65\x28\x28"), parse_expr, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x29\x20\x7b"), parse__, str("\x29"), parse__, parse_block, out_code("\x7d")), join(parse_expr, out_code("\x3b")))(start));
        return memoTable.get("statement "+start);
    }
    function parse_block(start) {
        if(memoTable.has("block "+start)) return memoTable.get("block "+start);
        memoTable.set("block "+start, join(str("\x7b"), out_code("\x7b"), parse__, repeat(join(parse_statement, parse__)), out_code("\x7d\x3b"), str("\x7d"))(start));
        return memoTable.get("block "+start);
    }
    function parse_expr(start) {
        if(memoTable.has("expr "+start)) return memoTable.get("expr "+start);
        memoTable.set("expr "+start, parse_expr_join(start));
        return memoTable.get("expr "+start);
    }
    function parse_expr_join(start) {
        if(memoTable.has("expr_join "+start)) return memoTable.get("expr_join "+start);
        memoTable.set("expr_join "+start, choice(join(out_code("\x66\x72\x6f\x6d\x53\x74\x72\x28\x5b\x74\x6f\x53\x74\x72\x28"), parse_expr_or, out_code("\x29"), repeat_plus(join(parse__, str("\x6a\x6f\x69\x6e"), out_code("\x2c"), parse__, out_code("\x74\x6f\x53\x74\x72\x28"), parse_expr_or, out_code("\x29"))), out_code("\x5d\x2e\x6a\x6f\x69\x6e\x28\x22\x22\x29\x29")), parse_expr_or)(start));
        return memoTable.get("expr_join "+start);
    }
    function parse_expr_or(start) {
        if(memoTable.has("expr_or "+start)) return memoTable.get("expr_or "+start);
        memoTable.set("expr_or "+start, choice(join(out_code("\x66\x72\x6f\x6d\x49\x6e\x74\x28\x28"), parse_expr_and, parse__, str("\x7c\x7c"), out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x20\x7c\x7c\x20\x28"), parse__, parse_expr_or, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x20\x7c\x7c\x20\x30\x29")), parse_expr_and)(start));
        return memoTable.get("expr_or "+start);
    }
    function parse_expr_and(start) {
        if(memoTable.has("expr_and "+start)) return memoTable.get("expr_and "+start);
        memoTable.set("expr_and "+start, choice(join(out_code("\x66\x72\x6f\x6d\x49\x6e\x74\x28\x28"), parse_expr_comp, parse__, str("\x26\x26"), out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x20\x26\x26\x20\x28"), parse__, parse_expr_and, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x20\x7c\x7c\x20\x30\x29")), parse_expr_comp)(start));
        return memoTable.get("expr_and "+start);
    }
    function parse_expr_comp(start) {
        if(memoTable.has("expr_comp "+start)) return memoTable.get("expr_comp "+start);
        memoTable.set("expr_comp "+start, choice(join(out_code("\x66\x72\x6f\x6d\x49\x6e\x74\x28\x28"), parse_expr_sum, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x20\x3c\x20\x28"), parse__, str("\x3c"), parse__, parse_expr_sum, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x20\x3f\x20\x31\x20\x3a\x20\x30\x29")), join(out_code("\x66\x72\x6f\x6d\x49\x6e\x74\x28\x28"), parse_expr_sum, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x20\x3d\x3d\x3d\x20\x28"), parse__, str("\x3d\x3d"), parse__, parse_expr_sum, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x20\x3f\x20\x31\x20\x3a\x20\x30\x29")), join(out_code("\x66\x72\x6f\x6d\x49\x6e\x74\x28\x28"), parse_expr_sum, out_code("\x29\x20\x3d\x3d\x3d\x20\x28"), parse__, str("\x3d\x3d\x3d"), parse__, parse_expr_sum, out_code("\x29\x20\x3f\x20\x31\x20\x3a\x20\x30\x29")), parse_expr_sum)(start));
        return memoTable.get("expr_comp "+start);
    }
    function parse_expr_sum(start) {
        if(memoTable.has("expr_sum "+start)) return memoTable.get("expr_sum "+start);
        memoTable.set("expr_sum "+start, choice(join(out_code("\x66\x72\x6f\x6d\x49\x6e\x74\x28\x28"), parse_expr_prod, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68"), repeat_plus(join(parse__, choice(join(str("\x2b"), out_code("\x2b")), join(str("\x2d"), out_code("\x2d"))), parse__, out_code("\x28"), parse_expr_prod, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x29")))), parse_expr_prod)(start));
        return memoTable.get("expr_sum "+start);
    }
    function parse_expr_prod(start) {
        if(memoTable.has("expr_prod "+start)) return memoTable.get("expr_prod "+start);
        memoTable.set("expr_prod "+start, choice(join(out_code("\x66\x72\x6f\x6d\x49\x6e\x74\x28\x28"), parse_expr_pow, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68"), repeat_plus(join(parse__, choice(join(str("\x2a"), out_code("\x2a")), join(str("\x25"), out_code("\x25"))), parse__, out_code("\x28"), parse_expr_pow, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x29")))), parse_expr_pow)(start));
        return memoTable.get("expr_prod "+start);
    }
    function parse_expr_pow(start) {
        if(memoTable.has("expr_pow "+start)) return memoTable.get("expr_pow "+start);
        memoTable.set("expr_pow "+start, choice(join(out_code("\x66\x72\x6f\x6d\x49\x6e\x74\x28\x28"), parse_expr_prefix, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x20\x2a\x2a\x20\x28"), parse__, str("\x2a\x2a"), parse__, parse_expr_pow, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x29")), parse_expr_prefix)(start));
        return memoTable.get("expr_pow "+start);
    }
    function parse_expr_prefix(start) {
        if(memoTable.has("expr_prefix "+start)) return memoTable.get("expr_prefix "+start);
        memoTable.set("expr_prefix "+start, choice(join(out_code("\x66\x72\x6f\x6d\x49\x6e\x74\x28\x28"), str("\x21"), parse__, parse_expr_prefix, out_code("\x29\x2e\x6c\x65\x6e\x67\x74\x68\x20\x3f\x20\x30\x20\x3a\x20\x31\x29")), join(str("\x74\x79\x70\x65\x6f\x66"), parse__, noemit(parse_expr_prefix), out_code("\x28\x66\x72\x6f\x6d\x53\x74\x72\x28\x22\x6c\x69\x73\x74\x22\x29\x29")), parse_func_call)(start));
        return memoTable.get("expr_prefix "+start);
    }
    function parse_func_call(start) {
        if(memoTable.has("func_call "+start)) return memoTable.get("func_call "+start);
        memoTable.set("func_call "+start, choice(join(out_code("\x28\x61\x77\x61\x69\x74\x20"), parse_func_get, parse__, str("\x28"), out_code("\x28"), parse__, optional(join(parse_expr, parse__, repeat(join(str("\x2c"), out_code("\x2c"), parse__, parse_expr, parse__)))), out_code("\x29"), str("\x29"), out_code("\x20\x3f\x3f\x20\x5b\x5d\x29")), parse_group)(start));
        return memoTable.get("func_call "+start);
    }
    function parse_func_get(start) {
        if(memoTable.has("func_get "+start)) return memoTable.get("func_get "+start);
        memoTable.set("func_get "+start, join(out_code("\x28\x4f\x62\x6a\x65\x63\x74\x2e\x68\x61\x73\x4f\x77\x6e\x28\x66\x75\x6e\x63\x74\x69\x6f\x6e\x73\x2c\x20\x22"), noconsume(parse_identifier), out_code("\x22\x29\x20\x3f\x20\x66\x75\x6e\x63\x74\x69\x6f\x6e\x73\x5b\x22"), noconsume(parse_identifier), out_code("\x22\x5d\x20\x3a\x20\x28\x28\x29\x20\x3d\x3e\x20\x7b\x20\x74\x68\x72\x6f\x77\x20\x22\x75\x6e\x76\x61\x6c\x69\x64\x20\x66\x75\x6e\x63\x74\x69\x6f\x6e\x3a\x20"), parse_identifier, out_code("\x22\x3b\x20\x7d\x29\x28\x29\x29"))(start));
        return memoTable.get("func_get "+start);
    }
    function parse_group(start) {
        if(memoTable.has("group "+start)) return memoTable.get("group "+start);
        memoTable.set("group "+start, choice(join(str("\x28"), parse__, parse_expr, parse__, str("\x29")), parse_value)(start));
        return memoTable.get("group "+start);
    }
    function parse_value(start) {
        if(memoTable.has("value "+start)) return memoTable.get("value "+start);
        memoTable.set("value "+start, choice(parse_integer, parse_string, join(str("\x5b"), out_code("\x5b"), parse__, optional(join(parse_expr, parse__, repeat(join(str("\x2c"), out_code("\x2c"), parse__, parse_expr, parse__)))), out_code("\x5d"), str("\x5d")), choice(join(str("\x74\x72\x75\x65"), parse_idend, out_code("\x28\x5b\x5b\x5d\x5d\x29")), join(str("\x66\x61\x6c\x73\x65"), parse_idend, out_code("\x28\x5b\x5d\x29"))), join(str("\x6e\x75\x6c\x6c"), parse_idend, out_code("\x28\x5b\x5d\x29")), join(str("\x69\x6e\x50\x75\x74"), out_code("\x28\x66\x72\x6f\x6d\x53\x74\x72\x28\x70\x72\x6f\x6d\x70\x74\x28\x22\x45\x6e\x74\x65\x72\x20\x6c\x69\x6e\x65\x20\x6f\x66\x20\x69\x6e\x70\x75\x74\x3a\x22\x29\x20\x3f\x3f\x20\x22\x22\x29\x29")), join(out_code("\x28\x4f\x62\x6a\x65\x63\x74\x2e\x68\x61\x73\x4f\x77\x6e\x28\x76\x61\x72\x69\x61\x62\x6c\x65\x73\x2c\x20\x22"), noconsume(parse_identifier), out_code("\x22\x29\x20\x3f\x20\x76\x61\x72\x69\x61\x62\x6c\x65\x73\x5b\x22"), noconsume(parse_identifier), out_code("\x22\x5d\x20\x3a\x20\x28\x28\x29\x20\x3d\x3e\x20\x7b\x20\x74\x68\x72\x6f\x77\x20\x22\x75\x6e\x76\x61\x6c\x69\x64\x20\x76\x61\x69\x65\x72\x61\x62\x6c\x65\x3a\x20"), parse_identifier, out_code("\x22\x3b\x20\x7d\x29\x28\x29\x29")))(start));
        return memoTable.get("value "+start);
    }
    
    let res = parse_main(0);
    if(res.result === false || res.consumed !== code.length) {
        let at = new Ctx(greatestSuccessIndex);
        throw new Error("Invalid syntax at "+at.line+":"+at.column);
    } else {
        return res.result;
    }
}