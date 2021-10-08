/* Magic Mirror
 * Module: MMM-OneTracker
 *
 * By see.shaughnessy
 *
 */
Module.register('MMM-OneTracker', {
  // Module config defaults.           // Make all changes in your config.js file
  defaults: {
    username: '', // Sign up for free using the OneTracker App
    password: '',
    useHeader: true, // false if you don't want a header
    header: 'My Packages', // Change in config file. useHeader must be true
    maxWidth: '300px',
    animationSpeed: 3000, // fade speed
    initialLoadDelay: 3250,
    retryDelay: 2500,
    updateInterval: 10 * 60 * 1000, // 10 minutes
    apiLanguage: 'en',
    maxParcels: 5,
  },

  getStyles: function () {
    return ['MMM-OneTracker.css'];
  },

  start: function () {
    Log.info('Starting module: ' + this.name);
    this.sendSocketNotification('CONFIG', this.config);

    requiresVersion: '2.1.0',
      //  Set locale.
      (this.url = '');
    this.OneTracker = {};
    this.scheduleUpdate();
  },

  getDom: function () {
    var wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    wrapper.style.maxWidth = this.config.maxWidth;

    if (!this.loaded) {
      wrapper.innerHTML = "Where's my stuff?";
      wrapper.classList.add('bright', 'light', 'small');
      return wrapper;
    }

    // If there are deliveries pending, go through all the data
    if (this.OneTracker.length != 0) {
      //  Header
      if (this.config.useHeader != false) {
        var header = document.createElement('header');
        header.classList.add('header', 'small', 'dimmed', 'bold');
        header.innerHTML =
          this.config.header + ' (' + this.OneTracker.length + ')';
        wrapper.appendChild(header);
      }

      //	Rotating my data
      var OneTracker = this.OneTracker;

      // My data begins here
      OneTracker.forEach((parcel, index) => {
        // Limit packages via config maxParcels
        if (index < this.config.maxParcels) {
          var top = document.createElement('div');
          top.classList.add('list-row');

          // Format package data

          var parcelWrapper = document.createElement('div');
          parcelWrapper.classList.add('parcel-wrapper');
          wrapper.appendChild(parcelWrapper);

          var dateWrapper = document.createElement('div');
          dateWrapper.classList.add('date-wrapper');
          parcelWrapper.appendChild(dateWrapper);

          var dataWrapper = document.createElement('div');
          dataWrapper.classList.add('data-wrapper');
          parcelWrapper.appendChild(dataWrapper);

          // expected_delivery date
          var expectedDelivery = document.createElement('div');
          expectedDelivery.classList.add('bright', 'expected_delivery');

          var expectedDeliveryLabel = document.createElement('div');
          expectedDeliveryLabel.classList.add(
            'bright',
            'expected_delivery_label'
          );

          // Calculate days left
          const daysToReceive = parcel.daysToReceive;
          console.log(daysToReceive);

          if (parcel.tracking_status == 'delivered')
            expectedDelivery.innerHTML =
              '<i class="fa fa-check-circle" aria-hidden="true"></i>';
          else if (daysToReceive == '?')
            expectedDelivery.innerHTML =
              '<i class="fa fa-truck" aria-hidden="true"></i>';
          else expectedDelivery.innerHTML = daysToReceive;

          dateWrapper.appendChild(expectedDelivery);

          // Show delivery if not delivered or delivered today
          if (parcel.tracking_status !== 'delivered') {
            if (daysToReceive >= 0) expectedDeliveryLabel.innerText = 'Days';
            if (daysToReceive == 1) expectedDeliveryLabel.innerText = 'Day';
          }
          dateWrapper.appendChild(expectedDeliveryLabel);

          // Title of shipment (if any)
          var Title = document.createElement('div');
          var description = parcel.description
            ? `${parcel.description} (${parcel.carrier})`
            : `${parcel.carrier} (#${parcel.tracking_id})`;
          Title.classList.add('small', 'bright', 'no-wrap', 'Title');
          Title.innerHTML = description;
          dataWrapper.appendChild(Title);

          // status of shipment
          const location = parcel.tracking_location;
          const statusReadable = parcel.tracking_status_readable;

          var locationDiv = document.createElement('div');
          locationDiv.classList.add('xsmall', 'no-wrap', 'dimmed');

          var statusDiv = document.createElement('div');
          statusDiv.classList.add('xsmall', 'no-wrap', 'dimmed');

          if (statusReadable !== '')
            statusDiv.innerHTML = `<i class="fa fa-calendar" aria-hidden="true"></i>  ${parcel.tracking_status_readable}`;
          if (location != '')
            locationDiv.innerHTML += `<i class="fa fa-map-marker" aria-hidden="true"></i>  ${parcel.tracking_location}`;
          dataWrapper.appendChild(locationDiv);
          dataWrapper.appendChild(statusDiv);
        } // Parcel limit
      }); // Loop through parcles

      return wrapper;
    } else {
      // When there are no pending deliveries, remove the header
      if (this.config.useHeader != true) {
        var header = document.createElement('header');
        header.classList.add('header', 'small', 'dimmed');
        header.innerHTML =
          this.config.header + ' (' + this.OneTracker.length + ')';
        wrapper.appendChild(header);
      }
    } // Closes else statement from deliveries pending if statement above

    return wrapper;
  }, // <-- closes getDom

  /////  Add this function to the modules you want to control with voice //////

  notificationReceived: function (notification, payload) {
    if (notification === 'HIDE_SHIPPING') {
      this.hide(1000);
      //    this.updateDom(300);
    } else if (notification === 'SHOW_SHIPPING') {
      this.show(1000);
      //   this.updateDom(300);
    }
  },

  processOneTracker: function (data) {
    this.OneTracker = data;
    // console.log('processOneTracker: ' + this.OneTracker); // for checking //
    this.loaded = true;
  },

  scheduleUpdate: function () {
    setInterval(() => {
      console.log('scheduleUpdate');
      this.getOneTracker();
    }, this.config.updateInterval);
    this.getOneTracker(this.config.initialLoadDelay);
  },

  getOneTracker: function () {
    this.sendSocketNotification('GET_ONETRACKER');
  },

  socketNotificationReceived: function (notification, payload) {
    console.warn('notification received ', notification);
    if (notification === 'ONETRACKER_RESULT') {
      this.processOneTracker(payload);
      this.updateDom(this.config.animationSpeed);
    }

    this.updateDom(this.config.initialLoadDelay);
  },
});
