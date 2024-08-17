#!/bin/bash

echo "=============STARTED CONFIG================="

# Read secrets from files
username=$(cat /run/secrets/mongodb_username)
password=$(cat /run/secrets/mongodb_password)

# Initialize MongoDB and create the user
mongo -- "$MONGO_INITDB_DATABASE" <<EOF
use zalando-prive;

db.createUser({
    user: '$username',
    pwd: '$password',
    roles: [
        {
            role: 'readWrite',
            db: 'zalando-prive',
        },
    ],
});

db.createCollection("brands");
db.createCollection("categories");
db.createCollection("cookies");
db.createCollection("products");
db.createCollection("sizes");
db.createCollection("tags");
db.createCollection("watchlists");

db.createView("tagged_categories", "tags", [
    {
        \$lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "id",
            as: "categoryName"
        }
    },
    {
        \$unwind: {
            path: "\$categoryName",
            includeArrayIndex: "i",
            preserveNullAndEmptyArrays: false
        }
    },
    {
        \$addFields: {
            categorySlug: "\$categoryName.name"
        }
    },
    {
        \$project: {
            _id: 0,
            categorySlug: 1,
            filterName: 1,
            categoryId: 1,
            gender: {
                \$arrayElemAt: [
                    "\$categoryName.ancestor_names",
                    1
                ]
            }
        }
    }
]);

EOF

echo "=============CONFIG COMPLETED================="
