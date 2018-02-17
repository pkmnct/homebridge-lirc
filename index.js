var Lirc = require('./lirc');
var Service, Characteristic;

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-lirc", "Lirc", LircAccessory);
};


function LircAccessory(log, config) {
	this.log = log;
	this.name = config.name;
	this.lirc = new Lirc(config.lirc);
	this.state = 0;
	this.muted = 0;
	this.volume = 50;
	this.log("Starting a stateless LIRC device with name '" + this.name + "'...");
	this.commands = config.commands;
}

LircAccessory.prototype.getMuted = function(callback) {
	var muted = this.muted > 0;
	this.log("Mute for the '%s' is %s", this.name, this.muted);
	callback(null, muted);
};

LircAccessory.prototype.setMuted = function(muted, callback) {
	var self = this;
	this.lirc.send(this.commands.mute, function(err) {
		if(!err) {
			self.muted = muted ? 1 : 0;
			self.log("Set muted to %s", self.muted);
		}
		callback(err, self.muted);
	});
};

LircAccessory.prototype.getVolume = function(callback) {
	this.log("Volume for the '%s' is %s", this.name, this.volume);
	callback(null, this.volume);
};

LircAccessory.prototype.setVolume = function(volume, callback) {
	var delta = volume - this.volume;
	if(delta === 0) {
		callback(null, volume);
		return;
	}

	var self = this;
	var keys = Array.from({length: Math.abs(delta)}, function(item, index) {
		return delta < 0 ? self.commands.voldown : self.commands.volup;
	}).reduce(function(collector, keys) {
		return collector.concat(keys);
	});

	this.lirc.send(keys, function(err) {
		if(!err) {
			self.volume = volume;
			self.log("Set volume to %s", self.volume);
		}
		callback(err, self.volume);
	});
};

LircAccessory.prototype.getPowerOn = function(callback) {
	var powerOn = this.state > 0;
	this.log("State for the '%s' is %s", this.name, this.state);
	callback(null, powerOn);
};

LircAccessory.prototype.setPowerOn = function(powerOn, callback) {
	var self = this;
	var shouldSwitchState = true;
	if(powerOn == self.state) {
		callback(null, self.state);
		shouldSwitchState = false;
	}
	this.lirc.send(powerOn ? self.commands.on : self.commands.off, function(err) {
		if(!err) {
			if (shouldSwitchState) {
				self.state = powerOn ? 1 : 0;
			}
			self.log("Set state to %s", self.state);
		}
		callback(err, self.state);
	});
};

LircAccessory.prototype.getServices = function() {
	var zwitch = new Service.Switch(this.name);

	zwitch
		.getCharacteristic(Characteristic.On)
		.on('get', this.getPowerOn.bind(this))
		.on('set', this.setPowerOn.bind(this));

	var speaker = new Service.Speaker(this.name);
	speaker
		.getCharacteristic(Characteristic.Mute)
		.on('get', this.getMuted.bind(this))
		.on('set', this.setMuted.bind(this));

	speaker
		.getCharacteristic(Characteristic.Volume)
		.on('get', this.getVolume.bind(this))
		.on('set', this.setVolume.bind(this));

	return [zwitch, speaker];
};
