const moment = require('moment');
const config = require('config');
const _ = require('lodash');

class AppContext {
  constructor() {
    if (AppContext._instance) {
      return AppContext._instance;
    }
    this.global = null;
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new AppContext();
    }
    return this._instance;
  }

  async init() {
    this.global = {};
  }
}

module.exports = AppContext;