/*
* This file is part of the WattBox package.
* © 2021 David Stevens
* Author: David Stevens <teamjtf4@gmail.com>
*
* This program is free software.
* You should have received a copy of the MIT license along with
* this program.
*
* You can be released from the requirements of the license by purchasing
* a commercial license. Buying such a license is mandatory as soon as you
* develop commercial activities involving the WattBox package without
* disclosing the source code of your own applications.
*/


import axios from 'axios';
import * as xml2js from 'xml2js';

// Types
import { BasicStatus } from './_models/BasicStatus';

export class WattBox {
    authToken: string;
    networkPath: string;
    private parser: xml2js.Parser = new xml2js.Parser();


    constructor(username: string, password: string, networkPath: string) {
        this.authToken = this.getAuthToken(username, password);

        if (!networkPath.startsWith('http://') && !networkPath.startsWith('https://')) {
            networkPath = 'http://' + networkPath.substring(0, networkPath.lastIndexOf('/'));
            this.networkPath = networkPath;
        } else {
            this.networkPath = networkPath.substring(0, networkPath.lastIndexOf('/'));
        }

    }

    public powerOn(outlet: number) {

        var self = this;

        return new Promise((resolve, reject) => {
            let url = self.buildCommandUrl(outlet, 1);
            this.rest_get(url).then((response: any) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });

        })
    }

    public powerOff(outlet: number) {

        var self = this;

        return new Promise((resolve, reject) => {
            let url = self.buildCommandUrl(outlet, 0);
            this.rest_get(url).then((response: any) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });

        })
    }

    public powerReset(outlet: number) {

        var self = this;

        return new Promise((resolve, reject) => {
            let url = self.buildCommandUrl(outlet, 3);
            this.rest_get(url).then((response: any) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });

        })
    }

    public powerResetTimeout(outlet: number, timeout: number) {

        var self = this;

        return new Promise((resolve, reject) => {
            let url = self.buildCommandUrl(outlet, 3);
            this.rest_get(url).then((response: any) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });

        })
    }

    public autoRebootOn() {

        var self = this;

        return new Promise((resolve, reject) => {
            let url = self.buildCommandUrl(0, 4);
            this.rest_get(url).then((response: any) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });

        })
    }

    public autoRebootOff() {

        var self = this;

        return new Promise((resolve, reject) => {
            let url = self.buildCommandUrl(0, 5);
            this.rest_get(url).then((response: any) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });

        })
    }

    private buildCommandUrl(outlet: number, command: number) {
        return this.networkPath + '/control.cgi?outlet=' + outlet + '&command=' + command;
    }

    private rest_get(url: string) {

        var self = this;

        return new Promise((resolve, reject) => {
            axios.get(url, {
                headers: {
                    'Authorization': this.authToken,
                    'Content-Type': 'application/json',
                    'Keep-Alive': '300',
                    'Connection': 'keep-alive',
                    'User-Agent': 'APP',
                    'Host': this.networkPath.split('//')[1].split('/')[0]
                }
            }).then((response) => {
                let data = response.data;
                try {
                    self.parser.parseStringPromise(data).then((result: any) => {
                        let data: BasicStatus = result.request;
                        resolve(data);
                    }).catch(error => {
                        reject(error);        
                    })
                } catch (error) {
                    resolve(response);
                }
            }).catch((error) => {
                if (error == 'Error: socket hang up') {
                    reject('Error: Authentication failed. Please check your credentials.');
                } else if (error.code == 'ECONNREFUSED') {
                    reject('Error: Connection refused. Please check your network connection.');
                } else if (error.code == 400 || error.code == 401) {
                    reject('Error: Connection refused. Please check your network connection.');
                } else { reject(error); }
            });
        });
    }

    private getAuthToken(username: string, password: string) {
        var auth: string = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
        return auth;
    }
}

let wattbox = new WattBox('technician', 'technician22', '192.168.11.244/');

console.log('Starting')
console.log(wattbox.authToken);
console.log(wattbox.networkPath);

wattbox.powerOn(3).then((data) => {
    console.log(data);
}).catch((error) => {
    console.log(error);
});