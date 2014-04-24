drinkUp = {
	init: function(){
		drinkUpAcceptedOffer = false;
		drinkUpCurrentUser = "";
		chrome.storage.sync.get("name", function(storage){
			drinkUpCurrentUser = storage.name;
		});
		chrome.runtime.onMessage.addListener(function(data) {
			if(data.action == "newOffer"){

				if(document.querySelectorAll(".drinkUp-notice").length){
					alert("Tell "+data.user+" to wait until later! Only one offer at a time!")
				}else if(data.user == drinkUpCurrentUser) {

					chrome.extension.sendMessage({
					  "action":"serverCountdown"
					});

					chrome.extension.sendMessage({
					  "action":"iWantDrink",
					  drinkID: data.drinkID,
					  drinkName: data.drinkName,
					  user: drinkUpCurrentUser
					});


				} else {

					drinkUp.newOffer(data);
				}
			}
		});
	},	
	newOffer: function(data){
		request = new XMLHttpRequest();
		request.open('GET', chrome.extension.getURL('/views/notice.html'), true);
		request.onload = function() {


		  var source = document.createElement("div");
		  //HandlesBars.js compiled code.
		  source.innerHTML = request.responseText;
		  compiledSource = source.querySelector("script").innerHTML;
		  template = Handlebars.compile(compiledSource); 
		  source = document.createElement("div");
		  source.innerHTML = template(data)


		  document.getElementsByTagName('body')[0].appendChild(source);



		  //Fires Event Listeners
		  drinkUp.countdownOffer(data);
		  drinkUp.drinkOptions.iWantDrink(data);
		  drinkUp.drinkOptions.noDrink();
		  drinkUp.drinkOptions.buggerOff();

		};
		request.send();
	},
	countdownOffer: function(data){

		//Grab countdown number.
		var timeout =  function(){
			setTimeout(function(){
				var drinkUpSecondsLeft = document.querySelector("[drinkUp-action='countdown']")
				if(drinkUpSecondsLeft.innerHTML > 1){
					drinkUpSecondsLeft.innerHTML = drinkUpSecondsLeft.innerHTML-1;
					console.log(drinkUpSecondsLeft);
					timeout();
				}else{
					// if(drinkUpAcceptedOffer){
					// 	alert("Client Done");
					// }
					drinkUp.removeNotice();
				}
			},1000);
		}

		timeout();	
	},
	drinkOptions:{
		iWantDrink: function(data){
			document.querySelector('[drinkUp-action="iWantDrink"]').addEventListener('click', function(){
				//Accept Offer
				drinkUpAcceptedOffer = true;
				chrome.extension.sendMessage({
				  "action":"iWantDrink",
				  drinkID: data.drinkID,
				  drinkName: data.drinkName,
				  user: drinkUpCurrentUser
				});
				drinkUp.removeNotice();
			});
		},
		noDrink: function(){
			document.querySelector('[drinkUp-action="noDrink"]').addEventListener('click', function(){
				drinkUp.removeNotice();
			});
		},
		buggerOff: function(){
			document.querySelector('[drinkUp-action="buggerOff"]').addEventListener('click', function(){

				// alert("test");
				chrome.storage.sync.set({"desire":"Don't want to"});
				drinkUp.removeNotice();
			});
		}
	},
	removeNotice: function(){
		document.querySelector("[drinkUp-action='countdown']").innerHTML = 0;
		notice = document.querySelector(".drinkUp-notice")
		notice.parentNode.removeChild(notice);
	}
}


document.addEventListener('DOMContentLoaded', function () {
  drinkUp.init();
});


