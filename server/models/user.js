var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
  _id:       { type: String},
  name:      { type: String},
  room:      { type: String},
  color:     { type: String}
},{
  versionKey:false
});

module.exports = {userSchema};
