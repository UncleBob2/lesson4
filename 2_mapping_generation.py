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
    compound_consonants = ["ch", "tr", "ng"]
    initial = word[:2] if word[:2] in compound_consonants else word[0]
    return initial.lower()


file_path = "file.json"
character_mapping = generate_character_mapping(file_path)
print(json.dumps(character_mapping, indent=2, ensure_ascii=False))
