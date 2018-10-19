'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = MobxActions;

var _mobx = require('mobx');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function MobxActions(actionTypes, middleware) {

    if (!Array.isArray(actionTypes) || actionTypes.some(function (actionType) {
        return typeof actionType !== 'string';
    })) {
        throw new Error('first argument ("actionTypes") must be an array of strings');
    }
    if (middleware && typeof middleware !== 'function') {
        throw new Error('second optional argument ("middleware") must be a function');
    }

    var _stores = [];

    var actions = {};

    var dispatchId = 0;
    actionTypes.forEach(function (type) {
        actions[type] = (0, _mobx.action)(function (actionArg) {
            var currentDispatchId = dispatchId;
            _stores.forEach(function (store) {
                var handler = store.actionHandlers[type];
                if (!handler) {
                    return;
                }
                if (!middleware) {
                    handler(actionArg);
                    return;
                }
                var next = function next() {
                    return handler(actionArg);
                };
                middleware({
                    dispatchId: currentDispatchId,
                    actionType: type,
                    action: actionArg,
                    store: store,
                    handler: handler
                }, next);
            });
            dispatchId++;
        });
    });

    var bindActionsToHandlers = function bindActionsToHandlers(store) {
        Object.entries(store.actionHandlers).forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                actionType = _ref2[0],
                handler = _ref2[1];

            if (!actions[actionType]) {
                console.error({ key: actionType, handler: handler, store: store });
                throw new Error('actionHandler with key { ' + actionType + ' } does not correspond to an action!!');
            }
            if (typeof handler !== 'function') {
                console.error({ handler: handler, actionType: actionType, store: store });
                throw new Error('actionHandler must be a function!!');
            }
        });
        _stores.push(store);
    };

    var _makeHander = function _makeHander(instance) {
        var actionHandlers = instance.actionHandlers;

        if (!actionHandlers) {
            // there's no reason to @handler something if there's no actionHandlers.
            throw new Error('No actionHandlers property detected on store class.');
        }
        Object.entries(actionHandlers).forEach(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
                actionType = _ref4[0],
                handler = _ref4[1];

            // autobinding
            actionHandlers[actionType] = handler.bind(instance);
        });
        bindActionsToHandlers(instance);
    };

    /*
    Validation lives here for both handlers and stores,
    since all stores are handlers.
    */
    var handler = function handler(StoreObjectOrClass) {
        if (!StoreObjectOrClass || !['object', 'function'].includes(typeof StoreObjectOrClass === 'undefined' ? 'undefined' : _typeof(StoreObjectOrClass)) || Array.isArray(StoreObjectOrClass)) {
            throw new Error('Store base must be object or class.');
        }
        if ((typeof StoreObjectOrClass === 'undefined' ? 'undefined' : _typeof(StoreObjectOrClass)) === 'object') {
            _makeHandler(StoreObjectOrClass);
            return StoreObjectOrClass;
        }
        return function (_StoreObjectOrClass) {
            _inherits(_class, _StoreObjectOrClass);

            function _class() {
                _classCallCheck(this, _class);

                var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

                _makeHandler(_this);
                return _this;
            }

            return _class;
        }(StoreObjectOrClass);
    };

    var _makeStore = function _makeStore(instance) {
        var observableShape = {}; // this does not affect getters and setters
        Object.keys(instance).forEach(function (key) {
            observableShape[key] = _mobx.observable;
        });
        (0, _mobx.decorate)(instance, observableShape);
    };

    var store = function store(StoreObjectOrClass) {
        // store base validation lives in the `handler` function
        if ((typeof StoreObjectOrClass === 'undefined' ? 'undefined' : _typeof(StoreObjectOrClass)) === 'object') {
            _makeHandler(StoreObjectOrClass);
            _makeStore(StoreObjectOrClass);
            return StoreObjectOrClass;
        }
        return function (_StoreObjectOrClass2) {
            _inherits(_class2, _StoreObjectOrClass2);

            function _class2() {
                _classCallCheck(this, _class2);

                var _this2 = _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).call(this));

                _makeHander(_this2);
                _makeStore(_this2);
                return _this2;
            }

            return _class2;
        }(StoreObjectOrClass);
    };

    return { actions: actions, handler: handler, store: store };
}
