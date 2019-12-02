import sys

def main():
	if len(sys.argv) > 4 or len(sys.argv) < 4:
		print("usage: separate.py fileWithAllWords.txt outputName.txt maxWordsInAFile")
		exit()
	else:
		thisFileNumber = 0
		with open("{}.txt".format(sys.argv[1]), "r") as maintxt:
			count = 0
			outputPtr = open("{}_{}.txt".format(sys.argv[2], thisFileNumber), "w")
			for line in maintxt:
				if count >= int(sys.argv[3]):
					thisFileNumber += 1
					count = 0
					outputPtr.close()
					outputPtr = open("{}_{}.txt".format(sys.argv[2], thisFileNumber), "w")
				count += 1

				outputPtr.write(line)

		outputPtr.close()

main()