import socket 
import json
import time
from time import sleep
import random
import datetime

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
    # parse String to Python JSON:
    y = json.loads(data)
    # the result is a Python dictionary:
    category = y["category"]
    command = y["command"]
    msg_data = y["data"] 
    device = y["device"]
    state = msg_data["state"]
    # If command START_STEERING_DEBUG in category debug 
    if category == "debug" and command == "START_STEERING_DEBUG":
        #printing incomming Data
        print(category)
        print(command)
        print(msg_data)
        print(device)
        
        
        while state:
            num1 = random.randrange(0, 2000)
            num2 = random.randrange(0, 1000)
            num3 = random.randrange(0, 1000)
            num4 = random.randrange(0, 1000)
            num5 = random.randrange(0, 2000)
            num6 = random.randrange(0, 1000)
            num7 = random.randrange(0, 1000)
            num8 = random.randrange(0, 1000)
            #print("send msg ...")
            epoch_time = int(time.time())
            #print(epoch_time)
            msg_tmp = "${}${}${}${}${}${}${}${}?{}"
            msg = msg_tmp.format(num1,num2,num3,num4,num5,num6,num7,num8,epoch_time)
            #print(msg) 
            jsonData = {
                "category":"debug",
                "command":"DEBUG_STEERING",
                "value":{
                        "time":1000,
                        "direction":"FOR",
                        "enabled_motors":{"steering":False,"drive":True},
                        "testname": num1,
                        "bestname":num2,
                         "current_position":num3
                        }
            }
            json_msg = json.dumps(jsonData)
            conn.send(msg)
            sleep(0.1)
        pass
    #conn.send(data)  # echo
conn.close()