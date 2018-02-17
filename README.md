# Homebridge-LIRC

# Fork from rodrobin's NPM package https://www.npmjs.com/package/homebridge-lirc

Plugin for controlling devices through [LIRC](http://www.lirc.org/) via [Homebridge](https://github.com/nfarina/homebridge). <img src="https://www.npmjs.com/static/images/osi.svg" alt="MIT License Logo" width="24" height="24"> MIT licensed **Voice control of devices through Siri or plain Homekit apps**.

Since LIRC supports an arbitrary number and types of devices not all combinations of Apple Homekit ```Services``` and ```Characteristics``` are
supported out-of-the-box. However, this plugin implements two Homekit ```Services``` (Switch and Speaker) and three ```Characteristics```
(Power, Mute and Volume) that should hopefully provide a solid foundation for anyone needing to add more.

For a full list of Homekit supported ```Services``` and ```Characteristics``` see [this](https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js).

In order to make use of this plugin the following pre-conditions must be met:

1. Homebridge needs to be installed and configured
2. LIRC needs to be installed and configured (with at least one working remote definition and listening on a port)
3. IR transmitter installed and configured on the same machine as LIRC

Please note that Homebridge and LIRC don't have to be installed on the same machine since they communicate over a standard TCP
socket but do mind any firewalls between them.

## Installation
The following command should be familiar:

```npm install -g homebridge-lirc```

## Configuration
Add the following JSON snippet to the Homebridge configuration file ```~/.homebridge/config.json``` (or the equivalent for Windows users) under the section ```accessories```:
```
{
    "accessory":      "Lirc",
    "name":           "<identifier>",
    "commands":       {
        "on":       ["KEY_1"],
        "off":      ["KEY_0", "KEY_0"],
        "mute":     ["KEY_MUTE"]
    },
    "lirc":         {
        "remote":       "<lirc-configured-remote-name>",
        "delay":        250,
        "host":         "<hostname>",
        "port":         8765
    }
}
```
Homebridge needs to identify which plugins to load at start-up which is does by looking at the ```accessory``` value, so it is critical this is left as is. Conversely, the ```name``` value should be changed and at the very least be unique since it signifies a discreet accessory in Homebridge. Also, if voice control is essential then it should also be phonetically distinct and understandable by Siri.

The following sections will go into detail on the ```lirc``` and ```commands``` structures and expected values.

Remember to restart Homebridge after any changes.

### Key: lirc
This section contains information needed for communication with the LIRC installation:

* **remote**(string): a LIRC configured remote name (mandatory)
* **delay**(number): refers to the necessary gap between commands in miliseconds - default is 250 (optional)
* **host**(string): either hostname or IP (mandatory)
* **port**(number): default is 8765 (optional)
* **test**(boolean): if set to true will only connect to LIRC and not send commands (optional and not shown)

### Key: commands
Commands maps a logical action, e.g. 'volumeup', to one or more commands known by LIRC. The value(s) need to map to actual keys in a
remote definition file configured in LIRC. Some devices require this for normal operation such as projectors when turning them off.

The commands ('on', 'off', etc.) are referenced in the plugin for the relevant ```Characteristics``` so any changes in them will need to be reflected
in the code as well.

## Extending
In the likely event that the included ```Services``` and ```Characteristics``` do not cover a specific need these are the basic steps needed to
extend the plugin:
1. Identify the ```Service``` and ```Characteristics``` in [this](https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js)
2. Implement the get and set methods for the required ```Characteristics```
3. Create a new device section to the Homebridge ```config.json``` file as described under the **Configuration** section
4. Add the command key(s) to the section

### Additional notes
There is a limited set of ```Services``` and ```Characteristics``` but even if the precise type of service isn't defined one with a similar set of
```Characteristics``` can be used. Note that only ```Services``` and ```Characteristics``` defined by Homekit can be used.

A projector for example isn't defined but it can be considered a Switch since it needs to turn on and off. To add input switching
another ```Service``` and ```Characteristic``` would have to be found and implemented. The same device can implement more than one ```Service``` and
related ```Characteristics```.

Please note that recording remotes for use with LIRC is outside the scope of this document. Refer to the man page for ```irrecord``` or go
[here](http://www.lirc.org/html/irrecord.html).
