# By VilgotanL
import math
import sys
import os

lines = []
try:
	fileName = sys.argv[1]
	file = open(fileName)
	lines = file.read().split("\n")
	file.close()
except Exception as e:
	print(f"Error while opening file:\n{e}")
	sys.exit(0)

registers = [0, 0]
lineNum = 0

def err(str):
	print("\n" + str + f" (at line {lineNum+1})")
	sys.exit(0)

while lineNum < len(lines) and lineNum >= 0:
	line = lines[lineNum]
	prevLineNum = lineNum

	for i in range(0, len(line)):
		if line[i] == "*":
			registers = [registers[1] + 1, registers[0]]
		elif line[i] == "-":
			if registers[0] > 0:
				registers[0] -= 1;
			else:
				str1 = ""
				for char in line[(i+1):]:
					if char.isdigit():
						str1 += char
					else:
						break
				n = 0
				try:
					n = int(str1)
				except:
					err("Invalid integer after - with current counter at 0")
				lineNum = n - 2 #-2 because we're incrementing at the end and again because 2Swap uses line numbers starting at 1
				break #stop loop for this line
	print("AFTER LINE " + str(prevLineNum+1) + ", registers: " + str(registers))
	lineNum += 1