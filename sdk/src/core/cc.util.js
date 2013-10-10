cc.Util = {
    //http://docs.sencha.com/touch/2.2.0/source/Number2.html#Ext-Number-method-toFixed
    isToFixedBroken: (0.9).toFixed() !== '1',
    indicatorObject: {},
    //Used to determine if values are of the language type Object
    objectTypes: {
        'boolean': false,
        'function': true,
        'object': true,
        'number': false,
        'string': false,
        'undefined': false
    },
    domReady: function(fn){
        if(document.readyState === "complete") {
            fn()
        }
        else {
            window.addEventListener("load", fn, false);
        }
    },
    round: function(value, places){
        var multiplier = Math.pow(10, places);
        return (Math.round(value * multiplier) / multiplier);
    },
    toFixed: function(value, precision){

        value = cc.Util.isString(value) ? parseFloat(value) : value;

        if (cc.Util.isToFixedBroken) {
            precision = precision || 0;
            var pow = Math.pow(10, precision);
            return (Math.round(value * pow) / pow).toFixed(precision);
        }

        return value.toFixed(precision);
    },
    //this method is useful for cloning complex (read: nested) objects without having references 
    //from the clone to the original object
    //http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
    clone: function(obj) {
        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            var copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            var copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = this.clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            var copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    },
    extend: function(dst) {
        //strange thing, we can't use forOwn here because
        //phantomjs raises TypeErrors that don't happen in the browser
        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            if (obj !== dst){
                for (key in obj){
                    dst[key] = obj[key];
                }
            }
        }
        return dst;
    },
    /*jshint eqeqeq:true, -:true*/
    //this method is ripped out from lo-dash
    /*jshint eqeqeq:false*/
    createCallback: function(func, thisArg, argCount) {
      if (func === null) {
        return identity;
      }
      var type = typeof func;
      if (type != 'function') {
        if (type != 'object') {
          return function(object) {
            return object[func];
          };
        }
        var props = keys(func);
        return function(object) {
          var length = props.length,
              result = false;
          while (length--) {
            if (!(result = isEqual(object[props[length]], func[props[length]], cc.Util.indicatorObject))) {
              break;
            }
          }
          return result;
        };
      }
      if (typeof thisArg == 'undefined') {
        return func;
      }
      if (argCount === 1) {
        return function(value) {
          return func.call(thisArg, value);
        };
      }
      if (argCount === 2) {
        return function(a, b) {
          return func.call(thisArg, a, b);
        };
      }
      if (argCount === 4) {
        return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return function(value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
    },
    /*jshint eqeqeq:true*/
    //this method is ripped out from lo-dash
    findKey: function(object, callback, thisArg) {
      var result;
      callback = cc.Util.createCallback(callback, thisArg);
      cc.Util.forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    },
    find: function(object, callback, thisArg) {
      var result;
      callback = cc.Util.createCallback(callback, thisArg);
      cc.Util.forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = value;
          return false;
        }
      });
      return result;
    },
    //this method is ripped out from lo-dash
    forOwn: function(collection, callback) {
        var index,
            iterable = collection,
            result = iterable;

        if (!iterable) {
            return result;
        }

        if (!cc.Util.objectTypes[typeof iterable]) {
            return result;
        }

        for (index in iterable) {
            if (Object.prototype.hasOwnProperty.call(iterable, index)) {
                if (callback(iterable[index], index, collection) === cc.Util.indicatorObject) {
                    return result;
                }
            }
        }
        return result;
    },
    debounce: function(func, wait, immediate) {
      var timeout, result;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) result = func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(context, args);
        return result;
      };
    },
    isObject: function(value){
        return typeof value === 'object';
    },
    isNumber: function(value){
      return typeof value === 'number';
    },
    isArray: function(value){
        return toString.call(value) === '[object Array]';
    },
    isFunction: function(value){
        return typeof value === 'function';
    },
    isString: function(value){
        return typeof  value === 'string';
    },
    isUndefined: function(value){
        return typeof value === 'undefined';
    },
    createGuid: function(){
      //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
    },
    Array: {
        remove: function(arr, item){
            var index = arr.indexOf(item);
            arr.splice(index, 1);
            return arr;
        }
    }
};

//we put this here instead of in an seperate file so that the
//order of files doesn't matter for concatenation
cc.Util.domReady(function(){
    FastClick.attach(document.body);
});