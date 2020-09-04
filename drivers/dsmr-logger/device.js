'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

class MyDevice extends Homey.Device {

	timerElapsed(device) {
		setTimeout(function () { device.timerElapsed(device); }, device.getSetting('interval') * 1000);
		var energy = {
			"list": [
				{ "device": "measure_power", "factor": 1000, "dsmr": ["power_delivered_l1", "power_delivered_l2", "power_delivered_l3"] },
				{ "device": "meter_power", "factor": 1, "dsmr": ["energy_delivered_tariff1", "energy_delivered_tariff2"] },
				{ "device": "meter_gas", "factor": 1, "dsmr": ["gas_delivered"] },
				{ "device": "meter_water", "factor": 1, "dsmr": ["water_delivered"] }
			]
		};
		var hostname = device.getSetting('hostname');
		fetch('http://' + hostname + '/api/v1/sm/actual').then(function (response) {
			response.json().then(function (json) {
				energy.list.forEach(lookup => {
					var add = 0;
					json.actual.forEach(element => {
						lookup['dsmr'].forEach(search => {
							if (search === element['name']) {
								add += (element['value'] * lookup['factor']);
								device.setCapabilityValue(lookup['device'], add);
							}
						});
					});
				});
			});
		}).catch(function (err) {
			device.log(err);
		});
	}


	// this method is called when the Device is initialized
	onInit() {
		let device = this;
		device.log('dsmr-logger init');
		device.log('Name:', device.getName());
		device.log('Class:', device.getClass());
		device.log('Hostname:', device.getSetting('hostname'));
		device.log('Interval:', device.getSetting('interval'));

		setTimeout(function () { device.timerElapsed(device); }, device.getSetting('interval') * 1000);
	}
}

module.exports = MyDevice;