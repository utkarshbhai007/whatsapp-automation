import pywhatkit
import time
import sys
import os
import re
import pyautogui
import logging
from datetime import datetime

# Configuration
pyautogui.FAILSAFE = False
IMAGE_PATH = "villa.png"
LOG_FILE = 'whatsapp_errors.log'

# Setup logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def wait_for_file(file_path, max_wait=15):
    """Wait for file to be created with timeout"""
    waited = 0
    while waited < max_wait:
        if os.path.exists(file_path):
            return True
        time.sleep(0.5)
        waited += 0.5
    return False

def read_temp_files():
    """Read numbers and message from temp files"""
    try:
        # Look for temp files in the same directory as this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        numbers_file = os.path.join(script_dir, "temp_numbers.txt")
        message_file = os.path.join(script_dir, "temp_message.txt")

        print(f"Looking for numbers file: {numbers_file}")
        print(f"Looking for message file: {message_file}")
        print(f"Absolute numbers file path: {os.path.abspath(numbers_file)}")
        print(f"Absolute message file path: {os.path.abspath(message_file)}")
        
        # Wait for files to be created
        print("Waiting for files to be created...")
        if not wait_for_file(numbers_file):
            print(f"ERROR: Numbers file not found after waiting: {numbers_file}")
            return [], ""
            
        if not wait_for_file(message_file):
            print(f"ERROR: Message file not found after waiting: {message_file}")
            return [], ""
        
        # Small delay to ensure file writing is complete
        time.sleep(1)
        
        # Read files
        with open(numbers_file, "r", encoding="utf-8") as f:
            numbers = [line.strip() for line in f if line.strip()]
        
        with open(message_file, "r", encoding="utf-8") as f:
            message = f.read().strip()
        
        print(f"SUCCESS: Read {len(numbers)} numbers and message length: {len(message)}")
        return numbers, message
        
    except Exception as e:
        print(f"ERROR: Error reading temp files: {e}")
        return [], ""

def validate_number(number):
    """Validate and format phone number"""
    clean_num = re.sub(r'[^\d+]', '', number)
    if re.fullmatch(r"\+?\d{10,15}", clean_num):
        return clean_num if clean_num.startswith("+") else f"+{clean_num}"
    return None

def send_single_message(number, message, index, total):
    """Send message to a single number"""
    print(f"SENDING to ({index + 1}/{total}): {number}")
    
    try:
        # Check if image exists
        if not os.path.exists(IMAGE_PATH):
            print(f"ERROR: Image file not found: {IMAGE_PATH}")
            return False
            
        # Send image with caption
        pywhatkit.sendwhats_image(
            receiver=number,
            img_path=IMAGE_PATH,
            caption=message,
            wait_time=15,
            tab_close=False
        )

        print("WAITING for WhatsApp Web to load...")
        time.sleep(20)

        # Press enter to send
        pyautogui.press("enter")
        print("SUCCESS: Message sent!")

        time.sleep(3)

        # Close tab
        pyautogui.hotkey("ctrl", "w")
        time.sleep(1)
        pyautogui.press("enter")  # Confirm 'Leave' if prompted
        print("TAB closed")

        time.sleep(8)  # Wait before next message
        return True

    except Exception as e:
        print(f"FAILED to send to {number}: {e}")
        return False

def main():
    """Main function"""
    print("WHATSAPP AUTO SENDER STARTED")
    print("=" * 50)
    
    # Read numbers and message
    raw_numbers, message = read_temp_files()
    
    if not raw_numbers:
        print("ERROR: No numbers found")
        return
    
    if not message:
        print("ERROR: No message found")
        return
    
    # Validate numbers
    valid_numbers = []
    for num in raw_numbers:
        formatted_num = validate_number(num)
        if formatted_num:
            valid_numbers.append(formatted_num)
        else:
            print(f"WARNING: Skipping invalid number: {num}")
    
    if not valid_numbers:
        print("ERROR: No valid numbers found")
        return
    
    total = len(valid_numbers)
    print(f"SUCCESS: Found {total} valid number(s)")
    print(f"MESSAGE: {message[:50]}...")
    print(f"IMAGE: {IMAGE_PATH}")
    
    # Check if image exists
    if not os.path.exists(IMAGE_PATH):
        print(f"ERROR: Image file not found: {IMAGE_PATH}")
        print("Please make sure villa.png is in the same folder as this script")
        return
    
    print("\nIMPORTANT: Make sure WhatsApp Web is logged in Chrome!")
    print("Starting in 5 seconds...")
    time.sleep(5)

    # Send messages
    successful = 0
    for i, number in enumerate(valid_numbers):
        if send_single_message(number, message, i, total):
            successful += 1

    # Summary
    print("\n" + "=" * 50)
    print("SENDING COMPLETE!")
    print(f"SUCCESSFUL: {successful}/{total}")
    print(f"FAILED: {total - successful}")
    print("PROCESS FINISHED!")

if __name__ == "__main__":
    main()