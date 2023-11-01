import json
from unidecode import unidecode


def generate_json(input_file, output_file):
    data = {}
    current_word = None

    with open(input_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            print(f"Reading line: {line}")

            if ":" in line:
                # This line contains a description
                description = line
                if current_word:
                    # Convert Vietnamese to ASCII and replace spaces with underscores
                    audio_file_name = (
                        unidecode(f"{current_word}_{description.split(':')[0].strip()}")
                        .lower()
                        .replace(" ", "_")
                        + ".mp3"
                    )
                    image_file_name = (
                        unidecode(f"{current_word}_{description.split(':')[0].strip()}")
                        .lower()
                        .replace(" ", "_")
                        + ".png"
                    )

                    data[current_word] = {
                        "audioPath": f"path/to/audio/{audio_file_name}",
                        "imagePath": f"path/to/image/{image_file_name}",
                        "combinedWords": description,
                    }
                    print(f"Added word: {current_word}, Description: {description}")
            else:
                # This line contains a new word
                current_word = line
                print(f"New word: {current_word}")

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({"words": data}, f, ensure_ascii=False, indent=2)

    print(f"JSON data has been saved to '{output_file}'")


generate_json("info.txt", "file.json")
