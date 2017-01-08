var observable = function(el) {

  /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */

  el = el || {};

  /**
   * Private variables
   */
  var callbacks = {},
    slice = Array.prototype.slice;

  /**
   * Public Api
   */

  // extend the el object adding the observable methods
  Object.defineProperties(el, {
    /**
     * Listen to the given `event` ands
     * execute the `callback` each time an event is triggered.
     * @param  { String } event - event id
     * @param  { Function } fn - callback function
     * @returns { Object } el
     */
    on: {
      value: function(event, fn) {
        if (typeof fn == 'function')
          { (callbacks[event] = callbacks[event] || []).push(fn); }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Removes the given `event` listeners
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    off: {
      value: function(event, fn) {
        if (event == '*' && !fn) { callbacks = {}; }
        else {
          if (fn) {
            var arr = callbacks[event];
            for (var i = 0, cb; cb = arr && arr[i]; ++i) {
              if (cb == fn) { arr.splice(i--, 1); }
            }
          } else { delete callbacks[event]; }
        }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Listen to the given `event` and
     * execute the `callback` at most once
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    one: {
      value: function(event, fn) {
        function on() {
          el.off(event, on);
          fn.apply(el, arguments);
        }
        return el.on(event, on)
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Execute all callback functions that listen to
     * the given `event`
     * @param   { String } event - event id
     * @returns { Object } el
     */
    trigger: {
      value: function(event) {
        var arguments$1 = arguments;


        // getting the arguments
        var arglen = arguments.length - 1,
          args = new Array(arglen),
          fns,
          fn,
          i;

        for (i = 0; i < arglen; i++) {
          args[i] = arguments$1[i + 1]; // skip first argument
        }

        fns = slice.call(callbacks[event] || [], 0);

        for (i = 0; fn = fns[i]; ++i) {
          fn.apply(el, args);
        }

        if (callbacks['*'] && event != '*')
          { el.trigger.apply(el, ['*', event].concat(args)); }

        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    }
  });

  return el

};

var o = new function () {
	observable( this );
}();

var trigger = function ( data ) {
	o.trigger( data.type, data.payload, data.mutation, data.getter );
};

var on = function ( type, cb ) {
	o.on( type, cb );
};

var off = function ( type, cb ) {
	if ( cb ) {
		o.off( type, cb );
	} else {
		o.off( type );
	}
};

var pack = function ( options ) {
	var type = options.type; if ( type === void 0 ) type = null;
	var payload = options.payload; if ( payload === void 0 ) payload = null;
	var mutation = options.mutation; if ( mutation === void 0 ) mutation = null;
	var getter = options.getter; if ( getter === void 0 ) getter = null;
	return { type: type, payload: payload, mutation: mutation, getter: getter }
};

var assign = function ( target, sources ) {
	try {
		return Object.assign( target, sources )
	} catch ( err ) {
		var keys = Object.keys( sources );
		for ( var i = 0; i < keys.length; i++ ) {
			var key = keys[ i ];
			if ( !( key in target ) ) {
				target[ key ] = sources[ key ];
			}
		}
		return target
	}
};

var getters$1 = {
	default: function (state) { return state; }
};

var mutations = {};

var actions = {};

var Store = function Store ( opt ) {
	var state = opt.state;
	var mutations$$1 = opt.mutations; if ( mutations$$1 === void 0 ) mutations$$1 = {};
	var actions$$1 = opt.actions; if ( actions$$1 === void 0 ) actions$$1 = {};
	var getters = opt.getters; if ( getters === void 0 ) getters = {};
	var type = opt.type;
	var store = this;
	var ref = this;
	var dispatch = ref.dispatch;
	var commit = ref.commit;
	var getState = ref.getState;

	var _state = {
		get: function () { return state; },
		set: function ( newState, mutationType, provide ) {
			state = newState;
			postMessage( ( provide ? pack( { type: type, payload: state, mutation: mutationType } ) : pack( { type: type, mutation: mutationType } ) ) );
		}
	};
	getters = assign( getters, getters$1 );
	mutations$$1 = assign( mutations$$1, mutations );
	actions$$1 = assign( actions$$1, actions );

	Object.defineProperties( this, {
		type: {
			value: type,
			enumerable: false,
			writable: false,
			configurable: false
		},
		getters: {
			value: getters,
			configurable: false,
			writable: false
		},
		mutations: {
			value: mutations$$1,
			configurable: false,
			writable: false
		},
		actions: {
			value: actions$$1,
			configurable: false,
			writable: false
		},
		dispatch: {
			value: function ( type, payload ) { return dispatch.call( store, type, payload ); },
			configurable: false,
			writable: false
		},
		commit: {
			value: function ( type, payload, provide ) {
				if ( provide === void 0 ) provide = true;

				return commit.call( store, _state, type, payload, provide );
	},
			configurable: false,
			writable: false
		},
		getState: {
			value: function ( type, payload ) { return getState.call( store, _state, type, payload ); },
			configurable: false,
			writable: false
		}
	} );
};

Store.prototype.getState = function getState ( state, type, payload ) {
		if ( type === void 0 ) type = 'default';

	var get = this.getters[ type ]( state.get(), payload, this.getters );
	postMessage( pack( { type: this.type, payload: get, getter: type } ) );
};

Store.prototype.commit = function commit ( state, type, payload, provide ) {
	state.set( this.mutations[ type ]( state.get(), payload ), type, provide );
};

Store.prototype.dispatch = function dispatch ( type, payload ) {
	this.actions[ type ]( this.commit, payload );
};

var INIT = 'INIT';
var CREATE_CLIENT_STORE = 'CREATE_CLIENT_STORE';
var CREATE_CLIENT_MANAGER = 'CREATE_CLIENT_MANAGER';

var stores = {};
var managers = {};
var getters = {};
var forClient = {
	stores: [],
	managers: [],
	getters: []
};

var worker = {
	start: function () {
		onmessage = function (e) {
			var data = e.data;
			switch ( data[ 0 ] ) {
				case 'dispatch':
					stores[ data[ 1 ] ].dispatch( data[ 2 ], data[ 3 ] );
					break
				case 'operate':
					managers[ data[ 1 ] ]( stores, data[ 2 ] );
					break
				case 'getState':
					stores[ data[ 1 ] ].getState( data[ 2 ], data[ 3 ] );
					break
				default:
					break
			}
		};
		postMessage( pack( { type: INIT, payload: { stores: forClient.stores, managers: forClient.managers, getters: forClient.getters } } ) );
	},
	registerStore: function (config) {
		var store = new Store( config );
		var type = store.type;
		var actions = store.actions;
		if ( !( type in stores ) ) {
			stores[ type ] = store;
			forClient.stores.push( {
				type: type,
				actions: Object.keys( actions ),
				getters: Object.keys( getters )
			} );
		}
	},
	registerManager: function (config) {
		var type = config.type;
		var handler = config.handler;
		if ( !( type in managers ) ) {
			managers[ type ] = handler;
			forClient.managers.push( {
				type: type
			} );
		}
	}
};

var worker$1 = Object.freeze( worker );

var _install = function ( path, worker ) {
	try {
		worker = new Worker( path );
		worker.onmessage = function (message) { return trigger( message.data ); };
		return worker
	} catch ( err ) {
		console.error( 'Error in install', err );
	}
};

var _dispatch = function ( storeType, actionType, payload, worker ) {
	worker.postMessage( [ 'dispatch', storeType, actionType, payload ] );
};

var _operate = function ( managerType, payload, worker ) {
	worker.postMessage( [ 'operate', managerType, payload ] );
};

var subscribe$1 = function ( type, cb ) {
	on( type, cb );
};

var unsubscribe$1 = function ( type, cb ) {
	off( type, cb );
};

var _getState = function ( storeType, getter, options, worker ) {
	if ( getter === void 0 ) getter = 'default';

	return new Promise( function ( resolve, reject ) {
		var subscriber = function ( state, m, got ) {
			if ( got !== getter ) {
				return
			}
			unsubscribe$1( storeType, subscriber );
			resolve( state );
		};

		subscribe$1( storeType, subscriber );

		try {
			worker.postMessage( [ 'getState', storeType, getter, options ] );
		} catch ( err ) {
			unsubscribe$1( storeType, subscriber );
			reject( err );
		}
	} )
};

var businessmanWoker = null;

var install = function (path) {
	businessmanWoker = _install( path, businessmanWoker );
};
var dispatch$1 = function ( storeType, actionType, payload ) { return _dispatch( storeType, actionType, payload, businessmanWoker ); };
var operate = function ( managerType, payload ) { return _operate( managerType, payload, businessmanWoker ); };
var subscribe = function ( type, cb ) { return subscribe$1( type, cb ); };
var unsubscribe = function ( type, cb ) { return unsubscribe$1( type, cb ); };
var getState$1 = function ( storeType, getter, options ) { return _getState( storeType, getter, options, businessmanWoker ); };

subscribe( INIT, function (data) {
	var stores = {};
	try {
		data.stores.map( function (store) {
			stores[ store.type ] = {
				dispatch: function ( actionType, payload ) { return dispatch$1( store.type, actionType, payload ); },
				subscribe: function (cb) { return subscribe( store.type, cb ); },
				unsubscribe: function (cb) { return unsubscribe( store.type, cb ); },
				getState: function ( getter, options ) { return getState$1( store.type, getter, options ); }
			};
			return store
		} );
		trigger( pack( { type: CREATE_CLIENT_STORE, payload: stores } ) );
		trigger( pack( { type: CREATE_CLIENT_MANAGER, payload: data.managers } ) );
	} catch ( err ) {
		console.error( 'Error in creating client store or client manager', err );
	}
} );

export { install, dispatch$1 as dispatch, operate, subscribe, unsubscribe, getState$1 as getState, worker$1 as worker };
