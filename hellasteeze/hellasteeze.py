import requests
import json
import pymongo
import os
from cookiemonster import test_login
from pymongo import MongoClient
import docker
import random
import time
from datetime import datetime
from dateutil import parser

MONGO_URI = os.getenv('MONGODB_URI') 
#PROXY_URI = os.getenv('PROXY_URI') 

client = docker.from_env()
    
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
        

def update_cookies(cookies, updates):
    cookie_str = ''
    for key, value in updates.items():
        cookie_str += f'{key}={value}; '
    print(f'Cookies are: {cookie_str}')
    return cookie_str

# Function to save JSON to a file
def save_json_to_file(json_data, filename):
    with open(filename, 'w') as json_file:
        json.dump(json_data, json_file, indent=4)

# Function to load cookies from MongoDB
def load_cookies_from_mongo():
    client = MongoClient(MONGO_URI)
    db = client['zalando-prive']
    collection = db['cookies']
    cookies_doc = collection.find_one({})
    return cookies_doc['cookies'] if cookies_doc else None

# Function to save cookies to MongoDB
def save_cookies_to_mongo(cookies):
    print ("Saving cookies to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client['zalando-prive']
    collection = db['cookies']
    collection.update_one({}, {'$set': {'cookies': cookies}}, upsert=True)

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
            
def start_get_session_cookie_container():
    print("Getting cookies from the monster...")
    cookies = test_login()
    print("Got cookies from the monster.")
    
    save_cookies_to_mongo(cookies)
    initial_headers['Cookie'] = update_cookies('', cookies)
    try_request_with_cookies()
    
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
            start_get_session_cookie_container()
            break
        
        if len(results) > 0:
            print("Saving JSON to MongoDB...")
            save_response_to_mongo(results)
        else:
            print("No results were found for this request.")

initial_headers = {
  'Content-Type': 'application/json',
  'Accept': '*/*',
  'Sec-Fetch-Site': 'same-origin',
  'Accept-Language': 'es-ES,es;q=0.9',
  'Sec-Fetch-Mode': 'cors',
  'Accept-Encoding': 'gzip, deflate, br',
  'Origin': 'https://www.zalando-prive.es',
  'Referer': 'https://www.zalando-prive.es/articles/categories/24128398',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Content-Length': '15',
  'Connection': 'keep-alive',
  'Host': 'www.zalando-prive.es',
  'Sec-Fetch-Dest': 'empty',
  'Cookie': '',  # Initially empty, will be populated later
  'X-SortDown-Reserved': 'true',
  'client_type': 'web',
  'X-Touchpoint': 'ccf',
  'x-xsrf-token': '0518f92960fa8dc87c8d8b   2a52f967b86849d67e7a5172da335714761fb5717e'
}


# Load cookies from MongoDB
cookies = load_cookies_from_mongo()
if cookies:
    initial_headers['Cookie'] = update_cookies('', cookies)
    try_request_with_cookies()
else:
    print("No cookies found or expired cookies. Calling the cookie monster...")
    start_get_session_cookie_container()