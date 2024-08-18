import json

# Read the JSON data from the file with utf-8 encoding
with open('raw-articles-4k.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Initialize a set to track unique (filterName, categoryId) pairs
unique_pairs = set()

# Iterate over each config element in the data
for config in data.get('configs', []):
    filtername = None
    category_id = config.get('categoryId')

    # Iterate through the simples list to find the filterName
    for simple in config.get('simples', []):
        filtername = simple.get('filterName')
        if filtername:
            break

    # Add the (filterName, categoryId) pair to the set
    if filtername and category_id is not None:
        unique_pairs.add((filtername, category_id))

# Convert the set to a list of dictionaries
unique_pairs_list = [{"filterName": pair[0], "categoryId": pair[1]} for pair in unique_pairs]

# Print the resulting list
print(json.dumps(unique_pairs_list, indent=4, ensure_ascii=False))

# Save the resulting list to a file with utf-8 encoding
with open('tagging.json', 'w', encoding='utf-8') as f:
    json.dump(unique_pairs_list, f, indent=4, ensure_ascii=False)