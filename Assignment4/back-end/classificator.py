# app.py
import json
from azure.iot.device import IoTHubDeviceClient, Message
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS,  cross_origin
CONNECTION_STRING = "HostName=assignment4.azure-devices.net;DeviceId=MyNodeDevice;SharedAccessKey=axkIDEbJ+9SXl85TsQTpBhFbqDLDXMjw/45e6+e51Yg="
app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

def iothub_client_init():
    # Create an IoT Hub client
    client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)
    return client




@app.route('/hello', methods=['GET', 'POST'])
@cross_origin()
def hello():

    # POST request
    if request.method == 'POST':
        print('Incoming..')
        data = request.get_json()
        
        response = {}
        
        if(float(data['acc_mod']) >= 0.5):
            response['activity'] = "You are moving"
            msg = json.dumps(response['activity'])
            print(msg)
            
            client.send_message(msg)
        else:
            response['activity'] = "You are still"
            msg = json.dumps(response['activity'])
            print(msg)
            
            client.send_message(msg)
        
        print(response)
        return 'OK', 200

    # GET request
    else:
        message = {'greeting': 'Hello from Flask!'}
        return jsonify(message)  # serialize and use JSON headers


if __name__ == "__main__":

    client= iothub_client_init() 

    app.run(host='192.168.1.80')
