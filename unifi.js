var request = require('request');
var rp = require('request-promise');

var cookie = require('cookie');

var unifi_username;
var unifi_password;

var unifi_Cookies;


var unifi_APIKEY;
var unifi_USERID;
var unifi_NvrUrl;

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
        //console.log('Unifi request: ' + unifi_NvrUrl + '/user/' + unifi_USERID);
        request(options, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                //console.log('Success');
                resolve();
            } else {
                var errMsg = 'Error ';
                //console.log(errMsg);
                self.log(err);
                //console.log(res.statusCode);
                //console.log(res.statusMessage)
                reject(errMsg);
            }
        })
    });
}

module.exports = {
    init,
    login,
    setAlerts
};