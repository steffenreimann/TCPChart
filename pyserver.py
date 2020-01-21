import socket 
import json
from time import sleep
import random

TCP_IP = '127.0.0.1'
TCP_PORT = 5005
BUFFER_SIZE = 1024  # Normally 1024, but we want fast response
    
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((TCP_IP, TCP_PORT))
s.listen(1)
   
conn, addr = s.accept()
print 'Connection address:', addr

state = False

while 1:
    data = conn.recv(BUFFER_SIZE)
    if not data: break
    print "received data:", data
    # parse x:
    y = json.loads(data)
    category = y["category"]
    command = y["command"]
    msg_data = y["data"] 
    device = y["device"]

    # the result is a Python dictionary:
    
    if category == "debug" and command == "START_STEERING_DEBUG":
        print(category)
        print(command)
        print(msg_data)
        print(device)
        
        state = msg_data["state"]
        while state:
            dac_power  = random.randrange(0, 2000)
            target_position  = random.randrange(0, 1000)
            current_position  = random.randrange(0, 1000)
            print("send msg ...")
            jsonData = {
                "category":"debug",
                "command":"DEBUG_STEERING",
                "value":{
                        "time":1000,
                        "direction":"FOR",
                        "enabled_motors":{"steering":False,"drive":True},
                        "dac_power": dac_power,
                        "target_position":target_position,
                        "current_position":current_position
                        }
                    
                    
            }
            

            z = json.dumps(jsonData)
            conn.send(z)
            sleep(0.1)
        pass
    conn.send(data)  # echo
conn.close()