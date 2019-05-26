const net = require('net');
const fs = require('fs');
let clients = 0;
let clientList = [];

let server = net.createServer(client => {
}).listen(5000);

console.log('Listening on port 5000');

server.on('connection', connection => {
    clients++;
    connection.id = clients;
    clientList.push(connection);
    connection.setEncoding('utf8');
    connection.write(`Welcome to the chatroom, you are Client ${connection.id}`);
    fs.appendFile('chat.log', `Client ${connection.id} just connected!\n`, (error) => {
        if ( error ) throw error;
    });
    clientList.forEach((client) => {
        if ( client !== connection ) {
            client.write(`Client ${connection.id} just connected!`)
        }
    });

    connection.on('data', (data) => {
        if ( data ) {
            fs.appendFile('chat.log', `Client ${connection.id}: ${data}`, (error) => {
                if ( error ) throw error;
            });
        }
        clientList.forEach((client) => {
            if ( client !== connection ) {
                client.write(`Client ${connection.id}: ${data}`)
            }
        });
    });

    console.log(`Client ${connection.id} Connected`);

    connection.on('close', function () {
        fs.appendFile('chat.log', `Client ${connection.id} just disconnected.\n`, (error) => {
            if ( error ) throw error;
        });
        clientList.forEach((client) => {
            if ( client !== connection ) {
                client.write(`Client ${connection.id} just disconnected.`)
            }
        });
        let index = clientList.indexOf(connection);
        clientList.splice(index, 1);
    });
});