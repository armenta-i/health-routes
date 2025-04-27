import socket
import subprocess
import threading
import time
import os

# EDIT these paths based on your project structure
BACKEND_DIR = r"AI-HACK\backend"
FRONTEND_DIR = r"AI-HACK\frontend"

def get_local_ip():
    """Get the local network IP address."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Doesn't need to actually connect
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def run_backend(ip_address):
    """Run the backend server using uvicorn."""
    print(f"Starting backend in {BACKEND_DIR} on {ip_address}:8000...")
    os.chdir(BACKEND_DIR)
    backend_command = f"uvicorn main:app --host {ip_address} --port 8000"
    subprocess.run(backend_command, shell=True)

def run_frontend():
    """Run the frontend using npx expo start."""
    print(f"Starting frontend in {FRONTEND_DIR}...")
    os.chdir(FRONTEND_DIR)
    frontend_command = "npx expo start"
    subprocess.run(frontend_command, shell=True)

if __name__ == "__main__":
    ip = get_local_ip()
    print(f"Detected Local IP: {ip}")

    # Start backend and frontend in separate threads
    backend_thread = threading.Thread(target=run_backend, args=(ip,))
    frontend_thread = threading.Thread(target=run_frontend)

    backend_thread.start()
    time.sleep(2)  # Slight delay so backend has a headstart
    frontend_thread.start()

    backend_thread.join()
    frontend_thread.join()
