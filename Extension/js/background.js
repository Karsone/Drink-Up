drinkUp = {
  init: function(){
    drinkUp.socketConnection();
    drinkUp.newOffer();
    drinkUp.offerDrink();
    drinkUp.iWantDrink();
    drinkUp.serverCountdown();
    drinkUp.changeDesire();
    drinkUp.changeName();
    drinkUp.changeCellNumber();

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
        drinkers = [];
        secondsLeft = 61;
        var timeout = function(){
          setTimeout( function(){
            if(secondsLeft > 1){
              secondsLeft = secondsLeft-1;
              timeout();
            }else{
              drinkerString = "";
              drinkers.forEach(function(element, index, array){
                drinkerString += "\n - "+ element.user;
              });

              chrome.storage.sync.get("cellNumber", function(storage){
                console.log(storage);
                data.cellNumber = storage.cellNumber;
                data.textMessage = "You and "+drinkers[drinkers.length-1].user+" are making "+drinkers[drinkers.length-1].drinkName+"! For "+drinkerString+"";
                socket.emit('textMessage', data);

                var options = {
                  type: "basic",
                  title: "You and "+drinkers[drinkers.length-1].user+" are making "+drinkers[drinkers.length-1].drinkName+"!",
                  message: "For "+drinkerString+"",
                  iconUrl: "images/icon.png"
                }

                chrome.notifications.create("makingDrink", options, function(){

                  setTimeout(function(){
                    chrome.notifications.clear("makingDrink", function(){});
                  },60000)

                });



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
    socket = io.connect('http://knode.cloudapp.net:3001');
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
      chrome.storage.sync.get("name", function(storage){
        currentUser = storage.name;
      });

      chrome.storage.sync.get("desire", function(storage){
        if(storage.desire == "Want to"){

          if(currentUser == data.user){


            var options = {
              type: "basic",
              title: "Offer Sent!",
              message: "You sent an offer for" + data.drinkName,
              iconUrl: "images/icon.png"
            }

            chrome.notifications.create("offerSent", options, function(){

              setTimeout(function(){
                chrome.notifications.clear("offerSent", function(){});
              },2000)

            });


            chrome.extension.sendMessage({
              "action":"serverCountdown"
            });         

            chrome.extension.sendMessage({
              "action":"iWantDrink",
              drinkID: data.drinkID,
              drinkName: data.drinkName,
              user: data.user,
              currentUser:currentUser
            });

          }else{

            var options = {
              type: "basic",
              title: "New Drink Offer!",
              message: data.user+" is offering " + data.drinkName +"\n \n[Click to Accept]",
              iconUrl: "images/icon.png"
            }

            chrome.notifications.create("newOffer", options, function(){

              chrome.notifications.onClicked.addListener(function(notificationID){
                if(notificationID == "newOffer"){
                  chrome.storage.sync.get("name", function(storage){
                    chrome.extension.sendMessage({
                      "action":"iWantDrink",
                      drinkID: data.drinkID,
                      drinkName: data.drinkName,
                      user: storage.name
                    });
                  });
                }
              });

              setTimeout(function(){
                chrome.notifications.clear("newOffer", function(){});
              },60000)

            });

          }

        }
      });
    });
  },
  changeName: function(){
    chrome.extension.onMessage.addListener( function(data){
      if(data.action == "changeName"){
        if(data.name != "none"){
          chrome.storage.sync.set({"name":data.name});
        }else{
          alert("Gotta have a name!");
        }
      }
    });
  },
  changeCellNumber: function(){
    chrome.extension.onMessage.addListener( function(data){
      if(data.action == "changeCellNumber"){
        chrome.storage.sync.set({"cellNumber":data.cellNumber});
      }
    });
  },
  changeDesire: function(){
    chrome.extension.onMessage.addListener( function(data){
      if(data.action == "changeDesire"){
        chrome.storage.sync.set({"desire":data.desire});
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  drinkUp.init();
});

