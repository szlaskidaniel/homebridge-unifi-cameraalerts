var request = require('request');
var rp = require('request-promise');
var defer = require('promise-defer')


var cookie = require('cookie');

var unifi_username;
var unifi_password;

var unifi_Cookies;


var unifi_APIKEY;
var unifi_USERID;
var unifi_NvrUrl;

var cameras;


var self;


function init(aUser, aPassword, aNvr, obj) {

    unifi_username = aUser;
    unifi_password = aPassword;
    unifi_NvrUrl = aNvr;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    self = obj;

}

function login() {

    return new Promise(function (resolve, reject) {
        //console.log('login to Unifi...', unifi_username);

        var post_data = {
            "username": unifi_username,
            "password": unifi_password

        };
        //console.log('Unifi request: ', unifi_NvrUrl + '/login');
        var options = {
            url: unifi_NvrUrl + '/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000,
            json: post_data
        };


        request(options, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                //console.log('Logged In');

                unifi_Cookies = res.headers['set-cookie'];
                unifi_USERID = body.data[0]["_id"];
                unifi_APIKEY = body.data[0].apiKey;

                //console.log('Camera alerts enabled: ', body.data[0].enablePush);

                resolve(body.data[0].enablePush);
            } else {
                //console.log('HTTP ResponseCode', res.statusCode);
                //console.log('HTT ResponseMessage', res.statusMessage);
                //console.log(err);

                reject();
            }
        })

    });
}



function setAlerts(aState, aUrl) {

    //console.log('func: arm');
    return new Promise(function (resolve, reject) {

        //console.log('setAlerts to:', aState);
        var post_data = {
            "apiKey": unifi_APIKEY,
            "enableEmail": aState,
            "enablePush": aState
        };



        var options = {
            url: unifi_NvrUrl + '/user/' + unifi_USERID,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Cookie": unifi_Cookies
            },
            timeout: 5000,
            json: post_data
        };

        request(options, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                /*
                getCameras().then(function (resp) {
                    self.log('Time for update');
                    updateCameras(aState).then(function (resp) {

                        resolve();


                    }).catch(function (error) {
                        reject();
                    });

                }).catch(function (error) {
                    reject();
                });
                */
               resolve();

            } else {
                var errMsg = 'Error ';
                //console.log(errMsg);
                console.log(err);
                //console.log(res.statusCode);
                //console.log(res.statusMessage)
                reject(errMsg);
            }
        })
    });
}



function getCameras() {
    cameras = {};

    return new Promise(function (resolve, reject) {

        //console.log('setAlerts to:', aState);
        var post_data = {};

        var options = {
            url: unifi_NvrUrl + '/camera',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Cookie": unifi_Cookies
            },
            timeout: 5000,
            json: post_data
        };

        request(options, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                // Analyze resp
                self.log('All CAM downloaded - parse');
                body.data.forEach(function (element) {
                    cameras[element["_id"]] = element.name;
                });
                self.log('All CAM parsed');
                self.log(cameras);

                resolve();
            } else {
                var errMsg = 'Error ';
                //console.log(errMsg);
                console.log(err);
                //console.log(res.statusCode);
                //console.log(res.statusMessage)
                reject(errMsg);
            }
        })
    });
}




function updateCameras(aState, def) {

    var deferred = def || new defer();

    var firstItem;
    for (firstItem in cameras) {
        break;
    }

    var post_data = {
        "name": cameras[firstItem],
        "recordingSettings": {
            "motionRecordEnabled": false,
            "fullTimeRecordEnabled": aState,
            "channel": "0"
        }
    }
   

    self.log('Update Cam: ' + firstItem + '/' + cameras[firstItem]);

    var options = {
        url: unifi_NvrUrl + '/camera/' + firstItem,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Cookie": unifi_Cookies
        },
        timeout: 5000,
        json: post_data
    };

    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {

            delete cameras[firstItem];

            if (countObj(cameras) == 0) {
                deferred.resolve(true);
            } else {
                updateCameras(aState, deferred)
            }

        } else {
            var errMsg = 'Error ';
            //console.log(errMsg);
            console.log(err);
            //console.log(res.statusCode);
            //console.log(res.statusMessage)
            deferred.reject(errMsg);
        }
    })
    return deferred.promise;

}

function countObj(obj) {
    var count = 0;

    for(var prop in obj) {
            ++count;
    }

    return count;
}

module.exports = {
    init,
    login,
    setAlerts
};