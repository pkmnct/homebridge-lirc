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
	this.log("Starting a stateless LIRC device with name '" + this.name + "'...");
	this.commands = config.commands;
}

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

	return [zwitch];
};
