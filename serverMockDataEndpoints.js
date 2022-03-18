const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const {spawn, exec} = require('child_process');
const fs = require('fs');
const EC = require('elliptic').ec;
const keccak256 = require('js-sha3').keccak256;


function getAddress () {
    console.log('here is the key');
    const ec = new EC('secp256k1');
    const compKey = fs.readFileSync('./data-simulator/pubKey_compressed', {encoding : 'utf8'});
    
    // Decode public key
    const key = ec.keyFromPublic(compKey, 'hex');

    // Convert to uncompressed format
    const publicKey = key.getPublic().encode('hex').slice(2);

    // Now apply keccak
    const address = keccak256(Buffer.from(publicKey, 'hex')).slice(64 - 40);

    


    console.log(`Public Key: 0x${publicKey}`);
    console.log(`Address: 0x${address.toString()}`);

    return `0x${address.toString()}`;
  }

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); 

// create a GET route
app.get('/express_backend', (req, res) => { 
    /*const child = exec('bash ./pebble-simulator/simulator.sh');
    child.stdout.on('data', (data) => {
        console.log(`child stdout:\n${data}`);
      });
      
      child.stderr.on('data', (data) => {
        console.error(`child stderr:\n${data}`);
      }); */
  res.send({ express: 'Welcome to Starknet IoT DAO!'}); 
});

app.get('/get_address', (req, res) => {
    const addressEth = getAddress();
    if (req.query.readData==1){
        console.log('here in read data');
        var dataLog = fs.readFileSync('./pebble.dat').toString().split("\n");
        const stringforAddr = dataLog[0];
        var keyFile = fs.readFileSync('./data-simulator/privKey').toString().split("\n");
        const keyToSave = keyFile[0].trim();
        res.send({currentAddr : addressEth, firstLine : stringforAddr, privKey : keyToSave});
    }
    else{
    res.send({currentAddr : addressEth});
    }
});

app.get('/run_simulator', (req, res) => {
    var data = fs.readFileSync('./data-simulator/simulator.sh').toString().split("\n");
    data[6] = `TargetMax=${req.query.TargetMax}`;
    data[7] = `TargetMin=${req.query.TargetMin}`;
    data[68] = `CountPkg=${req.query.runs}`;
    var text = data.join("\n");
    fs.writeFile('./data-simulator/simulator.sh', text, function (err) {
        if (err) return console.log(err);
      });
    

    const child = exec('bash ./data-simulator/simulator.sh');
    
    child.stdout.on('data', (data) => {
        console.log(`child stdout:\n${data}`);
      });
      
    child.stderr.on('data', (data) => {
        console.error(`child stderr:\n${data}`);
      });
    
    res.send({simComplete : true});  
})

app.get('/run_simulator_verify', (req, res) => {
    fs.writeFile('./data-simulator/privKeyVerify', req.query.PrivKey, function (err) {
        if (err) return console.log(err);
      });
    
    var data = fs.readFileSync('./data-simulator/simulatorVerify.sh').toString().split("\n");
    data[6] = `TargetMax=${req.query.TargetMax}`;
    data[7] = `TargetMin=${req.query.TargetMin}`;
    data[61] = `START=${req.query.Start}`;
    data[62] = `DELTA=${req.query.Delta}`;
    var text = data.join("\n");
    fs.writeFile('./data-simulator/simulatorVerify.sh', text, function (err) {
        if (err) return console.log(err);
      });
    
    const child = exec('bash ./data-simulator/simulatorVerify.sh');
    
    child.stdout.on('data', (data) => {
        console.log(`child stdout:\n${data}`);
      });
      
    child.stderr.on('data', (data) => {
        console.error(`child stderr:\n${data}`);
      });

    
    
    res.send({simComplete : true});  
})

app.get('/deal_verify_final', (req, res) => {
    var dataLog = fs.readFileSync('./pebble.dat').toString().split("\n");
    
    res.send({dataVerify : dataLog});
})

app.get('/python_test', (req,res)=> {
  var dataToSend;
 // spawn new child process to call the python script
 const python = spawn('python3', ['script1.py', `node.js`, `python`]);
 // collect data from script
 python.stdout.on('data', function (data) {
  console.log('Pipe data from python script ...');
  dataToSend = data.toString();
 });

 python.stderr.on('data', function(data) {
  console.log(`Pipe error from python script ...${data}`);
 })
 // in close event we are sure that stream from child process is closed
 python.on('close', (code) => {
 console.log(`child process close all stdio with code ${code}`);
 // send data to browser
 res.send(dataToSend)
 })
})