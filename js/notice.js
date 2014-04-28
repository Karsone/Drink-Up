drinkUp = {
	init: function(){

		chrome.runtime.onMessage.addListener(function(data) {
			if(data.action == "newOffer"){
				if(document.querySelectorAll(".drinkUp-notice").length){
					alert("Tell "+data.user+" to wait until later! Only one offer at a time!")
				} else {
					drinkUp.newOffer(data);
				}
			}
		});
	},	
	newOffer: function(data){
		  var source = document.querySelectorAll('#notice')[0].innerHTML
		  var template = Handlebars.compile(source); 
		  document.querySelectorAll('body')[0].innerHTML = template(drinkUp.templateData);

		  //Fires Event Listeners
		  drinkUp.countdownOffer(data);
		  drinkUp.drinkOptions.iWantDrink(data);
		  drinkUp.drinkOptions.noDrink();
		  drinkUp.drinkOptions.buggerOff();
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
				chrome.storage.sync.get("name", function(storage){
				  chrome.extension.sendMessage({
				    "action":"iWantDrink",
				    drinkID: data.drinkID,
				    drinkName: data.drinkName,
				    user: storage.name
				  });
				  drinkUp.removeNotice();
				});
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
		window.close();
	}
}


document.addEventListener('DOMContentLoaded', function () {
	drinkUp.init();
});


