This is plugin that integrate Homebridge with Unifi Cameras API.
Switch allow to enable / disable notifications (both mail and push) for all cameras assigned to the current user.

You can include that into other automations in your smart home.

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-unifi-cameraalerts
3. Update your configuration file. See sample config.json snippet below. 

# Configuration

Configuration sample:

 ```
    "accessories": [
        {
            "accessory": "UnifiAlerts",
            "name": "UnifiAlerts",
            "unifiUserName": "",
            "unifiPassword": "" ,
            "unifiNvr": "https://192.168.99.4:7443/api/2.0"           
        }
    ]

```

Fields: 

* "accessory": Must always be "UnifiAlerts" (required)
* "name": Can be anything (used in logs)
* "unifiUserName" , "unifiPassword": UserName and Password for your NVR
* "unifiPassword": PIN Code used for arm/disarm
* "unifiNvr": address for your NVR recorder combined with /api/2.0 path