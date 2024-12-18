import requests
import json
import os
import sys
import pymongo
from pymongo import MongoClient

MONGO_URI = os.getenv('MONGODB_URI') 

initial_headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/plain, */*',
  'Sec-Fetch-Site': 'same-origin',
  'Accept-Language': 'es-ES,es;q=0.9',
  'Sec-Fetch-Mode': 'cors',
  'Accept-Encoding': 'gzip, deflate, br',
  'Origin': 'https://www.zalando-prive.es',
  'Content-Length': '132',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1.1 Safari/605.1.15',
  'Referer': 'https://www.zalando-prive.es/',
  'Sec-Fetch-Dest': 'empty',
  'Cookie': '',
  'client_type': 'web',
  'X-Requested-With': 'XMLHttpRequest',
  'Priority': 'u=3, i',
  'x-xsrf-token': '82b9ca2197776505e34ca37cd0f11d9f864277257994c3632c710a1d9af7cd75'
}

def load_cookies_from_mongo():
    client = MongoClient(MONGO_URI)
    db = client['zalando-prive']
    collection = db['cookies']
    cookies_doc = collection.find_one({})
    return cookies_doc['cookies'] if cookies_doc else None

def format_cookies(cookies_dict):
    return '; '.join(f"{key}={value}" for key, value in cookies_dict.items())

def try_request_with_cookies(product):
    # Ensure the product is a string
    if not isinstance(product, str):
        product = json.dumps(product)

    url = "https://www.zalando-prive.es/api/phoenix/stockcart/cart/items"

    try:
        print("About to send this payload to Zalando..." + str(product))
        response = requests.post(url, headers=initial_headers, data=product)
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except requests.RequestException as e:
        print(f"Request failed: {e}")

    
def main():
    product_env = os.getenv("PRODUCT")
    
    if not product_env:
        print("No product data found in environment variable.")
        sys.exit(1)
    
    try:
        product = json.loads(product_env)
        print(f"Product data: {product}")
    except json.JSONDecodeError as e:
        print(f"Failed to parse product JSON: {e}")
        sys.exit(1)

    cookies = load_cookies_from_mongo()
    if not cookies:
        print("No cookies found or expired cookies.")
        sys.exit(1)
    
    print("Cookies snippet: " + str(cookies)[:15])

    formatted_cookies = format_cookies(cookies)
    print(f"Formatted Cookies: {formatted_cookies}")
    initial_headers['Cookie'] = formatted_cookies

    try_request_with_cookies(product)
    sys.exit(0)

if __name__ == "__main__":
    main()