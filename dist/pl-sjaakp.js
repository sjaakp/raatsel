/**
 * Couldn't get Tau Prolog's apply/3 or apply/4 to work under a Javascript worker thread.
 * So I made a replacement prolog module with just one predicate: apply/3.
 * Tau Prolog has to be loaded without js module!
 *
 * :- use_module(library(js)).
 * @link http://tau-prolog.org/manual/making-your-own-packages
 * @link http://tau-prolog.org/documentation/prolog/js/apply/4
 *
 * Notice: in a worker thread, called functions need to be defined like this:
 *
 * fn = (arg1, arg2) =>
 * { // ...
 * }
 *
 * and not like so:
 *
 * function fn(arg1, arg2)
 * { // ...
 * }
 *
 * Otherwise fn is only defined after it has been called at least once (I think). Weird.
 */
var pl;
(function( pl ) {
    // Name of the module
    var name = "js";
    // Object with the set of predicates, indexed by indicators (name/arity)
    var predicates = function() {
        return {
            "sp_apply/3": function(thread, point, atom) {

                var name = atom.args[0], args = atom.args[1], result = atom.args[2];
                if( pl.type.is_variable( name ) || pl.type.is_variable( args ) ) {
                    thread.throw_error( pl.error.instantiation( atom.indicator ) );
                } else if( !pl.type.is_atom( name ) && (!pl.type.is_js_object( name ) || typeof name.value !== "function") ) {
                    thread.throw_error( pl.error.type( "atom_or_JSValueFUNCTION", name, atom.indicator ) );
                } else if( !pl.type.is_list( args ) ) {
                    thread.throw_error( pl.error.type( "list", args, atom.indicator ) );
                }
                var fn = pl.type.is_atom( name ) ? self[name.id] : name.toJavaScript();
                if( typeof fn === "function" ) {
                    var pointer = args;
                    var pltojs;
                    var arr = [];
                    while( pointer.indicator === "./2" ) {
                        pltojs = pointer.args[0].toJavaScript();
                        if( pltojs === undefined ) {
                            thread.throw_error( pl.error.domain( "javascript_object", pointer.args[0], atom.indicator ) );
                            return undefined;
                        }
                        arr.push( pltojs );
                        pointer = pointer.args[1];
                    }
                    if( pl.type.is_variable( pointer ) ) {
                        thread.throw_error( pl.error.instantiation( atom.indicator ) );
                        return;
                    } else if( pointer.indicator !== "[]/0" ) {
                        thread.throw_error( pl.error.type( "list", args, atom.indicator ) );
                        return
                    }
                    var value;
                    try {
                        value = fn.apply(self, arr );
                    } catch( e ) {
                        thread.throw_error( pl.error.javascript( e.toString(), atom.indicator ) );
                        return;
                    }
                    value = pl.fromJavaScript.apply( value );
                    thread.prepend( [new pl.type.State( point.goal.replace( new pl.type.Term( "=", [value, result] ) ), point.substitution, point )] );
                }
            }
        };
    };
    // List of predicates exported by the module
    var exports = [ "sp_apply/3" ];
    // DON'T EDIT
    if( typeof module !== 'undefined' ) {
        module.exports = function(tau_prolog) {
            pl = tau_prolog;
            new pl.type.Module( name, predicates(), exports );
        };
    } else {
        new pl.type.Module( name, predicates(), exports );
    }
})( pl );
