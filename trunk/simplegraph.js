
var Macavity = { };
  
Macavity.SimpleGraph = function() {
 this._index = {};  
  
}


Macavity.SimpleGraph.prototype = { 
  add_resource_triple : function(s, p, o) {
    if (! this.has_resource_triple(s, p, o) ) {
      var o_type = o.indexOf('_:') == 0 ? 'bnode' : 'uri';
      var o_info = { "type" : o_type , "value" : o };
      this._add_triple(s, p, o_info);
    }
  },


  add_literal_triple : function(s, p, o, l, dt) {
    if (! this.has_literal_triple(s, p, o, l, dt) ) {
      var o_info = { "type" : 'literal' , "value" : o };
      if ( arguments.length > 4 ) {
        o_info['datatype'] = arguments[4];
      }
      else if ( arguments.length > 3 ) {
        o_info['lang'] = arguments[3];
      }
      this._add_triple(s, p, o_info);
    }
  },

  get_index : function() {
    return this._index;
  },

  get_first_literal : function(s, p, def) {
    if ( arguments.length < 3 ) def = '';
    if (! this._index.hasOwnProperty(s) || ! this._index[s].hasOwnProperty(p)) return def;
    for (var i = 0; i < this._index[s][p].length; i++) {
      if ( this._index[s][p][i]['type'] == 'literal') {
        return this._index[s][p][i]['value'];
      } 
    }  
    return def;
  },

  remove_resource_triple : function(s, p, o) {
    if (! this._index.hasOwnProperty(s) || ! this._index[s].hasOwnProperty(p)) return;
    for (var i = 0; i < this._index[s][p].length; i++) {
      if ( this._index[s][p][i]['type'] == 'uri' && this._index[s][p][i]['value'] == o ) {
        if ( this._index[s][p].length <=1 ) {
          this.remove_property_values(s, p);
        }
        else {
          this._index[s][p].splice(i, 1);
        }
        
        return;
      } 
    }  
  },

  remove_triples_about : function(s) {
    if (! this._index.hasOwnProperty(s) ) return;
    delete this._index[s];        
  },

  remove_property_values : function(s, p) {
    if (! this._index.hasOwnProperty(s) || ! this._index[s].hasOwnProperty(p)) return false;
    delete this._index[s][p];

    var prop_count = 0;
    for (prop in this._index[s]) prop_count++;
    if ( prop_count == 0) {
      delete this._index[s];        
    }

  },

  remove_all_triples : function() {
    this._index = {};
  },

  is_empty : function() {
    var subj_count = 0;
    for (subj in this._index) subj_count++;
    return ( subj_count == 0);
  },


  has_resource_triple : function(s, p, o) {
    if (! this._index.hasOwnProperty(s) || ! this._index[s].hasOwnProperty(p)) return false;
    var o_type = o.indexOf('_:') == 0 ? 'bnode' : 'uri';
    for (var i = 0; i < this._index[s][p].length; i++) {
      if ( this._index[s][p][i]['type'] == o_type && this._index[s][p][i]['value'] == o ) return true;
    }
    return false;
  },

  has_literal_triple : function(s, p, o, l, dt) {
    if (! this._index.hasOwnProperty(s) || ! this._index[s].hasOwnProperty(p)) return false;
    for (var i = 0; i < this._index[s][p].length; i++) {
      if ( this._index[s][p][i]['type'] == 'literal' && this._index[s][p][i]['value'] == o ) {
        if ( this._index[s][p][i].hasOwnProperty('lang') ) {
          if ( arguments.length > 3 && this._index[s][p][i]['lang'] == l ) {
            return true;
          } 
        }
        else if ( this._index[s][p][i].hasOwnProperty('datatype') ) {
          if ( arguments.length > 4 && this._index[s][p][i]['datatype'] == dt ) {
            return true;
          } 
        }
        else {
          return true;
        }     
      }
    }
    return false;
  },

  get_first_resource : function(s, p, def) {
    if ( arguments.length < 3 ) def = '';
    if (! this._index.hasOwnProperty(s) || ! this._index[s].hasOwnProperty(p)) return def;
    for (var i = 0; i < this._index[s][p].length; i++) {
      if ( this._index[s][p][i]['type'] != 'literal') {
        return this._index[s][p][i]['value'];
      } 
    }  
    return def;
  },


  from_json : function(data) {
    if ( arguments.length < 2 ) base = '';
    if (typeof data === "string") {
      this._index = JSON.parse(data);
    }
    else  {
      this._index = data;
    }
  },


  _add_triple : function(s, p, o_info) {
    if (! this._index.hasOwnProperty(s)) {
      this._index[s] = {};
      this._index[s][p] = new Array();
    }
    else if (! this._index[s].hasOwnProperty(p)) {
      this._index[s][p] = new Array();
    }

    this._index[s][p].push(o_info);
  },

  subject_exists : function(s) {
    return this._index.hasOwnProperty(s);
  },

  properties : function(s) {
    props = [];

    if (this.subject_exists(s)) {
      for (prop in this._index[s]) {
        if (this._index[s].hasOwnProperty(prop)) { 
          props.push(prop);
        }
      }
    }
    return props;
  },

  subjects : function() {
    subs = [];

    for (s in this._index) {
      if (this._index.hasOwnProperty(s)) { 
        subs.push(s);
      }
    }

    return subs;
  },

  values : function(s,p) {
    values = [];

    if (this.subject_exists(s)) {
      if (this._index[s].hasOwnProperty(p)) { 
        for (i = 0; i < this._index[s][p].length; i++) {
          values.push(this._index[s][p][i]);
        }
      }
    }
    return values;
  },



  get_label : function(resource_uri) {
    label = this.get_first_literal(resource_uri,'http://www.w3.org/2004/02/skos/core#prefLabel', '', 'en');
    if ( label == '') {
      label = this.get_first_literal(resource_uri,'http://www.w3.org/2000/01/rdf-schema#label', '', 'en');
    }
    if ( label == '') {
      label = this.get_first_literal(resource_uri,'http://purl.org/dc/terms/title', '', 'en');
    }
    if ( label == '') {
      label = this.get_first_literal(resource_uri,'http://purl.org/dc/elements/1.1/title', '', 'en');
    }
    if ( label == '') {
      label = this.get_first_literal(resource_uri,'http://purl.org/rss/1.0/title', '', 'en');
    }
    if ( label == '') {
      label = this.get_first_literal(resource_uri,'http://xmlns.com/foaf/0.1/name', '', 'en');
    }
    if ( label == '') {
      label = this.get_first_literal(resource_uri,'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', '', 'en');
    }
    if ( label == '') {
      label = resource_uri;
    }  
  
    return label;
  },
  
  
  get_description : function(resource_uri) {
    
   
    text = this.get_first_literal(resource_uri,'http://purl.org/dc/terms/description', '', 'en');
    if ( text == '') {
      text = this.get_first_literal(resource_uri,'http://purl.org/dc/elements/1.1/description', '', 'en');
    }
    if ( text == '') {
      text = this.get_first_literal(resource_uri,'http://www.w3.org/2000/01/rdf-schema#comment', '', 'en');
    }
    if ( text == '') {
      text = this.get_first_literal(resource_uri,'http://purl.org/rss/1.0/description', '', 'en');
    }
    if ( text == '') {
      text = this.get_first_literal(resource_uri,'http://vocab.org/bio/0.1/olb', '', 'en');
    }   
    
    
    
    return text;
  }, 

}

if (!this.JSON) {
    JSON = {};
}
(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapeable.lastIndex = 0;
        return escapeable.test(string) ?
            '"' + string.replace(escapeable, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }
                return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// If the object has a dontEnum length property, we'll treat it as an array.

            if (typeof value.length === 'number' &&
                    !value.propertyIsEnumerable('length')) {

// The object is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
})();

