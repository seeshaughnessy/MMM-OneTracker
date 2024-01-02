/* Magic Mirror
 * Module: MMM-OneTracker
 *
 * By seeshaughnessy via fork by Mykle1
 *
 */

const { forEach } = require('lodash');
const NodeHelper = require('node_helper');
const sampleJson = require('./json_response.json');
const Log = require("logger");

module.exports = NodeHelper.create({
  start: function () {
    Log.info('Starting node_helper for: ' + this.name);
  },

  getOneTracker: function () {
    // Authenticate and get token
    let self = this;

    var authBody = {
      email: this.config.username,
      password: this.config.password,
    };

    try {
      fetch('https://api.onetracker.app/auth/token', {
        method: 'post',
        body: JSON.stringify(authBody),
        headers: { 'Content-Type': 'application/json' }
      })
      .then(self.checkFetchStatus)
      .then((response) => response.json())
      .then((responseData) => {

        const authData = responseData;
        var authToken = authData.session.token;

        fetch('https://api.onetracker.app/parcels', {
          method: 'get',
          headers: {
            'x-api-token': authToken,
          }
        })
        .then(self.checkFetchStatus)
        .then((trackResponse) => trackResponse.json())
        .then((trackData) => {
          let results = trackData.parcels;
          // let results = sampleJson.parcels; // Test using json_response.json
          // console.log('Result: ', result); // check
          results.forEach((result) => {
            result.daysToReceive = self.getDaysToReceive(result);
          });
          const filteredParcels = results.filter(
            (parcel) => parcel.daysToReceive !== false
          );

          self.sendSocketNotification('ONETRACKER_RESULT', filteredParcels);
        });
      })
    }
    catch (error) {
      Log.error("Error fetching parcel status:" + error);
    }
  },

  checkFetchStatus: function(response) {
    if (response.ok) {
      return response;
    } else {
      throw Error(response.statusText);
    }
  },

  // Returns days left until delivery, false if delivered 1+ days ago, and ? if delivery is unknown
  getDaysToReceive: function (parcel) {
    const parcelStatus = parcel.tracking_status;
    const parcelString = parcel.tracking_time_estimated;

    // Calculate daysToDelivery
    const parcelDate = new Date(parcelString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set today's time to 0, so delivery doesn't show partial day
    const diffInTime = parcelDate.getTime() - today.getTime();
    const daysToDelivery = Math.round(diffInTime / (1000 * 3600 * 24));

    if (parcelStatus == 'delivered') {
      return daysToDelivery == 0 ? '0' : false;
    } else {
      return daysToDelivery < 0 ? '?' : daysToDelivery;
    }
    return false;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'CONFIG') {
      this.config = payload;
    } else if (notification === 'GET_ONETRACKER') {
      Log.info('Processing GET_ONETRACKER notification');
      this.getOneTracker();
    }
  },
});
