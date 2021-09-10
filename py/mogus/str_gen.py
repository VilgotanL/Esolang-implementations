def num_gen(n):
    if n == 0:
        ans = "mmo"
    elif n == 1:
        ans = "m"
    elif n > 0:
        ans = "mmommo" + ("mo" * abs(n)) + "o"
    elif n < 0:
        ans = "mmo" + ("mo" * abs(n))
    return ans


inp = input("Enter string: ")

ans = ""
for i in range(0, len(inp)):
    ans += num_gen(ord(inp[i]))
    ans += "u\n"
print(ans)