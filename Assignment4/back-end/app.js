var express = require('express');
var mqtt = require('mqtt');
var cors = require('cors');
var fs = require('fs');
var http = require('http');



var app = express();


var clientsActivity = new Map();

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;
var connectionString = 'HostName=assignment4.azure-devices.net;DeviceId=MyNodeDevice;SharedAccessKey=axkIDEbJ+9SXl85TsQTpBhFbqDLDXMjw/45e6+e51Yg=';
var client = clientFromConnectionString(connectionString);


var connectCallback = function (err) {
    if (err) {
      console.error("Could not connect: " + err.message);
    } else {
      console.log("Client connected");
      client.on("message", function (msg) {
        console.log("Id: " + msg.messageId + " Body: " + msg.data);
        client.complete(msg, printResultFor("completed"));
      });
  
      client.on("error", function (err) {
        console.error(err.message);
      });
  
      client.on("disconnect", function () {
        clearInterval(sendInterval);
        client.removeAllListeners();
        client.open(connectCallback);
      });
    }
  };
//conncet iot hub
  client.open(connectCallback);

app.use(express.json()); // for parsing application/json
app.use(cors());

app.get('/test', function (req, res) {
    res.send('Hello World!');
});

app.get('/state/:clientId', function (req, res) {
    if( clientsActivity.has( req.params.clientId) ){
        message = {
            activity: clientsActivity.get(req.params.clientId)
        }
        
        res.type('application/json');
        res.status(200);
        res.send(JSON.stringify(message));
    }
    else{
        res.status(404).send({});
    }
    
});
app.post('/state/:clientId', function(req,res){
    let Id= req.params.clientId;
    try{
      console.log(req.body)
      res.type('application/json');
      res.status(200);
      res.send({});

    }catch(e){
      console.error("Error : " + e);
      res.status(500).send("500 - Internal Error");

    }
});


app.post('/readings', function (req, res) {
    try {
        console.log(req.body);
        console.log("debug");
        let data = req.body;
       // var message = new Message(JSON.stringify(data));
        if(parseFloat(data['acc_mod'])> 0.5){
         
         var message = new Message(JSON.stringify(data));
         client.sendEvent(message, printResultFor("send"));
         console.log("Ti stai muovendo")

        }else{
          var message = new Message(JSON.stringify(data));
          client.sendEvent(message, printResultFor("send"));
          console.log("Sei fermo")
        }
        

        //client.sendEvent(message, printResultFor("send"));
        res.send("POST request to the homepage");
        
        //msgText= JSON.parse(req.body);
       
    }
    catch (e) {
        console.error("Error : " + e);
        res.status(500).send("500 - Internal Error");
    }

});


//THIS MUST BE THE LAST ROUTE
app.use(function(req, res, next) {
   
    res.status(404).send('Sorry cant find that!');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

httpServer.listen(3001);
//httpsServer.listen(3000);


/*// called when the client connects
function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");

}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:"+responseObject.errorMessage);
    }
}
    
// called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived:"+message.payloadString);
}
*/
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + " error: " + err.toString());
    if (res) console.log(op + " status: " + res.constructor.name);
  };
}