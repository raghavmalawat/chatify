var mongoose = require('mongoose');
var messSchema = mongoose.Schema({
  _id:       { type: String},
  userId:    { type: String },
  from:      { type: String },
  text:      { type: String , default:"." },
  room:      { type: String },
  createdAt: { type: String },
  url:       { type:String, default:"." }
},{
  versionKey:false
});

module.exports = {messSchema};