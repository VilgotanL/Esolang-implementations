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

stack = []
lineNum = 0

def err(str):
	print("\n" + str + f" (at line {lineNum+1})")
	sys.exit(0)

def pop(index=None):
	if len(stack) < 1:
		err("Error: Stack underflow!")
	if index is None:
		return stack.pop()
	else:
		return stack.pop(index)

while lineNum < len(lines):
	#print("BEFORE LINE " + str(lineNum+1))
	line = lines[lineNum]
	prevLineNum = lineNum

	for i in range(0, len(line)):
		if line[i] == "m":
			stack.append(1)
		elif line[i] == "o":
			a, b = pop(), pop()
			stack.append(b - a)
		elif line[i] == "g":
			n = pop()
			if n < 1 or n > len(lines):
				err("Error: Attempt to goto line number out of range: "+str(n))
			lineNum = n - 2 #-2 because we're incrementing at the end and again because 2Swap uses line numbers starting at 1
			break #stop loop for this line
		elif line[i] == "u":
			n = pop()
			if n != 0:
				try:
					print(chr(n), end="", flush=True)
				except Exception as e:
					err("Error: Failed to print character with code "+str(n)+":" + str(e))
			else:
				try:
					stack.append(ord(input("\nInput character: ")))
				except:
					err("Error: Failed to input character: "+str(e))
		elif line[i] == "s":
			stack.append(pop(0))
	#print("\nAFTER LINE " + str(prevLineNum+1) + ", stack: " + str(stack))
	lineNum += 1