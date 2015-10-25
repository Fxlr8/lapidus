var nats = require('nats');

module.exports = {
    init: function (config, eventEmitter) {
        console.log('Connecting to nats on: ' + config.servers.join(', '));
        nats = nats.connect(config);

        eventEmitter.on('event', function(event) {

            if (event.schema && event.table) {
                if (event.pk) {
                    nats.publish(event.schema + '.' + event.table + '.' + event.pk, JSON.stringify(event));
                } else {
                    /* TODO: validate behavior of logical decoding and decide how this should be documented/handled for
                       tables without have primary keys */
                    nats.publish(event.schema + '.' + event.table, JSON.stringify(event));
                }
            } else if (event.ns && event.pk) {
                nats.publish(event.ns + '.' + event.pk, JSON.stringify(event));
            }
        });
    },

    validateConfig: function (config, scopeConfig, globalConfig) {
        var errors = [];

        if (typeof config.server === 'string') {
            config.servers = [config.server];
            delete config.server;
        }

        return errors;
    }
};