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
    rotateInterval: 30 * 1000, // 30 second rotation of items
    updateInterval: 10 * 60 * 1000, // 10 minutes
    apiLanguage: 'en',
    dateTimeFormat: 'ddd, MMM DD, YYYY, h:mm a',
    dateFormat: 'ddd, MMM DD, YYYY',
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
    this.activeItem = 0;
    this.rotateInterval = null;
    this.scheduleUpdate();
  },

  getDom: function () {
    const status = {
      in_transit: 'In Transit',
      delivered: 'Delivered',
    };

    var wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    wrapper.style.maxWidth = this.config.maxWidth;

    if (!this.loaded) {
      wrapper.innerHTML = "Where's my stuff?";
      wrapper.classList.add('bright', 'light', 'small');
      return wrapper;
    }

    if (this.config.useHeader != false) {
      var header = document.createElement('header');
      header.classList.add('header');
      header.innerHTML =
        this.config.header + ' (' + this.OneTracker.length + ')';
      wrapper.appendChild(header);
    }

    // If there are deliveries pending, go through all the data
    if (this.OneTracker.length != 0) {
      //	Rotating my data
      var OneTracker = this.OneTracker;
      var OneTrackerKeys = Object.keys(this.OneTracker);
      if (OneTrackerKeys.length > 0) {
        if (this.activeItem >= OneTrackerKeys.length) {
          this.activeItem = 0;
        }
        // var OneTracker = this.OneTracker[OneTrackerKeys[this.activeItem]];
        //	console.log(this.OneTracker); // for checking

        // My data begins here
        OneTracker.forEach((parcel) => {
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

          // Title of shipment (if any)
          var Title = document.createElement('div');
          var description = parcel.description
            ? `${parcel.description} (${parcel.carrier})`
            : `From ${parcel.carrier} (#${parcel.tracking_id})`;
          Title.classList.add('small', 'bright', 'no-wrap', 'Title');
          Title.innerHTML = description;
          dataWrapper.appendChild(Title);

          // // ID of shipment
          // var ID = document.createElement('div');
          // ID.classList.add('xsmall', 'bright', 'ID');
          // ID.innerHTML = 'ID: ' + parcel.id;
          // dataWrapper.appendChild(ID);

          // // Last update on shipment
          // var lastUpdate = document.createElement('div');
          // lastUpdate.classList.add('xsmall', 'bright', 'lastUpdate');
          // lastUpdate.innerHTML =
          //   'Updated: ' +
          //   moment(parcel.last_updated_at)
          //     .local()
          //     .format(this.config.dateTimeFormat);
          // dataWrapper.appendChild(lastUpdate);

          // // tracking number of shipment
          // var tracking_number = document.createElement('div');
          // tracking_number.classList.add('xsmall', 'bright', 'tracking_number');
          // tracking_number.innerHTML = '#' + parcel.tracking_id;
          // dataWrapper.appendChild(tracking_number);

          // // Courier name
          // var slug = document.createElement('div');
          // slug.classList.add('xsmall', 'bright', 'courier');
          // slug.innerHTML = 'Courier: ' + parcel.carrier;
          // dataWrapper.appendChild(slug);

          // expected_delivery date
          var parcelDate = moment('2020-10-13T00:00:00Z');
          var today = moment(Date.now());
          // console.log(parcelDate, today);

          const daysToDelivery =
            parcel.tracking_time_estimated == '1001-01-01T00:00:00Z'
              ? '?'
              : today.diff(parcelDate, 'days');

          var expectedDelivery = document.createElement('div');
          expectedDelivery.classList.add('bright', 'expected_delivery');

          var expectedDeliveryLabel = document.createElement('div');
          expectedDeliveryLabel.classList.add('expected_delivery_label');
          expectedDeliveryLabel.innerText =
            daysToDelivery == 1 ? 'Day' : 'Days';

          expectedDelivery.innerHTML = daysToDelivery;

          if (parcel.tracking_status != 'delivered') {
            dateWrapper.appendChild(expectedDelivery);
            dateWrapper.appendChild(expectedDeliveryLabel);
          } else {
            expectedDelivery.innerText = 'D';
            dateWrapper.appendChild(expectedDelivery);
          }

          // status of shipment
          var tag = document.createElement('div');
          tag.classList.add('xsmall', 'bright', 'status');
          tag.innerHTML = `${status[parcel.tracking_status]}: ${
            parcel.tracking_location
          }`;
          dataWrapper.appendChild(tag);
          console.log(parcel); // check

          // // tracking_location
          // const location = OneTracker.tracking_location;

          // var locationView = document.createElement('div');
          // locationView.classList.add('xsmall', 'bright', 'shipment_type');
          // if (location !== '') {
          //   locationView.innerHTML = 'Location: ' + location;
          // }
          // dataWrapper.appendChild(locationView);
        });
      } // <-- closes rotation

      return wrapper;
    } else {
      // From deliveries pending if statement above

      // When there are no pending deliveries, do the following
      var top = document.createElement('div');
      top.classList.add('list-row');

      // When no deliveries are pending
      var nothing = document.createElement('div');
      nothing.classList.add('small', 'bright', 'nothing');
      nothing.innerHTML = 'No deliveries pending!';
      wrapper.appendChild(nothing);

      // Current date and time (wherever you are)
      var date = document.createElement('div');
      date.classList.add('small', 'bright', 'date');
      date.innerHTML = moment().local().format(this.config.dateTimeFormat);
      wrapper.appendChild(date);
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

  scheduleCarousel: function () {
    //  console.log("Carousel of OneTracker fucktion!"); // for cheking //
    this.rotateInterval = setInterval(() => {
      this.activeItem++;
      this.updateDom(this.config.animationSpeed);
    }, this.config.rotateInterval);
  },

  scheduleUpdate: function () {
    setInterval(() => {
      console.log('scheduleUpdate');
      this.getOneTracker();
    }, this.config.updateInterval);
    this.getOneTracker(this.config.initialLoadDelay);
  },

  getOneTracker: function () {
    Log.error('GET_ONETRACKER');
    this.sendSocketNotification('GET_ONETRACKER');
  },

  socketNotificationReceived: function (notification, payload) {
    console.warn('notification received ', notification);
    if (notification === 'ONETRACKER_RESULT') {
      this.processOneTracker(payload);
      if (this.rotateInterval == null) {
        this.scheduleCarousel();
      }
      this.updateDom(this.config.animationSpeed);
    }

    this.updateDom(this.config.initialLoadDelay);
  },
});
