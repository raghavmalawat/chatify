var mongoose = require('mongoose');
var roomSchema = mongoose.Schema({
  _id:       { type: String},
  name:      { type: [String]},
  room:      { type: String }
},{
  versionKey:false
});

module.exports = {roomSchema};
