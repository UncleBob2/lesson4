import itertools

# Options from the first dropdown
square1 = [
    "b",
    "c",
    "ch",
    "d",
    "đ",
    "gi",
    "h",
    "kh",
    "l",
    "m",
    "n",
    "ng",
    "r",
    "s",
    "tr",
    "v",
    "x",
]

# Options from the second dropdown
square2 = ["ơi", "ới", "ời", "ởi", "ỡi", "ợi"]

# Options from the third dropdown
square3 = [" "]

# Generate all possible permutations
permutations = list(itertools.product(square1, square2, square3))

# Open a file for writing
with open("permutations.txt", "w", encoding="utf-8") as f:
    # Format and write the permutations to the file
    for perm in permutations:
        f.write("".join(perm) + "\n")

print("Permutations have been saved to 'permutations.txt'")
