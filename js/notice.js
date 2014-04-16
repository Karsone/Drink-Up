drinkUp = {
	init: function(){
		drinkUp.newOffer();
	},	
	newOffer: function(){
		chrome.runtime.onMessage.addListener(function(data) {
			if(data.action == "newOffer"){
				request = new XMLHttpRequest();
				request.open('GET', chrome.extension.getURL('/views/notice.html'), true);
				request.onload = function() {
				  var source = document.createElement("div");
				  source.innerHTML = request.responseText;
				  source = source.querySelector("script").innerHTML;
				  template = Handlebars.compile(source); 
				  var body = document.querySelector('body');
				  body.innerHTML = body.innerHTML + template(data);
				  drinkUp.countdownOffer();
				  drinkUp.drinkOptions.iWantDrink();
				  drinkUp.drinkOptions.noDrink();
				  drinkUp.drinkOptions.buggerOff();

				};
				request.send();
			}
		});
	},
	countdownOffer: function(clear){
		var interval = setInterval(function(){
			var countdown = document.querySelector("[drinkUp-action='countdown']")
			countdown.innerHTML = countdown.innerHTML-1;
			if(countdown.innerHTML < 1 ){
				clearInterval(interval);
			}
		},1000);

		if(clear){
			clearInterval(interval);
		}
	},
	drinkOptions:{
		iWantDrink: function(){
			// document.querySelector('[drinkUp-action="iWantDrink"]').addEventListener('click', function(){

			// });
		},
		noDrink: function(){
			// document.querySelector('[drinkUp-action="noDrink"]').addEventListener('click', function(){

			// });
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
		notice = document.querySelector(".drinkUp-notice")
		notice.parentNode.removeChild(notice);
		drinkUp.countdownOffer(true);
	}
}


document.addEventListener('DOMContentLoaded', function () {
  drinkUp.init();
});


