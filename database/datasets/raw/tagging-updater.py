from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://opi:on7hedrum5@localhost:27017/')  # Adjust connection details as needed
db = client['zalando-prive']  # Replace with your database name
categories_collection = db['categories']
tags_collection = db['tags']

# Retrieve all documents from the categories collection
categories_cursor = categories_collection.find()

# Process each document in the categories collection
for category_doc in categories_cursor:
    if category_doc:
        category_id = category_doc['id']
        category_name = category_doc['name']    
        ancestor_ids = category_doc['ancestor_ids']
        ancestor_names = category_doc['ancestor_names']
        
        print(f"\nProcessing category: {category_name} (ID: {category_id})")
        print("Names to check: " + category_name + " " + str('ancestor_names'))

        # Condition for "Hogar"
        if "Hogar" in ancestor_names:
            ids_to_check = [category_id] + ancestor_ids[1:]
            filter_name = "other"
            print(f"Condition 'Hogar' matched. IDs to check: {ids_to_check}")

        # Condition for "Calzado"
        elif "Calzado" in ancestor_names:
            ids_to_check = [category_id] + ancestor_ids[:2]
            filter_name = "shoes"
            print(f"Condition 'Calzado' matched. IDs to check: {ids_to_check}")

        # Condition for "Ropa"
        elif "Ropa" in ancestor_names:
            ids_to_check = [category_id] + ancestor_ids[:2]
            filter_name = None
            print(f"Condition 'Ropa' matched. IDs to check: {ids_to_check}")

        else:
            print(f"No specific condition matched for category: {category_name}")
            continue

        # If the filter_name is None, perform the join operation as before
        if filter_name is None:
            print(f"Performing join operation for 'Ropa'")
            matching_tags = tags_collection.find({'categoryId': {'$in': ids_to_check}})

            for tag in matching_tags:
                new_entry = {
                    'filterName': tag['filterName'],
                    'categoryId': tag['categoryId']
                }

                print(f"Inserting new entry: {category_name} -> {new_entry}")
                # Insert new entry if it doesn't already exist in the tags collection
                tags_collection.update_one(
                    {'filterName': new_entry['filterName'], 'categoryId': new_entry['categoryId']},
                    {'$setOnInsert': new_entry},
                    upsert=True
                )
        else:
            # Insert the new entry for "Hogar" or "Calzado" if it doesn't already exist
            for cat_id in ids_to_check:
                new_entry = {
                    'filterName': filter_name,
                    'categoryId': cat_id
                }

                print(f"Inserting new entry: {category_name} -> {new_entry}")
                tags_collection.update_one(
                    {'filterName': new_entry['filterName'], 'categoryId': new_entry['categoryId']},
                    {'$setOnInsert': new_entry},
                    upsert=True
                )

print("Process completed.")