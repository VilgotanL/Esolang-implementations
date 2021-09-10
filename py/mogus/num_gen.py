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


if __name__ == "__main__":
    n = input("Enter integer: ")
    try:
        n = int(n)
    except Exception as e:
        print("Invalid integer!")
    else:
        print(num_gen(n))