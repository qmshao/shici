
Module.register("shici", {

	// Module config defaults.
	defaults: {
		updateInterval: 300000,
		remoteFile: null,
		fadeSpeed: 4000,
		morningStartTime: 3,
		morningEndTime: 12,
		afternoonStartTime: 12,
		afternoonEndTime: 17,
		text: {
			"content": "Hello!",
			"author": "",
			"origin": "",
		}
		
	},

	// Set currentweather from module
	currentWeatherType: "",

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);
		
		var self = this;
		this.getShici((text) => {
			self.config.text = text;
			// console.log(self.config.text);
			self.updateDom();
		});
		
		//self.updateDom();
		// Schedule update timer.
		setInterval(function() {
			self.updateDom(self.config.fadeSpeed);
		}, this.config.updateInterval);
	},




	getShici: function(callback) {
		let xobj = new XMLHttpRequest(),
			path = `https://api.gushi.ci/all.json`;
		xobj.overrideMimeType("application/json");
		xobj.open("GET", path, true);
		xobj.onreadystatechange = function() {
			if (xobj.readyState === 4 && xobj.status === 200) {
				callback(JSON.parse(xobj.responseText));
			}
		};
		xobj.send(null);
	},



	// Override dom generator.
	getDom: function() {
		var self = this;
		this.getShici((text) => {
			self.config.text = text;
			// console.log(self.config.text);
		});

		console.log(self.config.text);
		let content = document.createElement("div");
		content.append(document.createTextNode(self.config.text.content));
		content.style.textAlign = "justify";
		let by = document.createElement("div");
		by.append(document.createTextNode(self.config.text.author?`\n－ ${self.config.text.author} 《${self.config.text.origin}》`:""));
		by.style.textAlign = "right";
		by.style.fontSize = "60%";
		let wrapper = document.createElement("div");
		wrapper.className = this.config.classes ? this.config.classes : "thin large bright";
		wrapper.appendChild(content);
		wrapper.appendChild(by);
		return wrapper;
	},

	// From data currentweather set weather type
	setCurrentWeatherType: function(data) {
		var weatherIconTable = {
			"01d": "day_sunny",
			"02d": "day_cloudy",
			"03d": "cloudy",
			"04d": "cloudy_windy",
			"09d": "showers",
			"10d": "rain",
			"11d": "thunderstorm",
			"13d": "snow",
			"50d": "fog",
			"01n": "night_clear",
			"02n": "night_cloudy",
			"03n": "night_cloudy",
			"04n": "night_cloudy",
			"09n": "night_showers",
			"10n": "night_rain",
			"11n": "night_thunderstorm",
			"13n": "night_snow",
			"50n": "night_alt_cloudy_windy"
		};
		this.currentWeatherType = weatherIconTable[data.weather[0].icon];
	},

	// Override notification handler.
	notificationReceived: function(notification, payload, sender) {
		if (notification === "CURRENTWEATHER_DATA") {
			this.setCurrentWeatherType(payload.data);
		}
	},

});
