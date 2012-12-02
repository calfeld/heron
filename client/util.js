// Generated by CoffeeScript 1.4.0
(function() {
  var Heron, c_generate_id_table, _ref;

  Heron = (_ref = this.Heron) != null ? _ref : this.Heron = {};

  c_generate_id_table = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  Heron.Util = (function() {

    function Util() {}

    Util.rand = function(n) {
      return Math.floor(Math.random() * n);
    };

    Util.generate_id = function(n) {
      var i, l;
      if (n == null) {
        n = 8;
      }
      l = c_generate_id_table.length;
      return ((function() {
        var _i, _ref1, _results;
        _results = [];
        for (i = _i = 0, _ref1 = n - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          _results.push(c_generate_id_table[this.rand(l)]);
        }
        return _results;
      }).call(this)).join('');
    };

    return Util;

  })();

}).call(this);