const {Users} = require('./utils/users');
var mongoose = require('mongoose') 
mongoose.connect('mongodb://localhost:27017/chatApp',{ useNewUrlParser: true });

var users = new Users();
users.getUserList("Ise",function(ans){
    if(ans.includes("Raghav"))
    console.log(ans);
});