const config = require('config')
const AppContext = require('./AppContext')

const moment = require('moment')
const infra = require('infra')
const { mongodb, radius } = infra
const logger = require('infra').logger.child({ module: 'app' })

const models = require('model')
const { webServer } = require('server')
const { name, version } = require('../package.json')

const LRU = require('lru-cache')
let cache = new LRU({
  maxAge: config.cacheTTL ? config.cacheTTL : 24 * 3600 * 1000,
})

class App {
  constructor() {
    this.uptime = moment().unix()
    this.name = name
    this.version = version
    this.models = models
    this.logger = logger

    this.webServer = webServer
    this.webServer.build(cache)
  }

  async open() {
    logger.info(`version: ${this.version}, uptime: ${moment().format()}`)

    // await this.openMongoClient()
    await this.webServer.open()
    await this.openRadiusClient()

    await AppContext.instance.init()

    // database init
    await this.tryInitDatabase()
  }

  async close() {
    await this.webServer.close()
    // await this.closeMongoClient()
  }

  async openMongoClient() {
    try {
      await mongodb.open()
    } catch (error) {
      this.logger.error(`mongodb client open error: ${error.message}`)
    }
  }

  async closeMongoClient() {
    try {
      await mongodb.close()
    } catch (error) {
      this.logger.error(`mongodb client close error: ${error.message}`)
    }
  }

  async tryInitDatabase() {}

  async openRadiusClient() {
    try {
      await radius.open()
    } catch (error) {
      this.logger.error(`radius client open error: ${error.message}`)
    }
  }
}

module.exports = new App()
