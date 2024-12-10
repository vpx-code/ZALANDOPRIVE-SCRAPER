import requests
import json
import pymongo
import os
from pymongo import MongoClient
import random
import time
import sys
from datetime import datetime
from dateutil import parser

MONGO_URI = os.getenv('MONGODB_URI') 
#PROXY_URI = os.getenv('PROXY_URI') 

    
#tor_proxy = {
#        'http': PROXY_URI,
#        'https': PROXY_URI
#    }

def get_ip_and_country():
    try:
        response = requests.get('https://ipinfo.io')
        data = response.json()
        ip = data.get('ip')
        country = data.get('country')
        print(f"Performing request from {ip} in {country}")
    except requests.exceptions.JSONDecodeError:
        print("Error decoding your IP address. Weird!")

# Function to load cookies from MongoDB
def load_cookies_from_mongo():
    client = MongoClient(MONGO_URI)
    db = client['zalando-prive']
    collection = db['cookies']
    cookies_doc = collection.find_one({})
    return cookies_doc['cookies'] if cookies_doc else None

def save_response_to_mongo(responses):
    print("Saving product info to MongoDB...")
    
    client = MongoClient(MONGO_URI)
    db = client['zalando-prive']
    collection = db['products']
    
    base_url = "https://www.zalando-prive.es"
    base_image_url = "https://img01.ztat.net/article/"
        
    for part in responses:
        if isinstance(part, str):
            response = json.loads(part)
        else:
            response = part
        
        configs = response.get('configs', [])
        
        for item in configs:
            stockStatus = item.get("stockStatus")
            campaign_end_date_str = item.get("campaignEndDate")
            special_price = item.get("specialPrice")
            
            if campaign_end_date_str:
                campaign_end_date = parser.parse(campaign_end_date_str)

                # Make sure both dates are naive
                if campaign_end_date.tzinfo is not None:
                    campaign_end_date = campaign_end_date.replace(tzinfo=None)

                if campaign_end_date < datetime.utcnow().replace(tzinfo=None):
                    stockStatus = "UNAVAILABLE"
            
            # Prepare the price history record (current price and date)
            price_history_entry = {
                "date": datetime.utcnow().replace(tzinfo=None),
                "price": special_price
            }
            
            processed_item = {
                "nameCategoryTag": item.get("nameCategoryTag"),
                "nameColor": item.get("nameColor"),
                "brand": item.get("brand"),
                "nameShop": item.get("nameShop"),
                "images": [base_image_url + img for img in item.get("images", [])[:3]],
                "brandCode": item.get("brandCode"),
                "sku": item.get("sku"),
                "campaignEndDate": campaign_end_date,  # Store the latest campaign end date
                "specialPrice": special_price,  # Store the latest special price
                "stockStatus": stockStatus,
                "urlPath": base_url + item.get("urlPath", {}).get("46")
            }
            
            collection.update_one(
                { 
                    "sku": item.get("sku")
                },
                {
                    "$set": processed_item,
                    "$push": {
                        "campaignEndDateHistory": campaign_end_date,  # History of campaign end dates
                        "priceHistory": price_history_entry  # History of prices with date
                    }
                },
                upsert=True
            )
            
# Function to try the request with cookies
def try_request_with_cookies():
    get_ip_and_country()
    
    nextCursor = ""
    results = []    
    initial_payload = json.dumps({
        "cursor": None
    })
    
    while nextCursor is not None:
        response = requests.request("POST", os.getenv('url'), headers=initial_headers, data=initial_payload)
        if response.status_code == 206:
            print("Request was successful.")
            resulting_json = response.json()
            print(f"Response snippet was {str(resulting_json)[0:100]}")
            nextCursor = resulting_json.get("nextCursor", None)
            print (f"Next cursor is: {str(nextCursor)[0:100]}")
            if nextCursor:
                print("Next cursor was found")
                initial_payload = json.dumps({
                    "cursor": nextCursor
                })
                sleepTime = random.randint(3, 10)
                print("Going to sleep for " + str(sleepTime) + " seconds...")
                time.sleep(sleepTime)  
            else:
                print("Next cursor not found. Assigning to None.")
                nextCursor = None   
                
            print("Attaching results part to list.")
            results.append(response.json())
       
        else:
            print(f"Request failed with status code {response.status_code}.")
            try:
                # Attempt to parse the response body as JSON
                response_json = response.json()
                print("Response JSON is:", response_json)
            except requests.exceptions.JSONDecodeError:
                # Handle the case where the response body is not JSON
                print("Response body is not JSON. Raw response content:")
                print(response.text)  # Log the raw response content for debugging
            sys.exit(1)
        
        if len(results) > 0:
            print("Saving JSON to MongoDB...")
            save_response_to_mongo(results)
        else:
            print("No results were found for this request.")

initial_headers = {
  'Referer': 'https://www.zalando-prive.es/articles/categories/24128398',
  'Cookie': '',
  'Cache-Control': 'no-cache',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Host': 'www.zalando-prive.es',
  'Pragma': 'no-cache',
  'Origin': 'https://www.zalando-prive.es',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Site': 'same-origin',
  'Content-Length': '15',
  'Connection': 'keep-alive',
  'Accept-Language': 'es-ES,es;q=0.9',
  'Accept': '*/*',
  'Content-Type': 'application/json',
  'Accept-Encoding': 'gzip, deflate, br',
  'Sec-Fetch-Mode': 'cors',
  'X-Touchpoint': 'ccf',
  'x-xsrf-token': '915dab1236ba7b80cf48aa4038e22ddf051f57e4fa2559f240f127f92eb1a765',
  'X-SortDown-Reserved': 'true',
  'client_type': 'web'
}


def format_cookies(cookies_dict):
    return '; '.join(f"{key}={value}" for key, value in cookies_dict.items())

cookies = load_cookies_from_mongo()
if cookies:
    print("Cookies snippet: " + str(cookies)[:15])
    formatted_cookies = format_cookies(cookies)
    print(formatted_cookies)
    initial_headers['Cookie'] = formatted_cookies
    try_request_with_cookies() 
    sys.exit(0)
else:
    print("No cookies found or expired cookies.")
    sys.exit(1)