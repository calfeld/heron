// Generated by CoffeeScript 1.4.0
(function() {
  var Heron, _ref,
    __slice = [].slice;

  Heron = (_ref = this.Heron) != null ? _ref : this.Heron = {};

  Heron.Dictionary = (function() {

    function Dictionary(config) {
      var _ref1, _ref2,
        _this = this;
      if (config == null) {
        config = {};
      }
      this._ = {
        client_id: config.client_id,
        debug: (_ref1 = config.debug) != null ? _ref1 : false,
        path: (_ref2 = config.path) != null ? _ref2 : '/dictionary',
        batch: 0,
        messages: [],
        versions: {},
        receivers: {}
      };
      this._.issue_message = function(message) {
        if (!(message.domain != null)) {
          throw 'Missing domain.';
        }
        if (!(message.command != null)) {
          throw 'Missing command.';
        }
        message.value = JSON.stringify(message.value);
        _this._.pdebug('OUT', message);
        if (_this._.batch === 0) {
          _this._.send_to_server('messages', {
            messages: JSON.stringify([message])
          });
        } else {
          _this._.messages.push(message);
        }
        return null;
      };
      this._.send_to_server = function(command, parameters) {
        if (parameters == null) {
          parameters = null;
        }
        if (_this._.client_id != null) {
          parameters.client_id = _this._.client_id;
        }
        jQuery.post("" + _this._.path + "/" + command, parameters);
        return null;
      };
      this._.is_ephemeral = function(key) {
        return key[0] === '%';
      };
      this._.pdebug = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      };
      if (this._.debug) {
        this._.pdebug = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return console.debug.apply(console, ['Heron.Dictionary'].concat(__slice.call(args)));
        };
      }
      this._.pdebug('initialized');
    }

    Dictionary.prototype.receive = function(json) {
      var active_receivers, ephemeral, message, messages, r, receivers, _base, _base1, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _name, _name1, _ref1, _ref2;
      messages = jQuery.parseJSON(json);
      this._.pdebug('IN begin');
      active_receivers = {};
      for (_i = 0, _len = messages.length; _i < _len; _i++) {
        message = messages[_i];
        ephemeral = this._.is_ephemeral(message.key);
        receivers = this._.receivers[message.domain];
        for (_j = 0, _len1 = receivers.length; _j < _len1; _j++) {
          r = receivers[_j];
          if (!(active_receivers[r] != null)) {
            active_receivers[r] = true;
            if (typeof r.begin === "function") {
              r.begin();
            }
          }
        }
        if (!(receivers != null)) {
          next;

        }
        switch (message.command) {
          case 'create':
            this._.pdebug('IN create', message.domain, message.key, message.value);
            for (_k = 0, _len2 = receivers.length; _k < _len2; _k++) {
              r = receivers[_k];
              if (typeof r.create === "function") {
                r.create(message.domain, message.key, jQuery.parseJSON(message.value));
              }
            }
            if (!ephemeral) {
              if ((_ref1 = (_base = this._.versions)[_name = message.domain]) == null) {
                _base[_name] = {};
              }
              this._.versions[message.domain][message.key] = message.version;
            }
            break;
          case 'update':
            this._.pdebug('IN update', message.domain, message.key, message.value);
            for (_l = 0, _len3 = receivers.length; _l < _len3; _l++) {
              r = receivers[_l];
              if (typeof r.update === "function") {
                r.update(message.domain, message.key, jQuery.parseJSON(message.value));
              }
            }
            if (!ephemeral) {
              if ((_ref2 = (_base1 = this._.versions)[_name1 = message.domain]) == null) {
                _base1[_name1] = {};
              }
              this._.versions[message.domain][message.key] = message.version;
            }
            break;
          case 'delete':
            this._.pdebug('IN delete', message.domain, message.key);
            for (_m = 0, _len4 = receivers.length; _m < _len4; _m++) {
              r = receivers[_m];
              if (typeof r["delete"] === "function") {
                r["delete"](message.domain, message.key);
              }
            }
            if (!ephemeral) {
              delete this._.versions[message.domain][message.key];
            }
            break;
          default:
            error("Unknown command: " + message.command);
        }
      }
      for (r in active_receivers) {
        if (typeof r.finish === "function") {
          r.finish();
        }
      }
      this._.pdebug('IN finish');
      return this;
    };

    Dictionary.prototype.batch = function(f) {
      this.begin();
      f();
      this.finish();
      return this;
    };

    Dictionary.prototype.begin = function() {
      this._.pdebug('OUT begin batch');
      this._.batch += 1;
      return this;
    };

    Dictionary.prototype.finish = function() {
      this._.pdebug('OUT finish batch');
      if (this._.batch === 0) {
        error('Finishing at batch level 0.');
      } else {
        this._.batch -= 1;
        if (this._.batch === 0) {
          this._.pdebug('OUT execute batch');
          this._.send_to_server('messages', {
            messages: JSON.stringify(this._.messages)
          });
          this._.messages = [];
        }
      }
      return this;
    };

    Dictionary.prototype.subscribe = function(domain, receiver) {
      if (!(this._.client_id != null)) {
        throw 'Missing client_id.';
      }
      if (!this._.receivers[domain]) {
        this._.pdebug('SUBSCRIBE', domain);
        this._.send_to_server('subscribe', {
          domain: domain
        });
        this._.receivers[domain] = [];
      }
      this._.receivers[domain].push(receiver);
      return this;
    };

    Dictionary.prototype.update = function(domain, key, value) {
      var message;
      message = {
        command: 'update',
        domain: domain,
        key: key,
        value: value
      };
      if (!this._.is_ephemeral(key)) {
        message.previous_version = this._.versions[domain][key];
        message.version = Heron.Util.generate_id();
        this._.versions[domain][key] = message.version;
      }
      this._.issue_message(message);
      return this;
    };

    Dictionary.prototype.create = function(domain, key, value) {
      var message, _base, _ref1;
      message = {
        command: 'create',
        domain: domain,
        key: key,
        value: value
      };
      if (!this._.is_ephemeral(key)) {
        message.version = Heron.Util.generate_id();
        if ((_ref1 = (_base = this._.versions)[domain]) == null) {
          _base[domain] = {};
        }
        this._.versions[domain][key] = message.version;
      }
      this._.issue_message(message);
      return this;
    };

    Dictionary.prototype["delete"] = function(domain, key) {
      var message;
      message = {
        command: 'delete',
        domain: domain,
        key: key
      };
      this._.issue_message(message);
      return this;
    };

    return Dictionary;

  })();

}).call(this);
