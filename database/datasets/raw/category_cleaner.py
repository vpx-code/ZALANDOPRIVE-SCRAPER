import json

# Read the JSON data from the file with utf-8 encoding
with open('categories-raw.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def clean_category(category, cleaned_list, ancestor_names, ancestor_ids):
    cleaned = {
        "id": category["id"],
        "parentId": category["parentId"],
        "name": category["name"],
        "ancestor_names": ancestor_names,
        "ancestor_ids": ancestor_ids
    }
    cleaned_list.append(cleaned)
    if "categories" in category:
        for cat in category["categories"]:
            clean_category(cat, cleaned_list, ancestor_names + [category["name"]], ancestor_ids + [category["id"]])

cleaned_list = []
clean_category(data, cleaned_list, [], [])

# To print the cleaned data as a JSON string
print(json.dumps(cleaned_list, indent=4, ensure_ascii=False))

# Save the cleaned data to a file with utf-8 encoding
with open('cleaned_data.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_list, f, indent=4, ensure_ascii=False)