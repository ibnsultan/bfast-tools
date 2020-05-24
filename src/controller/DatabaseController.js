const axios = require('axios');
const Utils = require('./utils');
const LocalStorage = require('./LocalStorageController');
const BFastJs = require("../bfast-tools");
const _storage = new LocalStorage();
const staticServer = require('http-server');

class DatabaseController {

    /**
     * switch on/off database dashboard
     * @param projectId {string}
     * @param mode {number}
     * @param force {boolean}
     * @returns {Promise<>}
     * @deprecated
     */
    async switchDashboard(projectId, mode, force = false) {
        try {
            const user = await _storage.getUser();
            console.log(`\nCurrent linked bfast project ( projectId: ${projectId})`);
            console.log(`Start switching dashboard ${mode === 0 ? 'off' : 'on'}`);
            const response = await axios.post(`${await BFastJs.clusterApiUrl()}/dashboard/${projectId}/switch/${mode}?force=${force}`,
                {},
                {
                    headers: {
                        'content-type': 'application/json',
                        'authorization': `Bearer ${user.token}`
                    },
                }
            );
            return response.data;
        } catch (reason) {
            if (reason && reason.response) {
                throw reason.response.data;
            } else {
                throw reason;
            }
        }
    }

    async openUi(port) {
        staticServer.createServer({
            root: __dirname + '/../database-ui'
        }).listen(port);
        return 'BFast::Database playground listen on : ' + port + '\nOpen http://localhost:' + port + " In your browser";
    }

    /**
     * update liveQuery classes to listen to
     * @param projectDir {string}
     * @param classes {string[]}
     * @param force {boolean}
     * @returns {Promise<>}
     * @deprecated
     */
    async addClassesToLiveQuery(projectDir, classes, force) {
        try {
            if (!Array.isArray(classes)) {
                throw "classes must be an array of string"
            }
            const user = await _storage.getUser();
            await Utils.isBFastProject(projectDir);
            const project = await _storage.getCurrentProject(projectDir);
            console.log(`\nCurrent linked bfast project ( projectId: ${project.projectId})`);
            const response = await axios.post(`${await BFastJs.clusterApiUrl()}/database/${project.projectId}/liveQuery?force=${force}`,
                {
                    classNames: classes
                },
                {
                    headers: {
                        'content-type': 'application/json',
                        'authorization': `Bearer ${user.token}`
                    },
                }
            );
            return response.data;
        } catch (reason) {
            if (reason && reason.response) {
                throw reason.response.data;
            } else {
                throw reason;
            }
        }
    }
}

module.exports = DatabaseController;