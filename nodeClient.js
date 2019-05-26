const net = require('net');
const userInput = process.stdin;
userInput.setEncoding('utf-8');
let name = false;


let client = net.createConnection({ port: 5000 }, () => {
});

client.setEncoding('utf8');

client.on('data', message => {
    console.log(message.trim());
});

userInput.pipe(client);
// userInput.on('data', data => {
//
// });
