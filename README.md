## MMM-OneTracker

Track all your deliveries using the OneTracker API

## Here's what you get

A list of all your deliveries that are currently in transit.
Status, estimated delivery date, which courier, tracking number, etc. . .
Amazon, UPS, FedEx, USPS, etc..

Unlike most tracking services, OneTracker doesn't require you to link your email to it in order to auto-foward and track emails. This means you can use multiple email accounts (or multiple people!) to set up rules to forward your packages, and can see them all on your mirror!

## Examples

![](images/1.JPG)

## Installation

- `git clone https://github.com/seeshaughnessy/MMM-OneTracker` into the `~/MagicMirror/modules` directory.

- Sign up for a free account using the OneTracker app (There's NO API Key! Just use your username and password in the config to authenticate)

## Config.js entry and options

    {
        disabled: false,
        module: "MMM-OneTracker",
        position: "top_left",
        config: {
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
        }
    },

This module is based off of Mykle1's module, MMM-AfterShip (https://github.com/mykle1/MMM-AfterShip).

It is my first attempt at adapting a module for Magic Mirror. It's one of my first coding projects in general, so please be kind regarding the messy code. That being said, please let me know if you have any feedback so that I can learn and grow!

##Features I'd like to add

- [ ] Add fade to bottom of list, similar to calendar module
- [ ] Sort deliveries by most recent expected tracking date
- [ ] Clean up and refactor js and css
- [ ] Further testing
