import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(script_dir, 'data.json')

with open(data_path, 'r', encoding='utf-8') as f:
    data = json.load(f)


# Extract directions
directions = []
for route in data.get('routes', []):
    for leg in route.get('legs', []):
        for step in leg.get('steps', []):
            instruction = step.get('html_instructions', '')
            if instruction:
                directions.append(instruction)

# Build cleaned JSON structure
cleaned_data = {
    "directions": directions
}

# Save to a new file
with open('cleaned_directions.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_data, f, indent=2)

print(f"Extracted {len(directions)} directions into 'cleaned_directions.json'.")
