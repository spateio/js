window.Gorealtime = (function(app_id, verbose) {
    "use strict";

    verbose = verbose === true;
    var WS_URL = 'ws://ws.gorealti.me:9000/';
    var callbackRegistry = {};
    var self = {
        socket: null
    };

    var connect = function() {
        var url = WS_URL + app_id;
        self.socket = new WebSocket(url);

        self.socket.onmessage = function(data) {
            var message = JSON.parse(data.data);
            if (message.type == 'message') {
                if (callbackRegistry.hasOwnProperty(message.channel)) {
                    callbackRegistry[message.channel](message);
                }
            } else if (message.type == 'disconnect') {
                self.log('Instructed to disconnect', message.reason);

                self.socket.close();
                if (message.reconnect) {
                    setTimeout(connect, 5000);
                }

            }
        };

    };

    var channelsFromArgs = function(inputArgs) {
        var channels = [];
        for (var i = 0; i < inputArgs.length; i++) {
            channels.push(inputArgs[i]);
        }
        return channels;
    };

    var subscribe = function(channel) {
        if (self.socket.readyState !== self.socket.OPEN) {
            // queue the channel subscriptions
            self.socket.addEventListener('open', function() {
                subscribe.apply(this, [channel]);
            });
            return;
        }

        self.socket.send(JSON.stringify({
            type: 'subscribe',
            channels: [channel]
        }));
        return true;
    };

    var unsubscribe = function(channel) {
        self.socket.send(JSON.stringify({
            type: 'unsubscribe',
            channels: [channel]
        }));
        return true;
    };

    self.log = function() {
        if (window.console && verbose) {
            console.log(arguments);
        }
    };

    self.on = function(channel, cb) {
        // first subscribe to the channel if we're not already
        if (!callbackRegistry.hasOwnProperty(channel)) {
            subscribe(channel);
        }

        // add the callback to the registry
        callbackRegistry[channel] = cb;
    };

    self.off = function(channel) {
        delete callbackRegistry[channel];
        unsubscribe(channel);
    };

    connect();
    return self;
});

