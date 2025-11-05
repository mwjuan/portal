const radius = require('radius');
const dgram = require("dgram");
const config = require('config');

let server = dgram.createSocket("udp4");

// secret: testing123
server.on("message", function (msg, rinfo) {
    var packet = radius.decode({ packet: msg, secret: config.secret });

    if (packet.code != 'Access-Request') {
        console.log('unknown packet type: ', packet.code);
        return;
    }

    var username = packet.attributes['User-Name'];
    var password = packet.attributes['User-Password'];

    var result = 'Access-Reject';
    if (username == 'shgbit' && password == 'shgbit') result = 'Access-Accept';

    var response = radius.encode_response({
        packet: packet,
        code: result,
        secret: config.secret
    });

    server.send(response, 0, response.length, rinfo.port, rinfo.address, (err, bytes) => {
        if (!err) return;
        console.log('Error sending response to ', rinfo);
    });
});

server.on("listening", function () {
    var address = server.address();
    console.log("radius server listening " + address.address + ":" + address.port);
});

// port: 1812
server.bind(config.port);