drinkUp = {
	init: function(){
		drinkUp.templateRender();
	},
	drinkButtons:function(){
		Array.prototype.forEach.call(document.querySelectorAll('[drinkUp-action="offerDrink"]'), function(element){
			element.addEventListener('click', function(){
				drinkID = element.getAttribute('data-drinkID');
				drinkName = element.getAttribute('data-drinkName');
				userName = document.querySelector('[drinkUp-action="toggleSetName"]').innerHTML;
				if(userName == "None"){
					drinkUp.templateData.notification = "You Need a name!";
					drinkUp.templateRender();
				}else{
					chrome.extension.sendMessage({
						"action":"offerDrink",
						drinkID: drinkID,
						drinkName: drinkName,
						user: userName
					});
					window.close();
				}
			});
		});
	},
	toggleSetName: function(){
		document.querySelector('[drinkUp-action="toggleSetName"]').addEventListener('click', function(){
			drinkUp.templateData.options.settingName = 1;
			drinkUp.templateRender();

			//After Render
			document.querySelector('[name="name"]').focus();

			document.querySelector('[name="name"]').value = drinkUp.templateData.options.name;
			document.querySelector('[name="cellNumber"]').value = drinkUp.templateData.options.cellNumber;
			drinkUp.saveName();
		});
	},
	saveName: function(){
		document.querySelector('[drinkUp-action="saveName"]').addEventListener('click', function(){
			if(document.querySelector('[name="name"]').value.length > 0 && document.querySelector('[name="cellNumber"]').value.length > 0){
				drinkUp.templateData.options.settingName = 0;

				var name = document.querySelector('[name="name"]').value;
				var cellNumber = document.querySelector('[name="cellNumber"]').value;

				chrome.extension.sendMessage({
					"action":"changeName",
					name:name
				});


				chrome.extension.sendMessage({
					"action":"changeCellNumber",
					cellNumber:cellNumber
				});

				drinkUp.templateData.options.name = name;
				drinkUp.templateData.options.cellNumber = cellNumber;

				

				drinkUp.templateRender();
			}else{
				drinkUp.templateData.notification = "Error, please fill full name & cell number";
			}
		});
	},
	toggleDesire: function(){
		 document.querySelector('[drinkUp-action="toggleDesire"]').addEventListener('click', function(){
			chrome.storage.sync.get("desire", function(storage){
				if(storage.desire == "Want to"){
					console.log("Changing to not wanting too");
					chrome.extension.sendMessage({
						"action":"changeDesire",
						desire:"Don't want to"
					});
					drinkUp.templateData.options.desire = "Don't want to";
				}else{
					chrome.extension.sendMessage({
						"action":"changeDesire",
						desire:"Want to"
					});
					drinkUp.templateData.options.desire = "Want to";
				}
			});

			setTimeout(function(){
				drinkUp.templateRender();
			},100)

		 });
	},
	templateData: {
		"notification" : "",
		"options" : {
			"name": "",
			"desire": "",
			"cellNumber": "",
			"settingName" : 0
		}, 
		"drinks":[
			{
				"drinkID":"redBull",
				"drinkName":"Red Bull + Vodka",
				"drinkImage":"/images/redbull.svg"
			},
			{
				"drinkID":"rumCoke",
				"drinkName":"Rum + Coke",
				"drinkImage":"/images/coke.svg"
			},
			{
				"drinkID":"wine",
				"drinkName":"Wine",
				"drinkImage":"/images/wine.svg"
			}
		]
	},
	templateRender: function(){
		var source = document.querySelectorAll('#popup')[0].innerHTML
		var template = Handlebars.compile(source); 
		document.querySelectorAll('body')[0].innerHTML = template(drinkUp.templateData);
		drinkUp.toggleSetName();
		drinkUp.drinkButtons();
		drinkUp.toggleDesire();
		drinkUp.templateData.notification = "";
	}
}


document.addEventListener('DOMContentLoaded', function () {
	chrome.storage.sync.get("name", function(storage){
		drinkUp.templateData.options.name = storage.name;
		drinkUp.templateRender();
	});

	chrome.storage.sync.get("desire", function(storage){
		drinkUp.templateData.options.desire = storage.desire;
		drinkUp.templateRender();
	});

	chrome.storage.sync.get("cellNumber", function(storage){
		drinkUp.templateData.options.cellNumber = storage.cellNumber;
		drinkUp.templateRender();
	});

	drinkUp.init();
	console.log(drinkUp.templateData);
});




