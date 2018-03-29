var Service, Characteristic;

var unifi = require('./unifi');

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-unifi-cameraAlerts", "UnifiAlerts", UnifiCameraAlertsAccessory);
}

function UnifiCameraAlertsAccessory(log, config) {

    this.log = log;
    this.name = config["name"];
    this.unifiUserName = config["unifiUsername"];
    this.unifiPassword = config["unifiPassword"];
    this.unifiNvr = config["unifiNvr"];

    var self = this;
    
    unifi.init(this.unifiUserName, this.unifiPassword, this.unifiNvr, self);

}


UnifiCameraAlertsAccessory.prototype = {

    setUnifiTargetState: function (state, callback) {
        var self = this;

        self.log("Set Unifi Camera Alerts to %s", state);
        //var self = this;

        unifi.setAlerts(state).then(function (resp) {
            
            //self.securityService.setCharacteristic(Characteristic.On, state);
            self.log('Unifi Camera alerts updated');
            callback(null, state);

        }).catch(function (error) {
            // Most propably user not logged in. Re-login

            unifi.login().then(function (resp) {
                //successful call
                //this.log('Relogin success...');

                unifi.setAlerts(state).then(function (resp) {
                    self.log('Unifi Camera alerts updated');
                    callback(null, state);

                }).catch(function (error) {
                    //this.log(error)
                    callback("error");
                })

            }).catch(function (error) {
                //this.log(error);
                callback("error");

            });
        }.bind(this));

    },

    getUnifiState: function (callback) {
        var self = this;
        unifi.login().then(function (resp) {
            //successful call
            self.log('Camera alerts enabled: ', resp);
            callback(null, resp);

        }).catch(function (error) {
            callback("error");
        });
    },

    identify: function (callback) {
        this.log("Identify requested!");
        callback(); // success
    },

    getServices: function () {
        this.unifiService = new Service.Switch(this.name);

        this.unifiService
            .getCharacteristic(Characteristic.On)
            .on('get', this.getUnifiState.bind(this))
            .on('set', this.setUnifiTargetState.bind(this));

        return [this.unifiService];
    }
};