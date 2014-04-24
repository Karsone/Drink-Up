drinkUp = {
  init: function(){
    drinkUp.socketConnection();
    drinkUp.newOffer();
    drinkUp.offerDrink();
    drinkUp.iWantDrink();
    drinkUp.serverCountdown();

    //LocalStorage Defaults

    chrome.storage.sync.get("name", function(storage){
      if(!storage.name){
        chrome.storage.sync.set({"name":"None"});
      }
    });

    chrome.storage.sync.get("desire", function(storage){
      if(!storage.desire){
        chrome.storage.sync.set({"desire":"Want to"});
      }
    });


  },
  iWantDrink: function(){
    chrome.extension.onMessage.addListener( function(data){
      if(data.action == "iWantDrink"){
        socket.emit('iWantDrink', data);
      }
    });
  },
  serverCountdown: function(){
    var drinkers = [];
    socket.on('newDrinker', function (data) {
      drinkers.push(data);
    });

    chrome.extension.onMessage.addListener( function(data){
      if(data.action == "serverCountdown"){
        secondsLeft = 10;
        var timeout = function(){
          setTimeout( function(){
            if(secondsLeft > 1){
              secondsLeft = secondsLeft-1;
              timeout();
            }else{
              chrome.tabs.create({ url: "http://vin65.com/" }, function(){
                drinkerString = "";
                drinkers.forEach(function(element, index, array){
                  drinkerString += "\n - "+ element.user;
                });
                alert("You are making "+ drinkers.length +" "+drinkers[0].drinkName+"'s with "+drinkers[drinkers.length-1].user+" for "+drinkerString+"")
                drinkers = [];
              });
            }
          },1000);
        }
        timeout();
      }
    });
  },
  socketConnection: function(){
    //Initial Socket Connection
    socket = io.connect('138.91.225.194:3000');
  },
  offerDrink: function(drink){
    //User Offers a drink, message goes to server.
    chrome.extension.onMessage.addListener( function(data){
      if(data.action == "offerDrink"){
        socket.emit('offerDrink', data);
      }
    });
  },
  newOffer: function(){
    //Someone else has offered a drink!
    socket.on('newOffer', function (data) {
      data.action = "newOffer";

      chrome.storage.sync.get("desire", function(storage){
        if(storage.desire == "Want to"){
          var notification = webkitNotifications.createNotification("","New Drink Offer!","Someone is offering " + data.drinkName);
          notification.show();
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, data);
          });
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  drinkUp.init();
});

