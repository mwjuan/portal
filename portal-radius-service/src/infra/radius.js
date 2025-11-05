var config = require('config')
var radius = require('radius')
var dgram = require('dgram')
var server = dgram.createSocket('udp4')
const logger = require('./logger').logger.child({ module: 'infra:radius' })

const EventEmitter = require('events')

class Radius extends EventEmitter {
  async open() {
    logger.info(`****** RADIUS SERVER DEMO: PORT=${config.radius.port},SECRET=${config.radius.secret} ******`)

    server.on('message', async (msg, rinfo) => {
      let packet = radius.decode({ packet: msg, secret: config.radius.secret })

      if (packet.code != 'Access-Request') {
        console.log('unknown packet type: ', packet.code)
        return
      }

      let username = packet.attributes['User-Name']
      let password = packet.attributes['User-Password']
      logger.info(`user: ${username} , pwd: ${password}`)
      //'Access-Accept', 'Access-Reject'
      let result = 'Access-Reject'
      if (username == 'shgbit' && password == 'shgbit') result = 'Access-Accept'

      let response = radius.encode_response({
        packet: packet,
        code: result,
        secret: config.radius.secret,
      })

      server.send(response, 0, response.length, rinfo.port, rinfo.address, (err, bytes) => {
        if (!err) return
        console.log('Error sending response to ', rinfo)
      })
    })

    server.on('listening', function () {
      let address = server.address()
      console.log('radius server listening ' + address.address + ':' + address.port)
    })

    server.bind(config.radius.port)
  }
}

module.exports = new Radius()
