import subprocess

info = subprocess.STARTUPINFO()
info.dwFlags = 1
info.wShowWindow = 0
subprocess.Popen("node code", startupinfo=info)