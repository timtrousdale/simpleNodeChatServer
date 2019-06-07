const net = require('net');
const fs = require('fs');
let clients = 0;
let clientList = [];
const serverAdminPassword = 'supersecretpw';

let server = net.createServer(client => {
}).listen(5000);


console.log('Listening on port 5000');

server.on('connection', connection => {
    clients++;
    connection.id = clients;
    connection.name = `Client${clients}`;
    clientList.push(connection);
    connection.setEncoding('utf8');
    connection.write(`Welcome to the chatroom, you are Client${connection.id}`);
    fs.appendFile('chat.log', `${connection.id}:${connection.name} just connected!\n`, (error) => {
        if ( error ) throw error;
    });
    clientList.forEach((client) => {
        if ( client !== connection ) {
            client.write(`${connection.name} just connected!`)
        }
    });

    connection.on('data', (data) => {
        if ( data ) {
            fs.appendFile('chat.log', `${connection.id}:${connection.name}: ${data}`, (error) => {
                if ( error ) throw error;
            });
        }

        if ( data.toString().trim().charAt(0) === '/' ) {
            let command = data.toString().trim().split(' ');

            let message = command.slice(2).join(' ');
            let clientExists = false;
            let activeClients = [];
            switch ( command[0] ) {
                case '/close':
                    connection.end();
                    break;
                case '/w':
                case '/whisper':
                case '/Whisper':
                    let whisperedUser = command[1];
                    if ( whisperedUser === connection.name ) {
                        connection.write(`Server: Error, you whispered yourself.`);
                        break;
                    }
                    clientExists = false;
                    clientList.forEach((client) => {
                        if ( client.name === whisperedUser ) {
                            clientExists = true;
                            client.write(`${connection.name} whispers: ${message}`)
                        }
                        if ( clientExists === false ) {
                            connection.write(`Server: Error, there is no one named ${command[1]}.`)
                        }
                    });
                    break;
                case '/username':
                    let newUsername = command[1];
                    if ( command.length > 3 ) {
                        connection.write(`Server: Error, usernames cannot contain spaces.`);
                        break;
                    }
                    if ( newUsername === connection.name ) {
                        connection.write(`Server: Error, that is the same username.`);
                        break;
                    }
                    clientExists = false;
                    clientList.forEach((client) => {
                        if ( client.name === newUsername ) {
                            connection.write(`Server: Error ${newUsername} is already in use.`);
                            clientExists = true;
                        }
                    });
                    if ( clientExists === true ) break;
                    connection.name = newUsername;
                    connection.write(`Server: Success, your new username is ${newUsername}`);
                    break;
                case '/kick':
                    let clientToKick = command[1];
                    let password = command[2];
                    if ( command.length > 3 ) {
                        connection.write(`Server: Error, password cannot contain spaces.`);
                        break;
                    }
                    if ( password !== serverAdminPassword ) {
                        connection.write(`Server: Error, admin password incorrect.`);
                        break;
                    }
                    clientList.forEach((client) => {
                        if ( client.name === clientToKick ) {
                            client.write(`Server: An Admin has removed you from this channel.`);
                            connection.write(`Server: ${client.name} has been removed from this channel.`);
                            client.end();
                        }
                    });
                    break;
                case '/clientlist':
                    clientList.forEach((client) => {
                        console.log(client.name);
                        activeClients.push(client.name);
                    });
                    connection.write(`Server: Active Clients are...${activeClients.join()}.`);
                    break;

                default:
                    connection.write(`Server: Invalid command`);
                    break;
            }
        } else {

            clientList.forEach((client) => {
                if ( client !== connection ) {
                    client.write(`${connection.name}: ${data}`)
                }
            });
        }
    });

    console.log(`${connection.name} Connected`);

    connection.on('close', function () {
        fs.appendFile('chat.log', `${connection.id}:${connection.name} just disconnected.\n`, (error) => {
            if ( error ) throw error;
        });
        clientList.forEach((client) => {
            if ( client !== connection ) {
                client.write(`${connection.name} just disconnected.`)
            }
        });
        let index = clientList.indexOf(connection);
        clientList.splice(index, 1);
    });
});