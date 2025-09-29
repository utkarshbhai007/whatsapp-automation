from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os
import threading
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

script_logs = []

@app.post("/send-messages")
async def send_messages(data: dict):
    numbers = data.get("numbers", [])
    message = data.get("message", "")
    thread = threading.Thread(target=run_whatsapp_script, args=(numbers, message))
    thread.start()
    return {"status": "started"}

@app.get("/logs")
async def get_logs():
    return {"logs": script_logs}

def run_whatsapp_script(numbers: list, message: str):
    """Run the WhatsApp script in a separate thread"""
    global script_logs
    script_logs = ["SCRIPT started..."]
    
    try:
        # Get the python-script directory path
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        script_dir = os.path.join(backend_dir, "python-script")
        script_logs.append(f"Absolute script_dir: {script_dir}")
        
        # Create temporary numbers file IN THE PYTHON-SCRIPT FOLDER
        numbers_file = os.path.join(script_dir, "temp_numbers.txt")
        message_file = os.path.join(script_dir, "temp_message.txt")
        
        script_logs.append(f"Absolute numbers_file: {os.path.abspath(numbers_file)}")
        script_logs.append(f"Absolute message_file: {os.path.abspath(message_file)}")
        script_logs.append("Creating temporary files...")
        
        # Create temporary numbers file
        with open(numbers_file, "w", encoding="utf-8") as f:
            for number in numbers:
                f.write(f"{number}\n")
        
        # Create temporary message file
        with open(message_file, "w", encoding="utf-8") as f:
            f.write(message)
        
        # Force file write and close
        import time
        time.sleep(3)  # Give time for files to be written
        
        # Verify files were created
        numbers_exists = os.path.exists(numbers_file)
        message_exists = os.path.exists(message_file)
        
        script_logs.append(f"Numbers file created: {numbers_exists}")
        script_logs.append(f"Message file created: {message_exists}")
        script_logs.append(f"Files in script directory: {os.listdir(script_dir)}")
        
        if not numbers_exists or not message_exists:
            script_logs.append("ERROR: Temporary files were not created properly")
            return
        
        script_logs.append(f"PROCESSING {len(numbers)} numbers")
        
        # Change to python-script directory
        original_dir = os.getcwd()
        os.chdir(script_dir)
        script_logs.append(f"Current working directory after chdir: {os.getcwd()}")
        
        script_logs.append("STARTING WhatsApp automation...")
        
        # Run the Python script
        env = os.environ.copy()
        env["PYTHONIOENCODING"] = "utf-8"
        process = subprocess.Popen(
            ["python", "whatsapp_sender.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            encoding='utf-8',
            env=env
        )
        
        # Capture output in real-time
        for line in process.stdout:
            if line.strip():
                script_logs.append(line.strip())
                print(line.strip())
        
        process.wait()
        os.chdir(original_dir)
        
        # Clean up temp files
        try:
            if os.path.exists(numbers_file):
                os.remove(numbers_file)
            if os.path.exists(message_file):
                os.remove(message_file)
            script_logs.append("TEMPORARY files cleaned up")
        except Exception as e:
            script_logs.append(f"NOTE: Could not clean up temp files: {e}")
            
        script_logs.append("PROCESS FINISHED!")
        
    except Exception as e:
        script_logs.append(f"ERROR: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
