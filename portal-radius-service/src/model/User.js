const { mongoose } = require('infra').mongodb
const { Schema } = mongoose

const UserSchema = new Schema({
  name: { type: String },
  password: {type: String}
})


module.exports = mongoose.model('User', UserSchema, 'users');