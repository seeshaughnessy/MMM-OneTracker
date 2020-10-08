/* Magic Mirror
 * Module: MMM-OneTracker
 *
 * By Mykle1
 *
 */
const NodeHelper = require('node_helper');
const axios = require('axios');
const moment = require('moment');

module.exports = NodeHelper.create({
  start: function () {
    console.log('Starting node_helper for: ' + this.name);
  },

  getOneTracker: async function () {
    // Authenticate and get token
    try {
      const response = await axios({
        method: 'post',
        url: 'https://api.onetracker.app/auth/token',
        data: {
          email: this.config.username,
          password: this.config.password,
        },
      });
      const authToken = await response.data.session.token;

      // GET parcels
      try {
        const res = await axios({
          method: 'get',
          url: 'https://api.onetracker.app/parcels',
          headers: {
            'x-api-token': authToken,
          },
        });
        let result = res.data.parcels;
        // console.log('Result: ' + result); // check

        let filteredParcels = result.filter((parcel) =>
          this.getDaysToReceive(parcel)
        );
        this.sendSocketNotification('ONETRACKER_RESULT', filteredParcels);
      } catch (error) {
        console.log('Get Error: ' + error);
      }
    } catch (error) {
      console.log('Post Error: ' + error);
    }
  },

  // Returns days left until delivery, null if delivered 1+ days ago, and ? if delivery is unknown
  getDaysToReceive: function (parcel) {
    const parcelStatus = parcel.tracking_status;
    const parcelDate = parcel.tracking_time_estimated;
    const parcelDay = parcelDate.substr(8, 2); //Get day from tracking data
    var today = new Date().toString().substr(8, 2); //Get todays date
    const daysToDelivery = parcelDay - today;

    if (parcelStatus != 'delivered' && daysToDelivery < 0) return '?';
    if (parcelStatus != 'delivered' && daysToDelivery >= 0)
      return daysToDelivery;
    if (parcelStatus == 'delivered' && daysToDelivery == 0) return '0';
    return;
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
