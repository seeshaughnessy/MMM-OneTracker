/* Magic Mirror
 * Module: MMM-OneTracker
 *
 * By Mykle1
 *
 */
const { forEach } = require('lodash');
const NodeHelper = require('node_helper');
const request = require('request');

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
    const parcelDate = parcel.tracking_time_estimated;
    const parcelDay = parcelDate.substr(8, 2); //Get day from tracking data
    var today = new Date().toString().substr(8, 2); //Get todays date
    const daysToDelivery = parcelDay - today;

    if (parcelStatus !== 'delivered') {
      if (daysToDelivery < 0) return '?';
      if (daysToDelivery >= 0) return daysToDelivery;
    } else if (parcelStatus == 'delivered') {
      if (daysToDelivery == 0) return '0';
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
