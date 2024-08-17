import time
import json
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options

ZALANDO_EMAIL = os.getenv('ZALANDO_EMAIL')
ZALANDO_PASSWORD = os.getenv('ZALANDO_PASSWORD')

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument('--ignore-certificate-errors')
    #chrome_options.add_argument(f'--proxy-server={get_secret("/run/secrets/proxy_uri")}')
    chrome_options.add_argument('--allow-running-insecure-content')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15')
    chrome_options.add_argument('--v=1')  # Increase logging verbosity
    chrome_options.add_argument('--log-level=0')  # Set log level to ALL
    chrome_options.add_argument('--verbose')

    driver = webdriver.Remote(
        command_executor='http://selenium-chromium:4444/wd/hub',
        options=chrome_options
    )
    driver.set_window_size(1920, 1080)
    
    return driver

def get_cookies(driver):
    print("Nom nom nom! Cookies!!")
    cookies = driver.get_cookies()
    cookies_dict = {cookie['name']: cookie['value'] for cookie in cookies}
    return cookies_dict

def test_login():
    driver = setup_driver()
    
    try:
        print("Performing Selenium code on the Grid...")
        driver.get("https://www.zalando-prive.es/")
        time.sleep(3)
        driver.get_screenshot_as_file("screenshot.png")
        
        driver.find_element(By.ID, 'topbar-cta-btn').click()
        print("Clicked the Login button.")
        time.sleep(3)
        driver.get_screenshot_as_file("screenshot1.png")

        driver.find_element(By.ID, 'sso-login-lounge').click()
        print("Entered the Login menu. Clicking stuff...")
        driver.get_screenshot_as_file("screenshot2.png")
        time.sleep(3)
        
        print("Submitting email...")
        driver.find_element(By.ID, "lookup-email").click()
        driver.find_element(By.ID, "lookup-email").send_keys(ZALANDO_EMAIL)
        driver.get_screenshot_as_file("screenshot3.png")
        driver.find_element(By.ID, "lookup-email").send_keys(Keys.ENTER)
        driver.get_screenshot_as_file("screenshot4.png")
        print("Submitted email.")
        
        driver.get_screenshot_as_file("screenshot5.png")
        print("Be patient, I'm working...")
        
        time.sleep(3)
        print("Submitting password...")
        driver.find_element(By.ID, "login-password").click()
        driver.find_element(By.ID, "login-password").send_keys(ZALANDO_PASSWORD)
        driver.find_element(By.ID, "login-password").send_keys(Keys.ENTER)
        print("Submitted password.")
        driver.get_screenshot_as_file("screenshot6.png")
        time.sleep(5)
        print("I just waited 5 seconds.")
        driver.get_screenshot_as_file("screenshot7.png")
        cookies = get_cookies(driver)
        return cookies

    except Exception as e:
        print(f"An error occurred: {e}")
        error_message = {'error': str(e)}

    finally:
        for log_type in driver.log_types:
            print(f"--- Logs of type: {log_type} ---")
            logs = driver.get_log(log_type)
            for entry in logs:
                print(entry)
        
        driver.quit()

if __name__ == "__main__":
    test_login()