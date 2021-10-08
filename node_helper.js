/* Magic Mirror
 * Module: MMM-OneTracker
 *
 * By seeshaughnessy via fork by Mykle1
 *
 */

const { forEach } = require('lodash');
const NodeHelper = require('node_helper');
const request = require('request');
const sampleJson = require('./json_response.json');

module.exports = NodeHelper.create({
  start: function () {
    console.log('Starting node_helper for: ' + this.name);
  },

  getOneTracker: function () {
    // Authenticate and get token
    let self = this;

    var options = {
      uri: 'https://api.onetracker.app/auth/token',
      method: 'POST',
      json: {
        email: this.config.username,
        password: this.config.password,
      },
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const authToken = body.session.token;

        const options = {
          uri: 'https://api.onetracker.app/parcels',
          method: 'GET',
          json: true,
          headers: {
            'x-api-token': authToken,
          },
        };

        request(options, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            let results = body.parcels;
            // let results = sampleJson.parcels; // Test using json_response.json
            // console.log('Result: ', result); // check
            results.forEach((result) => {
              result.daysToReceive = self.getDaysToReceive(result);
            });
            const filteredParcels = results.filter(
              (parcel) => parcel.daysToReceive !== false
            );

            self.sendSocketNotification('ONETRACKER_RESULT', filteredParcels);
          }
        });
      }
    });
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
      // console.log('Notification received');
      this.getOneTracker();
    }
  },
});
