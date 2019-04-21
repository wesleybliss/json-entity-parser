"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var EntityParser =
/*#__PURE__*/
function () {
  function EntityParser() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, EntityParser);

    this.firstRun = true;
    this.entities = {};
    this.refQueue = [];
    this.opts = _objectSpread({}, EntityParser.defaultOpts, opts);
  }

  _createClass(EntityParser, [{
    key: "titleCase",
    value: function titleCase(s) {
      return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
  }, {
    key: "pluralize",
    value: function pluralize(s) {
      return s.toLowerCase().endsWith('s') ? s : "".concat(s, "s");
    }
  }, {
    key: "singularize",
    value: function singularize(s) {
      if (s.endsWith('ies')) return s.substring(0, s.length - 'ies'.length) + 'y';else if (s.endsWith('s')) return s.substring(0, s.length - 1);
      return s;
    }
  }, {
    key: "getEntityId",
    value: function getEntityId(o) {
      try {
        if (!o || !o.hasOwnProperty(this.opts.idKey) || !o[this.opts.idKey]) return this.getContrivedEntityId();else return o[this.opts.idKey];
      } catch (e) {
        return this.getContrivedEntityId();
      }
    }
  }, {
    key: "getContrivedEntityId",
    value: function getContrivedEntityId() {
      var rn = Math.floor(Math.random() * 10000);
      return "#FAKE_ID#".concat(Date.now(), "-").concat(rn);
    }
  }, {
    key: "formatEntityName",
    value: function formatEntityName(name) {
      if (name.includes('_')) name = name.split('_').map(this.titleCase.bind(this)).join('');
      return this.titleCase(this.pluralize(name));
    }
  }, {
    key: "createEntity",
    value: function createEntity(name) {
      this.entities[name] = this.entities[name] || {};
    }
  }, {
    key: "requireValidObject",
    value: function requireValidObject(o) {
      if (_typeof(o) !== 'object') throw new Error('Value must be an object');
    }
  }, {
    key: "createEntityMap",
    value: function createEntityMap(o) {
      var _this = this;

      if (!o) return this.entities;
      this.requireValidObject(o);
      var keys = Object.keys(o);

      for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
        var key = _keys[_i];
        var name = this.formatEntityName(key);
        var value = o[key];

        if (Array.isArray(value)) {
          this.createEntity(name); // Even if costly, iterating every item is more accurate
          // else we might be missing some keys that only some items have

          value.forEach(function (it) {
            return _this.createEntityMap(it);
          });
        } else if (_typeof(value) === 'object') {
          this.createEntity(name);
          this.createEntityMap(value);
        }
      }

      return this.entities;
    }
  }, {
    key: "canCreateBackRef",
    value: function canCreateBackRef(parentEntity, parentId) {
      return parentEntity && parentId && Boolean(this.entities[parentEntity][parentId]);
    }
  }, {
    key: "canCreateForwardRef",
    value: function canCreateForwardRef(pk, name) {
      var canCreateForwardRef = false;

      try {
        if (pk && name) canCreateForwardRef = true;
      } catch (e) {}

      return canCreateForwardRef;
    }
  }, {
    key: "createRef",
    value: function createRef(parentEntity, parentId, name, id) {
      var isBackRef = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      this.refQueue.push([parentEntity, parentId, name, id, isBackRef]);
    }
  }, {
    key: "createRefEx",
    value: function createRefEx(parentEntity, parentId, name, id) {
      var isBackRef = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      // Not exactly sure why this is needed, but I think
      // it's on first-run, there's no parent yet
      if (!parentEntity) return;
      if (this.opts.logging) console.info("+ REF ".concat(parentEntity, " / ").concat(parentId, " / #REF#").concat(name, ":").concat(id)); // Parent key we want to add the ref to

      var pk = this.entities[parentEntity][parentId];
      var refCode = "".concat(name, ":").concat(id);

      if (isBackRef) {
        if (!this.canCreateBackRef(parentEntity, parentId)) return; // Add a back (child) ref

        this.entities[parentEntity][parentId]['#REFPARENT#'] = refCode;
      } else {
        if (!this.canCreateForwardRef(pk, name)) return;
        if (!pk[name] || !Array.isArray(pk[name])) this.entities[parentEntity][parentId][name] = [];
        this.entities[parentEntity][parentId][name].push(_defineProperty({}, '#REFCHILD#', refCode));
      }
    }
  }, {
    key: "parseEntities",
    value: function parseEntities(o, parentEntity, parentId) {
      var _this2 = this;

      var needsRef = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      if (!o) return this.entities;
      this.requireValidObject(o);
      this.createEntityMap(o);
      var id = this.getEntityId(o);
      var keys = Object.keys(o);
      if (!this.firstRun && !id) throw new Error("ID not found, ".concat(id, ", for ").concat(o));
      this.firstRun = false;

      var _loop = function _loop() {
        var key = _keys2[_i2];

        var name = _this2.formatEntityName(key);

        var value = o[key];

        if (Array.isArray(value)) {
          value.forEach(function (it) {
            var itId = _this2.getEntityId(it); // Create a forward ref from parent to child


            _this2.createRef(parentEntity, id, name, itId); // Parse the entity, adding it to the final result


            _this2.parseEntities(it, name, id, true); // Create a back ref from child to parent (now that child exists)


            if (parentEntity && id) _this2.createRef(name, itId, parentEntity, id, true);
          });
        } else if (_typeof(value) === 'object') {
          var valueId = _this2.getEntityId(value); // Create a forward ref from parent to child


          _this2.createRef(parentEntity, id, name, valueId);

          _this2.parseEntities(value, name, id); // Create a back ref from child to parent (now that child exists)


          if (parentEntity && id) _this2.createRef(name, valueId, parentEntity, id, true);
        } else {
          if (_this2.opts.logging) console.info("+ ".concat(parentEntity, " / ").concat(id, " / ").concat(key, " = ").concat(value));
          _this2.entities[parentEntity][id] = _this2.entities[parentEntity][id] || {};
          _this2.entities[parentEntity][id][key] = value;
        }
      };

      for (var _i2 = 0, _keys2 = keys; _i2 < _keys2.length; _i2++) {
        _loop();
      }
    }
  }, {
    key: "parse",
    value: function parse(o) {
      var _this3 = this;

      if (Array.isArray(o)) o.forEach(function (it) {
        return _this3.parseEntities(it);
      });else this.parseEntities(o);
      this.refQueue.map(function (params) {
        return _this3.createRefEx.apply(_this3, _toConsumableArray(params));
      });
      return this.entities;
    }
  }]);

  return EntityParser;
}();

exports["default"] = EntityParser;

_defineProperty(EntityParser, "defaultOpts", {
  logging: false,
  idKey: '_id'
});
