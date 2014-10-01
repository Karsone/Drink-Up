var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(3001);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}


io.sockets.on('connection', function (socket) {
  console.log("Connected");
  //When someone offers a drink.
  //Data - drink,user.
  socket.on('offerDrink', function (data) {
    io.sockets.emit('newOffer', data);
    // socket.broadcast.emit('newOffer', data); //To all clients but the current one
  });
  socket.on('iWantDrink', function (data) {
    io.sockets.emit('newDrinker', data);
    // socket.broadcast.emit('newOffer', data); //To all clients but the current one
  });
  socket.on('textMessage', function (data) {
    // io.sockets.emit('newDrinker', data);
    // Your accountSid and authToken from twilio.com/user/account
    var accountSid = '';
    var authToken = "";
    var client = require('twilio')(accountSid, authToken);

    if(data.cellNumber){
      client.messages.create({
          body: data.textMessage,
          to: "+1"+data.cellNumber,
          from: "+17787650037"
      });
    }
  });
});



