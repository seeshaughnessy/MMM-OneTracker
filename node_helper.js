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

      try {
        const res = await axios({
          method: 'get',
          url: 'https://api.onetracker.app/parcels',
          headers: {
            'x-api-token': authToken,
          },
        });
        const result = res.data.parcels;
        // console.warn('Result: ' + result); // check

        // Check for only current packages
        const currentParcels = result.filter((parcel) => {
          const deliveredDate = new Date(
            parcel.tracking_time_estimated
          ).toDateString();
          const today = new Date().toDateString();
          if (parcel.tracking_status == 'in_transit')
            return deliveredDate > today;
        });

        this.sendSocketNotification('ONETRACKER_RESULT', result);
      } catch (error) {
        console.log('Get Error: ' + error);
      }
    } catch (error) {
      console.log('Post Error: ' + error);
    }
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
