import socket
import os
import re

def get_local_ip():
    """
    This function finds the local IP address of the machine.
    It works by creating a temporary connection to a public DNS server.
    """
    s = None
    try:
        # Create a socket object
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Connect to a public server (doesn't send any data)
        s.connect(("8.8.8.8", 80))
        # Get the socket's own address
        ip_address = s.getsockname()[0]
    except Exception as e:
        print(f"Could not get local IP: {e}")
        ip_address = "127.0.0.1"  # Fallback to localhost
    finally:
        if s:
            s.close()
    return ip_address

def update_config_js(ip_address, port=8000):
    """
    Updates the frontend config.js file with the current IP address.
    """
    config_path = os.path.join("frontend", "config.js")
    
    if not os.path.exists(config_path):
        print(f"Config file not found at {config_path}")
        return False
    
    try:
        # Read the current config file
        with open(config_path, 'r') as file:
            content = file.read()
        
        # Update the API_BASE_URL with the new IP
        new_url = f"http://{ip_address}:{port}"
        
        # Replace the API_BASE_URL line
        pattern = r"const API_BASE_URL = process\.env\.API_BASE_URL \|\| '[^']*';"
        replacement = f"const API_BASE_URL = process.env.API_BASE_URL || '{new_url}';"
        
        updated_content = re.sub(pattern, replacement, content)
        
        # Write the updated content back
        with open(config_path, 'w') as file:
            file.write(updated_content)
        
        print(f"Updated config.js with API_BASE_URL: {new_url}")
        return True
        
    except Exception as e:
        print(f"Error updating config.js: {e}")
        return False

if __name__ == "__main__":
    ip = get_local_ip()
    print(f"Your local IP address is: {ip}")
    
    # Update config.js with the current IP
    if update_config_js(ip):
        print("Frontend config.js updated successfully!")
    else:
        print("Failed to update config.js")
    
    print("\nRun your backend server with the following command:")
    print(f"uvicorn main:app --host {ip} --port 8000")
    print("\nOr use the following for development with auto-reload:")
    print(f"uvicorn main:app --host {ip} --port 8000 --reload")
