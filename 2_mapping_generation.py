import json


def generate_character_mapping(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            word_data = json.load(f)

        words = word_data["words"]

        character_mapping = {}
        for word in words:
            initial = get_initial_consonant(word)
            if initial not in character_mapping:
                character_mapping[initial] = []
            character_mapping[initial].append(word)

        return character_mapping

    except Exception as e:
        print(f"An error occurred: {e}")
        return None


def get_initial_consonant(word):
    compound_consonants = ["ch", "tr", "ng", "gi", "kh"]
    for consonant in compound_consonants:
        if word.lower().startswith(consonant):
            return consonant
    return word[0].lower()


file_path = "file.json"
character_mapping = generate_character_mapping(file_path)

# Convert character_mapping to the desired JavaScript format
js_output = "const characterMapping = {\n"
for initial, words in character_mapping.items():
    js_output += f'  "{initial}": {json.dumps(words, ensure_ascii=False)},\n'
js_output = js_output.rstrip(",\n")  # Remove the trailing comma and newline
js_output += "\n}"

# Print the JavaScript output
print(js_output)
