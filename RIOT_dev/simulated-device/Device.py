# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for full license information.
import os
import time
import uuid
import random
import time
import sys
import json
import base64


import paho.mqtt.client as mqtt
'''
sys.path.insert(1, 'lib')

from  MQTTSNclient import Client
'''
# Using the Python Device SDK for IoT Hub:
#   https://github.com/Azure/azure-iot-sdk-python
# The sample connects to a device-specific MQTT endpoint on your IoT Hub.
from azure.iot.device import IoTHubDeviceClient, Message


# The device connection string to authenticate the device with your IoT hub.
# Using the Azure CLI:
# az iot hub device-identity show-connection-string --hub-name {YourIoTHubName} --device-id MyNodeDevice --output table

CONNECTION_STRING = "HostName=Assignment.azure-devices.net;DeviceId=MyPythonDevice;SharedAccessKey=51kvyuxG6g+IjXLWrPyTmkQSfmD9g0HCCxzVa3zLgl0="
app_id = "uoogio_net"
access_key = "ttn-account-v2.CxCOkFC9Tz5hrzby0KNF_uO6GRQhs4ah0riVIU2o4W8"



# Define the JSON message to send to IoT Hub.
###TEMPERATURE = 20.0
#HUMIDITY = 60
#WINDDIRECTION = 30
#WINDINTENSITY = 10
#RAINHEIGHT = 10
#MSG_TXT = '{{"temperature": {temperature},"humidity": {humidity},"winddirection": {WINDDIRECTION},"windintensity": {WINDINTENSITY},"rainheight": {RAINHEIGHT}}}'
def ttn_on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))

    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    client.subscribe("+/devices/+/up")






def ttn_on_message(client, userdata, msg):

    payl = json.loads(msg.payload.decode('utf-8'))

    newpayl= base64.b64decode(payl["payload_raw"])


    msg= {'temperature': newpayl[0],'humidity': newpayl[1],'wind_direction': newpayl[2], 'wind_intensity': newpayl[3],'rain_height': newpayl[4]}
    print(msg)



    message = json.dumps(msg)

    client1.send_message(message)

def iothub_client_init():
    # Create an IoT Hub client
    client1 = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)
    return client1

def ttn_client_init(ttn_app_id, ttn_access_key, on_con, on_msg):

    client = mqtt.Client()
    client.on_connect = on_con
    client.on_message = on_msg
    client.username_pw_set(ttn_app_id, ttn_access_key )
    client.connect("eu.thethings.network", 1883, 60)

    # Blocking call that processes network traffic, dispatches callbacks and
    # handles reconnecting.
    # Other loop*() functions are available that give a threaded interface and a
    # manual interface.
    client.loop_forever()








if __name__ == '__main__':
    '''
    topic='topic'
    '''
    print ( "Meteo station." )
    print ( "Press Ctrl-C to exit" )
    '''
    gateway = Client("gw", port=1885)
    gateway.registerCallback(Callback())
    gateway.connect()
    gateway.subscribe(topic)

    while True:
        time.sleep(1)
    '''
    client1 = iothub_client_init()
    ttn_client_init(app_id, access_key, ttn_on_connect, ttn_on_message)
    print("Sto ascoltando...")

    time.sleep(120)
    mqtt_client.close()
