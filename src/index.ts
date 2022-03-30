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
import { EventEmitter } from 'stream';
import * as xml2js from 'xml2js';

// Types
import { BasicStatus } from './_models/BasicStatus';
import { WattBoxInfo } from './_models/WattBoxInfo';

export class WattBoxPromise extends EventEmitter {
    authToken: string;
    networkPath: string;
    private parser: xml2js.Parser = new xml2js.Parser();
    private statusInterval: ReturnType<typeof setInterval>;;


    /**
     * It creates a new instance of the WattBox Promise class.
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @param {string} networkPath - The network path of the WattBox.
     */

    constructor(username: string, password: string, networkPath: string) {
        super();
        this.authToken = this.getAuthToken(username, password);

        if (!networkPath.startsWith('http://') && !networkPath.startsWith('https://')) {
            networkPath = 'http://' + networkPath.substring(0, networkPath.lastIndexOf('/'));
            this.networkPath = networkPath;
        } else {
            this.networkPath = networkPath.substring(0, networkPath.lastIndexOf('/'));
        }

    }

    /**
     * It turns on the power to the outlet.
     * @param {number} outlet - The outlet number to control.
     * @returns The response from the WattBox.
     */

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

    /**
     * It turns off the power to the outlet.
     * @param {number} outlet - The outlet number to control.
     * @returns The response from the WattBox.
     */

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

    /**
     * It resets the power to the outlet.
     * @param {number} outlet - The outlet number to reset.
     * @returns The promise object.
     */

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

    /**
     * It resets the power to the outlet.
     * @param {number} outlet - The outlet number to reset.
     * @param {number} timeout - The time in seconds to wait before turning on the outlet.
     * @returns The response from the server.
     */

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

    /**
     * It tells the device to reboot itself.
     * @returns The response from the server
     */

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

   /**
    * It turns off auto reboot.
    * @returns The response from the server.
    */

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

    /**
     * It gets the status of the wattbox.
     * @returns The response is a string. The string is a XML document.
     */

    public getStatus() {

        var self = this;

        /*
        * Wattbox documentation says that issuing the command 
        * control.cgi?command="wattbox_info.xml" will return the status of all outlets.
        * However, it seems that the command fails if you don't specify an outlet, BUT
        * if you specify a valid outlet it will change the status of that outlet to off.
        * The solution: issue the command with an impossible outlet value like -1. 
        * Any input on this would be appreciated.
        */

        return new Promise((resolve, reject) => {
            let url = self.networkPath + '/control.cgi?outlet=-1&command="wattbox_info.xml"';
            this.rest_get(url).then((response: any) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });

        })
    }

    /**
     * It subscribes to status updates of the device.
     * @param {number} time - The time interval in milliseconds between each status update.
     */

    public subscribeStatus(time: number) {

        var self = this;

        this.statusInterval = setInterval(() => {
            self.getStatus().then((response: BasicStatus) => {
                self.emit('status', response);
            }).catch((error) => {
                self.emit('error', error);
            });
        }, time);

    }

    /**
     * Unsubscribes from WattBox status updates.
     */

    public unsubscribeStatus() {

        clearInterval(this.statusInterval);

    }

    /**
     * It gets the information about the WattBox.
     * @returns The WattBoxInfo object.
     */

    public getInfo() {
        
        var self = this;

        return new Promise((resolve, reject) => {

            let url = self.networkPath + '/wattbox_info.xml';

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
                        let data: WattBoxInfo = result.request;
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
        })
    }

   /**
    * Build a URL for a command to the outlet
    * @param {number} outlet - The outlet number to control.
    * @param {number} command - 0 = off, 1 = on, 3 = reboot
    * @returns The response from the server.
    */

    private buildCommandUrl(outlet: number, command: number) {
        return this.networkPath + '/control.cgi?outlet=' + outlet + '&command=' + command;
    }

    /**
     * It makes a GET request to the server.
     * @param {string} url - The URL to send the request to.
     * @returns The promise is returned.
     */

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

    /**
     * It takes a username and password and returns a string that is used as an authorization header.
     * @param {string} username - The username of the user you want to authenticate.
     * @param {string} password - The password for the user.
     * @returns The auth token is being returned.
     */

    private getAuthToken(username: string, password: string) {
        var auth: string = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
        return auth;
    }
}