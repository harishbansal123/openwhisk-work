function main(params) {  
  return new Promise(function(resolve, reject) {  
    console.log("DEBUG: Received the following message as input: " + JSON.stringify(params));

    if (!params.messages || !params.messages[0] ||
        !params.messages[0].value || !params.messages[0].value.temp) {
      reject("Invalid arguments. Must include 'messages' JSON array with 'value' field");
    }

    var temp = params.messages[0].value.temp;
    var weather = "";
    if (temp < 10) {
      weather = "cold";
    } else if (temp >= 10 && temp <30) {
      weather = "pleasant";
    } else {
      weather = "hot";
    }

    console.log("DEBUG: weather is " + weather);

    var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    client = new kafka.Client("172.17.0.1:2182"),
    producer = new Producer(client);
    var message = '{"weather": "' + weather + '"}';

    payloads = [
      { topic: 'out-topic', messages: message, partition: 0 }
    ];
    
    producer.on('ready', function () {
      producer.send(payloads, function (err, data) {
          if(err) reject("Error occured while creating producer");
          else {
            console.log(data);
            resolve({success: true});
          }
      });
    });

    producer.on('error', function (err) {
      reject("Error occured while creating producer");
    });
  });  

}

exports.main = main;