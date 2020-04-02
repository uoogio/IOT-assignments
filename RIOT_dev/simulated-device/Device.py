# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for full license information.
import os
import time
import uuid
import random
import time
import sys
sys.path.insert(1, 'lib')
from  MQTTSNclient import Client
# Using the Python Device SDK for IoT Hub:
#   https://github.com/Azure/azure-iot-sdk-python
# The sample connects to a device-specific MQTT endpoint on your IoT Hub.
from azure.iot.device import IoTHubDeviceClient, Message


# The device connection string to authenticate the device with your IoT hub.
# Using the Azure CLI:
# az iot hub device-identity show-connection-string --hub-name {YourIoTHubName} --device-id MyNodeDevice --output table
CONNECTION_STRING = "HostName=assignment001.azure-devices.net;DeviceId=device;SharedAccessKey=KFroCSyTGQz/eap9e4rOHna1VL5Mxg+awD84ygkkGE4="

# Define the JSON message to send to IoT Hub.
###TEMPERATURE = 20.0
#HUMIDITY = 60
#WINDDIRECTION = 30
#WINDINTENSITY = 10
#RAINHEIGHT = 10
#MSG_TXT = '{{"temperature": {temperature},"humidity": {humidity},"winddirection": {WINDDIRECTION},"windintensity": {WINDINTENSITY},"rainheight": {RAINHEIGHT}}}'

def iothub_client_init():
    # Create an IoT Hub client
    client1 = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)
    return client1

def iothub_client_telemetry_sample_run():

    try:
        client = iothub_client_init()
        print ( "IoT Hub device sending periodic messages, press Ctrl-C to exit" )

        while True:
            # Build the message with simulated telemetry values.
            temperature = TEMPERATURE + (random.random() * 15)
            humidity = HUMIDITY + (random.random() * 20)
            winddir = WINDDIRECTION + (random.random() * 20)
            windint = WINDINTENSITY + (random.random() * 6)
            rainh = RAINHEIGHT + (random.random() * 5)

            msg_txt_formatted = MSG_TXT.format(temperature=temperature, humidity=humidity, WINDDIRECTION=winddir, WINDINTENSITY=windint, RAINHEIGHT=rainh)
            message = Message(msg_txt_formatted)

            # Add a custom application property to the message.
            # An IoT hub can filter on these properties without access to the message body.
            if temperature > 30:
              message.custom_properties["temperatureAlert"] = "true"
            else:
              message.custom_properties["temperatureAlert"] = "false"

            # Send the message.
            print( "Sending message: {}".format(message) )
            client.send_message(message)
            print ( "Message successfully sent" )
            time.sleep(1)

    except KeyboardInterrupt:
        print ( "IoTHubClient sample stopped" )

class Callback:
    '''
    A class to add a MQTTS callback. It is a modification of Callback class into lib/ to support AWS retransission.
    '''

    def __init__(self):
        self.events = []
        self.registered = {}


    def connectionLost(self, cause):
        print
        ("default connectionLost", cause)
        self.events.append("disconnected")

    def messageArrived(self, topicName, payload, qos, retained, msgid):
        '''
        Each time a new message is received we forward it to Azure  IoT hub
        '''
        # Send the message.
        client1 = iothub_client_init()
        message = Message(payload)
        client1.send_message(message)



        print ( "Message successfully sent" )
        print ("default publishArrived", topicName, payload, qos, retained, msgid)


        return True

    def deliveryComplete(self, msgid):
        print
        ("default deliveryComplete")

    def advertise(self, address, gwid, duration):
        print
        ("advertise", address, gwid, duration)

    def register(self, topicid, topicName):
        self.registered[topicId] = topicName



if __name__ == '__main__':
    topic='topic'
    print ( "IoT Hub Quickstart #1 - Simulated device" )
    print ( "Press Ctrl-C to exit" )

    gateway = Client("gw", port=1885)
    gateway.registerCallback(Callback())
    gateway.connect()
    gateway.subscribe(topic)

    while True:
        time.sleep(1)
