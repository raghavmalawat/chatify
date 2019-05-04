var socket=io();

function scrollToBottom(){
    var messages=jQuery('#messages');
    var newMessage=messages.children('li');

    var clientHeight=messages.prop('clientHeight');
    var scrollTop=messages.prop('scrollTop');
    var scrollHeight=messages.prop('scrollHeight');
    var newMessageHeight=newMessage.innerHeight();
    var lastMessageHeight=newMessage.prev().innerHeight();

    if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=scrollHeight){
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect',function(){
    var params=jQuery.deparam(window.location.search);
    socket.emit('join',params,function(err){
        if(err){
            alert(err);
            window.location.href='/';
        } else{
            console.log('No Error'); 
        }
    });
});

socket.on('disconnect',function(){
    console.log('disconnected from server');
}); 

socket.on('updateUserList',function(users){
    var ol=jQuery('<ol></ol>');
    console.log(users)
    users.forEach(function(user){
        ol.append(jQuery('<li></li>').text(user));
    });
    jQuery('#users').html(ol);
});

socket.on('newMessage',function(message){
    var params=jQuery.deparam(window.location.search);

    var col;
    if(message.from=='Admin')
        col='blue';
    else    
        col=message.color;  
    var formattedTime=moment(message.createdAt).format('h:mm a');
    var template=jQuery('#message-template').html();
    var checkUser="",lineBreak="both";
    params.name=(params.name).charAt(0).toUpperCase() + (params.name).slice(1).toLowerCase();

    if(params.name===message.from)
        checkUser="right";
    var html=Mustache.render(template,{
        text:message.text,
        from:message.from,
        createdAt:formattedTime,
        color:col,
        checkUser,
        lineBreak
    });
    jQuery('#messages').append(html); 
    scrollToBottom();
});

socket.on('newLocationMessage',function(message){
    var params=jQuery.deparam(window.location.search);

    var col;
    var checkUser="",lineBreak="both";
    if(message.from=='Admin')
        col='blue';
    else    
        col=message.color;  
    var formattedTime=moment(message.createdAt).format('h:mm a');
    var template=jQuery('#location-message-template').html();

    params.name=(params.name).charAt(0).toUpperCase() + (params.name).slice(1).toLowerCase();

    if(params.name===message.from)
        checkUser="right";
    var html=Mustache.render(template,{
        url:message.url,
        from:message.from,
        createdAt:formattedTime,
        color:col,
        checkUser,
        lineBreak
    });
    jQuery('#messages').append(html);
    scrollToBottom();
});

jQuery('#message-form').on('submit',function(e){
    e.preventDefault(); 

    var messageTextBox=jQuery('[name=message]');

    socket.emit('createMessage',{
        text:messageTextBox.val()
    },function(){
        messageTextBox.val('')    
    });
});

var locationButton=jQuery('#send-location');
locationButton.on('click',function(){
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser');
        }

        locationButton.attr('disabled','disabled').text('sending location...');

        navigator.geolocation.getCurrentPosition(function(position){
            locationButton.removeAttr('disabled').text('Send location');
            socket.emit('createLocationMessage',{
               latitude:position.coords.latitude,
               longitude:position.coords.longitude 
            });
        },function(){
            locationButton.removeAttr('disabled').text('Send location');
            alert('Unable to fetch location');
        });
});