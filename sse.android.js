"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("data/observable");
var EventSourceHandler = com.tylerjroach.eventsource.EventSourceHandler;
var EventSource = com.tylerjroach.eventsource.EventSource;
var SSE = (function () {
    function SSE(url, headers) {
        var _this = this;
        this._url = new java.net.URI(url);
        this.events = new observable_1.Observable();
        var that = new WeakRef(this);
        this._sseHandler = new EventSourceHandler({
            owner: that.get(),
            onConnect: function () {
                this.owner.events.notify({
                    eventName: 'onConnect',
                    object: new observable_1.fromObject({
                        connected: true
                    })
                });
            },
            onMessage: function (event, message) {
                this.owner.events.notify({
                    eventName: 'onMessage',
                    object: new observable_1.fromObject({
                        event: event.toString(),
                        message: { data: message.data, lastEventId: message.lastEventId, origin: message.origin }
                    })
                });
            },
            onComment: function (comment) {
                this.owner.events.notify({
                    eventName: 'onComment',
                    object: new observable_1.fromObject({
                        comment: comment
                    })
                });
            },
            onError: function (e) {
                this.owner.events.notify({
                    eventName: 'onError',
                    object: new observable_1.fromObject({
                        error: e.getMessage()
                    })
                });
            },
            onClosed: function (willReconnect) {
                this.owner.events.notify({
                    eventName: 'willReconnect',
                    object: new observable_1.fromObject({
                        willReconnect: willReconnect
                    })
                });
            }
        });
        if (headers) {
            this._headers = new java.util.HashMap();
            var arr = Object.keys(headers);
            if (arr.length > 0) {
                arr.forEach(function (key) {
                    _this._headers.put(key, headers[key]);
                });
                this._es = new EventSource.Builder(this._url)
                    .eventHandler(this._sseHandler)
                    .headers(this._headers)
                    .build();
                this._es.connect();
            }
            else {
                throw new Error('Headers cannot be empty');
            }
        }
        else {
            this._es = new EventSource.Builder(this._url)
                .eventHandler(this._sseHandler)
                .build();
            this._es.connect();
        }
    }
    SSE.prototype.connect = function () {
        var that = new WeakRef(this);
        this._thread = new java.lang.Thread(new java.lang.Runnable({
            owner: that.get(),
            run: function () {
                try {
                    console.log('running in a thread');
                    this.owner._es.connect();
                }
                catch (e) {
                    console.dump(e);
                }
            }
        }));
        this._thread.start();
    };
    SSE.prototype.close = function () {
        this._es.close();
        this._thread = null;
    };
    return SSE;
}());
exports.SSE = SSE;
