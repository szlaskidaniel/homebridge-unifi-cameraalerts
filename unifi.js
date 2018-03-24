var request = require('request');
var cookie = require('cookie');

var unifi_username;
var unifi_password;

var unifi_Cookies;


var unifi_APIKEY;
var unifi_USERID;
var unifi_NvrUrl;



function init(aUser, aPassword, aNvr) {

    unifi_username = aUser;
    unifi_password = aPassword;
    unifi_NvrUrl = aNvr;
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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


/*
function refreshState() {

    return new Promise(function (resolve, reject) {

        var post_data = {};

        var options = {
            url: 'https://www.riscocloud.com/ELAS/WebUI/Security/GetCPState',
            method: 'POST',
            headers: {
                "Referer": "https://www.riscocloud.com/ELAS/WebUI/MainPage/MainPage",
                "Origin": "https://www.riscocloud.com",
                "Cookie": riscoCookies
            },
            json: post_data
        };

        request(options, function (err, res, body) {
            if (!err) {
                // Check error inside JSON
                try {
                    if (body.error == 3) {
                        // Error. Try to login first
                        console.log('Error: 3. Try to login first.');
                        reject();
                        return
                    }
                } catch (error) {

                }

                // Check if overview is present

                if (body.overview == undefined) {
                    // No changes. Empty response
                    resolve();
                    return
                }

                //console.log('No error, status: ', res.statusCode);
                //console.log('RiscoCloud ArmedState:', body.overview.partInfo.armedStr);
                //console.log('RiscoCloud OngoingAlarm: ', body.OngoingAlarm);

                var riscoState;
                // 0 -  Characteristic.SecuritySystemTargetState.STAY_ARM:
                // 1 -  Characteristic.SecuritySystemTargetState.AWAY_ARM:
                // 2-   Characteristic.SecuritySystemTargetState.NIGHT_ARM:
                // 3 -  Characteristic.SecuritySystemTargetState.DISARM:
                //console.log(body);

                if (body.OngoingAlarm == true) {
                    riscoState = 4;
                } else {
                    try {
                        var armedZones = body.overview.partInfo.armedStr.split(' ');
                        if (parseInt(armedZones[0]) > 0) {
                            riscoState = 1 // Armed
                        } else
                            riscoState = 3 // Disarmed
                    } catch (error) {
                        resolve();
                    }
                }

                resolve(riscoState);
            } else
                reject();
        })
    })
}
*/


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
            json: post_data
        };
        //console.log('Unifi request: ' + unifi_NvrUrl + '/user/' + unifi_USERID);
        request(options, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                //console.log('Success');
                resolve();
            } else {
                var errMsg = 'Error ' + res.statusCode;
                //console.log(errMsg);
                //console.log(res);
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