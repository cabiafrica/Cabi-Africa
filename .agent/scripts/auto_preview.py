#!/usr/bin/env python3
"""
Auto Preview - Antigravity Kit
==============================
Manages (start/stop/status) the local development server for previewing the application.

Usage:
    python .agent/scripts/auto_preview.py start [port]
    python .agent/scripts/auto_preview.py stop
    python .agent/scripts/auto_preview.py status
"""

import os
import sys
import time
import json
import signal
import argparse
import subprocess
from pathlib import Path

AGENT_DIR = Path(".agent")
PID_FILE = AGENT_DIR / "preview.pid"
LOG_FILE = AGENT_DIR / "preview.log"

def get_project_root():
    return Path(".").resolve()

def is_running(pid):
    if sys.platform == 'win32':
        try:
            out = subprocess.check_output(f'tasklist /FI "PID eq {pid}"', shell=True).decode(errors='ignore')
            return str(pid) in out
        except:
            return False
    else:
        try:
            os.kill(pid, 0)
            return True
        except PermissionError:
            return True
        except OSError:
            return False

def get_start_command(root, target="user"):
    pkg_file = root / "package.json"
    if not pkg_file.exists():
        return None
    
    with open(pkg_file, 'r') as f:
        data = json.load(f)
    
    scripts = data.get("scripts", {})
    
    # Try dev:target first
    target_script = f"dev:{target}"
    if target_script in scripts:
        return ["npm", "run", target_script]
    
    if "dev" in scripts:
        return ["npm", "run", "dev"]
    elif "start" in scripts:
        return ["npm", "start"]
    return None

def start_server(target="user", port=3000):
    if PID_FILE.exists():
        try:
            pid = int(PID_FILE.read_text().strip())
            if is_running(pid):
                print(f"[ALREADY RUNNING] Preview already running (PID: {pid})")
                return
        except:
            pass # Invalid PID file

    root = get_project_root()
    cmd = get_start_command(root, target)
    
    if not cmd:
        print(f"[ERROR] No script found for target '{target}' in package.json")
        sys.exit(1)
    
    # Add port env var if needed
    env = os.environ.copy()
    env["PORT"] = str(port)
    
    print(f"[STARTING] Starting preview for target '{target}' on port {port}...")
    
    with open(LOG_FILE, "w") as log:
        process = subprocess.Popen(
            cmd,
            cwd=str(root),
            stdout=log,
            stderr=log,
            env=env,
            shell=True # Required for npm on windows often, or consistent path handling
        )
    
    # Save target info along with PID
    status_data = {"pid": process.pid, "target": target, "port": port}
    PID_FILE.write_text(json.dumps(status_data))
    print(f"[OK] Preview started! (PID: {process.pid})")
    print(f"   Logs: {LOG_FILE}")
    print(f"   URL: http://localhost:{port}")

def stop_server():
    if not PID_FILE.exists():
        print("[INFO] No preview server found.")
        return

    try:
        content = PID_FILE.read_text().strip()
        try:
            status_data = json.loads(content)
            pid = status_data["pid"]
        except json.JSONDecodeError:
            pid = int(content)
            
        if is_running(pid):
            # Try gentle kill first
            os.kill(pid, signal.SIGTERM) if sys.platform != 'win32' else subprocess.call(['taskkill', '/F', '/T', '/PID', str(pid)])
            print(f"[STOPPED] Preview stopped (PID: {pid})")
        else:
            print("[INFO] Process was not running.")
    except Exception as e:
        print(f"[ERROR] Error stopping server: {e}")
    finally:
        if PID_FILE.exists():
            PID_FILE.unlink()

def status_server():
    running = False
    pid = None
    target = "Unknown"
    port = 3000
    
    if PID_FILE.exists():
        try:
            content = PID_FILE.read_text().strip()
            try:
                status_data = json.loads(content)
                pid = status_data["pid"]
                target = status_data.get("target", "user")
                port = status_data.get("port", 3000)
            except json.JSONDecodeError:
                pid = int(content)
                
            if is_running(pid):
                running = True
        except:
            pass
            
    print("\n=== Preview Status ===")
    if running:
        print(f"[OK] Status: Running")
        print(f"Target: {target}")
        print(f"PID: {pid}")
        print(f"URL: http://localhost:{port}")
        print(f"Logs: {LOG_FILE}")
    else:
        print("[STOPPED] Status: Stopped")
    print("===================\n")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["start", "stop", "status"])
    parser.add_argument("arg1", nargs="?", default=None)
    parser.add_argument("arg2", nargs="?", default=None)
    
    args = parser.parse_args()
    
    if args.action == "start":
        # Resolve target and port
        target = "user"
        port = 3000
        
        if args.arg1:
            if args.arg1.isdigit():
                port = int(args.arg1)
            else:
                target = args.arg1
                if args.arg2 and args.arg2.isdigit():
                    port = int(args.arg2)
                    
        start_server(target, port)
    elif args.action == "stop":
        stop_server()
    elif args.action == "status":
        status_server()

if __name__ == "__main__":
    main()
