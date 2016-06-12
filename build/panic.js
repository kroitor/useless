/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
   ------------------------------------------------------------------- */

$uselessFile = 'useless.micro.js'

/* -------------------------------------------------------------------
   - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/*  As we do not run macro processor on server scripts, $include reduces to
    built-in require (if running in Node.js environment)
    ======================================================================== */

if (typeof require !== 'undefined') {
    _ = require ('underscore')
    $include = require }

/*  Bootstrap code (couple of absolutely urgent fixes to underscore.js)
    ======================================================================== */

_ = (function () {

    _.mixin ({
        zipWith: function (rows, zippo) {
                    return _.reduce (_.rest (rows), function (memo, row) {
                        return _.times (Math.max ((memo && memo.length) || 0, (row && row.length) || 0), function (i) {
                            return zippo (memo && memo[i], row && row[i]) }) }, _.first (rows)) } })

    if ('a1 b2 c3' !== _.zipWith ([['a','b','c'], [1,2,3]], function (a, b) { return a + b }).join (' ')) {
        throw new Error ('_.zipWith broken') }

    return _ }) ()


/*  Tests stub
 */
_.tests = {}
_.deferTest = _.withTest = function (name, test, subj) { subj () }

/*  Internal dependencies
    ======================================================================== */





/*  $platform and $global
    ======================================================================== */

;(function () {

    var p = (function () {
                    if ((typeof window !== 'undefined') && (typeof navigator !== 'undefined') && navigator.platform && navigator.platform.indexOf) {
                            return _.extend ({
                                    engine: 'browser',
                                    browserEngine: ((navigator.userAgent.indexOf('AppleWebKit') >= 0) ? 'WebKit' : undefined),
                                    browser: 
                                        ((navigator.userAgent.indexOf ('Firefox') >= 0) ? 'Firefox' :
                                        ((navigator.userAgent.indexOf ('Chrome')  >= 0) ? 'Chrome' :
                                        ((navigator.userAgent.indexOf ('Safari')  >= 0) ? 'Safari' :
                                        ((navigator.userAgent.indexOf ('Trident') >= 0) ? 'IE' : undefined)))) },

                                    ((navigator.platform .indexOf ("Linux arm") >= 0)
                                ||   (navigator.platform .indexOf ("Android")   >= 0)
                                ||   (navigator.userAgent.indexOf ("Android")   >= 0) ? { touch: true, system: 'Android' } :

                                        ((navigator.platform .indexOf ("iPad")      >= 0) ? { touch: true, system: 'iOS', device: 'iPad' }  :
                                        ((navigator.platform .indexOf ("iPhone")    >= 0)
                                    ||   (navigator.platform .indexOf ("iPod")      >= 0) ? { touch: true, system: 'iOS', device: 'iPhone' } : {} )))) }

                    else if ((typeof global !== 'undefined') && global._) {
                        return { engine: 'node' } }

                    else {
                        return {} } }) ()

    var $global = (p.engine === 'browser') ? window :
                  (p.engine === 'node')    ? global : undefined

    $global.define = function (name, v, cfg) {  if (name in $global) {
                                                    throw new Error ('cannot define global ' + name + ': already there') }

        var def = (v && (v.get instanceof Function) && (v.set instanceof Function) && v) || // { get: .., set: .. }
                       ((v instanceof Function) && (v.length === 0) && { get: v }) ||     // getter function () { }
                       { value: v }                                                       // constant value

        return Object.defineProperty ($global, name, _.extend (def, { enumerable: true }, cfg)) }


    $global.define ('$global', $global)
    $global.define ('$platform', Object.defineProperties ({}, _.mapObject ({

                                            engine:  p.engine,
                                            system:  p.system,
                                            device:  p.device,
                                            touch:   p.touch || false,

                                            IE:      p.browser       === 'IE',
                                            Firefox: p.browser       === 'Firefox',
                                            Safari:  p.browser       === 'Safari',
                                            Chrome:  p.browser       === 'Chrome',
                                            WebKit:  p.browserEngine === 'WebKit',

                                            Browser: p.engine === 'browser',
                                            NodeJS:  p.engine === 'node',
                                            iPad:    p.device === 'iPad',
                                            iPhone:  p.device === 'iPhone',
                                            iOS:     p.system === 'iOS'

                                        }, function (v, k) { return { enumerable: true, value: v } })))
}) ();

/*  Use this helper to override underscore's functions
    ======================================================================== */

$overrideUnderscore = function (name, genImpl) {
    return _[name] = genImpl (_[name]) }

/*  alert2 for ghetto debugging in browser
    ======================================================================== */

if ($platform.NodeJS) {
    $global.alert = function (args) {
        var print = ($global.log && _.partial (log.warn, log.config ({ stackOffset: 2 }))) || console.log
        print.apply (print, ['ALERT:'].concat (_.asArray (arguments))) } }
 
$global.alert2 = function (args) {
    alert (_.map (arguments, _.stringify).join (', ')); return arguments[0] }

$global.log = function () { console.log.apply (console.log, arguments) } // placeholder for log.js


;

/*  converts 'arguments' (and any other array mimick) to real Array
    ======================================================================== */

_.withTest (['stdlib', 'asArray'], function () {

    (function (a, b) {
        var args = _.asArray (arguments)

        $assert (_.isArray (args))
        $assert (args.length === 2)
        $assert (args[0] === a)
        $assert (args[1] === b) }) (42, 43)

        $assert (_.asArray (42), [42])

        /*  Should not mutate its argument (regression)
         */
        var foo =     { 0: 'foo', length: 1 }
        $assert (_.asArray (foo), ['foo'])
        $assert (foo, { 0: 'foo', length: 1 }) }, function () { _.extend (_, {

    asArray: function (x) {
                return (x.length !== undefined) ? [].slice.call (x, 0) : [x] } }) })

/*  Argument count tracking module (provides hinting to several metaprogramming
    utilities, like property definitions)
    ======================================================================== */

/*  NOTE:   "rest argument" is a term from upcoming ECMAScript 6 standard,
             denoting the "..." thing in "f(a,b,...)"-type signatures.

             Although it's best known elsewhere as 'variable argument list',
             and the "rest argument" term is really confusing to most of
             people, we should take course on the future language prospects
             that will soon become widely recognized reality for everyone.
 */

_.withTest ('argcount tracking', function () {

    var none        = function () {}
    var one         = function (a) {}
    var three       = function (a, b, c) {}
    var many        = $restArg (function () {})

    $assert (_.noArgs (none)    === true)
    $assert (_.hasArgs (none)   === false)
    $assert (_.numArgs (three)  === 3)
    $assert (_.hasArgs (three)  === true)
    $assert (_.restArg (many)   === true)
    $assert (_.noArgs (many)    === false)
    $assert (_.oneArg (one)     === true)

    var sameAsThree = _.withSameArgs (three, function () {})
    var oneArgLess  = _.withArgs (_.numArgs (three) - 1, _.restArg (three), function () {})

    $assert ([_.numArgs (sameAsThree), _.restArg (sameAsThree)], [3, false])
    $assert ([_.numArgs (oneArgLess ), _.restArg (oneArgLess )], [2, false])


}, function () { _.extend (_, {

    /*  Querying
     */
    numArgs: function (fn) {
                return fn._ac === undefined ? fn.length : fn._ac },     // short name for speed

    restArg: function (fn) {
                return fn._ra || false },                               // short name for speed

    noArgs: function (fn) {
                return (_.numArgs (fn) === 0) && !fn._ra },

    hasArgs: function (fn) {
                return (_.numArgs (fn) > 0) && !fn._ra },

    oneArg: function (fn) {
                return (_.numArgs (fn) === 1) && !fn._ra },

    /*  Setting
     */
    withRestArg: $restArg = function (fn) {
                                Object.defineProperty (fn, '_ra', { enumerable: false, writable: true, value: true })
                                return fn },

    withArgs: function (numArgs, restArg, fn) {
                        if (numArgs !== undefined) {
                            Object.defineProperty (fn, '_ac', { enumerable: false, writable: true, value: numArgs }) }
                        if (restArg !== undefined) {
                            Object.defineProperty (fn, '_ra', { enumerable: false, writable: true, value: restArg }) }
                        return fn },

    withSameArgs: function (other, fn) {
                        return _.withArgs (_.numArgs (other), _.restArg (other), fn) } }) })

/*  Adds argcount tracking to some underscore functions.
    Will test it for speed in future, and if slow in app code,
    will be de-mounted, thus sacrificing clarity in some places.
    ======================================================================== */

$overrideUnderscore ('memoize',
    function (memoize) {
        return function (fn) {
                    return _.withSameArgs (fn, memoize (fn)) } })

$overrideUnderscore ('partial',
    function (partial) {
        return $restArg (function (fn) {
                                return _.withArgs (
                                    Math.max (0, _.numArgs (fn) - (arguments.length - 1)), fn._ra,
                                        partial.apply (this, arguments)) }) })


$overrideUnderscore ('bind',
    function (bind) {
        return $restArg (function (fn, this_) {
                            return _.withArgs (
                                Math.max (0, _.numArgs (fn) - (arguments.length - 2)), fn._ra,
                                    bind.apply (this, arguments)) }) })

;
/*  Useful for debugging and tests
    ======================================================================== */

_.debugEcho = function () { return [this].concat (_.asArray (arguments)) }


/*  Context-free version of fn.call (for consistency)
    ======================================================================== */

_.call = function (fn, this_, args) { return fn.apply (this_, _.rest (arguments, 2)) }

/*  Limits function to given number of arguments
    ======================================================================== */

_.arity = function (N, fn) { return function () {
                                        return fn.apply (this, _.first (arguments, N)) }}

_.arity0 = function (fn) { return function () {
                                    return fn.call (this) }}

_.arity1 = function (fn) { return function (a) {
                                    return fn.call (this, a) }}

_.arity2 = function (fn) { return function (a, b) {
                                    return fn.call (this, a, b) }}

_.arity3 = function (fn) { return function (a, b, c) {
                                    return fn.call (this, a, b, c) }}

_.arityFn = function (N) { return _['arity' + N] }


/*  A version of _.partial that binds to tail of argument list
    ======================================================================== */

_.tails = $restArg (function (fn) { var tailArgs = _.rest (arguments)
                                        return function () {
                                            return fn.apply (this, _.asArray (arguments).concat (tailArgs)) }})

_.tails2 = $restArg (function (fn) { var tailArgs = _.rest (arguments)
                                        return function (a) {
                                            return fn.apply (this, [a].concat (tailArgs)) }})

_.tails3 = $restArg (function (fn) { var tailArgs = _.rest (arguments)
                                        return function (a, b) {
                                            return fn.apply (this, [a, b].concat (tailArgs)) }})


/*  Userful for higher order operations
    ======================================================================== */

_.withTest (['function', 'calls / tails'], function () {

    var fn       = _.debugEcho
    var  foo42_  = _.callsWith ('foo', 42)
    var _foo42   = _.tailsWith ('foo', 42)

    var foo42_fn =   foo42_ (fn)
    var fn_foo42 =  _foo42  (fn)

    var _fn       = _.callsTo (fn)
    var  fn_      = _.tailsTo (fn)
    var fn_bar24  =  fn_ ('bar', 24)
    var bar24_fn  = _fn  ('bar', 24)

    $assert (foo42_fn.call ('lol', 777), ['lol', 'foo', 42, 777])
    $assert (bar24_fn.call ('lol', 777), ['lol', 'bar', 24, 777])

    $assert (fn_foo42.call ('lol', 777), ['lol', 777, 'foo', 42])
    $assert (fn_bar24.call ('lol', 777), ['lol', 777, 'bar', 24])

    $assertEveryCalledOnce (function (mkay) {
        _.argumentPrependingWrapper (fn, function (fn) {
            $assert (fn (777), ['lol', 777, 'foo', 42]); mkay () }).call ('lol', 'foo', 42) })

}, function () {

    _.callsTo = function (fn) {
                    return $restArg (function () {
                        return _.callsWith.apply (null, arguments) (fn) }) }

    _.tailsTo = function (fn, then) {
                    return $restArg (function () {
                        return _.tailsWith.apply (null, arguments) (fn) }) }

    _.callsWith = $restArg (function (/* args */) { var args = _.asArray (arguments)
                                        return function (fn) {
                                            return _.withSameArgs (fn, function () {
                                                return fn.apply (this, args.concat (_.asArray (arguments))) }) } })


    _.tailsWith = $restArg (function (/* args */) { var args = _.asArray (arguments)
                                        return function (fn) {
                                            return _.withSameArgs (fn, function () {
                                                return fn.apply (this, _.asArray (arguments).concat (args)) }) } })

    _.argumentAppendingWrapper = function (fn, then) {
        return _.withSameArgs (fn, function () { var this_ = this, args = _.asArray (arguments)
                                        return then (function () {
                                            return fn.apply (this_, args.concat (_.asArray (arguments))) }) }) }

    _.argumentPrependingWrapper = function (fn, then) {
        return _.withSameArgs (fn, function () { var this_ = this, args = _.asArray (arguments)
                                        return then (function () {
                                            return fn.apply (this_, _.asArray (arguments).concat (args)) }) }) } }) // @hide


/*  binding to constructor arguments (cannot do this with bind/partial)
    ======================================================================== */

_.new = $restArg (function (Constructor, a, b, c, d) {
            switch (arguments.length) {
                case 1: return new Constructor ()
                case 2: return new Constructor (a)
                case 3: return new Constructor (a, b)
                case 4: return new Constructor (a, b, c)
                case 5: return new Constructor (a, b, c, d)
                default: _.notImplemented () } })

/*  Flips function signature (argument order)
    ======================================================================== */

_.flipN = function (fn) { return $restArg (function () {
             return fn.apply (this, _.asArray (arguments).reverse ()) })}

_.flip = function (fn) {
            if (_.restArg (fn)) { return _.flipN (fn) }
            else { switch (_.numArgs (fn)) {
                                    case 0:
                                    case 1: return fn
                                    case 2: return _.flip2 (fn)
                                    case 3: return _.flip3 (fn)
                                    default: throw new Error ('flip: unsupported arity') } } }

_.flip2 = function (fn) { return function (a, b) {
                                    return fn.call (this, b, a) }}

_.flip3 = function (fn) { return function (a, b, c) {
                                    return fn.call (this, c, b, a) }}

/*  Logical composition operators
    ======================================================================== */

_.or = function (a, b) { return function () {
        return a.apply (this, arguments) || b.apply (this, arguments) }},

_.and = function (a, b) { return function () {
        return a.apply (this, arguments) && b.apply (this, arguments) }},

_.not = function (x) { return function () {
        return !x.apply (this, arguments) } }

/*  Y combinator (for anonymous recursive functions)
    ======================================================================== */

_.withTest (['function', 'Y combinator'], function () {

    var countTo5 = _.Y (function (self) {
        return function (n) {
            return n >= 5 ? n : self (n + 1) } })

    $assert (countTo5 (0), 5) }, function () { _.extend (_, {

    Y: function (eatSelf) {
        var self = eatSelf (function () {
            return self.apply (this, arguments) }); return self } }) });


/*  converts regular things like map/zip to hyper versions, that traverse
    deep structures (tested later, via its derivatives: zipZip/mapMap etc)
    ======================================================================== */

/*  Operator argument is the thing that walks down the tree and transforms it.
    But its predicate gets called only on the leaves of a tree (end values).

    Essentially, it abstracts you from structure, making it 'transparent'
    for any kind of previously defined one-dimensional operators like
    map/filter/zip/reduce/etc.

    Example:    hyperMap = _.hyperOperator (_.unary,  _.map2)
                hyperZip = _.hyperOperator (_.binary, _.zip2)
 */

 (function () {

    /*  N number denotes how many arguments underlying operation accepts
     */
    _.hyperOperator = function (N, operator, diCaprioPredicate, nonTrivial) {
                                                                          var arity            = _.arityFn (N)       || _.identity
                                                                          var weNeedToGoDeeper =  (diCaprioPredicate || _.goDeeperWhenFirstArgumentIsGood) (N, nonTrivial || _.isNonTrivial)
                            return function () {                          var subOperator      = _.last (arguments)
                                return _.Y (function (hyperOperator_) {   var hyperOperator    = _.tails (operator, arity (hyperOperator_))
                                    return function () {
                                        return (weNeedToGoDeeper (arguments) ?
                                                    hyperOperator :
                                                    subOperator)
                                                        .apply (this, arguments) } }).apply (this, _.initial (arguments)) } }

    /*  Combinatoric complexity classifiers for exact configuration of hyperOperator behavior
     */
    _.goDeeperWhenFirstArgumentIsGood= function (N, canGoDeeper) { 
        return function (args) { return   (args.length > 0) ? canGoDeeper (args[0]) : false } }

    _.goDeeperAlwaysIfPossible= function (N, canGoDeeper) {
             if (N === 0) {                          return _.constant (false)                                }
        else if (N === 1) { return function (args) { return   canGoDeeper (args[0])                           } }
        else if (N === 2) { return function (args) { return   canGoDeeper (args[0]) || canGoDeeper (args[1])  } }
        else              { return function (args) { return _.some (_.asArray (args),  canGoDeeper)           } } }

    _.goDeeperOnlyWhenNessesary = function (N, canGoDeeper) {
             if (N === 0) {                          return _.constant (false)                                }
        else if (N === 1) { return function (args) { return   canGoDeeper (args[0])                           } }
        else if (N === 2) { return function (args) { return   canGoDeeper (args[0]) && canGoDeeper (args[1])  } }
        else              { return function (args) { return _.every (_.asArray (args), canGoDeeper)           } } }

    _.isTrivial = function (x) { return            _.isEmpty (x) || _.isString (x) || _.isNumber (x) ||
                                        !(_.isStrictlyObject (x) || _.isArray (x)) || _.isPrototypeInstance (x) || _.isMeta (x) }

    _.isMeta = _.constant (false)

    _.isNonTrivial = _.not (_.isTrivial)

    /*  Self-descriptive constants (for clarity)
     */
    _.binary = 2
    _.unary  = 1 }) ()

/*  Generates higher order stuff from regular routine
    ======================================================================== */

_.withTest (['function', 'higherOrder'], function () {

        var file = []
        var write = function (x) { file.push (x) }
        var writes = _.higherOrder (write)

        _.times (3, writes ('foo'))

        $assert (file, ['foo', 'foo', 'foo']) }, function () {

    _.higherOrder = _.callsTo })

/*  coerces x|fn()→x to x (useful for configuration parameters)
    ======================================================================== */

_.deferTest (['function', 'eval/evals'], function () {

        var cfg = {
            value1: 42,
            value2: function () { return 42 },
            value3: _.property ('number')
        }

        var eval = _.evals ({ number: 42 }) // higher order

        $assert (_.eval (cfg.value1), _.eval (cfg.value2), eval (cfg.value3), 42) }, function () {

    _.eval = function (x) {
                return _.isFunction (x) ? x.call (this) : x  }

    _.evals = function (__args__) {
                var arguments_ = arguments
                return function (x) {
                    return _.isFunction (x) ? x.apply (this, arguments_) : x } } })

/*  in rhyme with _.property, this one calls a method
    ======================================================================== */

_.method = function (name) {
                var args = _.rest (arguments)
                    return function (obj) {
                        return obj[name].apply (obj, args) } }

/*  Converts between calling conventions
    ======================================================================== */

_.asFreeFunction = function (fn) { return function (this_, restArg) {
                                            return fn.apply (this_, _.rest (arguments)) } }

_.asMethod = function (fn) { return function () {
                                        return fn.apply (undefined, [this].concat (_.asArray (arguments))) } }


/*  _.once
    ======================================================================== */

_.withTest (['function', 'once'], function () {

    $assertEveryCalledOnce (function (mkay) {
        var f = _.once (function () { mkay () })
        f ()
        f () }) },                                          function () {

    _.once = function (fn) {
                var called = false
                return function () {
                    if (!called) { called = true
                        return fn.apply (this, arguments) } } } })

/*  _.withTimeout
    ======================================================================== */

_.deferTest (['function', 'withTimeout'], function (testDone) {

    _.withTimeout ({
        maxTime: 10,
        expired: function () { $fail } },
        function (done) { done () })

    _.withTimeout ({
        maxTime: 10,
        expired: function (then) { testDone () } },
        function (done) { _.delay (done, 20) },
        function () { // 'then' should not be called if expired (though you may call it explicitly at expired() callback)
            $fail })

}, function () {

    _.withTimeout = function (cfg, what, then) {
        var expired = false
        var timeout = setTimeout (function () {
            expired = true
            if (cfg.expired) {
                cfg.expired (then) } }, cfg.maxTime)

        what (function () {
            if (!expired) {
                clearTimeout (timeout)
                if (then) {
                    then.apply (this, arguments) } } }) } })

/*  Sequential composition operator (inverted _.compose, basically)
    ======================================================================== */

_.withTest (['function', 'sequence / then'], function () {

        var context = { foo: 'bar' }

        var makeCookies = function (from) { $assert (this === context)
            return 'cookies from ' + from }

        var eatCookies = function (cookies) { $assert (this === context)
            return 'nice ' + cookies }

        var lifeProcess = makeCookies.then ?                            // available in both notations
                                makeCookies.then (eatCookies) :
                                _.then (makeCookies, eatCookies)

        var anotherWay = _.sequence (makeCookies, eatCookies)
        var wayAnother = _.sequence ([makeCookies, eatCookies])

        $assert (lifeProcess.call (context, 'shit'), 'nice cookies from shit')
        $assert (anotherWay.call  (context, 'shit'), 'nice cookies from shit')
        $assert (wayAnother.call  (context, 'shit'), 'nice cookies from shit')

        $assert (_.sequence ([]).call (context, 'foo'), 'foo')

        var plusBar = _.then (function (x) { return Promise.resolve (x) },
                              function (x) { return x + 'bar' })

        return plusBar ('foo').then (function (x) { $assert (x, 'foobar') })

    }, function () {

        _.sequence = function (arg) { // was _.flip (_.compose) before... but it needs performance
            var chain = _.isArray (arg) ? arg : _.asArray (arguments)
            var length = chain.length
            return (length === 0) ? _.identity : function (x) {
                for (var i = 0; i < length; i++) { x = chain[i].call (this, x) }
                return x } }

        _.seq = _.sequence

        _.then = function (fn1, fn2) { return function (args) {
                                                var r = fn1.apply (this, arguments)
                                                return (r instanceof Promise)
                                                            ? r.then (fn2.bind (this))
                                                            : fn2.call (this, r) }} })


;
/*  Basic utility for writing data-crunching functional expressions.
    ======================================================================== */

_.asString = function (what) { return what + '' }

_.typeOf = function (what) {
                return typeof what }

_.instanceOf = function (what) {
                    return function (x) { return (x instanceof what) } }

_.count = function (what) { // cannot override _.length
                return what.length }

_.array = _.tuple = function () {
                        return _.asArray (arguments) }

_.cons = function (head, tail) { return [head].concat (tail || []) }

_.atIndex = function (n) {
                return function (arr) { return arr[n] } }

_.takesFirst = _.higherOrder (_.first)
_.takesLast  = _.higherOrder (_.last)

_.applies = function (fn, this_, args) {
                return function () { return fn.apply (this_, args) } }

_.prepends = function (what) {
                return function (to) {
                    return what + to } }

_.appends = function (what) {
                return function (to) {
                    return to + what } }

_.join = function (arr, s) { return arr.join (s) }
_.joinWith = _.flip2 (_.join)
_.joinsWith = _.higherOrder (_.joinWith)

_.split      = function (s, del) { return s.split (del) }
_.splitWith  =                   _.flip2 (_.split)
_.splitsWith =             _.higherOrder (_.splitWith)

_.sum = function (a, b) {
            return (a || 0) + (b || 0) }


_.subtract = function (a, b) {
                return (a || 0) - (b || 0) }

_.mul = function (a, b) {
            return (a || 0) * (b || 0) }

_.equal = function (a, b) {
            return a === b }

_.sums      = _.plus  = _.higherOrder (_.sum)
_.subtracts = _.minus = _.higherOrder (_.subtract)
_.muls                = _.higherOrder (_.mul)
_.equals              = _.higherOrder (_.equal)

_.less           = function (a, b) { return a <  b }
_.lessOrEqual    = function (a, b) { return a <= b }
_.greater        = function (a, b) { return a >  b }
_.greaterOrEqual = function (a, b) { return a >= b }

_.isNegative = function (a) { return a < 0 }

_.largest = function (a, b) {                   // FFFFUUUU: underscore already taken _.max for its dirty needs.
                if (isNaN (a) && isNaN (b)) {
                    return NaN }
                else if (isNaN (a)) {
                    return b }
                else if (isNaN (b)) {
                    return a }
                else {
                    return Math.max (a, b) } }

_.notZero = function (x) { return x !== 0 }

_.propertyOf = function (obj) { return function (prop) {            // inverted version of _.property
                                            return obj[prop] }}

_.oneOf = $restArg (function () {
    return _.propertyOf (_.index (_.asArray (arguments))) })
;
/*  isTypeOf (bootstrap for OOP.js)
    ======================================================================== */

_.isInstanceofSyntaxAvailable = function () { var e = new Error ()
    try       { return e instanceof Error }
    catch (e) { return false } }

_.isTypeOf_ES4 = function (constructor, what) {
    while (what) {
        if (what.constructor === constructor) {
            return true }
        what = what.constructor.$base }
    return false }

_.isTypeOf_ES5 = function (constructor, what) {
    return what instanceof constructor }

_.isTypeOf = _.isInstanceofSyntaxAvailable () ? _.isTypeOf_ES5 : _.isTypeOf_ES4

_.isPrototypeInstance = function (x) {
    return x && x.constructor && _.isPrototypeConstructor (x.constructor) }

_.isPrototypeConstructor = function (x) {
    return (x && (x.$definition !== undefined)) || false }


/*  NaN has interesting property: Number.NaN !== Number.NaN, this makes it
    more preferable than undefined/null in some cases. This function converts
    anything that is not a number to NaN.
    ======================================================================== */

_.coerceToNaN = function (x) { return _.isFinite (x) ? x : Number.NaN }


/*  Useful for defining functions that accept either [x] or x as argument
    ======================================================================== */

_.coerceToArray = function (x) {
                    return (x === undefined) ? []
                                             : (_.isArray (x) ? x :
                                                               [x]) }

/*  Useful for defining flow control parameterization
    ======================================================================== */

_.coerceToFunction = function (x) {
          return _.isFunction (x) ?             x
                                  : _.constant (x) }


/*  Use to determine whether an object could be enumerated like an Array
    TODO: it may be more reasonable to check for 'length' property presence
    ======================================================================== */

_.isArrayLike = function (x) {
    return (x instanceof Array) || ($platform.Browser && (x instanceof NodeList)) }


/*  Fixes _.isArray to account objects that derive from Array prototype
    ======================================================================== */

_.deferTest (['type', 'isArray'], function () {

        var CustomArray = $extends (Array, {
            method: function () { return 42 } })

        $assert (_.isArray (new CustomArray ())) },

    function () {

        _.isArray = function (x) {
            return x instanceof Array } })


/*  Better _.matches / $assertMatches: +regexp feature, +deep matching
    ======================================================================== */

_.deferTest (['type', 'matches(regex)'], function () {

    var test = function (a, pattern) {
        $assert (_.match (a, pattern))
        $assert (_.matches (pattern) (a))
        $assertMatches (a, pattern) }

    $assertFails (function () {
        test ({ foo: [1,2], bar: 2 },
              { foo: [3], bar: 2 })
        test ({ bar: { foo: 'foo' } },
              { bar: { foo: /[0-9]+/ } })
        test ({}, { foo: 1 }) })

    $assertFails (function () {
        test ({ foo: 1 }, undefined)    // differs from original impl in that
        test ('.DS_Store', /.+\.js/) }) // regression

    test ({ foo: [1,2], bar: 2 },
          { foo: [2] })
    test ({ bar: { foo: '123', qux: 1 } },
          { bar: { foo: /[0-9]+/ } })
    test ({ foo: 1 }, {}) },

    function () { _.mixin ({

        matches: function (pattern) {
                        return ((arguments.length === 0) && _.constant (true)) ||
                                                            _.tails2 (_.match, pattern) },

        match: function (a, ptrn) {
                        return  (a === ptrn)
                            ||  (_.isArray (a)  && _.isArray (ptrn)  && _.arrayMatch (a, ptrn))
                            ||  (_.isObject (a) && _.isObject (ptrn) && _.objectMatch (a, ptrn))
                            ||  (_.isTypeOf (RegExp, ptrn) && _.isString (a) && (a.match (ptrn) !== null)) },

        arrayMatch: function (a, pattern) {
            return _.every (pattern, _.propertyOf (_.index (a))) },
         
        objectMatch: function (a, pattern) {
                            return _.reduce (_.pairs (pattern),
                                function (result, kv) {
                                    return result && _.match (a[kv[0]], kv[1]) }, true) } }) })

/*  Scalar values
    ======================================================================== */

_.withTest (['type', 'isScalar'], function () {

        $assert (_.every ([42, 'foo', null, undefined, true],        _.isScalar))
        $assert (_.every ([/foo/, new Date (), {}, []],       _.not (_.isScalar))) },

    function () {

        _.isScalar = function (v) {
                        return (v === undefined) ||
                               (v === null) || ((v && v.constructor) &&
                                                    ((v.constructor === String) ||
                                                     (v.constructor === Number) ||
                                                     (v.constructor === Boolean))) } })


/*  POD data types
    ======================================================================== */

_.withTest (['type', 'POD'], function () {

        $assert (_.every ([[], {}, 42, 'foo', null, undefined, true].map (_.isPOD)))
        $assert (_.every ([/foo/, new Date ()].map (_.isNonPOD))) },

    function () {

        _.isNonPOD = function (v) {
                        return (v && v.constructor) &&
                            (v.constructor !== Object) &&
                            (v.constructor !== Array) &&
                            (v.constructor !== String) &&
                            (v.constructor !== Number) &&
                            (v.constructor !== Boolean) }

        _.isPOD = function (v) {
                    return !_.isNonPOD (v) } })

/*  Numbers
    ======================================================================== */

_.withTest (['type', 'numbers'], function () {

    $assert (_.every (_.map ([0,        1,     -7,    200003, 12344567788], _.arity1 (_.not (_.isDecimal)))))
    $assert (_.every (_.map ([0.1, -0.001, 0.0001, -0.000001,    0.000001], _.arity1 (       _.isDecimal))))

    $assert (_.isDecimal (0.003, 0.01), false) // custom tolerance

}, function () {

    if (typeof Number.EPSILON === 'undefined') {
        Object.defineProperty (Number, 'EPSILON', { enumerable: true,
                                                    get:  _.constant (2.2204460492503130808472633361816E-16) }) } // NodeJS lack this

    
    _.isDecimal = function (x, tolerance) {
                    if (!_.isNumber (x) || _.isNaN (x)) {
                        return false }
                    else {
                        return (Math.abs (Math.floor (x) - x) > (tolerance || Number.EPSILON)) } } })

/*  'empty' classifiers (fixes underscore shit)
    ======================================================================== */

_.withTest (['type', 'empty-centric routines'], function () {

    $assert (_.coerceToObject ({ foo: 42 }), { foo: 42 })
    $assert (_.coerceToObject ([1,2,3]),     [1,2,3])
    $assert (_.coerceToObject (42),          {})
    $assert (_.coerceToObject (undefined),   {})

    $assert (_.coerceToEmpty (42), undefined)
    $assert (_.coerceToEmpty ([42]), [])
    $assert (_.coerceToEmpty ({ foo: 42 }), {})

    $assert ([
        _.isNonemptyString ('foo'),
        _.isNonemptyString (''),
        _.isNonemptyString ([])], [true, false, false])

    $assert (_.isEmptyArray ([]),           true)
    $assert (_.isEmptyArray ([1,2,3]),      false)
    $assert (_.isEmptyArray (undefined),    false)
    $assert (_.isEmptyArray (null),         false)
    $assert (_.isEmptyArray (''),           false)

    $assert (_.isEmptyObject ({}),          true)
    $assert (_.isEmptyObject ([]),          false)
    $assert (_.isEmptyObject ({ foo: 1 }),  false)
    $assert (_.isEmptyObject (undefined),   false) 
    $assert (_.isEmptyObject (null),        false)
    $assert (_.isEmptyObject (''),          false)
    $assert (_.isEmptyObject (0),           false)
    $assert (_.isEmptyObject (false),       false)

    $assert (_.isEmpty (0),         false)
    $assert (_.isEmpty (false),     false)
    $assert (_.isEmpty (/.+\.js/),  false) // regression
    $assert (_.isEmpty (null),      true)
    $assert (_.isEmpty ({}),        true)
    $assert (_.isEmpty ([]),        true)

    $assert (_.isNonempty ('foo'),  true) // negated _.isEmpty

    $assert (_.coerceToUndefined (undefined),   undefined)
    $assert (_.coerceToUndefined ({}),          undefined)
    $assert (_.coerceToUndefined ([]),          undefined)
    $assert (_.coerceToUndefined (''),          undefined)
    $assert (_.coerceToUndefined (null),        undefined)
    $assert (_.coerceToUndefined (0),           0)
    $assert (_.coerceToUndefined (Math.NaN),    undefined)
    $assert (_.coerceToUndefined (false),       false)
    $assert (_.coerceToUndefined ({ foo: 1 }),  { foo: 1 })
    $assert (_.coerceToUndefined ([1, 2]),      [1, 2])  }, function () { _.extend (_, {

    /*  These two override underscore's one, because the original stuff is semantically incorrect.
        A word needs to be spoken here, because it's not the first routine we override, and not
        the last. So what about semantics?

        For instance, 0 and false should NOT be treated as empty. But they are (in underscore).
        This is ridiculous. Can think of hundreds of applications of the correct impl., and
        just none of that for the creeped original version. Why would one ever need to treat 0
        as 'empty'? Shit, its just a regular number, no worse or better than 1 or 42. And 'false'?
        Keep hands off boolean logic. If someone states that something's false - it's false, not
        a 'void non-existing piece of nothing'. It's a value. It has value. And it's false. Oh,
        fock, just don't get me started...
     */
    isEmpty: function (obj) {
        return _.coerceToUndefined (obj) === undefined },

    isNonempty: function (obj) {
        return _.coerceToUndefined (obj) !== undefined },

    isEmptyObject: function (v) {
                        return   !_.isArray (v) &&
                                 !_.isFunction (v) &&
                                  _.isObject (v) &&
                                 (_.keys (v).length === 0) },

    isStrictlyObject: function (v) {
        return (v && (typeof v === 'object')) ? true : false },

    isEmptyArray: function (v) {
                        return _.isArray (v) && v.length === 0 },

    isNonemptyString: function (v) {
        return (typeof v === 'string') && (v.length > 0) },

    coerceToObject: function (x) {
        return _.isStrictlyObject (x) ? x : {} },

    coerceToEmpty: function (x) {
        if (_.isArray (x)) { return [] }
        else if (_.isStrictlyObject (x)) { return {} }
        else { return undefined } },

    /*  Projects a variety of input values through 'undefined/non-undefined' dichotomy.
     */
    coerceToUndefined: function (v) {
                            return ((v === undefined) ||
                                    (v === null) ||
                                    (v === Math.NaN) ||
                                    (v === '') ||
                                    (_.isPOD (v) &&
                                        (_.isEmptyObject (v) ||
                                        (v.length === 0)))) ? undefined : v } })} )






;
_.hasStdlib = true

/*  _.throwsError
    ======================================================================== */

_.withTest (['stdlib', 'throwsError'], function () {

        $assertThrows (_.throws ('foo'), 'foo')

        $assertThrows (_.throwsError (           'неуловимый Джо'),  _.matches ({ message: 'неуловимый Джо' }))
        $assertThrows (_.throwsError (new Error ('неуловимый Джо')), _.matches ({ message: 'неуловимый Джо' }))   },

    function () {

        _.throwsError = _.higherOrder (
            _.throwError = function (msg) {
                             throw (msg instanceof Error) ? msg : new Error (msg) })

        _.throws = _.higherOrder (
                        _.throw = function (msg) { throw msg })

        _.overrideThis   = _.throwsError ('override this')
        _.notImplemented = _.throwsError ('not implemented') })


/*  Abstract _.values
    ======================================================================== */

_.withTest (['stdlib', 'values2'], function () {

    $assert (_.values2 (undefined), [])
    $assert (_.values2 (_.identity), [_.identity])
    $assert (_.values2 ('foo'), ['foo'])
    $assert (_.values2 (['foo', 'bar']), ['foo', 'bar'])
    $assert (_.values2 ({ f: 'foo', b: 'bar' }), ['foo', 'bar'])

}, function () { _.mixin ({
                    values2: function (x) {
                             if (_.isArrayLike (x))         { return x }
                        else if (_.isStrictlyObject (x))    { return _.values (x) }
                        else if (_.isEmpty (x))             { return [] }
                        else                                { return [x] } } }) })

/*  Map 2.0
    ======================================================================== */

/*  Semantically-correct abstract map (maps any type of value)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.withTest (['stdlib', 'map2'], function () {

                                 var plusBar =   _.appends ('bar')

    $assert (_.map2 (       'foo',   plusBar),           'foobar'  )
    $assert (_.map2 ([      'foo'],  plusBar),    [      'foobar' ])
    $assert (_.map2 ({ foo: 'foo' }, plusBar),    { foo: 'foobar' })

    $assert (Array.from (_.map2 (new Set (['foo',    'bar']), plusBar).values ()),
                                          ['foobar', 'barbar'])

    /*  With flipped order of arguments (callback first)
     */
    $assert (_.mapWith (plusBar, { foo: 'foo' }), { foo: 'foobar' })

}, function () { _.mixin ({     map2: function (value,                       fn,      context) { return (
                                 _.isArrayLike (value) ? _.map       (value, fn,      context) : (
                                (value instanceof Set) ? _.mapSet    (value, fn,      context) : (
                            _.isStrictlyObject (value) ? _.mapObject (value, fn,      context) :
                                                                             fn.call (context, value)))) } })

                _.mapSet = function (set, fn, ctx) { var out = new Set ()
                                                     for (var x of set) { out.add (fn.call (ctx, x)) }
                                                     return out }
                _.mapsWith = _.higherOrder (
                _.mapWith  = _.flip2 (_.map2)) })


/*  Maps one-to-many
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.withTest (['stdlib', 'scatter/obj/arr'], function () {

    $assert (undefined, _.scatter ([], _.noop))

    $assert ([1,10, 2,20, 3,30],         _.scatter ([1,2,3], function (x, i, return_) { return_ (x); return_ (x * 10) }))
    $assert ({ 'b': 0, 'a': 1, 'r': 2 }, _.scatter ('bar',   function (x, i, return_) { _.each (x.split (''), _.flip (return_)) }))

    $assert (_.obj (_.noop),
             _.arr (_.noop), undefined)

    $assert (_.obj (function (emit) {
                              emit (42, 'foo')
                              emit (43, 'bar') }), { foo: 42, bar: 43 })

    $assert (_.arr (function (emit) {
                              emit (42)
                              emit (43, 44) }), [42, [43, 44]])

}, function () { _.mixin ({
                    scatter: function (obj, elem) { var result = undefined
                                _.map2 (obj, function (x, i) {
                                                 elem (x, i, function (v, k) {
                                                                if (arguments.length < 2) { (result = result || []).push (v) }  
                                                                                     else { (result = result || {})[k] = v } }) }); return result } })
                 _.obj = function (emitItems) {
                            var x = undefined; emitItems (function (v, k)  { (x = x || {})[k] = v  })
                         return x }

                 _.arr = function (emitItems) {
                            var x = undefined; emitItems (function (v    ) { (x = x || []).push ((arguments.length < 2) ? v : _.asArray (arguments)) })
                         return x } })


/*  Maps keys (instead of values)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.withTest (['stdlib', 'mapKeys'], function () {

    $assert (_.mapKeys ({ 'foo':    [1, 2,{ 'gay':    3 }]}, _.appends ('bar')),
                        { 'foobar': [1, 2,{ 'gaybar': 3 }]})

}, function () { _.mapKeys = function (x, fn) {
                        if (_.isArrayLike (x)) {
                            return _.map (x, _.tails2 (_.mapKeys, fn)) }
                        else if (_.isStrictlyObject (x)) {
                            return _.object (_.map (_.pairs (x), function (kv) { return [fn (kv[0]), _.mapKeys (kv[1], fn)] })) }
                        else {
                            return x } } })              


/*  Hyper map (deep) #1 — maps leafs
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.withTest (['stdlib', 'mapMap'], function () {

        $assert (_.mapMap ( 7,  _.typeOf),  'number')   // degenerate cases
        $assert (_.mapMap ([7], _.typeOf), ['number'])

        $assert (_.mapMap ( {   foo: 7,
                                bar: ['foo', {
                                    bar: undefined } ] }, _.typeOf),
                            
                            {   foo: 'number',
                                bar: ['string', {
                                    bar: 'undefined' } ] }) },
    function () {

        _.mapMap = _.hyperOperator (_.unary, _.map2) })


/*  Hyper map (deep) #2 — maps branches & leafs 
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.withTest (['stdlib', 'hyperMap'], function () {

        var complexObject = {  garply:         { bar: { baz: 5 } },
                               frobni: { foo: [{ bar: { baz: 5 } }] } }
    /*                                         -----------------             */

        var barBazSubstructure =    _.matches ({ bar: { baz: 5 } })

        var transformedObject = _.hyperMap (complexObject, function (x) {
                                                                if (barBazSubstructure (x)) { return 'pwned!' } })

        $assert (transformedObject, { garply:         'pwned!',
                                      frobni: { foo: ['pwned!'] } })         },

    function () {

        _.hyperMap =  function (data, op) {
                        return _.hyperOperator (_.unary, function    (expr, f) {
                                                           return op (expr) ||
                                                              _.map2 (expr, f) }) (data, _.identity) } })


/*  Abstract _.pairs
    ======================================================================== */

_.withTest (['stdlib', 'pairs2'], function () {

    $assert (_.pairs2 (undefined),              [[undefined, undefined]]) // TODO: unify semantics with _.values2
    $assert (_.pairs2 (_.identity),             [[undefined, _.identity]])
    $assert (_.pairs2 ('foo'),                  [[undefined, 'foo']])
    $assert (_.pairs2 (['foo', 'bar']),         [[ 0,  'foo'], [ 1,  'bar']])
    $assert (_.pairs2 ({ 0: 'foo', 1: 'bar' }), [['0', 'foo'], ['1', 'bar']]) },

        function () {

            _.pairs2 = function (x) { return _.scatter (x, function (x, i, return_) { return_ ([i, x]) }) } })



/*  Filter 2.0
    ======================================================================== */

_.withTest (['stdlib', 'filter 2.0'], function () { var foo = _.equals ('foo')

    // generic filter behavior for any container type

    $assert (_.filter2 (     'foo'  ,   foo),        'foo' )
    $assert (_.filter2 ([    'foo' ],   foo),   [    'foo' ])
    $assert (_.filter2 ({ f: 'foo' },   foo),   { f: 'foo' })
    
    $assert (_.filter2 (     'foo'  ,   _.not (foo)),   undefined)
    $assert (_.filter2 ([    'foo' ],   _.not (foo)),   [])
    $assert (_.filter2 ({ f: 'foo' },   _.not (foo)),   {})

    // map behavior, if predicate returns not boolean (mixed-behavior test not needed - although its the expected case of use)

    $assert (_.filter2 (     'foo' ,    _.constant ('bar')),         'bar'  )
    $assert (_.filter2 ([    'foo' ],   _.constant ('bar')),    [    'bar' ])
    $assert (_.filter2 ({ f: 'foo' },   _.constant ('bar')),    { f: 'bar' })

    // hyper-filter #1 (works on leafs)

    $assert (_.filterFilter (
                    { foo: 'foo',   bar: [7, 'foo', { bar: 'foo' }] }, _.not (_.equals ('foo'))),
                    {               bar: [7,        {            }] })  

}, function () {

    _.reject2 = function (value, op) {
        return _.filter2 (value, _.not (op)) }

    _.filter2 = function (value, op) {
        if (_.isArrayLike (value)) {                            var result = []
            for (var i = 0, n = value.length; i < n; i++) {     var v = value[i], opSays = op (v, i)
                if (opSays === true) {
                    result.push (v) }
                else if (opSays !== false) {
                    result.push (opSays) } } return result }

        else if (_.isStrictlyObject (value)) {                  var result = {}
            _.each (Object.keys (value), function (key) {       var v = value[key], opSays = op (v, key)
                if (opSays === true) {
                    result[key] = v }
                else if (opSays !== false) {
                    result[key] = opSays } }); return result }

        else {                                                  var opSays = op (value)
            if (opSays === true) {
                return value }
            else if (opSays !== false) {
                return opSays }
            else {
                return undefined } } }

        _.filterFilter = _.hyperOperator (_.unary, _.filter2)

        _.hyperFilter =  function (data, op) {
                           return _.hyperOperator (_.unary, function (                   expr, f) {
                                                           var x =                   op (expr)
                                                      return ((x === true) && _.filter2 (expr, f)) || x }) (data, _.identity) }

        _.hyperReject = function (data, op) {
            return _.hyperFilter (data, function (x) { var  opa = op (x)
                                        return _.isBoolean (opa) ?
                                                           !opa  :
                                                            opa }) }
})

/*  ======================================================================== */

_.withTest (['stdlib', 'each 2.0'], function () {

    var test = function (input) {                                        var output = []
                _.each2 (input, function ( x,     i,          n) {           output.push (
                                         [ x,     i,          n]) }); return output }
                            
        $assert (test ( 'foo'),         [['foo',  undefined,  1]])        
        $assert (test (['foo', 'bar']), [['foo',  0,          2],
                                         ['bar',  1,          2]])
        $assert (test ({ 'f': 'oo',
                         'b': 'ar' }),  [[ 'oo', 'f',         2],
                                         [ 'ar', 'b',         2]])
}, function () { 

    _.each2 =            function (x,                                                                           f) {
           if (     _.isArrayLike (x)) {                          for (var     i = 0, n = x.length; i < n; i++) f (x[       i ],     i, n) } // @hide
      else if (_.isStrictlyObject (x)) { var k = Object.keys (x); for (var ki, i = 0, n = k.length; i < n; i++) f (x[ki = k[i]],    ki, n) }
         else                          {                                                                        f (x,        undefined, 1) } } })


/*  Reduce on steroids
    ======================================================================== */

_.withTest (['stdlib', 'reduce 2.0'], function () {

    $assert (_.reduce2 (     3,   [7,    9 ], _.sum), 19)
    $assert (_.reduce2 ([    3,    7,    9 ], _.sum), 19)
    $assert (_.reduce2 ({ a: 3, b: 7, c: 9 }, _.sum), 19)
    $assert (_.reduce2 (     3   + 7   + 9  , _.sum), 19)

    $assert (_.reduce2 ([1], _.sum), 1)
    $assert (_.reduce2 ([],  _.sum), undefined)

    $assert (              1 + 20 + 3 + 4 + 5,
        _.reduceReduce ([[[1], 20],[3,[ 4,  5]]], function (a, b) { return (_.isNumber (a) && _.isNumber (b)) ? (a + b) : b }))

}, function () {

    /*  Because hyperOperator is fractal thing, it is nessesary to define a compatible argument
        order for _.reduce and its functor operand, as they get melted together to form a generic
        self-similar routine of a higher order.

        And that becames kinda "Yodish" when applied to familiar 'reduce'. See how they dont match:

            1. _.reduce (value, op, memo)
            2.       op (memo, value)
    */

    _.reduce2 = function (        _1,                 _2,      _3) { var no_left = arguments.length < 3
                       var left = _1,        rights = _2, op = _3
         if (no_left) {    left = undefined; rights = _1; op = _2 }

         _.each2 (rights, function (right, i) {
                  left =  no_left ? right :
                          op (left, right); no_left = false }); return left } // @hide

    _.reduceReduce = function (_1, _2, _3) {                             var initial = _1, value = _2, op = _3
                        if (arguments.length < 3) {                          initial = {}; value = _1; op = _2 }
                        return _.hyperOperator (_.binary,
                                                _.reduce2,
                                                _.goDeeperAlwaysIfPossible) (initial,      value,      op) }
 })


/*  Abstract concat
    ======================================================================== */

_.withTest (['stdlib', 'concat2'], function () {

    $assert (_.concat ([1,2], [3], [4,5]), [1,2,3,4,5])
    $assert (_.concat ( { foo: 1 }, { bar: 2 }),  { foo: 1, bar: 2 })
    $assert (_.concat ([{ foo: 1 }, { bar: 2 }]), { foo: 1, bar: 2 })
    $assert (_.concat (1,2,3), 6)

}, function () { 

    _.concat = function (a, b) { var      first,          rest
            if (arguments.length === 1) { first = a[0];   rest =  _.rest (a) }
            else {                        first = a;      rest =  _.rest (arguments) }

            return _.isArrayLike (first)
                          ? first.concat.apply (first, rest)
                          :          _.reduce2 (first, rest, function (              a,  b) {
                                                                if (_.isObject (     a) &&
                                                                    _.isObject (         b)) {
                                                                return _.extend ({}, a,  b)  }
                                                        else {  return               a + b   } }) } })

/*  Zip 2.0
    ======================================================================== */

/*  Abstract zip that reduces any types of matrices.
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.deferTest (['stdlib', 'zip2'], function () {

    $assert (_.zip2 ([  'f',
                        'o',
                        'o'], _.concat), 'foo')

    $assert (_.zip2 ([  ['f', 'b'],
                        ['o', 'a'],
                        ['o', 'r']], _.concat), ['foo', 'bar'])

    $assert (_.zip2 ([  { foo:'f', bar:'b' },
                        { foo:'o', bar:'a' },
                        { foo:'o', bar:'r' }], _.concat), { foo: 'foo', bar: 'bar' })

    $assert (_.zip2 (   { foo:'f', bar:'b' },           // passing rows as arguments
                        { foo:'o', bar:'a' },
                        { foo:'o', bar:'r' },  _.concat), { foo: 'foo', bar: 'bar' })

    $assert (_.zip2 (undefined, _.concat), undefined)   // degenerate cases
    $assert (_.zip2 (5,         _.concat), 5)
    $assert (_.zip2 ([],        _.concat), [])
    $assert (_.zip2 (['foo'],   _.concat), 'foo')

    $assert (_.zipObjectsWith ([
                { name: 'string' },
                { born: 123 }], _.array),
            
                { name: ['string',  undefined],
                  born: [undefined, 123] })

    $assert ([3], _.zipSetsWith ([
                    new Set ([2,3]),
                    new Set ([3,4])], function (a, b) { return a && b }).asArray)

}, function () { _.mixin ({

    zipSetsWith: function (sets, fn) {
                    return _.reduce (_.rest (sets), function (memo, obj) {
                        _.each (_.union (( obj && Array.from ( obj.values ())) || [],
                                         (memo && Array.from (memo.values ())) || []), function (k) {

                            var zipped = fn ((memo && memo.has (k)) ? k : undefined,
                                              (obj &&  obj.has (k))  ? k : undefined)
                            if (zipped === undefined) {
                                memo.delete (k) }
                            else {
                                memo.add (zipped) } }); return memo }, new Set (sets[0])) },

    zipObjectsWith: function (objects, fn) {
        return _.reduce (_.rest (objects), function (memo, obj) {
            _.each (_.union (_.keys (obj), _.keys (memo)), function (k) {
                var zipped = fn (memo && memo[k], obj && obj[k])
                if (zipped === undefined) {
                    delete memo[k] }
                else {
                    memo[k] = zipped } }); return memo }, _.clone (objects[0])) },

    zip2: function (rows_, fn_) {   var rows = arguments.length === 2 ? rows_ : _.initial (arguments)
                                    var fn   = arguments.length === 2 ? fn_   : _.last (arguments)
        if (!_.isArrayLike (rows) || rows.length === 0) {
            return rows }
        else {
                 if (_.isArrayLike (rows[0]))      { return _.zipWith        (rows, fn) }
            else if (rows[0] instanceof Set)       { return _.zipSetsWith    (rows, fn) }
            else if (_.isStrictlyObject (rows[0])) { return _.zipObjectsWith (rows, fn) }
                                              else { return _.reduce2        (rows, fn) } } } }) })


/*  Hyperzip (deep one).
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.withTest (['stdlib', 'zipZip'], function () {

    $assert (_.zipZip (
            { phones: [{ number: 'number' }] },
            { phones: [{ number: 333 }] }, _.array),
            { phones: [{ number: ['number', 333] }] })

    $assert (_.zipZip ([{   foo: 7,
                            bar: ['foo', {
                                bar: undefined } ] },
                        
                        {   foo: 'number',
                            bar: ['string', {
                                bar: 'undefined' } ] } ], _.array),

                        {   foo: [7, 'number'],
                            bar: [['foo', 'string'], {
                                bar: [undefined, 'undefined'] } ] }) },
function () {

    _.mixin ({ zipZip: _.hyperOperator (_.binary, _.zip2) }) })


/*  Most useful _.extend derivatives
    ======================================================================== */

_.withTest (['stdlib', 'extend 2.0'], function () {

        /*  Inverted version of _.extend, for humanized narration where it makes sense (not here,
            but see AOP impl for example of such one)
         */
        [(function () {

            var input   = { foo:1,  bar:1 }
            var plus    = { foo:42, qux:1 }
            var gives   = { foo:42, qux:1, bar: 1 }

            $assert (_.extendWith (plus, input), gives) }) (),

        /*  Higher-order version of _.extend, allows to use it as _.map operator, which cuts
            shit in typical arrays-of-objects crunching routines
         */
        (function () {
            var input   = [{ bar:1 }, {}]
            var plus    = _.extendsWith ({ foo:42 })
            var gives   = [{ bar:1, foo:42 }, { foo:42 }]

            $assert (_.map (input, _.arity1 (plus)), gives) }) (),

        /*  NOW DEPRECATED, USE _.extendedDeep
         */
        (function () {
            var input   = { foo:1,  bar: { qux:1 } }
            var plus    = { foo:42, bar: { baz:1 } }
            var gives   = { foo:42, bar: { baz:1, qux:1 }}

            $assert (_.extend2 (input, plus), gives) }) (),

        /*  Deep version of _.extend, allowing to extend arbitrary levels deep (referentially transparent, so _.extendedDeep instead of _.extendDeep)
         */
        (function () {

            var input   = { foo:1,  bar: { qux:1 } }
            var plus    = { foo:42, bar: { baz:1 } }
            var gives   = { foo:42, bar: { baz:1, qux:1 }}

            $assert (_.extendedDeep (input, plus), gives)

            $assert (_.extendedDeep ({ foo: new Set ([7]) }, {}).foo instanceof Set)

            $assert (Array.from (_.extendedDeep ({ foo: new Set ([1,2]) },
                                                 { foo: new Set ([2,3]) }).foo.values ()), [1,2,3]) }) (),

        /*  Referentially-transparent version (to be used in functional expressions)
         */
        (function () {
            var x = { foo: 1 }

            $assert (_.extended (x, { bar: 1 }), { foo: 1, bar: 1 })
            $assert (            x,              { foo: 1 }) }) () ]  }, function () {

    _.extend = $restArg (_.extend) // Mark as having rest argument (to make _.flip work on that shit)

    _.extended = $restArg (function () { return _.extend.apply (this, [{}].concat (_.asArray (arguments))) }) // referentially-transparent version

    _.extendWith = _.flip (_.extend)                                        
    _.extendsWith = _.flip (_.partial (_.partial, _.flip (_.extend)))   // higher order shit

    _.extendedDeep = _.tails3 (_.zipZip, function (a, b) { return b === undefined ? a : b })

    _.extend2 = $restArg (function (what) { 
                                return _.extend (what, _.reduceRight (arguments, function (right, left) {
                                    return _.object (_.map (_.union (_.keys (left), _.keys (right)),
                                                            function (key) {
                                                                var lvalue = left[key]
                                                                return [key, (key in right) ?
                                                                                (typeof lvalue === 'object' ?
                                                                                    _.extend (lvalue, right[key]) :
                                                                                    right[key]) :
                                                                                lvalue] }))}, {})) }) })

/*  Find 2.0 + Hyperfind
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.withTest (['stdlib', 'findFind'], function () {

    var obj = { x: 1, y: { z: 2 }}

    $assert (_.findFind ({ foo: 1, bar: [1,2,3]  }, _.constant (false)), false)
    $assert (_.findFind ({ foo: 1, bar: [1,2,3]  }, _.equals (2)),       2)
    $assert (_.findFind ({ foo: { bar: obj     } }, _.equals (obj)),     obj) },

function () {

    _.find2 = function (value, pred) {
        if (_.isArrayLike (value)) {                                
            for (var i = 0, n = value.length; i < n; i++) { var x = pred (value[i], i, value)
                              if (typeof x !== 'boolean') { return x }
                                     else if (x === true) { return value[i] } } }
        else if (_.isStrictlyObject (value)) {        
            for (var i = 0, ks = Object.keys (value), n = ks.length; i < n; i++) { var k = ks[i]; var x = pred (value[k], k, value)
                                                     if (typeof x !== 'boolean') { return x }
                                                            else if (x === true) { return value[k] } } } }

    _.findFind = function (obj, pred_) {
                    return _.hyperOperator (_.unary,
                             function (value, pred) {
                                    if (_.isArrayLike (value)) {                                
                                        for (var i = 0, n = value.length; i < n; i++) { var x = pred (value[i])
                                                          if (typeof x !== 'boolean') { return x }
                                                                 else if (x === true) { return value[i] } } }

                                    else if (_.isStrictlyObject (value)) {        
                                        for (var i = 0, ks = Object.keys (value), n = ks.length; i < n; i++) { var k = ks[i]; var x = pred (value[k])
                                                                                 if (typeof x !== 'boolean') { return x }
                                                                                        else if (x === true) { return value[k] } } }

                                                                                          var x = pred_ (value)
                                                            if (typeof x !== 'boolean') { return x }
                                                                   else if (x === true) { return value }
                                                                                          return false }) (obj, pred_) } })


/*  removes empty contents from any kinds of objects
    ======================================================================== */

_.withTest (['stdlib', 'nonempty'], function () {

    var obj = { blank: {}, empty: [], one: 1, none: undefined, nil: null, clear: '', zero: 0, no: false }
    var arr = [{}, [], 1, undefined, null, '', 0, false]

    $assert (_.nonempty (obj), { one: 1, zero: 0, no: false })
    $assert (_.nonempty (arr), [1, 0, false])

    $assert (_.nonempty (null), undefined)
    $assert (_.nonempty (''),   undefined)

}, function () {

    _.nonempty = function (obj) { return _.filter2 (obj, _.isNonempty) } })


/*  deep cloning of objects (as _.clone is shallow)
    ======================================================================== */

_.deferTest (['stdlib', 'cloneDeep'], function () {

    var Proto = $prototype ({})

    var obj     = { a: [{ b: { c: 'd' } }], b: {}, c: new Proto ()  }
    var copy    = _.cloneDeep (obj)

    $assert (obj   !== copy)    // should be distinct references
    $assert (obj.a !== copy.a)  //
    $assert (obj.b !== copy.b)  //
    $assert (obj.c === copy.c)  // should be same instance (should consider prototype instances as atomic value)

    $assert (obj, copy)     // structure should not change

    $assert (            _.cloneDeep ({ foo: new Set ()        }).foo instanceof Set)
    $assert (Array.from (_.cloneDeep ({ foo: new Set ([1,2,3]) }).foo.values ()), [1,2,3])

}, function () { _.extend (_, {

    clone: function (x) {
                return  (x instanceof Set) ? new Set (x) :
                        (!_.isObject (x)   ? x :
                        (_.isArray   (x)   ? x.slice () : _.extend ({}, x))) },

    cloneDeep: _.tails2 (_.mapMap, function (value) {
                                        return ( _.isStrictlyObject    (value) &&
                                                !_.isPrototypeInstance (value)) ? _.clone (value) : value }) }) })


/*  given objects A and B, _.diff subtracts A's structure from B,
    and returns difference in terms of B
    ======================================================================== */

_.deferTest (['stdlib', 'diff'], function () {

        $assert (_.diff ('foo', 'foo'), undefined)
        $assert (_.diff ('foo', 'bar'), 'bar')

        $assert (_.diff ({ a: 1, b: 2, c: 3 },
                         { a: 1, b: 3,      d: 4 }),
                         {       b: 3,      d: 4 })

        $assert (_.diff ([1,2,3], [1,2,3]), undefined)

        $assert (_.diff ([1,'foo',2], [1,2,3]), [2,3])

}, function () {

    _.hyperMatch = _.hyperOperator (_.binary, function (a, b, pred) {
                                        return _.coerceToUndefined (_.nonempty (_.zip2 (a, b, pred))) })

    _.diff = _.tails3 (_.hyperMatch, function (a, b) { 
                                        return  ((($atom.unwrap (a) === $atom.unwrap (b)) || (a === $any) || (b === $any)) ? undefined : b) }) })


/*  inverse of _.diff (returns similarities)
    ======================================================================== */

_.deferTest (['stdlib', 'undiff'], function () {

        $assert (_.undiff ('foo', 'foo'), 'foo')
        $assert (_.undiff ('foo', 'bar'), undefined)

        $assert (_.undiff ({ a: 1, b: 2, c: 3 },
                           { a: 1, b: 3,      d: 4 }),
                           { a: 1 })

        $assert (_.undiff ([1,2,3], [1,2,3]), [1,2,3])

        $assert (_.undiff ([1,2], [1,3]), [1,undefined])
        $assert (_.undiff ([1,2], [0,2]), [undefined,2])

}, function () {

    _.hyperMatch = _.hyperOperator (_.binary, function (a, b, pred) {
                                        return _.coerceToUndefined (_.zip2 (a, b, pred)) })

    _.undiff = _.tails3 (_.hyperMatch, function (a, b) {
                                            return (($atom.unwrap (a) === $atom.unwrap (b)) || (a === $any) || (b === $any))  ? b : undefined }) })


/*  Makes { foo: true, bar: true } from ['foo', 'bar']
    ======================================================================== */

_.withTest (['stdlib', 'index'], function () {
    
        $assert (_.index (['foo', 'bar']), { foo: true, bar: true }) }, function () { _.extend (_, {

    index: function (list) {
            var result = {}
            for (var i = 0, n = list.length; i < n; i++) {
                result[list[i]] = true }
            return result } }) })


/*  For string wrapping
    ======================================================================== */

_.withTest (['stdlib', 'quote'], function () {

        $assert (_.quote      ('qux'),            'qux')
        $assert (_.quote      ('qux', '[]'),     '[qux]')
        $assert (_.quote      ('qux', '/'),      '/qux/')
        $assert (_.quote      ('qux', '{  }'),   '{ qux }')
        $assert (_.quote      ('qux', '</>'),    '</qux>')
        $assert (_.quoteWith  ('[]', 'qux'), '[qux]') }, function () {

    _.quote = function (s, pattern_) {
                    var pattern = pattern_ || ''
                    var splitAt = Math.floor (pattern.length / 2 + (pattern.length % 2))
                    var before  = pattern.slice (0, splitAt)
                    var after   = pattern.slice (splitAt) || before

                    return before + s + after }


    _.quoteWith  = _.flip2 (_.quote)
    _.quotesWith = _.higherOrder (_.quoteWith) })


/*  _.partition 2.0
    ======================================================================== */

_.withTest (['stdlib', 'partition2'], function () {

        $assert (_.partition2 (
                    [ 'a', 'b', 'c',   undefined, undefined,   42], _.isNonempty),
                    [['a', 'b', 'c'], [undefined, undefined], [42]])

        $assert (_.partition3 ([ 'a', 'b', 'c', undefined, undefined, 42], _.typeOf),
                [{ label: 'string',    items: ['a', 'b', 'c'] },
                 { label: 'undefined', items: [undefined, undefined] },
                 { label: 'number',    items: [42] }]) }, function () {

    _.partition2 = function (arr, pred) { return _.pluck (_.partition3 (arr, pred), 'items') }

    _.partition3 = function (arr, pred) { var spans = [],
                                              span  = { label: undefined, items: [arr.first] }

            _.each (arr, function (x) { var label = pred (x)
                if ((span.label != label) &&
                     span.items.length) { spans.push (span = { label: label, items: [x] }) }
                                   else { span.items.push (x) } })

            return (span.length && spans.push (span)),
                    spans } })


/*  Taken from  npmjs.com/package/longest-common-substring
    Props to    npmjs.com/~mirkok
    ======================================================================== */


_.withTest (['stdlib', 'longestCommonSubstring'], function () {

    $assert ('foo', _.longestCommonSubstring ('foo', 'ffooa'))

}, function () {
    
    var indexMap = function(list) {
        var map = {}
        _.each (list, function(each, i) {
            map[each] = map[each] || []
            map[each].push(i) })
        return map }

    _.longestCommonSubstring = function (a, b) {
        var where = _.indexOfLongestCommonSubstring (a, b)
        return (where.length) ? a.substr (where.a, where.length) : undefined }

    _.indexOfLongestCommonSubstring = function(a, b) {
        var result = { a:0, b:0, length:0}
        var indexMapBefore = indexMap(a)
        var previousOverlap = []
        _.each (b, function(eachAfter, indexAfter) {
            var overlapLength
            var overlap = []
            var indexesBefore = indexMapBefore[eachAfter] || []
            _.each (indexesBefore, function(indexBefore) {
                overlapLength = ((indexBefore && previousOverlap[indexBefore-1]) || 0) + 1;
                if (overlapLength > result.length) {
                    result.length = overlapLength;
                    result.a = indexBefore - overlapLength + 1;
                    result.b = indexAfter - overlapLength + 1; }
                overlap[indexBefore] = overlapLength })
            previousOverlap = overlap })
        return result } })


/*  experimental shit (subject to removal)
    ======================================================================== */

_.key = function (fn) {
            return function (value, key) {
                return fn (key) } }

_.filterKeys = function (arr, predicate) {
                    return _.filter (arr, function (v, k) { return predicate (k) }) }

_.rejectKeys = function (arr, predicate) {
                    return _.reject (arr, function (v, k) { return predicate (k) }) }

_.pickKeys = function (obj, predicate) {
                    return _.pick (obj, function (v, k) { return predicate (k) }) }

_.omitKeys = function (obj, predicate) {
                    return _.omit (obj, function (v, k) { return predicate (k) }) }


;
/*  Properties
    ======================================================================== */

_.withTest ('properties', function () { var obj = {}

    _.defineProperty (obj, 'fourtyTwo',         42)
    _.defineProperty (obj, 'fourtyTwo_too',     function ()  { return 42 })
    _.defineProperty (obj, 'fourtyTwo_orDie',   function (x) { $assert (x == 42); return 42 })
    _.defineProperty (obj, 'fourtyTwo_eitherWay', {
        configurable: true,
        get: function () { return 42 },
        set: function (x) { $assert (x == 42) } })

    $assert (42,
        obj.fourtyTwo,
        obj.fourtyTwo_too,
        obj.fourtyTwo_orDie (42),
        obj.fourtyTwo_eitherWay = 42)

    delete obj.fourtyTwo_eitherWay                              // can be deleted if configurable:true
    $assert (obj.fourtyTwo_eitherWay === undefined)

    delete obj.fourtyTwo                                        // cannot be deleted (as default behavior)
    $assert (obj.fourtyTwo === 42)

    _.defineHiddenProperty (obj, 'hiddenAndDangerous', 42)      // shortut for enumerable:false
    $assert (_.keys (obj).indexOf ('hiddenAndDangerous') < 0)

    $assertEveryCalledOnce (function (mkay) {                   // memoized property
        _.defineMemoizedProperty (obj, '_42', function () {
                                                    mkay (); return 42 }) 
        $assert (                           
            obj._42,                                
            obj._42,
            obj._42, 42) }) }, function () { _.extend (_, {

    defineProperty: function (targetObject, name, def, defaultCfg) {
        if (_.isObject (targetObject) && targetObject.hasOwnProperty (name)) {
            throw new Error ('_.defineProperty: targetObject already has property ' + name) }
        else {
            Object.defineProperty (targetObject, name,
                _.extend ({ enumerable: true }, defaultCfg, _.coerceToPropertyDefinition (def, name))) } },

    defineHiddenProperty: function (targetObject, name, def, defaultCfg) {
        return _.defineProperty (targetObject, name, def, _.extend ({ enumerable: false }, defaultCfg)) },

    defineMemoizedProperty: function (targetObject, name, def_, defaultCfg) {
        var def = _.coerceToPropertyDefinition (def_, name)
        return _.defineProperty (targetObject, name,
                    _.extend ({}, def, {
                        get: _.memoizeToThis ('_' + name, def.get) }), defaultCfg) },

    defineProperties: function (targetObject, properties) {
        _.each (properties, _.defineProperty.partial (targetObject).flip2) },

    memoizedState: function (obj) {
                        return _.filter2 (obj, function (v, k) { return (k[0] === '_') && !_.isFunction (v) }) },

    memoizeToThis: function (name, fn) {
        return function () {
            var memo = this[name]
            return (memo !== undefined) ? memo : (this[name] = fn.call (this)) } },

    coerceToPropertyDefinition: function (value_, /* optional */ name) {
        var value = value_ || {}
        var actualValue = (typeof Tags === 'undefined') ? value_ : Tags.unwrap (value_)

                // property definition case (short circuit then)
        return  (!value.$constant && !value.$get && _.isPropertyDefinition (actualValue) && actualValue) ||

                // get-accessor-alone case
                ((value.$get || (!value.$constant && _.isFunction (actualValue) && _.noArgs (actualValue))) &&
                    {   get: actualValue,
                        set: _.throwsError ('cannot change ' + (name || 'property') + ' (as it\'s an accessor function)') }) ||

                // constant value case
                (!value.$get && {   get: _.constant (actualValue),
                                    set: _.throwsError ('cannot change ' + (name || 'property') + ' (as it\'s sealed to ' + actualValue + ')') }) ||

                // any other case (erroneous)
                _.throwsError ('coerceToPropertyDefinition: crazy input, unable to match') () },

    isPropertyDefinition: function (obj) {
        return _.isObject (obj) && (_.isFunction (obj.get) || _.isFunction (obj.set)) },

    ownProperties: function (obj) {
        return (obj && _.pickKeys (obj, obj.hasOwnProperty.bind (obj))) || {} }  }) })

;
_.hasTags = true

/*  Keywords
    ======================================================================== */

_.withTest ('keywords', function () {

    if ($global['$fourtyTwo'] === undefined) { // coz this test called twice during startup

        _.defineKeyword ('fourtyTwo',       42)
        _.defineKeyword ('fourtyTwo_too',   function ()  { return 42 })
        _.defineKeyword ('fourtyTwo_orDie', function (x) { $assert (x == 42); return 42 })

        _.defineTagKeyword ('foo')
        _.defineTagKeyword ('bar')
        _.defineTagKeyword ('qux')

        $assert (_.isTagKeyword ('qux'))

        _.defineModifierKeyword ('plusOne', function (x) { return x + 1 }) }

    $assert (42,
        $fourtyTwo,
        $fourtyTwo_too,
        $fourtyTwo_orDie (42))

    /*  Tags produce objects containing them as boolean flags. You can tag anything.
        Order doesn't matter, redundancy is legal.
     */
    $assert ($foo (42).$foo,    true)
    $assert ($bar (null).$bar,  true)
    $assert ($foo (42).$bar,    undefined)
    $assert ($foo ($bar (42)),  $bar ($foo ($foo (42))))

    /*  Safe way to check for a tag presence is $tag.is method:
     */
    $assert ($foo.is ($foo (42)), true)
    $assert ($foo.is ($bar (42)), false)
    $assert ($foo.is (42),        false)

    /*  Example of complex object containing tagged fields.
     */
    var test = {
        fourtyOne: $bar ($foo (41)),
        fourtyTwo: $foo ($bar (42)),
        notTagged: 40 }

    /*  This is how you coerce what-might-be-tagged to actual values:
     */
    $assert ($untag (42), Tags.unwrap (42), Tags.unwrap (test.fourtyTwo), 42)
    $assert (Tags.unwrapAll (test), { fourtyTwo: 42, fourtyOne: 41, notTagged: 40 })

    /*  Tags have .matches property, which is a predicate to test objects for those tags.
     */
    $assert ($foo.matches ($foo ()))
    $assert ($foo.matches (test.fourtyOne))
    $assert ($foo.matches (42) === false)

    /*  These predicates could be combined to produce complex test (a generic feature of Function provided by common.js)
     */
    $assert ({ fourtyOne: 41, fourtyTwo: 42 },  Tags.unwrapAll (_.pick (test, _.and ($foo.matches, $bar.matches))))
    $assert ({ notTagged: 40 },                 Tags.unwrapAll (_.omit (test, $foo.matches)))

    /*  You can replace value that might be tagged, i.e. $foo($bar(x)) → $foo($bar(y))
     */
    $assert (43,                Tags.modify (42,         function (subject) { return subject + 1 })) // not tagged
    $assert ($foo (43),         Tags.modify ($foo (42),  _.constant (43)))
    $assert ($foo ($bar (43)),  Tags.modify ($foo (42),  function (subject) { return $bar (subject + 1) }))

    /*  Previous mechanism is essential to so-called 'modifier keywords'
     */
    $assert ($plusOne (            41),                 42)
    $assert ($plusOne ($foo ($bar (41))),   $foo ($bar (42)))

    /*  Low-level way of tags addition, for run-time shit.
     */
    $assert (Tags.add ('qux', 42).$qux)
    $assert (Tags.add ('qux', test.fourtyTwo).$qux)

    /*  Wrapping nothing is now legal
     */
    $assert (Tags.hasSubject ($foo ()),   false)
    $assert (Tags.hasSubject ($foo (42)), true)

    /*  Map over tagged values:
     */
    $assert (     $qux ([8, 9, $foo ($bar (10))]),
        Tags.map ($qux ([1, 2, $foo ($bar (3))]), _.sums (7)))

    /*  Enumerating tags with Tags.each (obj, iter)
     */
    $assertMatches (['foo', 'bar', 'qux'], _.arr (function (iter) { Tags.each (test.fourtyTwo, iter) }))

    /*  Tagging with non-boolean data
     */
    $assert ($foo ({ some: 'params' }, 42).$foo, { some: 'params' })

    /*  'Extend' algebra
     */
    $assert (Tags.extend ($foo (7), $bar (8)), $foo ($bar (7)))
    $assert (Tags.extend ($foo (7),       8),  $foo (      7))
    $assert (Tags.extend (      7,  $foo (8)), $foo (      7))
    $assert (Tags.extend (      7,        8),              7)

    /*  Tags.omit
     */
    $assert (Tags.omit (            7,   '$foo'),          7)
    $assert (Tags.omit ($foo ($bar (7)), '$foo',  '$bar'), 7)
    $assert (Tags.omit ($foo ($bar (7)), '$foo'),  $bar (  7))

}, function () {

    Tags = _.extend2 (
                function (subject, keys) { if (subject !== undefined) { this.subject = subject }
                                           if (keys    !== undefined) { _.extend (this, keys) } }, {

    $definition: {}, // to make it recognizeable by _.isPrototypeInstance

    prototype: {

            /* instance methods (internal impl)
             */
            add: function (name, additionalData) {
                    return this[_.keyword (name)] = additionalData || true, this },

            clone: function (newSubject) {
                return _.extend (new Tags (newSubject || this.subject), _.pick (this, _.keyIsKeyword)) },

            modify: function (changesFn) {
                                this.subject = changesFn (this.subject)
                                if (_.isTypeOf (Tags, this.subject)) {
                                    return _.extend (this.subject, _.pick (this, _.keyIsKeyword)) }
                                else {
                                    return this }},

            extend: function (other) {
                        return (_.isTypeOf (Tags, other)) ? _.extend (this, _.pick (other, _.keyIsKeyword)) : this } },

        /* static methods (actual API)
         */
        omit: $restArg (function (what, ___) {
            if (_.isTypeOf (Tags, what)) {                var keysToOmit = _.index (_.rest (arguments))
                                                          var keysLeft   = _.pick (what, function (v, k) { return _.isKeyword (k) && !(k in keysToOmit) })
                        return (!_.isEmptyObject (            keysLeft)
                                    ? new Tags (what.subject, keysLeft)
                                    :           what.subject) }             else { return what } }),
  
        clone: function (what, newSubject) {
                        return (_.isTypeOf (Tags, what) ? what.clone (newSubject) : (newSubject || what)) },

        extend: function (what, other) { return _.isTypeOf (Tags, what)  ? what.clone ().extend (other) : (
                                                _.isTypeOf (Tags, other) ? Tags.wrap (what).extend (other) : what) },

        get: function (def) {
                        return (_.isTypeOf (Tags, def) ? _.pick (def, _.keyIsKeyword) : {}) },

        each: function (def, accept) {
                        if (_.isTypeOf (Tags, def)) { _.each (def, function (v, k) { if (k[0] === '$') { accept (k.slice (1)) } }) } },

        hasSubject: function (def) {
                        return (_.isTypeOf (Tags, def) && ('subject' in def)) },

        matches: function (name) {
                    return function (obj) { return obj && (obj[_.keyword (name)] !== undefined) } },

        unwrapAll: function (definition) {
                        return _.map2 (definition, Tags.unwrap) },

        unwrap: function (what) {
                    return _.isTypeOf (Tags, what) ? what.subject : what },

        wrap: function (what) {
            return _.isTypeOf (Tags, what) ? what : ((arguments.length === 0) ? new Tags () : new Tags (what)) },

        modify: function (what, changesFn) {
                            return _.isTypeOf (Tags, what) ?
                                        what.clone ().modify (changesFn) : changesFn (what) }, // short circuits if not wrapped

        map: function (obj, op) { return Tags.modify (obj,
                                                function (obj) {
                                                    return _.map2 (obj, function (t, k) {
                                                        return Tags.modify (t, function (v) {
                                                            return op (v, k, _.isTypeOf (Tags, t) ? t : undefined) }) }) }) },

        add: function (name, toWhat, additionalData) {
                return Tags.wrap.apply (null, _.rest (arguments, 1)).add (name, additionalData) } })

    _.keyword = function (name) {
                    return '$' + name }

    _.isKeyword = function (key) {
                    return key[0] == '$' }

    _.keywordName = function (x) {
        return _.isKeyword (x) ? x.slice (1) : x }

    _.keywords = function (obj) { return _.pick (obj, _.keyIsKeyword) }

    _.tagKeywords = {}

    _.isTagKeyword = function (k) {
                        return _.keywordName (k) in _.tagKeywords }

    _.keyIsKeyword = function (value, key) {
                        return _.isKeyword (key[0]) }

    _.defineKeyword = function (name, value) {
                        _.defineProperty ($global, _.keyword (name), value) }

    _.defineKeyword ('untag', Tags.unwrap)

    _.defineTagKeyword = function (k, fn) { // fn for additional processing of constructed function

                            fn = (_.isFunction (fn) && fn) || _.identity

                            if (!(_.keyword (k) in $global)) { // tag keyword definitions may overlap
                                _.defineKeyword (k, Tags.add ('constant',
                                    _.extendWith ({ matches: Tags.matches (k) }, fn (function (a, b) {      // generates $tag.matches predicate
                                        if (arguments.length < 2) { return Tags.add (k, a) }            // $tag (value)
                                                             else { return Tags.add (k, b, a) } }))))    // $tag (params, value)
                                _.tagKeywords[k] = true }

                                var kk = _.keyword (k)

                            return _.extend ($global[kk], {
                                        is: function (x) { return  (_.isTypeOf (Tags, x) && (kk in x)) || false },
                                     isNot: function (x) { return !(_.isTypeOf (Tags, x) && (kk in x)) || false },
                                    unwrap: function (x) { return  ($atom.matches (x) === true) ? Tags.unwrap (x) : x } }) }


    _(['constant', 'get', 'once', 'async'])
        .each (_.defineTagKeyword)

    _.defineModifierKeyword = function (name, fn) {
                                _.defineKeyword (name, function (val) {
                                                            return Tags.modify (val, fn) }) }

    _.deleteKeyword = function (name) {
                        delete $global[_.keyword (name)] } } )

;
_.hasTypeMatch = true

/*  Type matching for arbitrary complex structures (TODO: test)
    ======================================================================== */

_.defineTagKeyword ('required')

_.defineTagKeyword ('atom')

_.defineKeyword ('any', _.identity)

_.deferTest (['type', 'type matching'], function () {

    $assert (_.omitTypeMismatches ( { '*': $any, foo: $required ('number'), bar: $required ('number') },
                                    { baz: 'x', foo: 42,            bar: 'foo' }),
                                    { })

    $assert (_.omitTypeMismatches ( { foo: { '*': $any } },
                                    { foo: { bar: 42, baz: 'qux' } }),
                                    { foo: { bar: 42, baz: 'qux' } })

    $assert (_.omitTypeMismatches ( { foo: { bar: $required(42), '*': $any } },
                                    { foo: { bar: 'foo', baz: 'qux' } }),
                                    { })

    $assert (_.omitTypeMismatches ( [{ foo: $required ('number'), bar: 'number' }],
                                    [{ foo: 42,                   bar: 42 },
                                     { foo: 24,                           },
                                     {                            bar: 42 }]), [{ foo: 42, bar: 42 }, { foo: 24 }])

    $assert (_.omitTypeMismatches ({ '*': 'number' }, { foo: 42, bar: 42 }), { foo: 42, bar: 42 })

    $assert (_.omitTypeMismatches ({ foo: $any }, { foo: 0 }), { foo: 0 }) // there was a bug (any zero value was omitted)

    $assert (_.decideType ([]), [])
    $assert (_.decideType (42),         'number')
    $assert (_.decideType (_.identity), 'function')
    $assert (_.decideType ([{ foo: 1 }, { foo: 2 }]), [{ foo: 'number' }])
    $assert (_.decideType ([{ foo: 1 }, { bar: 2 }]), [])

    $assert (_.decideType ( { foo: { bar: 1        }, foo: { baz: [] } }),
                            { foo: { bar: 'number' }, foo: { baz: [] } })

    $assert (_.decideType ( { foo: { bar: 1        }, foo: { bar: 2 } }),
                            { foo: { bar: 'number' } })

    $assert (_.decideType ( { foo:         { bar: 1        },
                              bar:         { bar: 2        } }),
                            { '*':         { bar: 'number' } })

    if (_.hasOOP) {
        var Type = $prototype ()
        $assert (_.decideType ({ x: new Type () }), { x: Type }) }

}, function () {

    _.isMeta = function (x) { return (x === $any) || ($atom.is (x) === true) || ($required.is (x) === true)  }

    var zip = function (type, value, pred) {
        var required    = Tags.unwrapAll (_.filter2 (type, $required.matches))
        var match       = _.nonempty (_.zip2 (Tags.unwrapAll (type), value, pred))

        if (_.isEmpty (required)) {
                return match }
        
        else {  var requiredMatch = _.nonempty (_.zip2 (required, value, pred))
                var allSatisfied  = _.values2 (required).length === _.values2 (requiredMatch).length
                return allSatisfied ?
                            match : _.coerceToEmpty (value) } }

    var hyperMatch = _.hyperOperator (_.binary,
        function (type_, value, pred) { var type = Tags.unwrap (type_)

            if (_.isArray (type)) { // matches [ItemType] → [item, item, ..., N]
                if (_.isArray (value)) {
                    return zip (_.times (value.length, _.constant (type[0])), value, pred) }
                else {
                    return undefined } }

            else if (_.isStrictlyObject (type) && type['*']) { // matches { *: .. } → { a: .., b: .., c: .. }
                if (_.isStrictlyObject (value)) {
                    return zip (_.extend (  _.map2 (value, _.constant (type['*'])),
                                            _.omit (type, '*')), value, pred) }
                else {
                    return undefined } }

            else {
                return zip (type_, value, pred) } })

    var typeMatchesValue = function (c, v) { var contract = Tags.unwrap (c)
                                return  (contract === $any) ||
                                        ((contract === undefined) && (v === undefined)) ||
                                        (_.isFunction (contract) && (
                                            _.isPrototypeConstructor (contract) ?
                                                _.isTypeOf (contract, v) :  // constructor type
                                                contract (v))) ||           // test predicate
                                        (typeof v === contract) ||          // plain JS type
                                        (v === contract) }                  // constant match

    _.mismatches = function (op, contract, value) {
                            return hyperMatch (contract, value,
                                        function (contract, v) {
                                            return op (contract, v) ? undefined : contract }) }

    _.omitMismatches = function (op, contract, value) {
                            return hyperMatch (contract, value,
                                        function (contract, v) {
                                            return op (contract, v) ? v : undefined }) }

    _.typeMismatches     = _.partial (_.mismatches,     typeMatchesValue)
    _.omitTypeMismatches = _.partial (_.omitMismatches, typeMatchesValue)

    _.valueMismatches = _.partial (_.mismatches, function (a, b) { return (a === $any) || (b === $any) || (a === b) })

    var unifyType = function (value) {
        if (_.isArray (value)) {
            return _.nonempty ([_.reduce (_.rest (value), function (a, b) { return _.undiff (a, b) }, _.first (value) || undefined)]) }
        
        else if (_.isStrictlyObject (value)) {
            var pairs = _.pairs (value)
            var unite = _.map ( _.reduce (_.rest (pairs), function (a, b) { return _.undiff (a, b) }, _.first (pairs) || [undefined, undefined]),
                                _.nonempty)

            return (_.isEmpty (unite) || _.isEmpty (unite[1])) ? value : _.object ([[unite[0] || '*', unite[1]]]) }
        
        else {
            return value } }

    _.decideType = function (value) {
        var operator = _.hyperOperator (_.unary,
                            function (value, pred) {
                                if (value && value.constructor && value.constructor.$definition) {
                                    return value.constructor }
                                return unifyType (_.map2 (value, pred)) })

        return operator (value, function (value) {
            if (_.isPrototypeInstance (value)) {
                return value.constructor }
            else {
                return _.isEmptyArray (value) ? value : (typeof value) } }) } }) // TODO: fix hyperOperator to remove additional check for []

;
/*  Tired of wrapping JSON.parse to try/catch? Here's solution.
    Also, it's two-way (can either parse, or stringify).
    ======================================================================== */

_.json = function (arg) {
            if (typeof arg === 'string') {
                try         { return JSON.parse (arg) }
                catch (e)   { return {} } }
            else {
                return JSON.stringify (arg) } }
                
/*  Object stringifier
    ======================================================================== */

_.deferTest (['type', 'stringify'], function () {

        if (_.hasTags) {

            var complex =  { foo: $constant ($get ({ foo: 7 }, 1)), nil: null, nope: undefined, fn: _.identity, bar: [{ baz: "garply", qux: [1, 2, 3] }] }
                complex.bar[0].bar = complex.bar

            var renders = '{ foo: $constant ($get ({ foo: 7 }, 1)), nil: null, nope: undefined, fn: <function>, bar: [{ baz: "garply", qux: [1, 2, 3], bar: <cyclic> }] }'

            var Proto = $prototype ({})

            $assert (_.stringify (Proto),   $platform.NodeJS ? 'Proto ()' : '<prototype>')

            $assert (_.stringify (undefined),'undefined')
            $assert (_.stringify (123),     '123')
            $assert (_.stringify (complex, { pretty: false }), renders) }

        $assert (_.pretty ({    array: ['foo',
                                        'bar',
                                        'baz'],
                                 more:  'qux',
                             evenMore:   42    }), ['{    array: [ "foo",'    ,
                                                    '              "bar",'    ,
                                                    '              "baz"  ],' ,
                                                    '      more:   "qux",'    ,
                                                    '  evenMore:    42       }'].join ('\n'))

        var obj = {}
        $assert (_.stringify ([obj, obj, obj]), '[{  }, <ref:1>, <ref:1>]')

        $assert (_.stringify ({ foo: 1 }, { json: true, pretty: true }), '{ "foo": 1 }') }, function () {

    _.alignStringsRight = function (strings) {
                                                var              lengths = strings.map (_.count)
                                                var max = _.max (lengths)
                            return                              [lengths,  strings].zip (function (ln,   str) {
                                return ' '.repeats (max -                                          ln) + str }) }

    _.bullet = function (bullet,        str) { var indent = ' '.repeats (bullet.length)
              return _.joinWith  ('\n',
                     _.splitWith ('\n', str).map (function (line, i) { return (i === 0)
                                                                                 ? (bullet + line)
                                                                                 : (indent + line) })) }
                        
    _.stringifyOneLine = function (x, cfg) {
                            return _.stringify (x, _.extend (cfg || {}, { pretty: false })) }

    _.pretty = function (x, cfg) {
                    return _.stringify  (x, _.extend (cfg || {}, { pretty: true })) }

    _.stringify = function  (x, cfg) { cfg = cfg || {}
                    var measured = _.stringifyImpl (x, [], [], 0, cfg)
                    return (measured.length < 80 || 'pretty' in cfg) ? measured : _.pretty (x, cfg) }

    _.stringifyPrototype = function (x) {
            if ($platform.NodeJS && x.$meta) { var name = ''
                x.$meta (function (values) { name = values.name })
                return name && (name + ' ()') }
            else return '<prototype>' }

    _.builtInTypes = {
        'Event':         { target: $any },
        'MutationEvent': { target: $any, attrName: $any, prevValue: $any },
        'Range':         { startContainer: $any, startOffset: $any, endContainer: $any, endOffset: $any },
        'ClientRect':    { left: $any, top: $any, right: $any, bottom: $any, width: $any, height: $any } }

    _.stringifyImpl     = function (x, parents, siblings, depth, cfg) {

                            var customFormat = cfg.formatter && cfg.formatter (x)

                            if (customFormat) {
                                return customFormat }

                            if ((typeof jQuery !== 'undefined') && _.isTypeOf (jQuery, x)) {
                                x = _.asArray (x) }

                            if (x === $global) {
                                return '$global' }

                            else if (parents.indexOf (x) >= 0) {
                                return cfg.pure ? undefined : '<cyclic>' }

                            else if (siblings.indexOf (x) >= 0) {
                                return cfg.pure ? undefined : '<ref:' + siblings.indexOf (x) + '>' }

                            else if (x === undefined) {
                                return 'undefined' }

                            else if (x === null) {
                                return 'null' }

                            else if (_.isFunction (x)) {
                                return (cfg.pure ? x.toString () : ((_.isPrototypeConstructor (x) && _.stringifyPrototype (x)) || '<function>')) }

                            else if (typeof x === 'string') {
                                return _.quoteWith ('"', x.limitedTo (cfg.pure ? Number.MAX_SAFE_INTEGER : 60)) }

                            else if (_.isTypeOf (Tags, x)) {
                                return _.reduce (Tags.get (x), function (memo, value, tag) {
                                                                    return _.isBoolean (value)
                                                                        ? (tag + ' ' + memo.quote ('()'))
                                                                        : (tag + ' (' + _.stringifyImpl (value, parents, siblings, 0, { pretty: false }) + ', ' + memo + ')') },
                                    _.stringifyImpl ($untag (x), parents, siblings, depth + 1, cfg)) }

                            else if (!cfg.pure && _.hasOOP && _.isPrototypeInstance (x) && $prototype.defines (x.constructor, 'toString')) {
                                return x.toString () }

                            else if (_.isObject (x) && !((typeof $atom !== 'undefined') && ($atom.is (x)))) {

                                var builtInValue = _.find2 (_.builtInTypes, function (schema, name) {
                                                                                return ($global[name] &&
                                                                                    (x instanceof $global[name]) &&
                                                                                    (name + ' ' + _.stringifyOneLine (
                                                                                                        _.omitTypeMismatches (schema, x)))) || false })
                                if (builtInValue) {
                                    return builtInValue }
                                    
                                else {
                                    if (x instanceof Set) {
                                        x = x.asArray }

                                    var isArray = _.isArray (x)

                                    var pretty = cfg.pretty || false

                                    if ($platform.Browser) {
                                        if (_.isTypeOf (Element, x)) {
                                            return (x.tagName.lowercase +
                                                        ((x.id && ('#' + x.id)) || '') +
                                                        ((x.className && ('.' + x.className)) || '')).quote ('<>') }
                                            //return x.outerHTML.substr (0, 12) + '…' }
                                            //return x.tagName.lowercase.quote ('<>') }
                                        else if (_.isTypeOf (Text, x)) {
                                            return '@' + x.wholeText.limitedTo (20) } }

                                    if (x.toJSON) {
                                        return _.quoteWith ('"', x.toJSON ()) } // for MongoDB ObjectID

                                    if (!cfg.pure && (depth > (cfg.maxDepth || 5) || (isArray && x.length > (cfg.maxArrayLength || 60)))) {
                                        return isArray ? '<array[' + x.length + ']>' : '<object>' }

                                    var parentsPlusX = parents.concat ([x])

                                    siblings.push (x)

                                    var values  = _.pairs (x)

                                    var oneLine = !pretty || (values.length < 2)

                                    var impl = _.stringifyImpl.tails2 (parentsPlusX, siblings, depth + 1, cfg)

                                    var quoteKeys = cfg.json ? '""' : ''

                                    if (pretty) {
                                            values        = _.values (x)
                                        var printedKeys   = _.alignStringsRight (_.keys   (x).map (_.quotesWith (quoteKeys).then (_.appends (': '))))
                                        var printedValues =                            values.map (impl)

                                        var leftPaddings = printedValues.map (function (x, i) {
                                                                                return (((x[0] === '[') ||
                                                                                         (x[0] === '{')) ? 3 :
                                                                                            _.isString (values[i]) ? 1 : 0) })
                                        var maxLeftPadding = _.max (leftPaddings)

                                        var indentedValues = [leftPaddings, printedValues].zip (function (padding,   x) {
                                                                     return ' '.repeats (maxLeftPadding - padding) + x })

                                        var internals = isArray ? indentedValues :
                                                    [printedKeys, indentedValues].zip (_.bullet)

                                        var printed = _.bullet (isArray ? '[ ' :
                                                                          '{ ', internals.join (',\n'))
                                        var lines = printed.split ('\n')

                                        return printed +  (' '.repeats (_.max (lines.map (_.count)) -
                                                                        _.count (lines.last)) + (isArray ? ' ]' :
                                                                                                           ' }')) }

                                    return _.quoteWith (isArray ? '[]' : '{  }', _.joinWith (', ',
                                                _.map (values, function (kv) {
                                                            return (isArray ? '' : (kv[0].quote (quoteKeys) + ': ')) + impl (kv[1]) }))) } }

                            else if (_.isDecimal (x) && (cfg.precision > 0)) {
                                return _.toFixed (x,     cfg.precision) }

                            else {
                                return x + '' } } })

/*  Safe version of toFixed
    ======================================================================== */

_.toFixed = function (x, precision) {
    return (x && x.toFixed && x.toFixed (precision)) || undefined }

_.toFixed2 = function (x) {
    return _.toFixed (x, 2) }

_.toFixed3 = function (x) {
    return _.toFixed (x, 3) }

;
/*  ======================================================================== */

_.deferTest (['Array', 'squash'], function () {

      $assert ( [['all','your',                'to','us'],
                 [      'your',       'belong',     'us'],
                 [             'base','belong','to'     ],
                 [      'your','base'                   ]].squash (),
               /* -------------------------------------- */
                 ['all','your','base','belong','to','us'])


/*  ======================================================================== */

}, function () {    /*  Seems like the algoritm is O(N²) in the worst case,
                        but it can be optimized to O(N log N).
                        ---------------------------------------------------- */

    Array.prototype.squash = function (cfg) {
                                       cfg = cfg || {}

        var key  = cfg.key  || _.identity,  //  for element key extraction
            sort = cfg.sort || undefined    //  should be fn(a,b) -> {-1,0,1}

        var head  = { key: null, next: {}, depth: {} }
        var nodes = {}

        _.each (this, function (arr) {
                        for (
                            var i = 0, n = arr.length, prev = head, node = undefined; i < n; i++, prev = node) {
                            var item = arr[i]
                            var k    = key (item)
                            node = nodes[k] || (nodes[k] = { key: k, item: item, next: {}, depth: {} })
                            if (prev) {
                                prev.next [k] = node
                                prev.depth[k] = 0 } } })

        var decyclize =
            function (  visited, node, prev, depth) { depth = depth || 0
                        visited [node.key] = true                    
                                 node.next = _.filter2 (
                                             _.values (node.next),
                                                 function (next) {
                                                       if (next.key in visited) { return false }
                                                       else {
                                                            next  = decyclize (visited, next, node)
                                                            depth = Math.max (depth, node.depth[next.key])
                                                            return next } })
                if (prev) {
                    prev.depth[node.key] = Math.max (prev.depth[node.key] || 0, depth + 1) }

                delete visited[node.key]
                return         node }

        var ordered = function (    a,    b) {
                            return (a === b) || _.some (a.next, function (aa) {
                                                          return ordered (aa, b) }) }

        var flatten = function (node) { if (!node) return []

                            var next = (node.next || []).sort (
                                          function (a, b) { return (node.depth[a.key] || 0) <
                                                                   (node.depth[b.key] || 0) })
              /* DEBUG */   if (false) {
                                log.gg (node.key)
                                log.pp (next.map (function (next) {
                                                        return next.key + ' ' +
                                                               node.depth[next.key] })) }

                            return [node].concat (flatten (_.reduce (next, function (a, b) {

                                if (a === b)             { return a }
                                else if (ordered (b, a)) { b.next.push (a); return b }
                                else                     { a.next.push (b); return a } }))) }

        return _.rest (
               _.pluck (flatten (decyclize ({}, head)),
                       'item'))
    }
})

/*  ======================================================================== */

_.deferTest (['DAG', 'squash'], function () {

    var modules = {
        
        'tier1':   { requires: [] },
        'tier11':  { requires: ['tier1'] },
        'tier2':   { requires: ['tier0'] },
        'tier111': { requires: ['tier12', 'tier100'] },
        'tier12':  { requires: ['tier0',  'tier11', 'tier2'] },
        'tier100': { requires: ['tier10'] },
        'tier0':   { requires: [] },
        'tier10':  { requires: ['tier0', 'tier2'] },
        'root':    { requires: ['tier2', 'tier111'] } }

    $assert (
        DAG.squash ('root', { nodes: function (x) { return modules[x].requires } }),
        ["tier0", "tier1", "tier11", "tier2", "tier12", "tier10", "tier100", "tier111"]  )

/*  ======================================================================== */

}, function () {

    DAG = function (cfg) {
                    this.cfg   = cfg       || {},
                    this.nodes = cfg.nodes || _.noop },

    DAG.prototype.each = function (N, fn, prev,  visited) {
                                                 visited = visited || new Set ()

                                            if (!visited.has (N)) { 
                                                 visited.add (N);   var self  = this,
                                                                        nodes = this.nodes (N) || [],
                                                                        stop  = fn.call (this, N, {     nodes: nodes,
                                                                                                         prev: prev,
                                                                                                      visited: visited })
                                                if (stop !== true) {
                                                    nodes.forEach (function ( NN) {
                                                                   self.each (NN, fn, N, visited) }) } }; return visited },
    DAG.prototype.edges = function (N) {
                                var edges = []
                                    this.each (N, function (N, context) {   context .nodes
                                                                                    .concat (N)
                                                                                    .reduce (function (A, B) {
                                                                                          edges.push ([A, B]); return B }) }); return edges },
    DAG.prototype.squash = function  (node0) {
                  return this.edges  (node0)
                             .squash (this.cfg)
                             .remove (node0) }

    DAG.squash = function (node0, cfg) { return new DAG (cfg).squash (node0) }

})

/*  ======================================================================== */

;

/*  CPS primitives module
    ======================================================================== */

_.cps = function () {
    return _.cps.sequence.apply (null, arguments) }


/*  apply
    ======================================================================== */

_.withTest (['cps', 'apply'], function () {

    // TODO

}, function () {

    _.cps.apply = function (fn, this_, args_, then) { var args = _.asArray (args_)

        var lastArgN = _.numArgs (fn) - 1
        var thenArg = args[lastArgN]

        args[lastArgN] = function () {
            then.call (this, arguments, thenArg) }

        return fn.apply (this_, args) } })


/*  each
    ======================================================================== */

_.withTest (['cps', 'each'], function () {

    /*  Example array
     */
    var data = ['foo', 'bar', 'baz']
    var currentIndex = 0

    _.cps.each (data,

        /*  called for each item, in linear order
         */
        function (item, itemIndex, then, complete, arrayWeTraverse) {
            $assert (item === data[itemIndex])
            $assert (itemIndex === currentIndex++)
            $assert (arrayWeTraverse === data)

            $assert (_.isFunction (then))
            $assert (_.isFunction (complete))

            then () },

        /*  called when all items enumerated
         */
        function () {
            $assert (currentIndex === data.length) })

    /*  You can omit 'index' argument for iterator function
     */
    var data2 = []
    _.cps.each (data,
        function (item, then) { data2.push (item); then () },
        function () { $assert (data, data2) })

    /*  You can stop iteration by calling fourth argument
     */
    var data3 = []
    _.cps.each (data,
        function (item, i, then, break_) { data3.push (item); break_ () },
        function () { $assert (data3, ['foo']) })

    /*  Iterating over dictionary is legal
     */
    $assertEveryCalled (function (items__3, final__1) {
        var data2 = { 'foo': 1, 'bar': 2, 'baz': 3 }
        _.cps.each (
            data2,
            function (item, name, then) { $assert (item === data2[name]); items__3 (); then () },
            function () { final__1 () }) })

    /*  Iterating over scalar is legal
     */
    $assertEveryCalled (function (items__1, final__1) {
        _.cps.each (
            'foo',
            function (item, name, then) { $assert ([item, name], ['foo', undefined]); items__1 (); then () },
            function () { final__1 () }) })

    /*  Undefined/null are treated as empty (not scalars)
     */
    $assertEveryCalled (function (final__1) {
        _.cps.each (
            undefined,
            function () { $fail },
            function () { final__1 () }) }) },

function () { _.extend (_.cps, {

    each: function (obj, elem_, complete_, index_, length_, keys_) {

                var complete = complete_ || _.noop
                var elem     = function (x, k, next) {
                                    if (_.numArgs (elem_) === 2) { elem_ (x,    next, complete, obj) }
                                                            else { elem_ (x, k, next, complete, obj) } }

                if (_.isEmpty (obj)) {
                    complete () }

                else if (_.isScalar (obj)) {
                    elem (obj, undefined, complete) }

                else {

                    var index   = index_ || 0
                    var keys    = index === 0 ? (obj.length === undefined ? _.keys(obj) : undefined) : keys_
                    var length  = index === 0 ? (keys ? keys.length : obj.length) : length_

                    if (index >= (length || 0)) {
                        complete () }

                    else {
                        var key = keys ? keys[index] : index

                        elem (obj[key], key, arguments.callee.bind (this, obj, elem_, complete_, index + 1, length, keys)) } } } })} )


/*  map
    ======================================================================== */

_.withTest (['cps', 'map'], function () {

    /*  2-argument iterator semantics
     */
    _.cps.map ([7,6,5],
        function (x, then)    { then (x + 1) },
        function (result)     { $assert (result, [8,7,6]) })

    /*  3-argument iterator semantics
     */
    _.cps.map ([7,6,5],
        function (x, i, then) { then (x + 1) },
        function (result)     { $assert (result, [8,7,6]) }) },

function () { _.extend (_.cps, {

    map: function (obj, iter, complete) { var result = _.isArray (obj) ? [] : {}
            _.cps.each (obj, (_.numArgs (iter) == 2)
                                    ? function (x, i, next) { iter (x,    function (y) { result[i] = y; next () }) }
                                    : function (x, i, next) { iter (x, i, function (y) { result[i] = y; next () }) },
                function () { complete (result) }) } }) })

/*  find
    ======================================================================== */

_.withTest (['cps', 'find'], function () {

    /*  Basic use
     */
    _.cps.find ([7,6,5],
        function (x, then) { then ((x % 3) === 0) },
        function (x, key)  { $assert ([x, key], [6, 1]) })

    /*  Over dictionary
     */
    _.cps.find ({ foo: 7, bar: 6, baz: 5 },
        function (x, key, then) { then (key === 'baz') },
        function (x, key)       { $assert ([x, key], [5, 'baz']) })

    /*  Returning non-boolean
     */
    _.cps.find ([7,6,5],
        function (x, then) { then (((x % 3) === 0) ? 'yeah' : false) },
        function (x, key)  { $assert ([x, key], ['yeah', 1]) })

    /*  Not found
     */
    _.cps.find ([7,6,5],
        function (x, key, then) { then (false) },
        function (x)            { $assert (x, undefined) }) },

function () { _.extend (_.cps, {

    find: function (obj, pred, complete) { var passKey = (_.numArgs (pred) !== 2)

        _.cps.each (obj, function (x, key, next, complete) { var take = function (match) {
                                                                            if (match === false) { next () }
                                                                            else                 { complete (match === true ? x : match, key) } }
                            if (passKey) { pred (x, key, take) }
                            else         { pred (x,      take) } }, complete) } }) })

/*  memoize
    ======================================================================== */

_.withTest (['cps', 'memoize'], function () {

    $assertEveryCalledOnce (function (noMoreThanOne) {
        var plusOne = _.cps.memoize (function (x, then) { noMoreThanOne (); then (x + 1) })

        plusOne (2, function (x) { $assert (x === 3) })
        plusOne (2, function (x) { $assert (x === 3) }) }) },

function () { _.extend (_.cps, {

    memoize: function (fn) {
        return _.barrier ? _.cps._betterMemoize (fn) : _.cps._poorMemoize (fn) }, 

    /*  This simplified version is used to bootstrap Useless.js code base (where _.barrier not available)
     */
    _poorMemoize: function (fn) { var cache = {}
        return function (value, then) {
            if (value in cache) {                   //  there's a flaw: cache updates after fetch completes, so while fetch is running,
                then (cache[value]) }               //  any subsequent call (until cache is ready) will trigger fetch (as it doesnt know that result is already fetching)
            else {
                fn.call (this, value, function (result) {
                    then (cache[value] = result) }) } } },

    /*  UPD: added support for 0-arity semantics
     */
    _betterMemoize: function (fn) { var cache = {}  // barrier-enabled impl, eliminates redundant fetches
                                                    // in this version, any subsequent calls join at barrier (which opens when result is fetched)
        switch (_.numArgs (fn)) {
            case 1:
                return function (then) {             
                    if (!cache.already) {
                        fn.call (this, (cache = _.barrier ())) }
                    cache (then) }
            case 2:
                cache = {}
                return function (value, then) {    
                    if (!(value in cache)) {
                        fn.call (this, value, (cache[value] = _.barrier ())) }
                    cache[value] (then) }
            default:
                throw new Error ('_.cps.memoize: unsupported number of arguments') } } }) })


/*  reduce
    ======================================================================== */

_.withTest (['cps', 'reduce'], function () { $assertEveryCalled (function (mkay__2) {

    var input   = [1,2,3]
    var sums    = function (a, b, then) { then (a + b) }
    var check   = function (result) { $assert (result === 6); mkay__2 () }

    _.cps.reduce (input, sums, check)
    _.cps.reduce ([], sums, check, 6)

})}, function () {

    var reduce = function (array, op, then, memo, index) {  // internal impl
        if (!array || (index >= (array.length || 0))) {
            then (memo) }
        else {
            op (memo, array[index], function (result) { reduce (array, op, then, result, index + 1) }) } }

    _.cps.reduce = function (array, op, then, memo) {       // public API
        if (arguments.length < 4) {
            reduce (array, op, then, array[0], 1) }
        else {
            reduce (array, op, then, memo, 0) } } } )


/*  noop / identity / constant
    ======================================================================== */

_.withTest (['cps', 'noop, identity, constant'], function () { $assertEveryCalled (function (noop, identity, const1, const2) {

    /*  Port of underscore's _.noop to CPS terms
     */
    _.cps.noop (1,2,3, function () { $assert (arguments.length === 0); noop () })

    /*  Port of underscore's _.identity to CPS terms
     */
    _.cps.identity (1,2,3, function () { $assert ([1,2,3], _.asArray (arguments)); identity () })

    /*  Port of underscore's _.constant to CPS terms
     */
    _.cps.constant (3)    (function (_3)     { $assert (_3 === 3); const1 () })
    _.cps.constant (1, 2) (function (_1, _2) { $assert (_1 === 1); $assert (_2 === 2); const2 () })

})}, function () { _.extend (_.cps, {

    noop: $restArg (function () {
        return _.last (arguments).call (this) }),

    identity: $restArg (function () {
        var args = _.initial (arguments),
            then = _.last (arguments)
        if (then) {
            return then.apply (this, args) } }),

    constant: $restArg (function () { var args = arguments
                    return function () {
                        return _.last (arguments).apply (this, args) } }) })} )


/*  arity
    ======================================================================== */

_.deferTest (['cps', 'arity / resultArity'], function () {

    var returnMyArgs = _.cps.identity

    var put123 = function (fn) {
        return _.partial (fn, 1,2,3) }

    $assertCPS (put123 (              returnMyArgs),  [1,2,3])
    $assertCPS (put123 (_.cps.arity2 (returnMyArgs)), [1,2])
    $assertCPS (put123 (_.cps.arity1 (returnMyArgs)), [1])
    $assertCPS (put123 (_.cps.arity0 (returnMyArgs)))

    var return123 = function (then) {
        then (1,2,3) }

    $assertCPS (                    return123,  [1,2,3])
    $assertCPS (_.cps.resultArity2 (return123), [1,2])
    $assertCPS (_.cps.resultArity1 (return123), [1])
    $assertCPS (_.cps.resultArity0 (return123))

}, function () {

    _.cps.arity0 = function (fn) {
                        return function () {
                            fn.call (this, _.last (arguments)) } }

    _.cps.arity1 = function (fn) {
                        return function () {
                            fn.call (this, arguments[0], _.last (arguments)) } }

    _.cps.arity2 = function (fn) {
                        return function () {
                            fn.call (this, arguments[0], arguments[1], _.last (arguments)) } }

    _.cps.transformResult = function (operator, fn) {
                                return function (args) {
                                    fn.apply (this, _.initial (arguments).concat (operator (_.last (arguments)))) } }

    _.cps.resultArity2 = _.partial (_.cps.transformResult, _.arity2)
    _.cps.resultArity1 = _.partial (_.cps.transformResult, _.arity1)
    _.cps.resultArity0 = _.partial (_.cps.transformResult, _.arity0) })


/*  sequence / compose
    ======================================================================== */

_.withTest (['cps', 'sequence / compose'], function () { $assertEveryCalled (function (mkay__4) {

    /*  Basic example of asynchronous functions sequencing
     */
    var makeCookies = function (whatCookies, then)  { then ('cookies ' + whatCookies) }
    var eatCookies  = function (cookies, then)      { then ('nice ' + cookies) }
    var check       = function (result)             { $assert (result, 'nice cookies from shit'); mkay__4 () }

    _.cps.sequence (makeCookies, eatCookies, check)   ('from shit')     // supports both ways (either argument list...
    _.cps.sequence ([makeCookies, eatCookies, check]) ('from shit')     // ..or array

    _.cps (makeCookies, eatCookies, check) ('from shit') // shorthand macro

    /*  A port of underscore's _.compose (simply flipped _.sequence)
     */
    _.cps.compose (check, eatCookies, makeCookies) ('from shit')

})}, function () {

    _.cps.sequence = $restArg (
                        function (arr) { var functions = (_.isArray (arr) && arr) || _.asArray (arguments)
                            return _.reduceRight (functions, function (a, b) {
                                return function () {
                                    return b.apply (this, _.asArray (arguments).concat (a)) }}, _.cps.identity) })

    _.cps.compose = $restArg (
                        function (arr) { var functions = (_.isArray (arr) && arr) || _.asArray (arguments)
                            return _.cps.sequence (functions.slice ().reverse ()) }) })


/*  _.cps.sequence with error handling (kind of a simplified Promise)
    ======================================================================== */

_.deferTest (['cps', 'trySequence'], function () {

    var testErr = new Error ()

    /*  No error
     */
    $assertEveryCalledOnce (function (mkay) {
        _.cps.trySequence ([
            _.cps.constant ('foo'),
            _.appends ('bar').asContinuation],
                function (result) { $assert (result, 'foobar'); mkay () }) })

    /*  Throwing error
     */
    $assertEveryCalledOnce (function (mkay) {
        _.cps.trySequence ([
            function () { throw testErr },
            function () { $fail }],
                function (result) { $assert (result === testErr); mkay () }) })

    /*  Returning error to continuation
     */
    $assertEveryCalledOnce (function (mkay) {
        _.cps.trySequence ([
            function (then) { then (testErr) },
            function () { $fail }],
                function (result) { $assert (result === testErr); mkay () }) })

    /*  Reading error in separate callback
     */
    $assertEveryCalledOnce (function (mkay) {
        _.cps.trySequence ([
            function (then) { then (testErr) },
            function () { $fail }],
                function (result) { $fail },
                function (err)    { $assert (err === testErr); mkay () }) })

}, function () {

    _.cps.trySequence = function (functions, then, err) {
        _.reduceRight (functions, function (a, b) {
            return function (e) {
                if (_.isTypeOf (Error, e)) {
                    return (err || then) (e) }
                else {
                    try {
                        return b.apply (this, _.asArray (arguments).concat (a)) }
                    catch (e) {
                        return (err || then) (e) } } } }, then) () }

});

/*  Extensions methods
    ======================================================================== */

_(['method', 'property', 'flipped', 'forceOverride']) // keywords recognized by $extensionMethods
    .each (_.defineTagKeyword)

$extensionMethods = function (Type, methods) {

    _.each (methods, function (tags, name) { var fn = Tags.unwrap (tags)

        /*  define as _.method (this, ...)
         */
        if (!(name in _)) {
                      _[name] = _[name] || fn }

        /*  define as property of Type
         */
        if (!tags.$method && (tags.$property || (_.oneArg (fn)))) {
            if (!(name in Type.prototype) || tags.$forceOverride) {
                _.defineHiddenProperty (Type.prototype, name, function () {
                    return fn (this) }) } }

        /*  define as method
         */
        else if (!tags.$property) {
            if (!(name in Type.prototype) || tags.$forceOverride) {
                Type.prototype[name] = _.asMethod (tags.$flipped ? _.flip (fn) : fn) } }

        else {
            throw new Error ('$extensionMethods: crazy input, unable to match') } })};
/*  Function extensions
    ======================================================================== */

_.tests.Function = {

    '$ for partial application': function () {

             var sum = function (a, b) { return a + b }

        $assert (sum.$  ('foo') ('bar'), 'foobar')      // bind to head of argument list
        $assert (sum.$$ ('foo') ('bar'), 'barfoo') },   // bind to tail of argument list

    'Fn.callsWith': function () {
        $assert (42, (function (a,b,c) {
                      $assert ([a,b,c],
                               [1,2,3]); return 42; }).callsWith (1,2) (3)) },

    /*  Converts regular function (which returns result) to CPS function (which passes result to 'then')
     */
    'asContinuation': function () { $assertEveryCalled (function (mkay__2) {

        var twoPlusTwo   = function () { return 2 + 2 }
        var shouldBeFour = function (result) {
            $assert (result == 4)
            mkay__2 () }

        twoPlusTwo.asContinuation (shouldBeFour)
        _.asContinuation (twoPlusTwo) (shouldBeFour) }) },

    /*  Postpones execution
     */
    'postpone': function (testDone) {
        $assertEveryCalledOnce ($async (function (mkay1, mkay2) { var testSecondCall = false
            var callMeLater = function () {
                if (testSecondCall) {
                    mkay2 ()
                    testDone () }
                else {
                    mkay1 ()
                    testSecondCall = true
                    callMeLater.postpone () } } // should be postponed again
            callMeLater.postpone ()
            callMeLater.postpone () })) },       // should not trigger double call

    'postponed': function (testDone) {
        $assertEveryCalledOnce ($async (function (mkay) {
            (function (_42) {
                $assert (this, 'foo')
                $assert (42, _42); mkay (); }).postponed.call ('foo', 42) }), testDone) },

    /*  Returns function that executed after _.delay
     */
    'delayed': function (testDone) {
        var eat42           = function (_42, then) { $assert (_42, 42); then () }
        var eat42_after5ms  = eat42.delayed (5)

        $assertEveryCalledOnce ($async (function (mkay) {
            eat42_after5ms (42, function () { mkay () }) }), testDone) } }

/*  Impl.
 */
$extensionMethods (Function, {

    $:  $method (_.partial), // binding to head of argument list
    $$: $method (_.tails),   // binding to tail of argument list

    bind:           _.bind,
    partial:        _.partial,
    calls:          _.bind,
    tails:          _.tails,
    tails2:         _.tails2,
    tails3:         _.tails3,
    applies:        _.applies,
    compose:        _.compose,
    then:           _.then,
    flip:           _.flip,
    with:           _.flipN,
    flip2:          _.flip2,
    flip3:          _.flip3,
    asFreeFunction: _.asFreeFunction,
    asMethod:       _.asMethod,

    callsWith: _.callsTo,
    tailsWith: _.tailsTo,

    higherOrder: _.higherOrder,

    returns: function (              fn,                                returns) {
                return function () { fn.apply (this, arguments); return returns } },
                                                
    asContinuation: function (f) {
        return $restArg (function () { _.last (arguments) (f.apply (this, _.initial (arguments))) }) },

    wraps: function (f, w) { f._wrapped = _.withSameArgs (f, w); return f },
    wrapped: function (f) { return f._wrapped || f },
    original: function (f) {  while (f && f._wrapped) {
                                     f  = f._wrapped } return f },

    arity0:         _.arity0,
    arity1:         _.arity1,
    arity2:         _.arity2,
    arity3:         _.arity3,

    or:     _.or,
    and:    _.and,
    not:    _.not,

    new: _.higherOrder (_.new),

    each: function (fn, obj) { return _.each2 (obj, fn) },
    map:  function (fn, obj) { return _.map2  (obj, fn) },

    oneShot: function (fn) { var called = false
        return function () {   if (!called) {
                                    called = true; return fn.apply (this, arguments) } } },

    memoized: _.memoize,
    throttled: _.throttle,
    
    debounced: function (func, wait, immediate) {
        
        var timestamp, timeout, result, args, context
        var later = function () {
            var last = Date.now () - timestamp
            if (last < wait && last > 0) {
                timeout = setTimeout (later, wait - last) }
            else {
                timeout = null;
                if (!immediate) {
                    result = func.apply (context, args)
                    if (!timeout) {
                        context = args = null } } } }

        var debouncedFn = function() {
            context = this
            args = arguments
            timestamp = Date.now()
            var callNow = immediate && !timeout
            if (!timeout) {
                timeout = setTimeout(later, wait) }
            if (callNow) {
                result = func.apply(context, args)
                context = args = null }
            return result }

        debouncedFn.cancel = function () {
            if (timeout) {
                clearTimeout (timeout)
                timeout = null } }

        debouncedFn.callImmediately = function () { // cancels timeout (set by fn.debounced/fn.throttled) and calls immediately
            debouncedFn.cancel ()
            func.apply (context, args) }

        return debouncedFn },

    postpone: $method (function (fn) { fn.postponed.apply (null, arguments) }),

    postponed: function (fn) {
        return function () {               var args  = arguments, this_ = this
            if (!fn._postponed) {      fn._postponed = true
                _.delay (function () { fn._postponed = false
                    fn.apply (this_, args) }) } } },

    delay: _.delay,
    delayed: function (fn, time) {
        return function () {
            var args = arguments, context = this
            _.delay (function () { fn.apply (context, args) }, time) } } })


/*  A functional try/catch
    ======================================================================== */

_.tests.Function.catches = function () {

    $assert (           'yo',
         _.constant    ('yo').catches ($fails) (),
         _.identity          .catches ($fails) ('yo'),
         _.throwsError ('xx').catches          ('yo')   ())

    $assertThrows (function () {
        _.constant ('yo').catches (function () { $assert ('catch handler shoudnt work on passed continuations') }, _.throwsError ('xx')) () })

    $assert ((function (x) { throw x }).catches (
                                            _.appends ('+error_case'),
                                            _.appends ('+no_error_case'),
                                            _.appends ('+finally')) ('foo'), 'foo+error_case+finally')

    $assertMatches (
         _.throwError.catches () ('yo'), {
                         message: 'yo' })

    $assert (_.catches (_.throwsError (  42 ), $assertMatches
                          .$ ({ message: 42 })
                              .returns ('yo')) (),
                                        'yo')

    $assertCPS (_.constant ('yo').catches ($fails),
                            'yo') }

$extensionMethods (Function, { catch_:  function (fn, catch_, then, finally_) { return fn.catches (catch_, then) () },
                               catches: function (fn, catch_, then, finally_) {
                                                              var args = arguments.length
                                                        catch_ = (args > 1 ? _.coerceToFunction (catch_)   : _.identity)
                                                         then  = (args > 2 ? _.coerceToFunction (then)     : _.identity)
                                                    finally_   = (args > 3 ? _.coerceToFunction (finally_) : _.identity)
                                          return function () {     var result = undefined, catched = false
                                                      try          {   result = fn.apply (this, arguments) }
                                                      catch (e)    {   result = catch_ (e); catched = true }
                                                     if (!catched) {   result = then (result) }
                                                  return finally_  (   result) } } })





;
/*  Array extensions
    ======================================================================== */

_.withTest ('Array extensions', function () {

    var arr = [1,3,2,3,3,4,3]

    $assert ([arr.first, arr.second, arr.top, arr.last], [1, 3, 3, 3])
    $assert (arr.rest, [3,2,3,3,4,3])

    $assert (arr.take (4), [1,3,2,3])

    $assert ([arr.contains (4), arr.contains (9)], [true, false])

    $assert (arr.lastIndex, 6)

    $assert (arr.copy, arr)
    $assert (arr.copy !== arr)

    $assert (arr.remove (3), [1,2,4]) // it is fast
    $assert (arr,            [1,2,4]) // and mutates original (thats why fast)
                                      // for immutable version, use underscore's _.without

    $assert (arr.removeAll (),   [])
    $assert (arr,                [])

    $assert (['a','b','c'].removeAt (1),    ['a','c'])      // NOTE: mutates original
    $assert (['a','c'].insertAt ('b', 1),   ['a','b','c'])  // NOTE: mutates original

    $assert ([0,1,2].itemAtWrappedIndex (4) === 1)

             arr =         [1,2,3]
    $assert (arr.reversed, [3,2,1])
    $assert (arr,          [1,2,3]) // does not mutate original (in contrary to .reverse)
                                        
    $assert ([[1], [[2], 3], 4].flat,         [1, [2], 3, 4])
    $assert ([[1,2,3], [4,5,6]].zip (_.sum),  [5,7,9])
    $assert (_.zap ([1,2,3], [4,5,6], _.sum), [5,7,9])

    $assert (['a','b','c'].swap (1,2), ['a','c','b']) // NOTE: mutates original

    $assert ([1].random === 1) // returns random item from array
    $assert ([].random === undefined)

    $assert ([{ foo: 'bar'}, { foo: 'qux' }].pluck ('foo'),
                    ['bar',         'qux'])

    $assert ([['foo', 'bar'].join (),
              ['foo', 'bar'].join ('.'),
              ['foo', 'bar'].join (777),
              ['foo'       ].join (777),
              [       'bar'].join ('.')], ['foobar', 'foo.bar', ['foo', 777, 'bar'], 'foo', 'bar'])

}, function () {

    /*  TODO: rewrite using new $mixin facility
     */
    $extensionMethods (Array, {

        each:        _.each,
        map:         _.map,
        fold:        _.reduce2,
        reduce:      _.reduce,
        reduceRight: _.reduceRight,
        zip:         _.zipWith,
        groupBy:     _.groupBy,
        indexBy:     _.indexBy,
        find:        _.find,
        filter:      _.filter,
        flat:        _.flatten.tails2 (true),
        object:      _.object,
        shuffle:     _.shuffle,
        pluck:       $method (_.pluck),

        join: (function (strJoin) {
                    return $forceOverride (function (arr, delim) { delim = (arguments.length < 2) ? '' : delim
                                                if (/*_.isString (arr[0]) && */ // semantically correct, but breaks compat
                                                    _.isString (delim)) { return strJoin.call (arr, delim) }
                                                                   else { return _.reduce2 (arr, function (a, b) { return [a].concat ([delim, b]) }) } }) }) (Array.prototype.join),

        contains: function (arr, item) { return arr.indexOf (item) >= 0 },


        top:    function (arr) { return arr[arr.length - 1] },        
        first:  function (arr) { return arr[0] },
        second: function (arr) { return arr[1] },
        rest:   function (arr) { return _.rest (arr) },
        last:   function (arr) { return arr[arr.length - 1] },
        
        /*  TODO: refactor
         */
        take:   function (arr, n) { return arr.slice (0, n) },
        lastN:  $method (_.last),

        before: function (arr, x) { var i = arr.indexOf (x); return i < 0 ? arr : arr.slice (0, i - 1) },
        after: function (arr, x)  { var i = arr.indexOf (x); return i < 0 ? arr : arr.slice (i + 1) },

        isEmpty: function (arr) { return arr.length === 0 },
        notEmpty: function (arr) { return arr.length > 0 },

        lastIndex: function (arr) { return arr.length - 1 },

        random: function (arr) {
            return arr[_.random (0, arr.lastIndex)] },

        copy: function (arr) {
            return arr.slice (0) },

        removeAll: $method (function (arr) {
                        return arr.splice (0, arr.length), arr }),

        remove: function (arr, item) {
            var i; while ((i = arr.indexOf (item)) !== -1) {
                arr.splice (i, 1) } return arr },

        removeAt: function (arr, index) {
            arr.splice (index, 1); return arr },

        insertAt: function (arr, item, index) {
            arr.splice (index, 0, item); return arr },

        itemAtWrappedIndex: function (arr, i) {
            return arr[i % arr.length] },

        reversed: function (arr) {
            return arr.slice ().reverse () },

        swap: $method (function (arr, indexA, indexB) {
            var a = arr[indexA], b = arr[indexB]
            arr[indexA] = b
            arr[indexB] = a
            return arr }) })

    _.zap = function (firstArg) { /* (arg1..argN fn) syntax */
        var zippo = _.last (arguments)
        return _.reduce (_.rest (_.initial (arguments)), function (memo, row) {
                        return _.times (Math.max (memo.length, row.length), function (i) {
                            return zippo (memo[i], row[i]) }) }, firstArg) } })
;
/*  String extensions
    ======================================================================== */

_.deferTest ('String extensions', function () {

    /*  Convenient infix versions of string-crunching basics. The
        naming scheme of reversed/capitalized/trimmed is chosen to
        not cause conflicts with built-in methods/properties doing
        the same (which are implementation-dependent, e.g. str.trim
        method).
     */
    $assert ('ж'.repeats (0)    === '')
    $assert ('ж'.repeats (4)    === 'жжжж')
    $assert ('жопа'.first (2)   === 'жо')
    $assert ('жопа'.reversed    === 'апож')
    $assert ('жопа'.capitalized === 'Жопа') // capital Zhopa
    $assert ('  жопа  '.trimmed === 'жопа')
    $assert ('<жопа>'.escaped   === '&lt;жопа&gt;')
    $assert ('па'.prepend   ('жо'),
             'жо'.append    ('па'), 'жопа')

    $assert (['жопа'.contains ('опа'),
              'жопа'.contains ('апож')], [true, false])

    $assert  (['жопа'.startsWith ('ж'),
               'жопа'.startsWith ('жо'),
               'жопа'.startsWith ('о')], [true,
                                          true,
                                          false])
    $assert  (['жопа'.endsWith ('а'),
               'жопа'.endsWith ('па'),
               'жопа'.endsWith ('ж')], [true,
                                        true,
                                        false])

    /*  Higher order version of former utility
     */
    $assert ([  _.map ([1, 2, 3], _.prepends ('foo')), // higher order version
                _.map ([1, 2, 3], _.appends  ('bar'))].zip (_.append), ['foo11bar', 'foo22bar', 'foo33bar'])

    /*  This one is defined via unicode_regexp_hack and is super slow
     */
    $assert ('}|{О/7A с Py4K()Й ololo 321321'.latinAlphanumericValue,   '7APy4Kololo321321')
    $assert ('}|{О/7A с Py4K()Й ololo 321321'.alphanumericValue,        'О7AсPy4KЙololo321321')

    /*  This one is defined though regexps, and is kinda slow. Don't use
        in performance-critical code (like mass object rendering in UI)
     */
    $assert ('+7(965)412-63-21'.numericValue, '79654126321')
    $assert ('+7(965)412-63-21'.integerValue,   79654126321)
    $assert ('foo'.integerValue,                undefined)      // NOTE: returns undefined instead of NaN (for consistency reasons)
    $assert ('0'.integerValue,                  0)              // regression test (was resulting to undefined due to bug)

    /*  Use str.parsedInt instead of raw parseInt(), because latter requires
        base-10 argument, often mistakengly omited, thus resulting something
        like '010' to be parsed as octal number. I once spend hours of debugging
        to catch this kind of mistake, and now not want for someone's got
        trapped into the same shitty situation.
     */
    $assert ('123'.parsedInt,   123)
    $assert ('foo'.parsedInt,   undefined)      // NOTE: returns undefined instead of NaN (for consistency reasons)
    $assert ('0'.parsedInt,     0)              // regression test (was resulting to undefined due to bug)

    /*  This one is taken from Java's object hasher. Not to ever be used in
        some security-critical calculations, as it's not secure. It's fast.
     */
    $assert ('foo'.hash, 101574)

    /*  Use for filename/URL-part generation
     */
    $assert ('Пися Камушкинъ'.transliterate, 'pisyakamushkin')

    /*  This one is really convetient!
     */
    $assert  ('qux'.quote (''),     'qux')
    $assert  ('qux'.quote ('"'),    '"qux"')
    $assert  ('qux'.quote ('[]'),   '[qux]')
    $assert  ('qux'.quote ('/'),    '/qux/')
    $assert  ('qux'.quote ('{  }'), '{ qux }')
    $assert  ('qux'.quote ('</>'),  '</qux>')

    $assert  (_.isTypeOf (Uint8Array, 'foo'.bytes))
    $assert  (_.asArray ('foo'.bytes), [102, 111, 111])

    $assert  (['foobar'  .limitedTo (6),
               'tooloong'.limitedTo (6),
               ''        .limitedTo (0)], ['foobar',
                                           'toolo…', ''])

    $assert  ('жоп'.pad (5),      'жоп  ')
    $assert  ('жоп'.pad (5, '→'), 'жоп→→')

}, function () { $extensionMethods (String, {

    quote: _.quote,

    contains: function (s, other) { return s.indexOf (other) >= 0 },

    startsWith: function (s, x) {
                    return (x.length === 1) ? (s[0] === x) : (s.substring (0, x.length) === x) },

    endsWith: function (s, x) {
                    return (x.length === 1) ? (s[s.length - 1] === x) : (s.substring (s.length - x.length) === x) },

    pad: function (s, len, filler) {
        return s += (filler || ' ').repeats (Math.max (0, len - s.length)) },

    cut: function (s, from) {
        return s.substring (0, from - 1) + s.substring (from, s.length) },

    insert: function (s, position, what) {
        return s.substring (0, position) + what + s.substring (position, s.length) },

    lowercase: function (s) {
        return s.toLowerCase () },

    uppercase: function (s) {
        return s.toUpperCase () },

    trimmed: function (s) {
        return s.trim () },

    limitedTo: function (s, n) {
        return s && ((s.length <= n) ? s : (s.substr (0, n - 1) + '…')) },

    escaped: function (s) {
        return _.escape (s) },

    repeats: function (s, n) {                              // TODO: this should come in two versions: _.repeat (s, n) and _.repeats (n, s)
        return _.times (n, _.constant (s)).join ('') },

    prepend: function (s, other) {
        return other + s },

    append: function (s, other) {
        return s + other },

    first: function (s, n) {
        return _.first (s, n).join ('') },

    last: function (s, n) {
        return _.last (s, n).join ('') },

    reversed: function (s) {
        return s.split ('').reverse ().join ('') },

    capitalized: function (s) {
        return s.charAt (0).toUpperCase () + s.slice (1) },

    decapitalized: function (s) {
        return s.charAt (0).toLowerCase () + s.slice (1) },

    latinAlphanumericValue: function (s) {
        return s.replace (/[^a-z0-9]/gi, '') },

    alphanumericValue: function (s) {
        return s.replace (unicode_hack (/[^0-9\p{L}|^0-9\p{N}|^0-9\p{Pc}|^0-9\p{M}]/g), '') }, // utilizes unicode regexp hack (defined at the end of file)

    numericValue: function (s) {
        return s.replace (/[^0-9]/g, '') },

    integerValue: function (s) {
        return s.numericValue.parsedInt },

    parsedInt: function (s) {
        var result = parseInt (s, 10)
        return _.isFinite (result) ? result : undefined },

    bytes: function (s) {                var bytes = new Uint8Array (s.length)
        for (var i = 0; i < s.length; ++i) { bytes[i] = s.charCodeAt (i) }
                                      return bytes },

    hash: function (s) { // unsecure, but fast, taken from Java's object hasher
        var hash = 0, i, chr, len
        if (s.length === 0) {
            return hash; }

        for (i = 0, len = s.length; i < len; i++) {
            chr   = s.charCodeAt (i)
            hash  = ((hash << 5) - hash) + chr
            hash |= 0 } // Convert to 32bit integer

        return hash },

    transliterate: (function () {
        var table = _.extend ({

            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g',
            'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k',
            'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
            'у': 'u', 'ф': 'ph', 'х': 'h', 'ц': 'ts',
            'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ь': '',
            'ъ': '', 'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya' },

            _.object (_.map ('_-1234567890qwertyuiopasdfghjklzxcvbnm', function (x) { return [x,x] })))
        
        return function (s) {
            var result = ''
            var source = (s || '').toLowerCase ()

            for (var i = 0, n = source.length; i < n; i++) {
                var c = source[i]
                var x = table[c] || ''
                result += x }

            return result }}) () }) })

_.extend (String, {

    randomHex: function (length) {
                            if (length === undefined) {
                                length = _.random (1, 32) }
                            var string = '';
                            for (var i = 0; i < length; i++) { string += Math.floor (Math.random () * 16).toString (16) }
                            return string },

    leadingZero: function (n) {
                    return (n < 10) ? '0' + n : n.toString () } })

_.deferTest (['identifier naming style interpolation'], function () {

    $assert (_.camelCaseToLoDashes        ('flyingBurritoOption'), 'flying_burrito_option')
    $assert (_.camelCaseToDashes          ('flyingBurritoOption'), 'flying-burrito-option')
    $assert (_.dashesToCamelCase          ('flying-burrito-option'), 'flyingBurritoOption')
    $assert (_.loDashesToCamelCase        ('flying_burrito_option'), 'flyingBurritoOption')

}, function () {

    _.camelCaseToDashes   =   function (x) { return x.replace (/[a-z][A-Z]/g, function (x) { return x[0] + '-' + x[1].lowercase }) }
    _.camelCaseToLoDashes =   function (x) { return x.replace (/[a-z][A-Z]/g, function (x) { return x[0] + '_' + x[1].lowercase }) }
    _.dashesToCamelCase   =   function (x) { return x.replace (/(-.)/g,       function (x) { return x[1].uppercase }) } })
    _.loDashesToCamelCase =   function (x) { return x.replace (/(_.)/g,       function (x) { return x[1].uppercase }) }




;

/*  Interceptable/observable methods
    ======================================================================== */


/*  TODO: rewrite test
 */
_.deferTest ('bindable', function () {

    /*  Test subject
     */
    var obj = {
        plusOne: function (x) {
            return x + 1 },

        innocentMethod: function (x) {
            return x } }

    $assertEveryCalled (function (before__1, after__1, intercept__2, secondIntercept__1, bindable__1, infixBefore__1) {

        /*  That's how you observe method calls
         */
        _.onBefore (obj, 'plusOne', function (x)            { before__1 (); $assert (x === 7) })
        _.onAfter  (obj, 'plusOne', function (x, result)    { after__1 (); $assert ([x, result], [7, 8]) })

        $assert (obj.plusOne (7), 8)

        /*  That's how you intercept method calls
         */
        _.intercept (obj, 'innocentMethod', function (x, method) {
            intercept__2 ()
            return method (x + 1) * 2 })

        $assert (obj.innocentMethod (42), (42 + 1) * 2) 

        /*  Consequent interceptors wrap-up previous ones
         */
        _.intercept (obj, 'innocentMethod', function (x, method) {
            secondIntercept__1 ()
            $assert (method (x), (42 + 1) * 2) 
            return 'hard boiled shit' })

        $assert (obj.innocentMethod (42), 'hard boiled shit')

        /*  Test infix calls
         */
        var method = _.bindable (function (x) { bindable__1 (); $assert (x === 42) })
            method.onBefore (function (x) { infixBefore__1 (); $assert (x === 42) })
            method (42) })

    /*  Test 'once' semantics
     */
    var obj2 = { plusOne: function (x) { return x + 1 } }

    $assertEveryCalledOnce (function (beforeCalled, afterCalled) {

        var before = function (x) { beforeCalled (); $assert (x === 7) }
        var after  = function (x, result) { afterCalled ();  $assert ([x, result], [7, 8]) }

        _.times (2, function () {
            _.onceBefore (obj, 'plusOne', before)
            _.onceAfter  (obj, 'plusOne', after) })

        $assert (obj.plusOne (7), 8)
        $assert (obj.plusOne (7), 8) })

    /*  Test unbinding
     */
    $assertEveryCalled (function (afterCalled__1, shouldNotCall__0) {
                                var method = _.bindable (function () {})

                                    /*  Unbind specific delegate
                                     */
                                    method.onBefore (shouldNotCall__0)
                                    method.onAfter (afterCalled__1)
                                    method.off (shouldNotCall__0)
                                    method ()

                                    /*  Unbind everything
                                     */
                                    method.onBefore (shouldNotCall__0)
                                    method.onAfter (shouldNotCall__0)
                                    method.off ()
                                    method () })

}, function () {

    /*  Internal impl
     */
    var hooks      = ['onceBefore', 'onceAfter', 'onBefore', 'onAfter', 'intercept']
    var hooksShort = ['onceBefore', 'onceAfter', 'before', 'after', 'intercept']

    var copyHooks = function (from, to) {
        _.extend (to, _.map2 (_.pick (from, hooks), _.clone)) }

    var makeBindable = function (obj, targetMethod) { var method = obj[targetMethod]
                            return _.isBindable (method) ? method : (obj[targetMethod] = _.bindable (method)) }

    var hookProc = function (name) {
                        return function (obj, targetMethod, delegate) {
                               var bindable = makeBindable (obj, targetMethod)
                            return bindable[name].call (bindable, delegate) } }

    var mixin = function (method, context) { if (typeof method !== 'function') { throw new Error ('method should be a function') }

                    return _.extend ({}, method, {

                                    _bindable: true,
                                         impl: method,
                                     _wrapped: method,
                                      context: context,
                                          off: function (delegate) {
                                                    _.each (hooks, function (hook) {
                                                        if (delegate) { this['_' + hook].remove (delegate) }
                                                                 else { this['_' + hook].removeAll () } }, this); return this } },

                                /*  .onBefore, .onAfter, .intercept (API methods)
                                 */
                                _.object (_.map (hooks, function (name) { var queueName = ('_' + name)
                                                                          var once      = (name.indexOf ('once') >= 0)

                                                            return [name, function (fn) {
                                                                            if (!_.isBindable (this)) {
                                                                                throw new Error ('wrong this') }

                                                                            var queue = this[queueName]
                                                                            if (!once || queue.indexOf (fn) < 0) {
                                                                                this[queueName].push (fn) }

                                                                            return this }] })),

                                /*  ._onBefore, ._onAfter, ._intercept (queues)
                                 */
                                _.object (_.map (hooks, function (name) {
                                                            return ['_' + name, []] }))) }

    /*  Public API
     */
    _.extend (_, _.mapObject (_.invert (hooks), hookProc.flip2), {

        unbind: function (obj, targetMethod, delegate) {
                var method = obj[targetMethod]
                if (method &&
                    method.off) {
                    method.off (delegate) } },

        isBindable: function (fn) {
            return (fn && fn._bindable) ? true : false },

        bindable: _.extendWith ({ hooks: hooks, hooksShort: hooksShort }, function (method, context) {
            return _.withSameArgs (method, _.extendWith (mixin (method, context), function () {   

                var wrapper     = arguments.callee
                var onceBefore  = wrapper._onceBefore
                var onceAfter   = wrapper._onceAfter
                var before      = wrapper._onBefore
                var after       = wrapper._onAfter
                var intercept   = wrapper._intercept
                var this_       = context || this
                var i, ni       = undefined

                /*  Call onceBefore
                 */
                if (onceBefore.length) {
                    for (i = 0, ni = onceBefore.length; i < ni; i++) {
                        onceBefore[i].apply (this_, arguments) }
                    onceBefore.removeAll () }

                /*  Call before
                 */
                for (i = 0, ni = before.length; i < ni; i++) {
                    before[i].apply (this_, arguments) }

                /*  Call intercept
                 */
                var result = (intercept.length ? _.cps.compose ([method].concat (intercept)) : method).apply (this_, arguments)

                if (after.length || onceAfter.length) { var args = _.asArray (arguments).concat (result)

                    /*  Call after
                     */
                    for (i = 0, ni = after.length; i < ni; i++) {
                        after[i].apply (this_, args) }

                    /*  Call onceAfter
                     */
                    if (onceAfter.length) { var arr = onceAfter.copy
                                                      onceAfter.removeAll ()
                        for (i = 0, ni = arr.length; i < ni; i++) {
                            arr[i].apply (this_, args) } } }

                return result } )) }) }) })
;
/*  Generic functional primitives for dynamic code binding
    ======================================================================== */

_.tests.stream = {

    'triggerOnce': function () { $assertEveryCalledOnce (function (mkay) {
                                    var t = _.triggerOnce ()
                                    var f = function (_321) { $assert (_321 === 321); mkay () }
                                     t (f)
                                     t (f)
                                     t (321)
                                     t (123) }) },

    'observable': function () {

        /*  Should accept value as constructor, it should be accessible by .value property
         */
        var initedWithValue = _.observable (555)
        $assert (initedWithValue.value, 555)

        /*  Should call with current value when upon binding
         */
        $assertEveryCalledOnce (function (mkay) { var valueChanged = _.observable ()
            valueChanged (999)
            valueChanged (function (_999) { $assert (_999, 999); mkay () }) })

        /*  Should call previously bound callback if changed
         */
        $assertEveryCalled (function (mkay__3) { var valueChanged = _.observable ()
            valueChanged (mkay__3)
            valueChanged (123)
            valueChanged (345)
            valueChanged (567) })

        /*  Should pass last distinct value as argument to callbacks, not calling if its not changed
         */
        $assertEveryCalledOnce (function (mkay) { var valueChanged = _.observable ()
            valueChanged (function (_111) {
                            $assert (111, _111)
                            mkay () })
            valueChanged (111)
            valueChanged (111) })

        /*  Should pass previous value as second argument
         */
        $assertEveryCalledOnce (function (mkay) { var valueChanged = _.observable (444)
            valueChanged (function (_666, _444) { if (_444) { $assert ([_666, _444], [666, 444]); mkay () } })
            valueChanged (666) }) },

    'observable.when': function () {

        $assertEveryCalledOnce (function (mkay) {
            var value = _.observable (234)
                value.when (          234, function () { mkay () }) }) // passing constant should work

        $assertEveryCalledOnce (function (mkay) {
            var value = _.observable ()
                value.when (_.equals (432), function () { mkay () })
                value (432)
                value (234) })

        $assertNotCalled (function (mkay) {
            var value = _.observable ()
                value.when (_.equals (432), function () { mkay () })
                value (7) }) },

    'once': function () { $assertEveryCalledOnce (function (mkay) {

        var whenSomething = _.trigger ()
            whenSomething.once (mkay)
            whenSomething.once (mkay)
            whenSomething ()
            whenSomething () }) },

    '_.gatherChanges': function () {

        var valueA   = _.observable (),
            valueB   = _.observable (),
            changes  = []

        _.gatherChanges (valueA, valueB, function (a, b) {
            changes.push ([a, b]) })

        valueA (123)
        valueB (777)

        $assert (changes, [[123, undefined], [123, 777]]) },

    'context': function () {
        var trigger = _.extend (_.trigger (), { context: 42 })

        trigger (function () { $assert (this, 42) })
        trigger () },

    '_.off (bound)': function () {  var react = function () { $fail }
                                    var act = _.trigger (react)
        _.off (react)
        act () },

    '_.off (stream)': function () { var fail = function () { $fail }
                                    var act = _.trigger (fail)
        _.off (act)
        act () },

    '_.barrier (defaultListener)': function () {
        $assertEveryCalled (function (mkay) {
             _.barrier (function () { mkay () }) () }) },

    /*  Need to rewrite it for clariy
     */
    'all shit': function () {

        var obj = {
            somethingReady: _.barrier (),
            whenSomething:  _.trigger () }


        /*  Test conventional semantics (1:1 multicast)
         */
        $assertEveryCalled (function (mkay1__2, mkay2__2) {

            obj.whenSomething (mkay1__2)                // that's how you bind
            obj.whenSomething (mkay2__2)

            obj.whenSomething ()                        // that's how you trigger it
            obj.whenSomething ()     })                      


        /*  Test unbinding
         */
        $assertEveryCalledOnce (function (shouldCall) {

            var whenSomething = _.trigger ()

            var shouldBeCalled    = function () { shouldCall () },
                shouldNotBeCalled = function () { $fail }

            whenSomething (shouldBeCalled)
            whenSomething (shouldNotBeCalled)
            whenSomething.off (shouldNotBeCalled) // that's how you unbind specific listeners
            whenSomething () })


        /*  Test 'barrier' semantics + test argument passing
         */
        $assertEveryCalledOnce (function (mkay1, mkay2) {

            obj.somethingReady (function (x) {
                $assert (x === 'foo')               // you may pass arguments to callbacks
                obj.somethingReady (x)              // should not call anything
                mkay1 () })

            obj.somethingReady (function (x) {
                $assert (x === 'foo')
                mkay2 () })

            obj.somethingReady ('foo') })   // that's how you trigger it (may pass arguments)
        obj.somethingReady ('bar')          // should not call anything


        /*  Test _.allTriggered
         */
        var t1 = _.triggerOnce (), t2 = _.triggerOnce (),       // test pair1
            t3 = _.triggerOnce (), t4 = _.triggerOnce ()        // test pair2

        _.allTriggered ([t1, t2], function () { $fail }); t1 ()     // pair1: should not cause _.allTriggered to trigger

        $assertEveryCalledOnce (function (mkay) {
            _.allTriggered ([t3, t4], mkay); t3 (); t4 () })        // pair2: should trigger _.allTriggered
    },

    'call order consistency': function (done) {

        var abc = ''
        var put = function (x) { return _.barrier (function () { abc += x }) }
        var a = put ('a'),
            b = put ('b'),
            c = put ('c')

        var barr = _.barrier ()
            barr (a) (function () { barr.postpones = true; barr (c); barr.postpones = false }) (b) // C is bound after B, so it should be executed after B
            barr (true)

        _.allTriggered ([a,b,c], function () { $assert (abc, 'abc'); done () })
    },

    '_.barrier reset': function () {
        var b = _.barrier ()

        b ('not_42')
        b.reset ()

        $assertEveryCalledOnce (function (mkay) {
            b (function (value) { mkay (); $assert (value, 42) })
            b (42) }) },

    '_.barrier (value)': function () { $assertEveryCalledOnce (function (mkay) {
             var willBe42 = _.barrier (42)
        $assert (willBe42.already)
                 willBe42 (function (_42) { $assert (_42, 42); mkay () }) }) },
}

_.extend (_, {

    gatherChanges: function (observables_) {

        var observables = _.isArray (observables_) ? observables_ : _.initial (arguments)
        var accept      = _.last (arguments)
        var gather      =   function (value) {
                                accept.apply (this, _.pluck (observables, 'value')) }

        _.each (observables, function (read) {
            read (gather) }) },

    allTriggered: function (triggers, then) {
                        var triggered = []
                        if (triggers.length > 0) {
                            _.each (triggers, function (t) {
                                t (function () {
                                    triggered = _.union (triggered, [t])
                                    if (then && (triggered.length === triggers.length)) {
                                        then ()
                                        then = undefined } }) }) }
                        else {
                            then () } },

    observableRef: function (value) {
        return _.extend (_.observable.apply (this, arguments), { trackReference: true }) },

    observable: function (value) {
        var stream = _.stream ({
                        hasValue: arguments.length > 0,
                        value:    _.isFunction (value) ? undefined : value,
                        read:     _.identity,

                        read: function (schedule) {
                                return function (returnResult) {
                                    if (stream.hasValue) {
                                        returnResult.call (this, stream.value) }
                                    schedule.call (this, returnResult) } },

                        write: function (returnResult) {
                                    return function (value) {

                                        if (stream.beforeWrite) {
                                            value = stream.beforeWrite (value) }

                                        if (!stream.hasValue ||
                                            !(stream.trackReference ?
                                                (stream.value === value) :
                                                _.isEqual (stream.value, value))) {

                                            var prevValue = stream.value
                                            var hadValue = stream.hasValue

                                            stream.hasValue = true
                                            stream.value = value

                                            if (hadValue) {
                                                returnResult.call (this, false /* flush */, stream.value, prevValue) }
                                            else {
                                                returnResult.call (this, false /* flush */, stream.value) } } } } })
        if (arguments.length) {
            stream.apply (this, arguments) }

        return _.extend (stream, {

            force: function (value) {
                stream.hasValue = false
                stream (value || stream.value) },
                
            when: function (match, then) { var matchFn       = _.isFunction (match) ? match : _.equals (match),
                                               alreadyCalled = false
                stream (function (val) {
                    if (matchFn (val)) {
                        if (!alreadyCalled) {
                             alreadyCalled = true
                             stream.off (arguments.callee)
                             then.apply (this, arguments) }
                        else { 
                            /* log.w ('WTF') */ } } }) } }) },


    barrier: function (defaultValue) { var defaultListener = undefined

        if (_.isFunction (defaultValue)) {
            defaultListener = defaultValue
            defaultValue = undefined }

        var barrier = _.stream ({
                    already: defaultValue !== undefined,
                    value: defaultValue,

                    reset: function () {
                        barrier.already = false
                        delete barrier.value },

                    write: function (returnResult) {
                                return function (value) {
                                    if (!barrier.already) {
                                        barrier.already = true
                                        barrier.value = value }
                                    
                                    returnResult.call (this, true /* flush schedule */, barrier.value) } },

                    read: function (schedule) {
                                return function (returnResult) {
                                    if (barrier.already) {
                                        ((barrier.postpones || barrier.commitingReads) ? // solves problem outlined in 'call order consistency' test
                                            returnResult.postponed :
                                            returnResult).call (this, barrier.value) }
                                    else {
                                        schedule.call (this, returnResult) } } } })

        if (defaultListener) {
            barrier (defaultListener) }

        _.defineProperty (barrier, 'promise', function () {
                                                    return new Promise (function (resolve) { barrier (resolve) }) })

        return barrier },


    triggerOnce: $restArg (function () {
                var stream = _.stream ({
                                read: function (schedule) {
                                            return function (listener) {
                                                if (stream.queue.indexOf (listener) < 0) {
                                                    schedule.call (this, listener) } } },
                                write: function (writes) {
                                    return writes.partial (true) } }).apply (this, arguments); return stream }),

    trigger: $restArg (function () {
                return _.stream ({
                            read: _.identity,
                            write: function (writes) {
                                return writes.partial (false) } }).apply (this, arguments) }),

    off: function (fn, what) {
        if (fn.queue) {
            if (arguments.length === 1) { fn.queue.off ()     }
            else                        { fn.queue.off (what) } }
        if (fn.queuedBy) {
            _.each (fn.queuedBy, function (queue) { queue.remove (fn) })
             delete fn.queuedBy } },

    stream: function (cfg_) {

                var cfg         = cfg_ || {}
                var queue       = _.extend ([], { off: function (fn) { if (this.length) {
                                                    if (arguments.length === 0) {
                                                        _.each (this, function (fn) {
                                                            fn.queuedBy.remove (this) }, this)
                                                        this.removeAll () }
                                                    else {
                                                        if (fn.queuedBy) {
                                                            fn.queuedBy.remove (this)
                                                            this.remove (fn) } } } } })

                var self = undefined

                var scheduleRead = function (fn) {
                    if (queue.indexOf (fn) < 0) {
                        if (fn.queuedBy) {
                            fn.queuedBy.push (queue) }
                        else {
                            fn.queuedBy = [queue] }
                        queue.push (fn) } }

                var commitPendingReads = function (flush, __args__) {
                    var args        = _.rest (arguments),
                        context     = self.context || this,
                        schedule    = queue.copy

                    if (flush) {
                        queue.off () }

                    self.commitingReads = true

                    for (var i = 0, n = schedule.length; i < n; i++) {
                        (self.postpones ? schedule[i].postponed : schedule[i]).apply (context, args) }

                    delete self.commitingReads }

                var write = cfg.write (commitPendingReads)
                var read  = cfg.read (scheduleRead)

                /*  I/O API (two-way)
                 */
                var frontEnd  = function (fn) {
                                    if (_.isFunction (fn)) {
                                        read.call (this, fn) }

                                    else {
                                        write.apply (this, arguments) }

                                    return arguments.callee }

                /*  Once semantics
                 */
                var once = function (then) {
                                if (!_.find (queue, function (f) { return f.onceWrapped_ === then })) {
                                    read (_.extend (function (v) { _.off (self, arguments.callee); then (v) }, { onceWrapped_: then })) } }

                /*  Constructor
                 */
                return (self = _.extend ($restArg (frontEnd), cfg, {
                    queue:    queue,
                    once:     once,
                    off:    _.off.asMethod,
                    read:     read,
                    write:    write,
                    postpone: function () { this.postponed.apply (self.context, arguments) } })) } })



;

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
------------------------------------------------------------------------

Hot-wires some common C++/Java/C# ways to OOP with JavaScript's ones.

------------------------------------------------------------------------
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

_.hasOOP = true

_.withTest ('OOP', {

    '$prototype / $extends': function () {

    /*  Prototypes are defined via $prototype
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        var Foo = $prototype ({

        /*  If constructor is not defined (like here), it's default impl. will equal
            to the following:                                                               */

//          constructor: function (cfg) { _.extend (this, cfg) },

        /*  $static keyword is used to designate type-level members (context-free ones),
            effectively porting that shit from C++/C#/Java world.                           */

            method:                  function () { return 'foo.method' },
            staticMethod:   $static (function () { return 'Foo.staticMethod' }),

        /*  $property keyword is used to tag a value as an property definition.
            Property definitions expand itself within properties.js module, which
            is separate from OOP.js                                                         */

            property:                $property (function () { return 'foo.property' }),
            staticProperty: $static ($property (function () { return 'Foo.staticProperty' })),

        /*  Tags on members can be grouped like this, to reduce clutter if you have lots
            of members tagged with same keyword.                                            */

            $static: {
                $property: {
                    one: 1,
                    two: 2,
                    three: 3 } },

        /*  Demonstrates some semantics of property definitions, provided by properties.js
            See that module for further investigation.                                      */

            $property: {
                static42:       $static (42),
                just42:         42,
                just42_too:     function () { return 42 },
                fullBlown:  {
                    enumerable:     false,  // will be visible as object's own property (defaults to true)
                    configurable:   true,   // can be deleted by delete operator (defaults to false)
                    get:            function () { return 42 },
                    set:            function (x) { $stub } } } })


    /*  Inherited prototypes are defined via $extends
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        var Bar = $extends (Foo, $final ({

        /*  If constructor is not defined (like here), it's default impl.
            will be equal to the following one (calls base constructor):     */

//          constructor: function () { Foo.prototype.constructor.apply (this, arguments)) } 

            staticMethod: $static (function () {
                return 'Bar.staticMethod' }),

            method: function () {
                return 'bar.method' } }))


    /*  Instances of $prototype/$extends are created by the 'new' operator, as
        this pair of utility is just a thin wrapper over native JS prototypes.

        The 'new' operator calls 'constructor' member from a prototype
        definition. If no constructor is specified, default one takes first
        argument and extends constructed instance with it, overriding any member
        value that is specified at prototype definition (and this is a
        really common way to define prototype constructors in JavaScript)

        Such semantics could be treated as somewhat similar to the 'anonymous
        classes' feature in Java, which is a useful mechanism for ad-hoc
        specialization of constructed prototypes.   
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        var foo = new Foo ()
        var fuu = new Foo ({ method: function () { return 'fuu.method' }})
        var bar = new Bar ({ hi: 'there' })

        $assert (bar.hi         === 'there')
        $assert (fuu.method ()  === 'fuu.method')

        $assert ([foo.just42,   bar.just42],   [42, 42])        //  inheritance should work
        $assert ([Foo.static42, Bar.static42], [42, undefined]) //  (static members do not inherit)

    /*  Overriding should work
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        $assert ([foo.method (),        bar.method ()],         ['foo.method',       'bar.method'])
        $assert ([Foo.staticMethod (),  Bar.staticMethod ()],   ['Foo.staticMethod', 'Bar.staticMethod'])

    /*  Regular members shouln't be visible at type level
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        $assert ([foo.property,         foo.staticProperty], ['foo.property',       undefined])
        $assert ([Foo.staticProperty,   Foo.property],       ['Foo.staticProperty', undefined])

    /*  Until explicitly stated otherwise, properties are constant.
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        $assertThrows (function () { foo.just42 = 43 },
            _.matches ({ message: 'cannot change just42 (as it\'s sealed to 42)' })) },


/*  Use $final to tag a thing as non-overrideable (comes from Java)
    ======================================================================== */

    '$final': function () {

    /*  Tagging arbitrary member as $final
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        $assertThrows (function () {

            var A = $prototype ({
                        constructor: $final (function () {}) })

            var B = $extends (A, {
                        constructor: function () {} }) },   // will throw Error

            _.matches ({ message: 'Cannot override $final constructor' }))

    /*  Tagging whole prototype as $final
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        $assertThrows (function () {

            var A = $prototype ($final ({}))
            var B = $extends (A) }, // will throw Error

             _.matches ({ message: 'Cannot derive from $final-marked prototype' })) },


/*  Use $alias to make member aliases with correct semantics
    ======================================================================== */

    '$alias': function () {

        var foo = new ($prototype ({

            error: function () { return 'foo.error' },

            failure:              $alias ('error'),
            crash:                $alias ('error'),
            finalCrash:   $final ($alias ('crash')) /* chaining works */        })) ()
                
                var def = foo.constructor.$definition

                $assert (foo.finalCrash, foo.crash, foo.failure, foo.error) // all point to same function

                $assert    (def.finalCrash.$final)   // you can add new tags to alias members
                $assertNot (def.crash.$final)        // adding tags to alias members does not affect original members 
                $assertNot (def.error.$final)

        /*  Ad-hoc property aliases (applicable even when there's no explicitly declared member at what alias points to)
         */
        var size = new ($prototype ({
            w:  $alias ($property ('x')),
            h:  $alias ($property ('y')) })) ()

                $assert ([size.x = 42, size.y = 24], [size.w, size.h], [42, 24]) },


/*  Static (compile-time) constructor gets called at prototype generation
    ======================================================================== */

    '$constructor': function () {
        $assertEveryCalledOnce (function (mkay) {
            var foo = new ($prototype ({
                $constructor: function () {
                    mkay ()  } })) }) },


/*  Run-time type information APIs
    ======================================================================== */

    'RTTI': function () {

        var Foo = $prototype ({ $static: { noop: _.noop } }),
            Bar = $extends (Foo) // empty definition argument read as {}

        var foo = new Foo (),
            bar = new Bar ()

    /*  Basically, the simplest way to check a type, relying on some native JavaScript prototype semantics.
        But it does not account inheritance.
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        $assert (foo.constructor === Foo)
        $assert (bar.constructor === Bar)

    /*  A functional crossbrowser version of 'instanceof' (accounts inheritance):
     
            1.  Boils down to native 'instanceof' where available
            2.  In elder browsers, emulates with correct semantics
     
        Why use (instead of native syntax):
        
            -   cross-browser
            -   functional (can be partial'ed to yield a predicate)
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        $assert (_.isTypeOf (Function,  foo.constructor.noop))           
        $assert (_.isTypeOf (Tags,      foo.constructor.$definition.noop)) // note how $static group is collapsed to normal form

    /*  Infix version (a static member of every $prototype)
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        $assert ( Foo.isTypeOf (foo))
        $assert (!Bar.isTypeOf (foo))
        $assert (Bar.isTypeOf (bar))
        $assert (Foo.isTypeOf (bar))

    /*  Another infix version (a member of every $prototype)
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        $assert ( foo.isInstanceOf (Foo))
        $assert (!foo.isInstanceOf (Bar))
        $assert (bar.isInstanceOf (Bar))
        $assert (bar.isInstanceOf (Foo))

    /*  A private impl of isTypeOf (one shouldn't invoke these directly)
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        $assert (_.isTypeOf_ES5 (Bar, bar))     // isTypeOf impl. for ECMAScript level 5
        $assert (_.isTypeOf_ES5 (Foo, bar))     // (validate inheritance)

        $assert (_.isTypeOf_ES4 (Bar, bar))     // isTypeOf impl. for ECMAScript level 4 (IE8 and below)
        $assert (_.isTypeOf_ES4 (Foo, bar)) },  // (validate inheritance)


/*  This is how to decide whether a function is $prototype constructor
    ======================================================================== */

    'isConstructor': function () {

        var Proto = $prototype (),  // empty argument read as {}
            dummy = function () {}

        $assert ($prototype.isConstructor (Proto), true)
        $assert ($prototype.isConstructor (dummy), false)
        $assert ($prototype.isConstructor (null),  false) // regression

        $assert ([Proto, dummy].map ($prototype.isConstructor), [true, false]) },


/*  $prototype.inheritanceChain for traversing inheritance chain
    ======================================================================== */

    'inheritanceChain': function () {

        var A = $prototype ()
        var B = $extends (A)
        var C = $extends (B)

        $assert ($prototype.inheritanceChain (C), [C,B,A]) },

/*  $prototype.defines for searching for members on definition chain
    ======================================================================== */

    'defines': function () {

        var A = $prototype ({ toString: function () {} })
        var B = $extends (A)
        var C = $prototype ()

        $assert ([$prototype.defines (B, 'toString'),
                  $prototype.defines (C, 'toString')], [true, false]) },

/*  $prototype is really same as $extends, if passed two arguments
    ======================================================================== */

    'two-argument syntax of $prototype': function () {

        var A = $prototype ()
        var B = $prototype (A, {}) // same as $extends (Base, def)

        $assert (B.$base === A.prototype) },


/*  Adds value contracts to arguments for unit testing purposes
    ======================================================================== */

    'value contracts for arguments': function () {

        var Proto = $prototype ($testArguments ({

            frobnicate:  function (_777, _foo_bar_baz, unaffected) {},
            noMistake:   function () {} }))

        var obj = new Proto ()

        $assertFails (function () {
            obj.frobnicate (999, 'not right') })

        obj.frobnicate (777, 'foo bar baz')
        obj.noMistake () },


/*  You can enumerate members grouped by tag name via $membersByTag
    ======================================================================== */

    '$membersByTag': function () {

        var foo = $static ($property (1)),
            bar =          $property (2)

        $assertMatches ($prototype ({ foo: foo, bar: bar }).$membersByTag, { 'static'  : { 'foo': foo },
                                                                             'property': { 'foo': foo, 'bar': bar } }) },


/*  Tags on definition render to static properties
    ======================================================================== */

    'tags on definition': function () {

        $assertMatches ($prototype ($static ($final ({}))), { $static: true, $final: true }) },


/*  $mixin to extend existing types with $prototype-style definitions
    ======================================================================== */

    '$mixin': function () { var Type = $prototype ()

        $mixin (Type, {
            twentyFour: $static ($property (24)),
            fourtyTwo:           $property (42) })

        $assert ([Type    .twentyFour,
             (new Type ()).fourtyTwo], [24, 42]) }                                  }, function () {


/*  PUBLIC API
    ======================================================================== */

    _(['property', 'static', 'final', 'alias', 'memoized', 'private', 'builtin', 'hidden', 'testArguments'])
        .each (_.defineTagKeyword)

    $prototype = function (arg1, arg2) {
                    return $prototype.impl.compile.apply ($prototype.impl,
                                (arguments.length > 1)
                                    ? _.asArray (arguments).reverse ()
                                    : arguments) }

    $extends = function (base, def) {
                    return $prototype (base, def || {}) }

    $mixin = function (constructor, def) {
        return $prototype.impl.compileMixin (_.extend (def, { constructor: constructor })) }

    _.extend ($prototype, {

        isConstructor: function (what) {
            return _.isPrototypeConstructor (what) },

        macro: function (arg, fn) {
            if (arguments.length === 1) {
                $prototype.impl.alwaysTriggeredMacros.push (arg) }
            else {
                $prototype.impl.memberNameTriggeredMacros[arg] = fn } },

        macroTag: function (name, fn) { _.defineTagKeyword (name)
            $prototype.impl.tagTriggeredMacros[_.keyword (name)] = fn },

        each: function (visitor) { var namespace = $global
            for (var k in namespace) {
                if (!_.isKeyword (k)) { var value = namespace[k]
                    if ($prototype.isConstructor (value)) {
                        visitor (value, k) } } } },

        defines: function (constructor, member) {
            return (_.find ($prototype.inheritanceChain (constructor), function (supa) {
                        return (supa.$definition && supa.$definition.hasOwnProperty (member)) || false })) ? true : false },

        inheritanceChain: function (def) { var chain = []
            while (def) {
                chain.push (def)
                def = def.$base && def.$base.constructor }
            return chain },

        wrapMethods: function (def, op) {
                        return Tags.map (def, function (fn, k, t) {
                            return _.isFunction (fn) ? op (fn, k, t).wraps (fn) : fn }) },


    /*  INTERNALS
        ==================================================================== */

        impl: {

            alwaysTriggeredMacros:     [],
            memberNameTriggeredMacros: {},
            tagTriggeredMacros:        {},

            compile: function (def, base) {    var impl = ((base && base.$impl) || this)
                                    return $untag (impl
                                                    .sequence (def, base)
                                                    .call (impl, def || {})
                                                    .constructor) },

            sequence: function (def, base) { return _.sequence (

                /*  TODO: optimize performance (there's PLENTY of room to do that)
                 */
                this.extendWithTags,
                this.flatten,
                this.generateCustomCompilerImpl (base),
                this.generateArgumentContractsIfNeeded,
                this.ensureFinalContracts (base),
                this.generateConstructor (base),
                this.evalAlwaysTriggeredMacros (base),
                this.evalMemberTriggeredMacros (base),
                this.contributeTraits (base),
                this.evalPrototypeSpecificMacros (base),
                this.generateBuiltInMembers (base),
                this.callStaticConstructor,
                this.expandAliases,
                this.groupMembersByTagForFastEnumeration,
                this.defineStaticMembers,
                this.defineInstanceMembers) },

            compileMixin: function (def) {
                return _.sequence (
                    this.flatten,
                    this.contributeTraits (),
                    this.expandAliases,
                    this.evalMemberTriggeredMacros (),
                    this.defineStaticMembers,
                    this.defineInstanceMembers).call (this, def || {}).constructor },

            flatten: function (def) {
                var tagKeywordGroups    = _.pick (def, this.isTagKeywordGroup)
                var mergedKeywordGroups = _.object (_.flatten (_.map (tagKeywordGroups, function (membersDef, keyword) {
                    return _.map (this.flatten (membersDef), function (member, memberName) {
                        return [memberName, $global[keyword] (member)] }) }, this), true))

                var memberDefinitions   = _.omit (def, this.isTagKeywordGroup)

                return _.extend (memberDefinitions, mergedKeywordGroups) },

            evalAlwaysTriggeredMacros: function (base) {
                return function (def) { var macros = $prototype.impl.alwaysTriggeredMacros
                    for (var i = 0, n = macros.length; i < n; i++) {
                        def = (macros[i] (def, base)) || def }
                    return def } },

            evalMemberTriggeredMacros: function (base) {
                return function (def) { var names = $prototype.impl.memberNameTriggeredMacros,
                                            tags  = $prototype.impl.tagTriggeredMacros
                    _.each (def, function (value, name) {
                        if (names.hasOwnProperty (name)) {
                            def = (names[name] (def, value, name, base)) || def }
                        _.each (_.keys (value), function (tag) { if (tags.hasOwnProperty (tag)) {
                            def = (tags [tag] (def, value, name, base)) || def } }) })
                     return def } },

            evalPrototypeSpecificMacros: function (base) { return function (def) {
                if (!def.isTraitOf) {
                    var macroTags = $untag (def.$macroTags || (base && base.$definition && base.$definition.$macroTags))
                    if (macroTags) {
                        this.applyMacroTags (macroTags, def) } } return def } },

            applyMacroTags: function (macroTags, def) {
                 _.each (def, function (memberDef, memberName) {
                            _.each (macroTags, function (macroFn, tagName) { memberDef = def[memberName]
                                if (_.keyword (tagName) in memberDef) {
                                    def[memberName] = macroFn.call (def, def, memberDef, memberName) || memberDef } }, this) }, this); return def },

            generateCustomCompilerImpl: function (base) {
                return function (def) {
                    if (def.$impl) {
                        def.$impl = _.extend (Object.create ((base && base.$impl) || this), def.$impl) // sets prototype to base.$impl || this
                        def.$impl = $static ($builtin ($property (def.$impl))) }
                    else if (base && base.$impl) {
                        def.$impl = $static ($builtin ($property (base.$impl))) }
                    return def } },

            generateArgumentContractsIfNeeded: function (def) {
                return def.$testArguments ? $prototype.wrapMethods (def, function (fn, name) {
                                                                     return function () { var args = _.asArray (arguments)
                                                                        $assertArguments (args.copy, fn.original, name)
                                                                         return fn.apply (this, args) } }) : def },
            contributeTraits: function (base) {
                        return function (def) {
                
                if (def.$traits) { var traits = def.$traits

                    this.mergeTraitsMembers (def, traits, base)

                    def.$traits  = $static ($builtin ($property (traits)))
                    def.hasTrait = $static ($builtin (function (Constructor) {
                        return traits.indexOf (Constructor) >= 0 })) }

                return def } },

            mergeTraitsMembers: function (def, traits, base) {
                _.each (traits, function (trait) {
                    _.defaults (def, _.omit (trait.$definition,
                        _.or ($builtin.matches, _.key (_.equals ('constructor'))))) }) },

            extendWithTags: function (def) {                    
                return _.extendWith ($untag (def), _.mapObject (Tags.get (def), $static.arity1)) },

            callStaticConstructor: function (def) { 
                if (!def.isTraitOf) { 
                    _.each ($untag (def.$traits), function (T) {
                                                    if (T.$definition.$constructor) {
                                                        $untag (T.$definition.$constructor).call (def) } })
                    if (def.$constructor) {
                        $untag (def.$constructor).call (def) } } return def },

            generateConstructor: function (base) { return function (def) {
                return _.extend (def, { constructor:
                    Tags.modify (def.hasOwnProperty ('constructor') ? def.constructor : this.defaultConstructor (base),
                        function (fn) {
                            if (base) { fn.prototype = Object.create (base.prototype);
                                        fn.prototype.constructor = fn }
                            return fn }) }) } },

            generateBuiltInMembers: function (base) { return function (def) {

                if (def.$constructor) {
                    def.$constructor = $builtin ($static (def.$constructor)) }

                return _.defaults (def, {
                    $base:          $builtin ($static ($property (_.constant (base && base.prototype)))),
                    $definition:    $builtin ($static ($property (_.constant (_.extend ({}, base && base.$definition, def))))),
                    isTypeOf:       $builtin ($static (_.partial (_.isTypeOf, $untag (def.constructor)))),
                    isInstanceOf:   $builtin (function (constructor) { return _.isTypeOf (constructor, this) }),
                    $:              $builtin ($prototype.impl.$) }) }},

            $: function (fn) { return _.$.apply (null, [this].concat (_.asArray (arguments))) },
            
            defaultConstructor: function (base) {
                return (base ?
                    function ()    { base.prototype.constructor.apply (this, arguments) } :
                    function (cfg) { _.extend (this, cfg || {}) }) },

            defineStaticMembers: function (def) {
                this.defineMembers ($untag (def.constructor), _.pick (def, $static.matches))
                return def },

            defineInstanceMembers: function (def) {
                this.defineMembers ($untag (def.constructor).prototype, _.omit (def, $static.matches))
                return def },

            defineMembers: function (targetObject, def) {
                _.each (def, function (value, key) {
                    if (key !== 'constructor' && def.hasOwnProperty (key)) {
                        this.defineMember (targetObject, value, key) } }, this) },

            defineMember: function (targetObject, def, key) {
                if (def && def.$property) {
                    if (def.$memoized) {
                        _.defineMemoizedProperty (targetObject, key, def) }
                    else {
                        _.defineProperty (targetObject, key, def, def.$hidden ? { enumerable: false } : {}) } }
                else {
                    var what = $untag (def)
                    targetObject[key] = what } },

            ensureFinalContracts: function (base) { return function (def) {
                                        if (base) {
                                            if (base.$final) {
                                                throw new Error ('Cannot derive from $final-marked prototype') }

                                            if (base.$definition) {
                                                var invalidMembers = _.intersection (
                                                    _.keys (_.pick (base.$definition, $final.matches)),
                                                    _.keys (def))
                                                if (invalidMembers.length) {
                                                    throw new Error ('Cannot override $final ' + invalidMembers.join (', ')) } } }

                                        return def } },

            expandAliases: function (def) {
                                _.each (def, function (v, k) { def[k] = this.resolveMember (def, k, v)[1] }, this); return def },

            resolveMember: function (def, name, member) { member = member || def[name]

                                if ($alias.is (member)) { var ref      = this.resolveMember (def, $untag (member))
                                                          var refName  = ref[0]
                                                          var refValue = ref[1]

                                    return [refName, ($property.is (member) ?
                                                      $property ({ get: function ()  { return this[refName]     },
                                                                   set: function (x) {        this[refName] = x } }) : Tags.extend (refValue, Tags.omit (member, '$alias'))) ] }

                                else { return [name, member] } },

            groupMembersByTagForFastEnumeration: function (def) { var membersByTag = {}

                                                    _.each (def, function (m, name) {
                                                        Tags.each (m, function (tag) {
                                                            (membersByTag[tag] = (membersByTag[tag] || {}))[name] = m }) })

                                                    def.$membersByTag = $static ($builtin ($property (membersByTag))); return def },

            isTagKeywordGroup: function (value_, key) { var value = $untag (value_)
                return _.isKeyword (key) && _.isFunction ($global[key]) && (typeof value === 'object') && !_.isArray (value) },

            modifyMember: function (member, newValue) {
                return ($property.is (member) && Tags.modify (member, function (value) { return _.extend (value, _.map2 (_.pick (value, 'get', 'set'), newValue)) })) ||
                       (_.isFunction ($untag (member)) && Tags.modify (member, newValue)) || member } } }) })


/*  $trait  A combinatoric-style alternative to inheritance.
            (also known as "mixin" in some languages)
    ======================================================================== */

    _.withTest (['OOP', '$traits'], function () {

        var Closeable = $trait ({
            close: function () {} })

        var Movable = $trait ({
            move: function () {} })

        var Enumerable = $trait ({
            each: function (iter) {},
            length: $property (function () { return 0; }) })

        var JustCloseable     = $prototype ({ $traits: [Closeable] })
        var MovableEnumerable = $prototype ({ $traits: [Movable, Enumerable], move: function () {} })

        var movableEnumerable = new MovableEnumerable ()

        $assert (movableEnumerable.move === MovableEnumerable.prototype.move)

        $assertThrows (function () { new Closeable () },
            _.matches ({ message: 'Traits are not instantiable (what for?)' }))

        $assertTypeMatches (movableEnumerable, {
            move: 'function',
            each: 'function',
            length: 'number' })

        $assert ([
            movableEnumerable.isInstanceOf (Movable),
            movableEnumerable.isInstanceOf (Enumerable),
            movableEnumerable.isInstanceOf (Closeable)], [true, true, false])

        $assert (Movable.isTypeOf (movableEnumerable))
        $assert (Movable.isTraitOf (movableEnumerable))

        $assert (MovableEnumerable.hasTrait (Enumerable))

        $assertMatches (MovableEnumerable,  { $traits: [Movable, Enumerable] })
        $assertMatches (JustCloseable,      { $traits: [Closeable] })

        $assertCallOrder (function (t1_constructed, t2_constructed, proto_constructed) {

            var T1, T2

            $assertNotCalled (function (not_now) {
                T1 = $trait ({ $constructor: function () { not_now (); t1_constructed () } })
                T2 = $trait ({ $constructor: function () { not_now (); t2_constructed () } }) })

            var Proto = $prototype ({
                            $traits: [T1, T2],
                            $constructor: function () { proto_constructed () } }) })

}, function () {

    _.isTraitOf = function (Trait, instance) {
        var constructor = instance && instance.constructor
        return (constructor &&
            constructor.hasTrait &&
            constructor.hasTrait (Trait)) || false }    //  indexOf is fast if has 1-2 traits,
                                                        //  no need to pre-index
    _.isTypeOf = _.or (_.isTypeOf, _.isTraitOf)

    $trait = function (arg1, arg2) {
        var constructor = undefined
        var def = _.extend (arguments.length > 1 ? arg2 : arg1, {
                        constructor: _.throwsError ('Traits are not instantiable (what for?)'),
                          isTraitOf: $static ($builtin (function (instance) {
                            return _.isTraitOf (constructor, instance) })) })

        return (constructor = $prototype.impl.compile (def, arguments.length > 1 ? arg1 : arg2)) } })


/*  $macroTags
    ======================================================================== */

    $prototype.macro ('$macroTags', function (def, value, name) {
        _.each ($untag (value), function (v, k) { _.defineTagKeyword (k) }) })


/*  Context-free implementation of this.$
    ======================================================================== */

    _.$ = function (this_, fn) { var arguments_ = _.rest (arguments, 2)

        var result = (arguments_.length) ?
                        _.bind.apply (undefined, [fn, this_].concat (_.rest (arguments, 2))) :
                        _.withSameArgs (fn, function () { return fn.apply (this_, arguments) }) // @hide
        
        //result.context = this_

        return result }


/*  Adds this.$ to jQuery objects (to enforce code style consistency)
    ======================================================================== */

    if (typeof jQuery !== 'undefined') {
        jQuery.fn.extend ({ $: function () { return _.$.apply (null, [this].concat (_.asArray (arguments))) } })}


/*  $const (xxx) as convenient alias for $static ($property (xxx))
    ======================================================================== */
 
    _.withTest (['OOP', '$const'], function () {
 
        var A = $prototype ({
            $const: {
                foo: 'foo',
                bar: 'bar' },
            qux: $const ('qux'),
            zap: $const ('zap') })
 
        $assert ([A.foo, A.bar, A.qux, A.zap], ['foo', 'bar', 'qux', 'zap'])
        $assertThrows (function () { A.foo = 'bar '}) }, function () {

    _.defineKeyword ('const', function (x) { return $static ($property (x)) })  })



/*  Dual call interface
    ======================================================================== */

    /*  method → free function
     */
    _.withTest (['OOP', '$callableAsFreeFunction'], function () {

            var X = $prototype ({
                foo: $callableAsFreeFunction ($property (function () { $assert (this._42, 42); return 42 })) })

                x = new X ({ _42: 42 })

            $assert (x.foo, X.foo (x), 42) },       function () {

                /*  Impl
                 */
                _.defineTagKeyword  ('callableAsFreeFunction')
                $prototype.macroTag ('callableAsFreeFunction',
                    function (def, value, name) {
                              def.constructor[name] = $untag (value).asFreeFunction
                       return def }) })

    /*  free function → method
     */
    _.withTest (['OOP', '$callableAsMethod'],       function () {

            var X = $prototype ({
                foo: $callableAsMethod (function (this_, _42) { $assert (this_._42, _42, 42); return 42 }) })

                x = new X ({ _42: 42 })

            $assert (x.foo (42), X.foo (x, 42), 42) },  function () {

                /*  Impl 
                 */
                _.defineTagKeyword  ('callableAsMethod')
                $prototype.macroTag ('callableAsMethod',
                    function (def, value, name) {
                              def[name] = Tags.modify (value, _.asMethod)
                              def.constructor[name] = $untag (value)
                       return def }) })


/*  $singleton (a humanized macro to new ($prototype (definition)))
    ======================================================================== */

     _.withTest (['OOP', '$singleton'], function () { $assertEveryCalledOnce (function (baseConstructor, derivedConstructor) {

            var Base    = $prototype ({
                            method:    _.constant (42) })

        /*  returns constructed instance of a definition passed as argument
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

            var Simple  = $singleton ({
                            constructor: function () { baseConstructor () },
                            method:      function () { return 42 } })

        /*  can inherit from a prototype
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

            var Derived = $singleton (Base, {
                            constructor: function () { derivedConstructor (); Base.prototype.constructor.apply (this, arguments) } })

            $assert (Simple.method (), Derived.method (), 42) })

        /*  inner prototypes
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

            var Outside = $singleton ({
                Inside: $prototype ({ foo: function () {} }) })

            $assertTypeMatches ((new Outside.Inside ()).foo,  'function')           }, function () {

        /*  IMPLEMENTATION
            ==================================================================== */

            $singleton = function (arg1, arg2) {
                    return new ($prototype.apply (null, arguments)) () } })

;


/*  TODO:   UNIT TEST DAT MUTHAFUCKA
 */


/*  Context-free math functions
    ======================================================================== */

_.clamp = function (n, min, max) {
    return Math.max (min, Math.min (max, n)) }

_.lerp = function (t, min, max) {
    return min + (max - min) * t }

_.rescale = function (v, from, to, opts) { var unit = (v - from[0]) / (from[1] - from[0])
    return _.lerp (opts && opts.clamp ? _.clamp (unit, 0, 1) : unit, to[0], to[1]) }

_.rescaleClamped = function (v, from, to) { return _.rescale (v, from, to, { clamp: true }) }

_.sqr = function (x) { return x * x }


/*  Math.sign (missing from Safari)
    ======================================================================== */

if (!Math.sign) {
    Math.sign = function (x) {
        return (x < 0) ? -1 : ((x > 0) ? 1 : 0) } }

/*  Intersections (draft)
    ======================================================================== */

Intersect = {

    rayCircle: function (origin, d, center, r) {

        var f = origin.sub (center)
        var a = d.dot (d)

        var b = 2.0 * f.dot (d)
        var c = f.dot (f) - r*r

        var discriminant = b*b - 4.0*a*c
        if (discriminant < 0) {
            return undefined }

        else {
            discriminant = Math.sqrt (discriminant)

            var t1 = (-b - discriminant) / (2.0 * a)
            var t2 = (-b + discriminant) / (2.0 * a)

            if ((t1 >= 0) && (t1 <= 1)) {
                return { time: t1, where: origin.add (d.scale (t1)) } }

            if ((t2 >= 0) && (t2 <= 1)) {
                return { time: t2, where: origin.add (d.scale (t2)), insideOut: true } }

            return undefined } }
}

/*  2-dimensional vector
    ======================================================================== */

Vec2 = $prototype ({

    $static: {
        xx:          function (x)   { return new Vec2 (x,x) },
        xy:          function (x,y) { return new Vec2 (x,y) },
        x:           function (x)   { return new Vec2 (x,0) },
        y:           function (y)   { return new Vec2 (0,y) },
        zero:        $property (function () { return new Vec2 (0, 0) }),
        unit:        $property (function () { return new Vec2 (1, 1) }),
        one:         $alias ('unit'),
        lt:          $alias ('fromLT'),
        wh:          $alias ('fromWH'),
        fromLT:      function (lt) { return lt && (new Vec2 (lt.left, lt.top)) },
        fromWH:      function (wh) { return wh && (new Vec2 (wh.width, wh.height)) },
        fromLeftTop:     $alias ('fromLT'),
        fromWidthHeight: $alias ('fromWH'),
        lerp:        function (t, a, b) { return new Vec2 (_.lerp (t, a.x, b.x), _.lerp (t, a.y, b.y)) },
        clamp:       function (n, a, b) { return new Vec2 (_.clamp (n.x, a.x, b.x), _.clamp (n.y, a.y, b.y)) } },

    constructor: function (x, y) {
        if (arguments.length === 1) {
            if (_.isNumber (x)) {
                this.x = this.y = x }
            else {
                this.x = x.x
                this.y = x.y } }
        else {
            this.x = x
            this.y = y } },

    w: $alias ($property ('x')),
    h: $alias ($property ('y')),

    length:        $property (function () { return Math.sqrt (this.lengthSquared) }),
    lengthSquared: $property (function () { return this.x * this.x + this.y * this.y }),

    distance: function (pt) { return this.sub (pt).length },

    aspect: $property (function () { return this.x / this.y }),

    add: function (a, b) {
        if (b === undefined) {
            return (typeof a === 'number') ?
                new Vec2 (this.x + a,   this.y + a) :
                new Vec2 (this.x + a.x, this.y + a.y) }
        else {
            return new Vec2 (this.x + a, this.y + b) } },

    aspect: $property (function () { return this.w / this.h }),

    dot: function (other) {
        return this.x * other.x + this.y * other.y },

    sub: function (other) {
        return new Vec2 (this.x - other.x, this.y - other.y) },

    scale: function (tx, ty) {
        return new Vec2 (this.x * tx, this.y * (ty === undefined ? tx : ty)) },

    mul: function (other) {
        return new Vec2 (this.x * other.x, this.y * other.y) },

    divide: function (other) {
        return new Vec2 (this.x / other.x, this.y / other.y) },

    normal: $property (function () {
        return this.scale (1.0 / this.length) }),

    perp: $property (function () {
        return new Vec2 (this.y, -this.x) }),

    half: $property (function () {
        return new Vec2 (this.x * 0.5, this.y * 0.5) }),

    inverse: $property (function () {
        return new Vec2 (-this.x, -this.y) }),

    asArray: $property (function () {
        return [this.x, this.y] }),

    asLeftTop: $property (function () {
        return { left: this.x, top: this.y } }),

    asLeftTopMargin: $property (function () {
        return { marginLeft: this.x, marginTop: this.y } }),

    asWidthHeight: $property (function () {
        return { width: this.x, height: this.y } }),

    asTranslate: $property (function () {
        return 'translate(' + this.x + ' ' + this.y + ')' }),

    separatedWith: function (sep) {
        return this.x + sep + this.y },

    floor: $property (function () {
                        return new Vec2 (Math.floor (this.x), Math.floor (this.y)) }),

    sum: $static (function (arr) {
                    return _.reduce ((_.isArray (arr) && arr) || _.asArray (arguments),
                        function (memo, v) { return memo.add (v || Vec2.zero) }, Vec2.zero) }),

    toString: function () {
        return '{' + this.x + ',' + this.y + '}' },

    projectOnCircle: function (center, r) {
        return center.add (this.sub (center).normal.scale (r)) },

    projectOnLineSegment: function (v, w) {
        var wv = w.sub (v)
        var l2 = wv.lengthSquared
        if (l2 == 0) return v
        var t = this.sub (v).dot (wv) / l2
        if (t < 0) return v
        if (t > 1) return w
        return v.add (wv.scale (t)) },

    projectOnRay: function (origin, dir) { 
        var l2 = dir.lengthSquared
        if (l2 == 0) return 0
        return this.sub (origin).dot (dir) / l2 } })


/*  Cubic bezier
    ======================================================================== */

Bezier = {

    cubic: function (t, p0, p1, p2, p3) {
        var cube = t * t * t
        var square = t * t
        var ax = 3.0 * (p1.x - p0.x);
        var ay = 3.0 * (p1.y - p0.y);
        var bx = 3.0 * (p2.x - p1.x) - ax;
        var by = 3.0 * (p2.y - p1.y) - ay;
        var cx = p3.x - p0.x - ax - bx;
        var cy = p3.y - p0.y - ay - by;
        var x = (cx * cube) + (bx * square) + (ax * t) + p0.x;
        var y = (cy * cube) + (by * square) + (ay * t) + p0.y;
        return new Vec2 (x, y) },
        
    cubic1D: function (t, a, b, c, d) {
        return Bezier.cubic (t, Vec2.zero, new Vec2 (a, b), new Vec2 (c, d), Vec2.one).y },

    make: {
        
        cubic:   function (a,b,c,d) { return function (t) { return Bezier.cubic   (t,a,b,c,d) } },
        cubic1D: function (a,b,c,d) { return function (t) { return Bezier.cubic1D (t,a,b,c,d) } } } }


/*  Bounding box (2D)
    ======================================================================== */

BBox = $prototype ({

    $static: {

        zero: $property (function () {
            return new BBox (0, 0, 0, 0) }),

        unit: $property (function () {
            return new BBox (0, 0, 1, 1) }),

        rect: $property (function (sideSize) {
            return new BBox (0, 0, sideSize, sideSize) }),

        fromLeftTopAndSize: function (pt, size) {
            return BBox.fromLTWH ({ left: pt.x, top: pt.y, width: size.x, height: size.y }) },

        fromLTWH: function (l,t,w,h) {
            if (arguments.length === 1) { return l && (BBox.fromLTWH (l.left, l.top, l.width, l.height)) }
                                   else { return new BBox (l + w / 2.0, t + h / 2.0, w, h) } },

        fromLTRB: function (l,t,r,b) {
            if (arguments.length === 1) { return l && (BBox.fromLTRB (l.left, l.top, l.right, l.bottom)) }
                                   else { return new BBox (_.lerp (0.5, l, r), _.lerp (0.5, t, b), r - l, b - t) } },

        fromSizeAndCenter: function (size, center) {
            return new BBox (center.x - size.x / 2.0, center.y - size.y / 2.0, size.x, size.y) },

        fromSize: function (a, b) {
            if (b) { return new BBox (-a / 2.0, -b / 2.0, a, b) }
              else { return new BBox (-a.x / 2.0, -a.y / 2.0, a.x, a.y) } },

        fromPoints: function (pts) { var l = Number.MAX_VALUE, t = Number.MAX_VALUE, r = Number.MIN_VALUE, b = Number.MIN_VALUE
            _.each (pts, function (pt) {
                l = Math.min (pt.x, l)
                t = Math.min (pt.y, t)
                r = Math.max (pt.x, r)
                b = Math.max (pt.y, b) })
            return BBox.fromLTRB (l, t, r, b) } },

    constructor: function (x, y, w, h) {
        if (arguments.length == 4) {
            this.x = x
            this.y = y
            this.width = w
            this.height = h }
        else {
            _.extend (this, x) } },

    classifyPoint: function (pt) {
        
        var sides = _.extend (

            (pt.x > this.right)   ? { right   : true } : {},
            (pt.x < this.left)    ? { left    : true } : {},
            (pt.y > this.bottom)  ? { bottom  : true } : {},
            (pt.y < this.top)     ? { top     : true } : {})
        
        return _.extend (sides,

            (!sides.left &&
             !sides.right &&
             !sides.bottom && !sides.top) ? { inside: true } : {}) },

    classifyRay: function (origin, delta, cornerRadius) {

        var half = this.size.half
        var farTime, farTimeX, farTimeY, nearTime, nearTimeX, nearTimeY, scaleX, scaleY, signX, signY

        scaleX = 1.0 / delta.x
        scaleY = 1.0 / delta.y
        signX  = Math.sign (scaleX)
        signY  = Math.sign (scaleY)

        nearTimeX = (this.x - signX * half.x - origin.x) * scaleX
        nearTimeY = (this.y - signY * half.y - origin.y) * scaleY
        farTimeX =  (this.x + signX * half.x - origin.x) * scaleX
        farTimeY =  (this.y + signY * half.y - origin.y) * scaleY

        if (nearTimeX > farTimeY || nearTimeY > farTimeX) {
            return undefined }

        nearTime = nearTimeX > nearTimeY ? nearTimeX : nearTimeY
        farTime  = farTimeX  < farTimeY  ? farTimeX  : farTimeY

        if (nearTime >= 1 || farTime <= 0) {
            return undefined }

        var hit = { time: _.clamp (nearTime, 0, 1) }
        
        if (nearTimeX > nearTimeY) {
            hit.normal = new Vec2 (-signX, 0) }
        else {
            hit.normal = new Vec2 (0, -signY) }

        hit.delta = delta.scale (hit.time)
        hit.where = origin.add (hit.delta)

        if (cornerRadius) { var inner = this.grow (-cornerRadius)

            if (hit.where.x > inner.right) {
                if (hit.where.y < inner.top) {
                    hit = Intersect.rayCircle (origin, delta, inner.rightTop, cornerRadius) }
                else if (hit.where.y > inner.bottom) {
                    hit = Intersect.rayCircle (origin, delta, inner.rightBottom, cornerRadius) } }

            else if (hit.where.x < inner.left) {
                if (hit.where.y < inner.top) {
                    hit = Intersect.rayCircle (origin, delta, inner.leftTop, cornerRadius) }
                else if (hit.where.y > inner.bottom) {
                    hit = Intersect.rayCircle (origin, delta, inner.leftBottom, cornerRadius) } }

            if (hit && hit.insideOut) {
                hit.where = origin } }

        return hit
    },

    nearestPointTo: function (pt, cornerRadius) { var r = cornerRadius || 0

        var a = new Vec2 (this.left,  this.top),
            b = new Vec2 (this.right, this.top),
            c = new Vec2 (this.right, this.bottom),
            d = new Vec2 (this.left,  this.bottom)

        var pts = [ pt.projectOnLineSegment (a.add (r, 0),  b.add (-r, 0)),  // top
                    pt.projectOnLineSegment (b.add (0, r),  c.add (0, -r)),  // right
                    pt.projectOnLineSegment (c.add (-r, 0), d.add (r, 0)),   // bottom
                    pt.projectOnLineSegment (d.add (0, -r), a.add (0, r)),   // left

                    pt.projectOnCircle (a.add ( r,  r), r),
                    pt.projectOnCircle (b.add (-r,  r), r),
                    pt.projectOnCircle (c.add (-r, -r), r),
                    pt.projectOnCircle (d.add ( r, -r), r) ]

        return _.min (pts, function (test) { return pt.sub (test).length }) },

    xywh: $property (function () {
        return { x: this.x, y: this.y, width: this.width, height: this.height } }),

    ltwh: $property (function () {
        return { left: this.left, top: this.top, width: this.width, height: this.height } }),

    union: function (other) { return BBox.fromLTRB (
                                        Math.min (this.left,   other.left),
                                        Math.min (this.top,    other.top),
                                        Math.max (this.right,  other.right),
                                        Math.max (this.bottom, other.bottom)) },

    centerIn: function (other) {
        return new BBox (other.x, other.y, this.width, this.height) },

    clone: $property (function () {
        return new BBox (this.x, this.y, this.width, this.height) }),
    
    floor: $property (function () {
        return new BBox.fromLTRB (Math.floor (this.left),
                                  Math.floor (this.top),
                                  Math.floor (this.right),
                                  Math.floor (this.bottom)) }),

    css: $property (function () {
                        return { left: this.left   + 'px',
                                  top: this.top    + 'px',
                                width: this.width  + 'px',
                               height: this.height + 'px' } }),

    leftTop: $property (function () {
        return new Vec2 (this.left, this.top) }),

    leftBottom: $property (function () {
        return new Vec2 (this.left, this.bottom) }),

    rightBottom: $property (function () {
        return new Vec2 (this.right, this.bottom) }),
    
    rightTop: $property (function () {
        return new Vec2 (this.right, this.top) }),

    left: $property (function () {
        return this.x - this.width / 2.0 }),

    right: $property (function () {
        return this.x + this.width / 2.0 }),

    top: $property (function () {
        return this.y - this.height / 2.0 }),

    bottom: $property (function () {
        return this.y + this.height / 2.0 }),

    center: $property (function () {
        return new Vec2 (this.x, this.y) }),

    extent: $alias ('size'),

    size: $property (function () {
        return new Vec2 (this.width, this.height) }),

    offset: function (amount) {
        return new BBox (this.x + amount.x, this.y + amount.y, this.width, this.height) },

    newWidth: function (width) {
        return new BBox (this.x - (width - this.width) / 2.0, this.y, width, this.height) },

    grow: function (amount) {
        return new BBox (this.x, this.y, this.width + amount * 2, this.height + amount * 2) },

    shrink: function (amount) {
        return this.grow (-amount) },

    mul: function (z) {
            return new BBox (this.x * z, this.y * z, this.width * z, this.height * z) },

    area: $property (function () {
        return Math.abs (this.width * this.height) }),

    intersects: function (other) {
                    return !((this.right < other.left) ||
                             (this.left > other.right) ||
                             (this.bottom < other.top) ||
                             (this.top > other.bottom)) },

    toString: function () {
        return '{ ' + this.left + ',' + this.top + ' ←→ ' + this.right + ',' + this.bottom + ' }' } })


/*  3x3 affine transform matrix, encoding scale/offset/rotate/skew in 2D
    ======================================================================== */

Transform = $prototype ({

    $static: {

        identity: $property (function () { return new Transform () }),

        svgMatrix: function (m) {
                        return new Transform ([
                            [m.a, m.c, m.e],
                            [m.b, m.d, m.f],
                            [0.0, 0.0, 1.0] ]) },

        translation: function (v) {
                        return new Transform ([
                                    [1.0, 0.0, v.x],
                                    [0.0, 1.0, v.y],
                                    [0.0, 0.0, 1.0] ]) } },

    constructor: function (components) {
                    this.components = components || [
                        [1.0, 0.0, 0.0],
                        [0.0, 1.0, 0.0],
                        [0.0, 0.0, 1.0]] },

    multiply: function (m) {
                    var result = [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]]
                    var i, j, k, a = this.components, b = m.components;
                    for (i = 0; i < 3; i++) {
                        for (j = 0; j < 3; j++) {
                            for (k = 0; k < 3; k++) {
                                   result[i][j] += a[i][k] * b[k][j] } } }

                    return new Transform (result) },

    translate: function (v) {
                    return this.multiply (Transform.translation (v)) },

    scale: function (s) {
                return this.multiply (new Transform ([
                    [s,   0.0, 0.0],
                    [0.0, s,   0.0],
                    [0.0, 0.0, 1.0] ])) },

    inverse: $property ($memoized (function () { var m = this.components
                                        var id = (1.0 / 
                                                    (m[0][0] * (m[1][1] * m[2][2] - m[2][1] * m[1][2]) -
                                                     m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
                                                     m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])))

                                        return new Transform ([[

                                                 (m[1][1]*m[2][2]-m[2][1]*m[1][2])*id,          // 0 0
                                                -(m[0][1]*m[2][2]-m[0][2]*m[2][1])*id,          // 0 1
                                                 (m[0][1]*m[1][2]-m[0][2]*m[1][1])*id],         // 0 2

                                                [(m[1][0]*m[2][2]-m[1][2]*m[2][0])*id,          // 1 0
                                                 (m[0][0]*m[2][2]-m[0][2]*m[2][0])*id,          // 1 1
                                                -(m[0][0]*m[1][2]-m[1][0]*m[0][2])*id],         // 1 2

                                                [(m[1][0]*m[2][1]-m[2][0]*m[1][1])*id,          // 2 0
                                                -(m[0][0]*m[2][1]-m[2][0]*m[0][1])*id,          // 2 1
                                                 (m[0][0]*m[1][1]-m[1][0]*m[0][1])*id] ]) })),  // 2 2
        
    unproject: function (v) {
                    var m = this.components
                    return new Vec2 (
                        v.x * m[0][0] + v.y * m[0][1] + m[0][2],
                        v.x * m[1][0] + v.y * m[1][1] + m[1][2]) },

    project: function (v) {
                return this.inverse.unproject (v) } })


/*  Generates random number generator
    ======================================================================== */

_.rng = function (seed, from, to) {
    var m_w = seed;
    var m_z = 987654321;
    var mask = 0xffffffff;
    return function () {
        m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
        m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
        var result = ((m_z << 16) + m_w) & mask;
        result /= 4294967296;
        result += 0.5
        if (from === undefined && to === undefined) {
            return result }
        else {
            return Math.round (from + result * (to - from)) } } }


/*  Kind of Brezenham algorithm for 1D
    ======================================================================== */

_.equalDistribution = function (value, n) {
    var average = value / n
    var realLeft = 0.0
    return _.times (n, function () {
        var left = Math.round (realLeft)
        var right = Math.round (realLeft += average)
        var rough = Math.floor (right - left)
        return rough }) }


/*  DEPRECATED: use BBox utility
    ======================================================================== */

_.ptInRect = function (pt, rect) {
    return ((pt.x >= rect.left) && (pt.y >= rect.top) && (pt.x < rect.right) && (pt.y < rect.bottom)) }


/*  Color utility
    ======================================================================== */

_.hue2CSS = function (H, a)   { return _.RGB2CSS (_.hue2RGB (H), a)       }
_.HSL2CSS = function (hsl, a) { return _.RGB2CSS (_.HSL2RGB (hsl), a) }

_.HSL2RGB = function (hsl) { var h = hsl[0], s = hsl[1], l = hsl[2]
    var rgb = _.hue2RGB (h)
    var c = (1.0 - Math.abs (2.0 * l - 1.0)) * s
    return [(rgb[0] - 0.5) * c + l,
            (rgb[1] - 0.5) * c + l,
            (rgb[2] - 0.5) * c + l] }

_.hue2RGB = function (hue) {
    return [Math.max (0.0, Math.min (1.0, Math.abs (hue * 6.0 - 3.0) - 1.0)),
            Math.max (0.0, Math.min (1.0, 2.0 - Math.abs (hue * 6.0 - 2.0))),
            Math.max (0.0, Math.min (1.0, 2.0 - Math.abs (hue * 6.0 - 4.0)))] }

_.RGB2CSS = function (rgb, a) {
    return 'rgba(' +
        Math.round (rgb[0] * 255) + ',' +
        Math.round (rgb[1] * 255) + ',' +
        Math.round (rgb[2] * 255) + ',' + (a === undefined ? (rgb[3] === undefined ? 1.0 : rgb[3]) : a) + ')' }

_.RGB2HSL = function (rgb, a_) {
    var r = rgb[0], g = rgb[1], b = rgb[2], a = (a_ === undefined ? rgb[3] : a_)
    var max = Math.max (r, g, b), min = Math.min (r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0 }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break; }
        h /= 6 }
    return a === undefined ? [h, s, l] : [h, s, l, a] }
    

/*  Advanced rounding utility
    ======================================================================== */

_.extend (Math, (function (decimalAdjust) {
    return {
        roundTo: function (value, precision) {
            return value - (value % precision)
        },
        round10: function(value, exp) {
            return decimalAdjust ('round', value, exp);
        },
        floor10: function(value, exp) {
            return decimalAdjust ('floor', value, exp);
        },
        ceil10: function(value, exp) {
            return decimalAdjust ('ceil', value, exp);
        }
    }
}) (function /* decimalAdjust */ (type, value, exp) {

    /**
     * Decimal adjustment of a number.
     *
     * @param   {String}    type    The type of adjustment.
     * @param   {Number}    value   The number.
     * @param   {Integer}   exp     The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number}            The adjusted value.
     */

    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}));
/*  Parsers (TODO: REFACTOR)
    ======================================================================== */

_.tests.parse = {
    fileName: function () {
        $assert (Parse.fileName ('блабла'), 'блабла')
        $assert (Parse.fileName ('блабла.jpg'), 'блабла')
        $assert (Parse.fileName ('c:\\блабла/path/path2/блабла.jpg'), 'блабла')
    }
}

Parse = {
    keyCodeAsString: function (key) {
        return String.fromCharCode ((96 <= key && key <= 105) ? key - 48 : key) },

    fileName: function (path) {
        return _.first (_.last (path.split (/\\|\//)).split ('.')) },
}
;



/*  Self-awareness utils
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */





/*  Otherwise basic utility
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


/*  Concurrency primitives
 */

/*  Unit test / documentation / specification / how-to.
    ======================================================================== */

_.tests.concurrency = {

    'scope': function (testDone) { var releases = [],
                                       acquires = [],
                                       count    = 10

        var method = $scope (function (release, id, then) {           acquires.push (id)
                        _.delay (function () { release (function () { releases.push (id)
                                                            if (then)
                                                                then () }) }, 10) })

        method (42, function /* released */ () {
            $assert (count + 1, acquires.length, releases.length)
            $assert (acquires, releases.reversed)
            testDone () })

        _.times (count, function () { method (_.random (1000)) }) },

    'interlocked': function () { var isNowRunning = false

        var op = _.interlocked (function (item, i) { $assert (         !isNowRunning)
                                                                        isNowRunning = true
                    return __.delay (_.random (2)).then (function () { isNowRunning = false }) })

        return __.scatter (_.times (15, String.randomHex), op, { maxConcurrency: 10 }) } }


/*  Mutex/lock (now supports stand-alone operation, and it's re-usable).
 */
Lock = $prototype ({
    acquire: function (then) {
        this.wait (this.$ (function () {
            if (!this.waitQueue) {
                 this.waitQueue = [] }
            then () })) },

    acquired: function () {
        return this.waitQueue !== undefined },

    wait: function (then) {
        if (this.acquired ()) {     
            this.waitQueue.push (then) }
        else {
            then () }},

    release: function () {
        if (this.waitQueue.length) {
            var queueFirst = _.first (this.waitQueue)
            this.waitQueue = _.rest (this.waitQueue)
            queueFirst () }
        else
            delete this.waitQueue } })

_.interlocked = function (fn) { var lock = new Lock (),
                                    fn   = $untag (fn)
    return _.extendWith ({
                lock: lock,
                wait: lock.$ (lock.wait) }, function () { var this_ = this,
                                                              args_ = arguments;
                                                return new Promise (function (resolve) {
                                                                        lock.acquire (function () {
                                                                                        __.then (fn.apply (this_, args_),
                                                                                            function (x) {
                                                                                                lock.release (); resolve (x) }) }) }) }) }
/*  EXPERIMENTAL (TBD)
 */
_.defineKeyword ('scope', function (fn) { var releaseStack = undefined
                                                    
    return _.argumentPrependingWrapper (Tags.unwrap (fn),

            function /* acquire */ (fn) {

                            var released     = { when: undefined };
                               (releaseStack = (releaseStack || [])).push (released)

                    fn (function /* release */ (then) { if (released.when) throw new Error ('$scope: release called twice')
                                                            released.when = then
                        while (releaseStack &&
                               releaseStack.last &&
                               releaseStack.last.when) { var trigger =  releaseStack.last.when
                                                                   if ((releaseStack = _.initial (releaseStack)).isEmpty) {
                                                                        releaseStack = undefined }
                                                             trigger () } }) }) })

if ($platform.NodeJS) {
    module.exports = _ };
/*  What for:

    -   Hierarchy management (parent-child relationship)
    -   Destructors ('destroy' method), propagating through hierarchy
    -   bindable on $prototypes, auto-disconnecting if involved component gets destroyed
    -   trigger/barrier on $prototypes, auto-disconnecting if involved component gets destroyed

    Component facility provides unified mechanics for deinitialization, thus allowing
    to freely combine distinct components into more complex structure with no need to
    know how to specifically deinitialize each of them.

    Use to define highly configurable/reusable objects having limited lifetime, holding
    system resources and organizing into hierarchies, e.g. UI components, like dialogs,
    menus, embeddable data views. They hold DOM references and bound events, so one needs
    to properly free those resources during deinitialization. Case studies:

    -   For example, a pop-up menu could render itself into top-level 'document' element, 
        so just by destroying its parent component's DOM, things created by this pop-up
        wont be destroyed, and that's why explicit 'destroy' method is needed. With
        Component, you call 'destroy' on parent component, and it propagates to child
        components automatically, triggering their 'destroy' methods.

    -   A component could dynamically bind to other components with help of $bindable and
        $trigger facilities. If such component gets destroyed, those links became invalid
        and should be removed, otherwise it's considered as 'memory leak'. Component handles
        such situation, removing those links if any involved component gets destroyed.

    Component could be considered as basic tool for dynamic code binding at macro level,
    promoting functional code binding tools (defined in dynamic/stream.js) to $prototypes.
 */

_.tests.component = {

    /*  - Passing config to constructor will extend constructed instance with that object
        - Component constructors exhibit CPS interface (last function argument interprets as continuation)
     */
    'constructor([cfg, ][then])': function () { $assertNotCalled (function (mkay) {

        var Compo = $component ({})

        /*  1. constructor (cfg)
         */
        $assertMatches (new Compo ({ foo: 42 }), { foo: 42 })

        /*  2. constructor (then)
         */
        //new Compo (mkay)

        /*  3. constructor (cfg, then)
         */
        /*$assertMatches (new Compo ({ foo: 42 }, mkay), { foo: 42 })*/ }) },


    /*  init() should be entry point to a component, calling at constructor by default
     */
    'init': function () { $assertEveryCalledOnce (function (mkay) {
                            $singleton (Component, {
                                init: function () {
                                    mkay () } }) }) },


    /*  init(then) means your initialization is defined in CPS style
     */
    /*'CPS init': function () { $assertEveryCalled (function (compo1, compo2) {

                            var Compo = $prototype ({
                                init: function (then) { // you're required to call then, to complete init
                                    then () } })

                            var compo = new Compo (function () {
                                compo1 () })

                            var compo2 = new Compo ({ _42: 42 }, function () {
                                $assert (this._42, 42)
                                compo2 () }) }) },*/

    /*  constructor overriding is prohibited (by $final), use init() API for configuration means
     */
    'no constructor overriding': function () { $assertThrows (function () {
                                        $singleton (Component, {
                                            constructor: function () {} }) }) },


    /*  If you don't want init() to be called at constructor (to call it manually later),
        pass init:false to constructor's config
     */
    'manual init()': function () { $assertNotCalled (function (fail) {
                                        var Compo = $component ({ init: function () { fail () } })
                                        var compo = new Compo ({ init: false })
                                        $assert (typeof compo.init, 'function') }) }, // shouldn't be replaced by false

    /*  initialized is a _.barrier that opens after initialization
     */
    'initialized (barrier)': function () {
        var Compo = $component ({ init: function () {} })
        var compo = new Compo ({ init: false })

        $assert (!compo.initialized.already)
        $assertEveryCalledOnce (function (mkay) {
            compo.initialized (function () { mkay () })
            compo.init () }) },

    /*  'thiscall' semantics for methods (which can be defined by a variety of ways)
     */
    'thiscall for methods': function () {
        $assertEveryCalledOnce (function (prototypeMethod, instanceMethod) {
            var instance = null
            var Compo = new $component ({
                prototypeMethod: function () { $assert (this === instance); prototypeMethod () } })
            instance = new Compo ({
                instanceMethod:  function () { $assert (this === instance); instanceMethod () } })

            instance.prototypeMethod.call (null)
            instance.instanceMethod.call (null) }) },

    /*  Pluggable init/destroy with $traits (tests all combinations of CPS / sequential style method calling)
     */
    'pluggable init with $traits': function () { var A, B, C, D

        var A = $trait ({
            beforeInit: function () { A = true; return Promise.resolve () },
            afterInit:  function () { B = true; return Promise.resolve () } })

        var B = $trait ({
            beforeInit: function () { C = true; },
            afterInit:  function () { D = true; }
        })

        var C = $component ({
            $traits: [B, A] })

        return (new C ()).initialized.promise.then (function () {
                                                        $assert (A,B,C,D,true) }) },


    /*  $defaults is convenient macro to extract _.defaults thing from init() to definition level
     */
    '$defaults basic': function () {
        var Compo = $component ({ $defaults:           { foo: 42 }})
        $assert ($untag (Compo.$definition.$defaults), { foo: 42 })
        $assert (        Compo.            $defaults,  { foo: 42 })

        var Compo2 = $component ({ $traits: [$trait ({ $defaults: { foo: 11 } })], $defaults: { } })
        $assert ($untag (Compo2.$definition.$defaults), { foo: 11 })
        $assert (        Compo2.            $defaults,  { foo: 11 })
    },

    '$defaults': function () {
        var Trait = $trait ({ $defaults: { pff: 'pff', inner: { fromTrait: 1 } }})
        var Base = $component ({ $defaults: { foo: 12, qux: 'override me', inner: { fromBase: 1 } } })
        var Derived = $extends (Base, {
            $traits: [Trait],
            $defaults: { bar: 34, qux: 'overriden', inner: { fromDerived: 1 } } })
        
        //$assert (Derived.$ownDefaults,
        //               { bar: 34, qux: 'overriden', inner: { fromDerived: 1 } } )

        /* TODO: fix bug not allowing derived to not have $defaults
           var Derived2 = $extends (Derived, {}) */
 
        $assert (new Derived ().inner !== new Derived ().inner) // should clone $defaults at instance construction

        $assertMatches (new Derived ({ pff: 'overriden from cfg' }), { pff: 'overriden from cfg', foo: 12, bar: 34, qux: 'overriden', inner: { fromTrait: 1, fromBase: 1, fromDerived: 1 } }) },


    '$defaults cloning semantics': function () { var set = new Set ([1,2,3])

        var S = $component ({ $defaults: { foo: set,
                                           bar: new Set () } })

        var s = new S ()

        $assert (s.foo instanceof Set,
                 s.bar instanceof Set,
                 true)

        $assert (s.foo !== set)
    },

    /*  Use $requires to specify required config params along with their type signatures
     */
    '$requires': function () {
        var SomeType = $prototype ()
        var CompoThatRequires = $component ({
                                    $requires: {
                                        foo: SomeType,                      // requires foo to be instance of SomeType
                                        ffu: { a: 'number', b: 'string' },  // breakdown test
                                        bar: 'number',
                                        qux: ['number'],
                                        baz: _.not (_.isEmpty) } })         // custom requirement predicate


        var DerivedCompoThatRequiresMore =
            $extends (CompoThatRequires, {
                $requires: { more: 'string' } })


        $assertFails (function () {
            new CompoThatRequires ({ baz: {} }) }) // $requires behaves like assertion in case of failure

        $assertFails (function () {
            new DerivedCompoThatRequiresMore ({ more: 'hey how about other requirements' }) })

        new DerivedCompoThatRequiresMore ({
            foo: new SomeType (),
            bar: 42,
            qux: [1,2,3],
            more: 'blah blah',
            ffu: { a: 1, b: '2' },
            baz: 'blahblah' }) },


    /*  $overrideThis is a macro that requires a method to be overriden
     */
    /*'overrideThis': function () {
        $assertThrows (function () { $singleton (Component, { foo: $overrideThis (function () {}) }) },
            _.matches ({ message: 'foo should be overriden' })) },*/


    /*  $bindable lifts _.bindable to Component level, opening new venues to hooking onto existing impl,
        in ad-hoc way, with no need to specify hard-coded callback structure beforehand.

        Use to implement common beforeXXX and afterXXX semantics.
     */
    '$bindable': function () { $assertEveryCalledOnce (function (method, before, after) {

        var compo = $singleton (Component, {
                        method: $bindable (function (x) { method ()
                            return 42 }) })

        compo.method.onBefore (function (_5) { before ()
            $assert (this === compo)
            $assert (_5, 5) })

        compo.method.onAfter (function (_5, _result) { after ()
            $assert (this === compo)
            $assert (_5, 5)
            $assert (_result, 42) })

        $assert (compo.method (5), 42) }) },


    /*  Trigger has many names in outer world, like Event, Signal (and legion of
        many other misleading buzzwords).

        In our implementation, Trigger is a partial case of 'stream' concept, which
        is a highly abstract functional I/O primitive for multicasting of data/events).
        See dynamic/stream.js for its amazingly simple implementation.

            1.  If called with some value arguments (or no argument), it performs
                multicast of these arguments to all bound listeners (readers).
                In terms of 'streams' that operation is called 'write'.

            2.  If called with function argument, it adds that function to the wait
                queue mentioned before. In terms of 'streams' it is called 'read'.

        Component manages those streams (defined by $-syntax at its prototype definition),
        auto-disconnecting bound methods, so that no method of Component bound
        to such streams will ever be called after destroy().
     */
    '$trigger': function () { $assertEveryCalled (function (mkay__2) {
        
        var compo = $singleton (Component, {
                        mouseMoved: $trigger () })

        compo.mouseMoved (function (x, y) { $assert ([x, y], [7, 12]); mkay__2 () })
        compo.mouseMoved (7, 12)
        compo.mouseMoved (7, 12) }) },

    'init streams from config': function () { $assertEveryCalled (function (atDefinition, atInit) {

        var Compo = $component ({
                        mouseMoved: $trigger (atDefinition),
                        init: function () {
                            this.mouseMoved () } })

        new Compo ({ mouseMoved: atInit }) }) },

    /*  A variation of trigger. On 'write' operation, it flushes wait queue, so
        no callback bound previously gets called in future (until explicitly
        queued again by 'read' operation).
     */
    '$triggerOnce': function () {
        var compo = $singleton (Component, {
                        somthingHappened: $triggerOnce () })

        $assertEveryCalled (function (first, second) {
            compo.somthingHappened (function (what) { $assert (what, 'somthin'); first () })
            compo.somthingHappened (function (what) { $assert (what, 'somthin'); second () })
            compo.somthingHappened ('somthin') }) },


    /*  Another variation of stream, having 'memory fence / memory barrier' semantics,
        widely known as synchronization primitive in concurrent programming.

            1.  At first, barrier is in closed state, putting any callback passed to it
                to a queue.

            2.  When barrier is called with value argument, it state changes to 'opened',
                triggering all queued callbacks with that value argument passed in.

            3.  After barrier had opened, any futher callback gets called immediately
                with that value argument passed before, i.e. short-circuits.
     */
    '$barrier': function () { $assertEveryCalled (function (early, lately) {
        
        var compo = $singleton (Component, {
                        hasMessage: $barrier () })

        compo.hasMessage (function (_msg) { $assert (_msg, 'mkay'); early () })
        compo.hasMessage ('mkay')
        compo.hasMessage (function (_msg) { $assert (_msg, 'mkay'); lately () }) }) },


    /*  $observableProperty is a powerful compound mechanism for data-driven dynamic
        code binding, built around streams described previously.
     */
    '$observableProperty': function () { $assertEveryCalled (function (
                                            fromConstructor,
                                            fromConfig,
                                            fromLateBoundListener,
                                            fromDefinition,
                                            fromListenerOnlyVariant) {

        var Compo = $component ({
                        color: $observableProperty (),
                        smell: $observableProperty (),
                        shape: $observableProperty ('round', function (now) { $assert (now, 'round'); fromDefinition () }),
                        size:  $observableProperty (function (x) { $assert (x, 42); fromListenerOnlyVariant () }),
                        init: function () {
                            this.colorChange (function (now, was) { if (was) { fromConstructor ()
                                $assert ([now, was], ['green', 'blue']) } }) } })

        var compo = new Compo ({
            color: 'blue',
            size: 42,
            colorChange: function (now, was) { if (was) {   fromConfig ()
                                                            $assert ([now, was], ['green', 'blue']) } } })

        compo.smellChange (function (now, was) { fromLateBoundListener ()
            $assert (compo.smell, now, 'bad')
            $assert (undefined,   was) })

        compo.color = 'green'
        compo.smell = 'bad' }) },


    /*  $observableProperty automatically calls prototype constructor if supplied with non-prototype instance data
     */
    '$observableProperty (Prototype)': function () {
        var Compo = $component ({
                        position: $observableProperty (Vec2.zero),
                        init: function () {
                            this.positionChange (function (v) {
                                $assertTypeMatches (v, Vec2)
                                $assert (v.y, 42) }) } })

        var compo = new Compo ({ position: { x: 10, y: 42 }}) // supply POD value from constructor
        compo.position = { x: 20, y: 42 } },                  // supply POD value from property accessor

    'binding to streams with traits': function () {

        _.defineTagKeyword ('dummy')

        $assertEveryCalled (function (mkay1, mkay2) { var this_ = undefined

            var Trait = $trait ({
                somethingHappened: $trigger () })

            var Other = $trait ({
                somethingHappened: $dummy (function (_42) { $assert (this, this_); $assert (_42, 42); mkay1 () }) })

            var Compo = $component ({
                $traits: [Trait, Other],
                somethingHappened: function (_42) { $assert (this, this_); $assert (_42, 42); mkay2 () } })

            this_ = new Compo ()
            this_.somethingHappened (42) }) },

    'binding to bindables with traits': function () {

        $assertCallOrder (function (beforeCalled, interceptCalled, bindableCalled, afterCalled) { var this_ = undefined

            var Trait = $trait ({
                doSomething: $bindable (function (x) { $assert (this, this_); bindableCalled () }) })

            var Other = $trait ({
                beforeDoSomething: function (_42) { $assert (this, this_); $assert (_42, 42); beforeCalled () },
                interceptDoSomething: function (_42, impl) { interceptCalled (); $assert (this, this_); return impl (_42) } })

            var Compo = $component ({
                $traits: [Trait, Other],
                afterDoSomething: function (_42) { $assert (this, this_); $assert (_42, 42); afterCalled () } })

            this_ = new Compo ()
            this_.doSomething (42) }) },

    'binding to observable properties with traits': function () {

        $assertEveryCalled (function (one, two) { var this_ = undefined

            var Trait = $trait ({
                someValue: $observableProperty (42) })

            var Other = $trait ({
                someValue: function (_42) { one () } })

            var Compo = $component ({
                $traits: [Trait, Other],
                someValue: function (_42) { two () } })

            this_ = new Compo ()

            $assert (_.isFunction (this_.someValueChange))

            this_.someValue = 33 }) },

    'hierarchy management': function () { $assertEveryCalled (function (mkay__9) {
        
        var Compo = $extends (Component, {
            init:    function () { mkay__9 () },
            destroy: function () { mkay__9 () } })

        var parent = new Compo ().attach (
                        new Compo ().attach (
                            new Compo ()))

        var parrot = new Compo ()
                        .attachTo (parent)
                        .attachTo (parent)

        $assert (parrot.attachedTo === parent)
        $assert (parrot.detach ().attachedTo === undefined)

        var carrot = new Compo ()
        parent.attach (carrot)
        parent.attach (carrot)

        parent.destroy () })},

    'thiscall for streams': function () {
        
        var compo = $singleton (Component, {
            trig: $trigger () })

        compo.trig (function () {
            $assert (this === compo) })

        compo.trig.call ({}) },

    '$defaults can set $observableProperty': function () {

        var compo = $singleton (Component, {
            twentyFour: $observableProperty (42),
            $defaults: { twentyFour: 24 } })

        $assertEveryCalledOnce (function (mkay) {
            compo.twentyFourChange (function (val) { $assert (val, 24); mkay (); }) }) },

    'defer init with $defaults': function () {
        var compo = $singleton (Component, {
            $defaults: { init: false },
            init: function () { } })

        compo.init () },

    'stream members should be available at property setters when inited from config': function () {
        var compo = new ($component ({
            ready: $barrier (),
            value: $property ({
                set: function (_42) { $assertTypeMatches (this.ready, 'function') } }) })) ({ value: 42 }) },

    'observableProperty.force (regression)': function () { $assertEveryCalled (function (mkay__2) {
        
        var compo = $singleton (Component, {
            prop: $observableProperty () })

        compo.prop = 42
        compo.propChange (function (value) {
            $assert (value, 42)
            $assert (this === compo)
            mkay__2 () })

        compo.propChange.force () }) },

    'two-argument $observableProperty syntax': function () {

        $assertEveryCalled (function (mkay) {
            var compo = $singleton (Component, {
                                        prop: $observableProperty (42, function (value) { mkay ()
                                            if (compo) {
                                                $assert (this  === compo)
                                                $assert (value === compo.prop) } }) })
                compo.prop = 43 }) },


    'destroyAll()': function () { $assertEveryCalled (function (destroyed__2) {
        
        var Compo = $extends (Component, {
            destroy: function () { destroyed__2 () } })

        var parent = new Compo ()
                        .attach (new Compo ())
                        .attach (new Compo ())

        $assert (parent.attached.length === 2)

        parent.destroyAll ()
        parent.destroyAll ()

        $assert (parent.attached.length === 0) })},

    'random $nonce generation': function () { var X = $prototype (); $assert (_.isString (X.$nonce)) },

    '$macroTags for component-specific macros': function () {

        var Trait =    $trait ({   $macroTags: {
                                        add_2: function (def, fn, name) {
                                            return Tags.modify (fn, function (fn) {
                                                return fn.then (_.sum.$ (2)) }) } } })

        var Base = $component ({   $macroTags: {
                                        add_20: function (def, fn, name) {
                                            return Tags.modify (fn, function (fn) {
                                                return fn.then (_.sum.$ (20)) }) } } })

        var Compo = $extends (Base, {
            $traits: [Trait],
            $macroTags: { dummy: function () {} },

             testValue: $static ($add_2 ($add_20 (_.constant (20)))) })

        $assert (42, Compo.testValue ())
        $assertMatches (_.keys (Compo.$macroTags), ['dummy', 'add_2', 'add_20'])

        _.each (_.keys (Compo.$macroTags), _.deleteKeyword) },

    '$raw for performance-critical methods (disables thiscall proxy)': function () {

        var compo = new ($component ({
            method:          function (this_) { $assert (this_ === this) },
            rawMethod: $raw (function (this_) { $assert (this_ !== this) }) }))

        var    method = compo.   method;    method (compo)
        var rawMethod = compo.rawMethod; rawMethod (compo) },

    /*  $alias (TODO: fix bugs)
     */
    /*'$alias': function () { var value = 41

        var compo = $singleton (Component, {

            foo: function () { return ++value },
            bar: $bindable ($alias ('foo')),
            baz: $memoize  ($alias ('bar')) })

        $assertEveryCalled (function (mkay) { compo.bar.onBefore (mkay)
            $assert (compo.baz (),
                     compo.baz (), 42) }) },*/

    /*  Auto-unbinding
     */
    'unbinding (simple)': function () {
        var somethingHappened = _.trigger ()
        var compo = $singleton (Component, { fail: function () { $fail } })

        somethingHappened (compo.fail)
        compo.destroy ()
        somethingHappened () }, // should not invoke compo.fail


    '(regression) undefined was allowed as trait': function () {
        $assertThrows (function () {
            var Compo = $component ({ $traits: [undefined] }) }, { message: 'invalid $traits value' }) },

    '(regression) undefined members fail': function () {
        var Compo = $component ({ yoba: undefined })
        $assert ('yoba' in Compo.prototype) },

    '(regression) $defaults with $traits fail': function () {
        var Compo = $component ({ $traits: [$trait ({ $defaults: { x: 1 }})], $defaults: { a: {}, b: [], c: 0 } })
        $assert (Compo.$defaults, { x: 1, a: {}, b: [], c: 0 }) },

    '(regression) $defaults with $traits fail #2': function () {
        var Compo = $component ({ $traits: [$trait ({ $defaults: { x: 1 }})] })
        $assert (Compo.$defaults, { x: 1 }) },

    '(regression) method overriding broken': function () {
        var Compo = $component ({ method: function () { $fail } })
        var compo = new Compo ({ value: 42, method: function () { return this.value } })
        $assert (compo.method (), 42) },

    '(regression) $observableProperty (false)': function () {
        $assertEveryCalledOnce (function (mkay) {
            $singleton (Component, {
                foo: $observableProperty (false),
                init: function () { this.fooChange (mkay) } }) }) },

    '(regression) was not able to define inner compos at singleton compos': function () {
        var Foo = $singleton (Component, {
            InnerCompo: $component ({
                foo: $observableProperty () }) })

        var Bar = $extends (Foo.InnerCompo, { bar: $observableProperty () })
        var bar = new Bar ()

        $assertTypeMatches (bar, { fooChange: 'function', barChange: 'function' }) },

    /*'(regression) postpone': function (testDone) { $assertEveryCalledOnce ($async (function (foo) {
        $singleton (Component, {
            foo: function () { foo (); },
            init: function () { this.foo.postpone () } }) }), testDone) },*/

    '(regression) undefined at definition': function () { $singleton (Component, { fail: undefined }) },

    '(regression) properties were evaluated before init': function () {
        $singleton (Component, {
            fail: $property (function () { $fail }) }) },

    '(regression) misinterpretation of definition': function () {
        $singleton (Component, { get: function () { $fail } }) },

    '(regression) alias incorrectly worked with destroy': function () {
            var test = $singleton (Component, {
                destroy: function () { mkay () },
                close: $alias ('destroy') })

            $assert (test.close, test.destroy) } }


/*  General syntax
 */
_.defineKeyword ('component', function (definition) {
                                return $extends (Component, definition) })

_([ 'extendable', 'trigger', 'triggerOnce', 'barrier', 'observable', 'bindable', 'memoize', 'interlocked',
    'memoizeCPS', 'debounce', 'throttle', 'overrideThis', 'listener', 'postpones', 'reference', 'raw', 'binds', 'observes'])
    .each (_.defineTagKeyword)

_.defineTagKeyword ('observableProperty', function (impl) {
                                                return function (x, fn) {
                                                    return ((_.isFunction (x) && (arguments.length === 1)) ?
                                                                impl (x, fn) :     // $observableProperty (listener)
                                                                impl (fn, x)) } }) // $observableProperty (value[, listener])

_.defineKeyword ('observableRef', function (x) { return $observableProperty ($reference (x)) })

$prototype.macro ('$depends', function  (def, value, name) {
                                       (def.$depends = $builtin ($const (_.coerceToArray (value))))
                                 return def })

$prototype.macroTag ('extendable',
            function (def, value, name) {
                      def[name] = $builtin ($const (value))
               return def })

$prototype.macro (function (def) {
                            def.$nonce = $static ($builtin ($property (String.randomHex (32)))); return def })

Component = $prototype ({

    $defaults:  $extendable ({}),
    $requires:  $extendable ({}),
    $macroTags: $extendable ({}),

    /*  Overrides default OOP.js implementation
     */
    $impl: {

        sequence: function (def, base) { return _.sequence (
            this.extendWithTags,
            this.flatten,
            this.generateCustomCompilerImpl (base),
            this.generateArgumentContractsIfNeeded,
            this.ensureFinalContracts (base),
            this.generateConstructor (base),
            this.evalAlwaysTriggeredMacros (base),
            this.evalMemberTriggeredMacros (base),
            this.expandTraitsDependencies,
            this.mergeExtendables (base),
            this.contributeTraits (base),
            this.mergeStreams,
            this.mergeBindables,
            this.generateBuiltInMembers (base),
            this.callStaticConstructor,
            this.expandAliases,
            this.groupMembersByTagForFastEnumeration,
            this.defineStaticMembers,
            this.defineInstanceMembers) },

        expandTraitsDependencies: function (def) {

                if (_.isNonempty ($untag (def.$depends)) &&
                    _.isEmpty    ($untag (def.$traits))) {
                                          def.$traits = DAG.squash (def, {
                                                                  nodes: function (def) { return $untag (def.$depends) },
                                                                    key: function (def) { return $untag (def.$nonce) } }) }; return def },

        mergeExtendables: function (base) { return function (def) {

                _.each (base.$definition, function (value, name) {
                    if (value && value.$extendable) {
                        def[name] = Tags.modify (                       value,
                                        function (                      value) {
                                                                        value =    _.extendedDeep (value, $untag (def[name] || {}))
                                    _.each ($untag (def.$traits),
                                                function (trait) { if (!trait) {    log.e (def.$traits)
                                                                                    throw new Error ('invalid $traits value') }
                                                      var traitVal = trait.$definition [name]
                                                      if (traitVal) {   value =   _.extendedDeep ($untag (traitVal), value) } })
                                                               return   value }) } }); 
               return def } },

        mergeTraitsMembers: function (def, traits) { var pool = {}, bindables = {}, streams = {}

            var macroTags = $untag (def.$macroTags)
            var definitions = _.pluck (traits, '$definition').concat (_.clone (def))

            _.each (definitions, function (traitDef) {
                _.each ((macroTags && this.applyMacroTags (macroTags,
                                                _.extend (_.clone (traitDef), {
                                                    constructor: def.constructor }))) || traitDef,
                    function (member, name) {
                        if ($builtin.isNot (member) &&
                            $builtin.isNot (def[name]) && (name !== 'constructor')) {

                            if ($bindable.is (member))                  { bindables[name] = member }
                            if (Component.isStreamDefinition (member))  {   streams[name] = member }
                            (pool[name] || (pool[name] = [])).push (member);    def[name] = member } }) }, this)

            def.__bindables     = bindables
            def.__streams       = streams
            def.__membersByName = pool },

        mergeStreams: function (def) { var pool = def.__membersByName

            _.each (def.__streams, function (stream, name) {

                    var clonedStream = def[name] = Tags.clone (stream)
                        clonedStream.listeners = []

                    _.each (pool[name], function (member) {
                                            if (member !== stream) {
                                                clonedStream.listeners.push ($untag (member)) } }) }); return def },

        mergeBindables: function (def) { var pool = def.__membersByName

            _.each (def.__bindables, function (member, name) {
                var bound = _.filter2 (_.bindable.hooks, function (hook, i) {
                                                            var bound = pool[_.bindable.hooksShort[i] + name.capitalized]
                                                            return bound ? [hook, bound] : false })

                if (bound.length) { var hooks = {}

                    _.each (bound, function (kv) {
                        _.each (kv[1], function (fn) { fn = $untag (fn)
                            if (_.isFunction (fn)) { var k = '_' + kv[0]; (hooks[k] || (hooks[k] = [])).push (fn) } }) })

                    def[name] = $bindable ({ hooks: hooks }, Tags.clone (member)) } }, this)

            return def } },


    /*  Syntax helper
     */
    isStreamDefinition: $static (function (def) {
        return _.isObject (def) && (
            def.$trigger || def.$triggerOnce ||
            def.$barrier || def.$observable || def.$observableProperty) }),
    

    /*  Another helper (it was needed because _.methods actually evaluate $property values while enumerating keys,
        and it ruins most of application code, because it happens before Component is actually created).
     */
    mapMethods: function (/* [predicate, ] iterator */) { var iterator  = _.last (arguments),
                                                               predicate = (arguments.length === 1 ? _.constant (true) : arguments[0])
        var methods = []
        for (var k in this) {
            var def = this.constructor.$definition[k]
            if (!(def && def.$property)) { var fn = this[k]
                if (_.isFunction (fn) && !_.isPrototypeConstructor (fn) && predicate (def))  {
                    this[k] = iterator.call (this, fn, k, def) || fn } } } },

    enumMethods: function (_1, _2) {
        if (arguments.length === 2) { this.mapMethods (_1, _2.returns (undefined)) }
                               else { this.mapMethods (    _1.returns (undefined)) } },


    /*  Thou shall not override this
     */
    constructor: $final (function (arg1, arg2) {

        this.parent_ = undefined
        this.children_ = []

        var cfg                 = this.cfg = ((typeof arg1 === 'object') ? arg1 : {}),
            componentDefinition = this.constructor.$definition


        /*  Apply $defaults
         */
        if (this.constructor.$defaults) {
            cfg = this.cfg = _.extend (_.cloneDeep (this.constructor.$defaults), cfg) }


        /*  Add thiscall semantics to methods
         */
        this.mapMethods (function (fn, name, def) { if ((name !== '$') && (name !== 'init') && !(def && def.$raw)) { return this.$ (fn) } })


        /*  Listen self destroy method
         */
        _.onBefore  (this, 'destroy', this.beforeDestroy)
        _.onAfter   (this, 'destroy', this.afterDestroy)


        var initialStreamListeners = []
        var excludeFromCfg = { init: true }


        /*  Expand macros
            TODO: execute this substitution at $prototype code-gen level, not at instance level
         */
        _.each (componentDefinition, function (def, name) { if (def !== undefined) {

            /*  Expand $observableProperty
                TODO: rewrite with $prototype.macro
             */
            if (def.$observableProperty) {  var definitionValue = def.subject
                                            var defaultValue = (name in cfg) ? cfg[name] : definitionValue
                                            var streamName   = name + 'Change'

                /*  xxxChange stream
                 */
                var observable           = excludeFromCfg[streamName] = this[streamName] = _.observable ()
                    observable.context   = this
                    observable.postpones = def.$postpones

                /*  auto-coercion of incoming values to prototype instance
                 */
                if (_.isPrototypeInstance (definitionValue)) { var constructor = definitionValue.constructor
                    observable.beforeWrite = function (value) {
                        return constructor.isTypeOf (value) ? value : (new constructor (value)) } }

                /*  tracking by reference
                 */
                if (def.$reference) {
                    observable.trackReference = true }

                /*  property
                 */
                _.defineProperty (this, name, {
                        get: function ()  { return observable.value },
                        set: function (x) { observable.call (this, x) } })

                /*  Default listeners (come from traits)
                 */
                if (def.listeners) {
                    _.each (def.listeners, function (value) {
                        initialStreamListeners.push ([observable, value]) }) }

                /*  Default listener which comes from $observableProperty (defValue, defListener) syntax
                 */
                if (_.isFunction (def.$observableProperty)) {
                      initialStreamListeners.push ([observable, def.$observableProperty]) }

                /*  write default value
                 */
                if (defaultValue !== undefined) {
                    observable (defaultValue) } }

            /*  Expand streams
             */
            else if (Component.isStreamDefinition (def)) {
                var stream = excludeFromCfg[name] = this[name] = _.extend (
                                (def.$trigger       ? _.trigger :
                                (def.$triggerOnce   ? _.triggerOnce :
                                (def.$observable    ? _.observable :
                                (def.$barrier       ? _.barrier : undefined)))) (def.subject), { context: this, postpones: def.$postpones })

                if (def.listeners) {
                    _.each (def.listeners, function (value) {
                        initialStreamListeners.push ([stream, value]) }) }

                var defaultListener = cfg[name]                
                if (defaultListener) { initialStreamListeners.push ([stream, defaultListener]) } }

            /*  Expand $listener (TODO: REMOVE)
             */
            if (def.$listener) {
                this[name].queuedBy = [] }

            /*  Expand $interlocked
             */
            if (def.$interlocked) {
                this[name] = _.interlocked (this[name]) }

            /*  Expand $bindable
             */
            if (def.$bindable) {
                this[name] = _.extend (_.bindable (this[name], this),
                                       _.map2 (def.$bindable.hooks || {},
                                       _.mapsWith (this.$.bind (this).arity1))) }
            /*  Expand $debounce
             */
            if (def.$debounce) { var fn = this[name], opts = _.coerceToObject (def.$debounce)
                this[name] = fn.debounced (opts.wait || 500, opts.immediate) }

            /*  Expand $throttle
             */
            if (def.$throttle) { var fn = this[name], opts = _.coerceToObject (def.$throttle)
                this[name] = _.throttle (fn, opts.wait || 500, opts) }

            /*  Expand $memoize
             */
                 if (def.$memoize) {
                this[name] = _.memoize (this[name]) }
            else if (def.$memoizeCPS) {
                this[name] = _.cps.memoize (this[name]) } } }, this)

        /*  Add before/after stage to init
         */
        var init  = this.init
                    this.init = this._beforeInit
                                     .then (init
                                     .then (this._afterInit)).bind (this)

        /*  Apply cfg thing
         */
        _.each (cfg, function (value, name) {
            if (!(name in excludeFromCfg)) {
                this[name] = _.isFunction (value) ? this.$ (value) : value } }, this)


        /*  Fixup aliases (they're now pointing to nothing probably, considering what we've done at this point)
         */
        _.each (componentDefinition, function (def, name) {
            if (def && def.$alias && !def.$raw) {
                this[name] = this[$untag (def)] } }, this)


        /*  Check $overrideThis
         */
        /*_.each (componentDefinition, function (def, name) {
            if (def.$overrideThis && this[name] === undefined) {
                throw new Error (name + ' should be overriden') } })*/


        /*  Check $requires (TODO: make human-readable error reporting)
         */
        if (_.hasAsserts) {
            _.each (this.constructor.$requires, function (contract, name) {
                $assertTypeMatches (_.object ([[name, this[name]]]),
                                    _.object ([[name, contract]])) }, this) }


        /*  Subscribe default listeners
         */
        _.each (initialStreamListeners, function (v) { v[0].call (this, v[1]) }, this)


        /*  Call init (if not marked as deferred)
         */
        if (!(cfg.init === false || (this.constructor.$defaults && (this.constructor.$defaults.init === false)))) {
            var result = this.init ()
            if (result instanceof Promise) {
                result.panic } } }),

    /*  Arranges methods defined in $traits in chains and evals them
     */
    callChainMethod: function (name) { var self = this
        return __.seq (
                _.filter2 (this.constructor.$traits || [], function (Trait) {
                                                              var method = Trait.prototype[name]
                                                              return (method && method.bind (self)) || false })) },

    /*  Lifecycle
     */
    _beforeInit: function () {
        if (this.initialized.already) {
            throw new Error ('Component: I am already initialized. Probably you\'re doing it wrong.') }

        return this.callChainMethod ('beforeInit') },

    init: function () { /* return Promise for asynchronous init */ },

    _afterInit: function () { var cfg  = this.cfg,
                                  self = this

        return __.then (this.callChainMethod.$ ('afterInit'), function () {

                        self.initialized (true)

                        /*  Bind default property listeners. Doing this after init, because property listeners
                            get called immediately after bind (observable semantics), and we're want to make
                            sure that component is initialized at the moment of call.

                            We do not do this for other streams, as their execution is up to component logic,
                            and they're might get called at init, so their default values get bound before init.
                         */
                        _.each (self.constructor.$definition, function (def, name) {
                            if (def && def.$observableProperty) {            name += 'Change'
                                var defaultListener = cfg[name]
                                if (defaultListener) {
                                    self[name] (defaultListener) } } })

                        return true }) },
    
    initialized: $barrier (),

    beforeDestroy: function () {
        if (this.destroyed_) {
            throw new Error ('Component: I am already destroyed. Probably you\'re doing it wrong.') }
        if (this.destroying_) {
            throw new Error ('Component: Recursive destroy() call detected. Probably you\'re doing it wrong.') }
            this.destroying_ = true

        /*  Unbind streams
         */
        this.enumMethods (_.off)

        /*  Destroy children
         */
        _.each (this.children_, _.method ('destroy'))
                this.children_ = [] },

    destroy: function () {},

    afterDestroy: function () {

        _.each (this.constructor.$traits, function (Trait) {
            if (Trait.prototype.destroy) {
                Trait.prototype.destroy.call (this) } }, this)

        delete this.destroying_
        this.parent_ = undefined
        this.destroyed_ = true },


    /*  Parent manip.
     */ 
    attachedTo: $property (function () {
                            return this.parent_ }),

    attachTo: function (p) {
                    if (p === this) {
                        throw new Error ('smells like time-travel paradox.. how else can I be parent of myself?') }

                    if (this.parent_ !== p) {
                        if ((this.parent_) !== undefined) {
                            this.parent_.children_.remove (this) }
                            
                        if ((this.parent_ = p) !== undefined) {
                            this.parent_.children_.push (this) }} return this },

    detach: function () {
                return this.attachTo (undefined) },

    /*  Child manip.
     */
    attached: $property (function () {
                            return this.children_ }),

    attach: function (c) {
                _.invoke (_.coerceToArray (c), 'attachTo', this); return this },

    detachAll: function () {
                    _.each (this.children_, function (c) { c.parent_ = undefined })
                            this.children_ = []
                            return this },

    destroyAll: function () {
                    _.each (this.children_, function (c) { c.parent_ = undefined; c.destroy () })
                            this.children_ = []
                            return this } })
;




/*  Experimental stuff
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */


/*  Promise-centric extensions (WIP) /// TODO: REFACTOR
    ======================================================================== */

_.tests['Promise+'] = {

/*  ------------------------------------------------------------------------ */

    promisify: function () {

    /*  Example object  */

        var fs = {

        /*  Shouldn't be converted  */

            42: 42,
            dontTouchMe:  function () { $assert (arguments.length === 0); return 42 },
            dontTouchMe2: function () { $assert (arguments.length === 0); return 42 },
            readFileSync: function () { $assert (arguments.length === 0); return 42 },

        /*  Will be promisified */

            readFile: function (path,   callback) { $assert (this === fs)
                            if (path) { callback (null, 'contents of ' + path) }
                                 else { callback ('path empty') } } }

    /*  Run     */

        fsAsync = Function.promisifyAll (fs, { except: _.endsWith.$$ ('Sync').or (['dontTouchMe', 'dontTouchMe2'].asSet.matches) })

    /*  Check if 'except' worked successfully */

        $assert (fsAsync.dontTouchMe (),
                 fsAsync.dontTouchMe2 (),
                 fsAsync.readFileSync (), fsAsync['42'], 42)

    /*  Check if 'readFile' converted successfully */

        return __.all ([    fsAsync.readFile (null) .assertRejected ('path empty'),
                            fsAsync.readFile ('foo').assert         ('contents of foo') ]) },


/*  ------------------------------------------------------------------------ */

    __: function () { var adds = function (a, b) {
                                    return function (x, y) { return [x + a, y + b] } }
        return [
            __(123).assert (123),
            __(Promise.resolve (123)).assert (123),
            __(function () { return 123 }).assert (123),
            __(function () { throw 123 }).assertRejected (123),
            __(adds ('foo', 'bar'), 123, 456).assert (['123foo', '456bar']) ] },

    first: function () {
            return [
                Promise.firstResolved ([Promise.reject (123), Promise.resolve (456)]).assert (456),
                Promise.firstResolved ([Promise.reject (123), Promise.reject  (456)]).assertRejected (null),
                Promise.firstResolved ([])                                           .assertRejected (null) ] },

/*  ------------------------------------------------------------------------ */

    all: function () {
            return [
                __.all ([                 123,                   456 ]).assert ([123, 456]),
                __.all ([     _.constant (123),      _.constant (456)]).assert ([123, 456]),
                __.all ([Promise.resolve (123), Promise.resolve (456)]).assert ([123, 456]) ] },

/*  ------------------------------------------------------------------------ */

    seq: function () {  $assert (__.seq (123), 123)
                        $assert (__.seq ([123, 333]), 333)
                        $assert (__.seq ([123, _.constant (333)]), 333)

                        return [
                            __.seq ([Promise.resolve (123), Promise.resolve (333)]).assert (333),
                            __.seq ([123, __.constant (333)]).assert (333),
                            __.seq ([123, __.rejects ('foo')]).assertRejected ('foo'),
                            __.seq ([123, __.delays (0), _.appends ('bar')]).assert ('123bar')
                        ] },

/*  ------------------------------------------------------------------------ */

    map: function () {
            return [
                        __.map (       111 ,   _.appends ('bar')).assert (       '111bar'),
                        __.map (      [222],   _.appends ('bar')).assert (      ['222bar']),
                        __.map (    __(333),   _.appends ('bar')).assert (       '333bar'),
                        __.map ({ foo: 444 },  _.appends ('bar')).assert ({ foo: '444bar' }),
                        __.map ({ foo: 555 }, __.constant ('bar')).assert ({ foo: 'bar' }) ] },

/*  ------------------------------------------------------------------------ */

    filter: function () {
            return [
                        __.filter (123, _.constant (456)).assert (456),
                        __.filter (['foo', 456], _.isString).assert (['foo']),
                        __.filter (['foo', 456], __.constant ('baz')).assert (['baz', 'baz']),
                        __.filter ({ foo: 123, bar: '456' }, _.isNumber).assert ({ foo: 123 })
                    ] },

/*  ------------------------------------------------------------------------ */

    each: function () {

        var pairs = function (input) { var pairs = []
                        return __.each (input, function (x, i) { pairs.push ([x, i]) })
                                    .then (_.constant (pairs)) }

        return [    pairs ()         .assert ([]),
                    pairs (undefined).assert ([]),

                    pairs (42).assert ([[42, undefined]]),
                    
                    pairs ([    42,    48]) .assert ([[42,  0],  [48,  1 ]]),
                    pairs ({ 0: 42, 1: 48 }).assert ([[42, '0'], [48, '1']]),

                    __.each ([1,2], function (x, i) {
                                        if (i > 0) $fail
                                        return Promise.reject ('foo') }).assertRejected ('foo') ] }

/*  END OF TESTS ----------------------------------------------------------- */

}


/*  IMPLEMENTATION
    ======================================================================== */


TimeoutError = $extends (Error, { message: 'timeout expired' })                                

/*  ------------------------------------------------------------------------ */

__ = Promise.eval = function (x) { var this_ = this,
                                       args = _.rest (arguments)

                        return ((x instanceof Promise)   ?  x :
                               ((x instanceof Function)  ?  new Promise (function (resolve) { resolve (x.apply (this_, args)) }) : // @hide
                                                                Promise.resolve (x))) }

Promise.coerce = function (x) {
                        return (x instanceof Promise) ? x : Promise.resolve (x) }

/*  ------------------------------------------------------------------------ */

__.noop = function () {
            return Promise.resolve () }

__.eternity = new Promise (function () {})

__.identity = function (x) {
                return Promise.resolve (x) }

__.constant = function (x) {
                return function () {
                    return Promise.resolve (x) } }

__.reject = function (e) { return Promise.reject (e) }
__.rejects = function (e) { return function () { return Promise.reject (e) } }

/*  ------------------------------------------------------------------------ */

__.then = function (a, b) { b = _.coerceToFunction (b)
                try {
                    var x = (a instanceof Function) ? a () : a
                    return  (x instanceof Promise)  ? x.then (b) : b (x) }
                catch (e) {
                    return Promise.reject (e) } }

/*  ------------------------------------------------------------------------ */

__.delay = function (ms) { return __.delays (ms) () }

__.delays = function (ms) {
                return function (x) {
                    return new Promise (function (return_) { setTimeout (function () { return_ (x) }, ms || 0) }) } }

$mixin (Promise, {
    delay:              function (ms) { return this.then (__.delays (ms)) },
    timeout:            function (ms) { return this.race (__.delay (ms).reject (new TimeoutError ())) },
    now:     $property (function (  ) { return this.timeout (0) }) })


/*  ------------------------------------------------------------------------ */

$mixin (Array, {
    
    race: $property (function () { return Promise.race (this) }) })

/*  ------------------------------------------------------------------------ */

$mixin (Promise, {

    race: function (other) { return [this, other].race },

    firstResolved: $static (function (arr) {
                        return new Promise (function (resolve, reject) { var todo = arr && arr.length
                            if (!todo) {
                                reject (null) }
                            else {
                                _.each (arr, function (x) {
                                                Promise.coerce (x)
                                                       .then (function (x) { todo--
                                                                if (resolve) {
                                                                    resolve (x)
                                                                    resolve = undefined } })
                                                       .catch (function () { todo--
                                                            if (!todo) {
                                                                reject (null) } }) }) } }) }),

    reject: function (e) { return this.then (_.throwsError (e)) },

    chain: function (fn) { return this.then (function (x) { fn (x); return x; }) },

    done: function (fn) { return this.then (function (x) { fn (null, x); return x },
                                            function (e) { fn (e, null); throw e }) },

    finally: function (fn) { return this.then (function (x) { return fn (null, x) },
                                               function (e) { return fn (e, null) }) },

    /*state: $property (function () {
                        return this.then (
                            function (x) { return { state: 'fulfilled', fulfilled: true, value: x } },
                            function (e) { return { state: 'rejected', rejected: true, value: x } }).now.catch (function () {
                                           return { state: 'pending', pending: true } }) }),*/

    log:   $property (function () { return this.then (log,       log.then (_.throwsError)) }),
    alert: $property (function () { return this.done (alert2, alert2.then (_.throwsError)) }),
    panic: $property (function () { return this.catch (function (e) { ($global.Panic || $global.alert || $global.log) (e); throw e }) }),

    assert: function (desired) {
                return this.then (function (x) { $assert (x, desired); return x }) },

    assertTypeMatches: function (desired) {
                return this.then (function (x) { $assertTypeMatches (x, desired); return x }) },

    assertRejected: function (desired) { var check = (arguments.length > 0)
                        return this.catch (function (x) { if (check) { $assert (x, desired) } return x }) },

})

/*  ------------------------------------------------------------------------ */

_.deferTest (['Promise+', '_.scatter with pooling'], function () {

        var data = _.times (21, function (i) { return 'item_' + i })
        var numItems = 0
        var processedItems = []

        var op = function (item, i) {
                    numItems++
                    $assert (!processedItems.contains (item))
                    return __.delay (_.random (2))
                             .then (function () {
                                        processedItems.push (item)
                                        return item }) }

        return __.scatter (data, op, { maxConcurrency: 5 })
                 .then (function () { $assert (_.difference (data, processedItems).isEmpty) }) },

    /*  ------------------------------------------------------------------------ */

    function () {

        var TaskPool = $prototype ({

            constructor: function (cfg) {
                            
                            this.maxTime        = cfg && cfg.maxTime
                            this.pending        = []

                            if (this.maxConcurrency = cfg && cfg.maxConcurrency) {
                                this.numActive = 0
                                this.queue     = [] } },

            run: function (task) { var self = this

                        if (this.numActive >= this.maxConcurrency) { // queue task

                            return new Promise (function (resolve) {
                                                    self.queue.push (function () {
                                                                        return self.run  (task)
                                                                                   .then (resolve) }) }) }
                        else { // execute task

                            var p = __(task)

                            if (this.maxTime !== undefined) {
                                p = p.timeout (this.maxTime) }

                            if (this.maxConcurrency !== undefined) { // if queueing, wait until complete and pop next task

                                                           self.numActive++
                                p = p.then (function (x) { self.numActive--
                                                   return (self.queue.length &&
                                                          (self.numActive < self.maxConcurrency))
                                                                          ? self.queue.pop () ()
                                                                          : x }) }
                            this.pending.push (p)

                            return p } },


            all: $property (function () {
                                return Promise.all (this.pending) }) })

    /*  ------------------------------------------------------------------------ */

        __.scatter = function (x, fn, cfg /* { maxConcurrency, maxTime } */) {

                    return __.then (x, function (x) {

                        if (_.isStrictlyObject (x)) {

                            var result = _.coerceToEmpty (x),
                                tasks  = new TaskPool (cfg)

                            _.each2 (x, function (v, k) {
                                            tasks.run (fn.$ (v, k, x)).then ( // TODO: remove debug
                                                                        function (vk) {
                                                                            if (vk) {
                                                                                if (vk.length > 1) { // key provided
                                                                                    result[vk[1]] = vk[0] }
                                                                                else {
                                                                                    if (result instanceof Array) {
                                                                                        result.push (vk[0]) }
                                                                                    else {
                                                                                        result[k] = vk[0] } } } }) })
                            return tasks.all.then (_.constant (result)) }

                        else {
                            return __(fn, x, undefined, x).then (function (vk) { return vk[0] }) } }) }
})

/*  ------------------------------------------------------------------------ */

__.map = function (x, fn, cfg /* { maxConcurrency, maxTime } */) {
            return __.scatter (x, function (v, k, x) {
                return __.then (fn.$ (v, k, x), function (x) { return [x] }) }) }

__.filter = function (x, fn, cfg /* { maxConcurrency, maxTime } */) {
                return __.scatter (x, function (v, k, x) {
                                        return __.then (fn.$ (v, k, x),
                                            function (decision) {
                                                return ((decision === false) ? undefined :
                                                       ((decision === true)  ? [v]
                                                                             : [decision])) }) }) }
__.each = function (obj, fn) {
                return __.then (obj, function (obj) {
                    return new Promise (function (complete, whoops) {
                                        _.cps.each (obj, function (x, i, then) {
                                                            Promise.coerce (fn (x, i))
                                                                   .then (then)
                                                                   .catch (whoops) }, complete) }) }) }

__.seq = function (arr) {
            return _.reduce2 (arr, __.then) }

__.all = function (arr) {
            return Promise.all (_.map (arr, __)) }

__.race = function (arr) {
            return Promise.race (_.map (arr, __)) }

/*  ------------------------------------------------------------------------ */

$mixin (Function, {
    
    promisifyAll: $static (function (obj, cfg) { var cfg    = cfg || {},
                                                     except = cfg.except || _.noop

                                if (except instanceof Array) {
                                    except = except.asSet.matches }

                                var result = {}

                                for (var k in obj) {
                                    var x = obj[k]
                                    if (x instanceof Function) {
                                        var fn = x.bind (obj)
                                        result[k] = except (k) ? fn : fn.promisify }
                                    else {
                                        result[k] = x } }

                                return result }),

    promisify: $hidden ($property (
                            function () {            var f    = this
                                return function () { var self = this, args = arguments
                                    return new Promise (function (resolve, reject) {
                                        f.apply (self, _.asArray (args).concat (function (err, what) {
                                                                                      if (err) { reject (err) }
                                                                                                 resolve (what) })) }) } })) })

;


/*  Networking
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/*  Promise-based HTTP protocol API (cross-platform)
    ======================================================================== */

Http = $singleton (Component, {

    /*  You can re-use the HttpMethods trait to build API-specific layers over Http
     */

    $traits: [HttpMethods = $trait ({

                                get: function (path, cfg) {
                                            return this.request ('GET',  path, cfg) },

                                post: function (path, cfg) {
                                            return this.request ('POST', path, cfg) },

                                loadFile: function (path, cfg) {
                                            return this.request ('GET', path, { responseType: 'arraybuffer' }) },

                                uploadFile: function (path, file, cfg) {
                                                return this.post (path, _.extend2 ({
                                                    data: file,
                                                    headers: {
                                                        'Content-Type': 'binary/octet-stream',
                                                        'X-File-Name': Parse.fileName (file.name || 'file').transliterate || 'file',
                                                        'X-File-Size': file.size,
                                                        'X-File-Type': file.type } }, cfg)) } }) ],

    /*  Impl
     */

    request: function (type, path, cfg_) { var cfg = _.extend2 ({ headers: { 'Cache-Control': 'no-cache' } }, cfg_)

                return new Promise (function (resolve, reject) {

                    if ($platform.Browser) {

                        var prePath = (cfg.protocol || cfg.hostname || cfg.port) ?
                                     ((cfg.protocol || window.location.protocol) + '//' +
                                      (cfg.hostname || window.location.hostname) + ':' +
                                      (cfg.port     || window.location.port)) : ''

                        /*  Init XMLHttpRequest
                         */
                        var xhr = new XMLHttpRequest ()
                            xhr.open (type, prePath + path, true)

                        /*  Set to 'arraybuffer' to receive binary data
                         */
                        if (cfg.responseType)
                            xhr.responseType = cfg.responseType

                        /*  Set headers
                         */
                        _.each (cfg.headers, function (value, key) {
                            xhr.setRequestHeader (key, value) })

                        /*  Bind events
                         */
                        if (cfg.progress) {
                            xhr.onprogress = Http.progressCallbackWithSimulation (cfg.progress) }

                            xhr.onreadystatechange = function () {

                                if (xhr.readyState === 4) {
                                    if (cfg.progress) {
                                        cfg.progress (1) }

                                    var response = (xhr.responseType === 'arraybuffer')
                                                        ? xhr.response
                                                        : xhr.responseText

                                    if (xhr.status === 200) { resolve (response) }
                                                       else { reject  (_.extend (new Error (xhr.statusText), {
                                                                                        httpResponse: response,
                                                                                        httpStatus: xhr.status })) } } }
                        /*  Send
                         */
                        if (cfg.data) { xhr.send (cfg.data) }
                                 else { xhr.send () } }

                    else {
                        reject ('not implemented') } }) },

    progressCallbackWithSimulation: function (progress) { var simulated = 0
                                                        progress (0)
        return function (e) { if (e.lengthComputable) { progress (e.loaded / e.total) }
                                                 else { progress (simulated = ((simulated += 0.1) > 1) ? 0 : simulated) } } },
})

/*  An example of custom API layer over Http:

    1.  Converts request I/O to JSON
    2.  Interprets { success: true/false, value: ... } semantics
    3.  Adds cross-machine exception throwing
    
    ------------------------------------------------------------------------ */

JSONAPI = $singleton (Component, {

    $traits: [HttpMethods],

    request: function (type, path, cfg) { cfg = cfg || {}; var stackBeforeCall = _.hasReflection && $callStack.offset ((cfg.stackOffset || 0) + 1).asArray

                var cfg = _.extend2 ({ headers: { 'Content-Type': 'application/json; charset=utf-8' } }, cfg)
                if (cfg.what) {
                    cfg.data = JSON.stringify (cfg.what) }

                return Http
                        .request (type, '/api/' + path, cfg)
                        .finally (function (e, response) {

                            if (response) {
                                return JSON.parse (response) }

                            else if (e) {
                                if (e.httpResponse) {
                                    return JSON.parse (e.httpResponse) }
                                else {
                                    throw e } }

                            else {
                                throw new Error ('empty response') } })

                        .then (function (response) {
                            if (response.success) {
                                return response.value }
                            else {
                                if (response.parsedStack) {
                                    throw _.extend (new Error ('SERVER: ' + response.error), {
                                                        remote: true,
                                                        parsedStack: response.parsedStack.concat (stackBeforeCall || []) }) }
                                else {
                                    throw new Error (response.error) } } }) } });


/*  Browser-related code
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/*  Some handy jQuery extensions
    ======================================================================== */

if (jQuery) { (function ($) {

/*  We override some jQuery methods, so store previous impl. here
 */
var __previousMethods__ = _.clone ($.fn)

/*  Global functions
 */
_.extend ($, {

    /*  Instantiates svg elements
     */
    svg: function (tag) {
            var node = document.createElementNS ('http://www.w3.org/2000/svg', tag)
            if ((tag === 'svg') && !$platform.IE) {
                node.setAttribute ('xmlns', 'http://www.w3.org/2000/svg') }
            return $(node) } })

/*  Element methods
 */
.fn.extend ({

    /*  Provides auto-unbinding of $component $listeners from DOM events upon destroy
     */
    on: function (what, method) { var el = this, method = _.find (arguments, _.isFunction)

            /*  See useless/base/dynamic/stream.js for that queue/queuedBy interface.
             */
            if (method.queuedBy) {
                method.queuedBy.push ({ remove: function () { el.off (what, method) } }) }

            /*  Call original impl.
             */
            return __previousMethods__.on.apply (this, arguments) },

    /*  Links a data (or controller instance) to its DOM counterpart
     */
    item: function (value) {
        if (value) {                                                // setter
            if (this.length) {
                this[0]._item = value }
            return this }
        else {                                                      // getter
            return this.length ? this[0]._item : undefined } },

    /*  Writes properties directly to DOM object
     */
    props: function (what) {
        _.extend.apply (null, [this[0]].concat (arguments))
        return this },
    
    props2: function (what) {
        _.extend2.apply (null, [this[0]].concat (arguments))
        return this },

    /*  Wait semantics
     */
    hasWait: function () {
        return this.hasClass ('i-am-busy') },

    waitUntil: function (fn, then) { this.addClass ('i-am-busy').attr ('disabled', true)
        fn (this.$ (function () {
            this.removeClass ('i-am-busy').removeAttr ('disabled')
            if (then) {
                then.apply (null, arguments) } })); return this },

    /*  Checks if has parent upwards the hierarchy
     */
    hasParent: function (el) {
        var parent = this
        while (parent.length > 0) {
            if (parent[0] == (el[0] || el)) {
                return true }
            parent = parent.parent () }
        return false },

    /*  Returns a value or undefined (coercing empty values to undefined)
     */
    nonemptyValue: function () {
        var value = $.trim (this.val ())
        return (value.length == 0) ? undefined : value },

    /*  Returns a valid integer value or undefined (coercing NaN to undefined)
     */
    intValue: function () {
        var value = parseInt (this.nonemptyValue (), 10)
        return isNaN (value) ? undefined : value },

    /*  Checks if a mouse/touch event occured within element bounds
     */
    hitTest: function (event) {
        var offset = this.offset ()
        var pt = {
            x: event.clientX - offset.left,
            y: event.clientY - offset.top }
        return (pt.x >= 0) && (pt.y >= 0) && (pt.x < $(this).width ()) && (pt.y < $(this).height ()) },

    /*  Returns multiple attributes as object of { attr1: value, attr2: value, .. } form
     */
    attrs: function (/* name1, name2, ... */) {
        return _.object (_.map (arguments, function (name) { return [name, this.attr (name)] }, this)) },

    /*  Checks if any element upwards the hierarchy (including this element) conforms to a selector
     */
    belongsTo: function (selector) {
        return (this.is (selector) || this.parents (selector).length) },

    /*  Selects which classes element should have, based on a key selector

        Example: btn.selectClass (state, {  loading: 'btn-wait btn-disabled',
                                            error: 'btn-invalid',
                                            ok: '' })
     */
    selectClass: function (key, classes) {
        return this.removeClass (_.values (classes).join (' ')).addClass (classes[key]) },

    /*  Returns a valid integer of an attribute (or undefined)
     */
    attrInt: function (name) { return (this.attr (name) || '').integerValue },
    cssInt:  function (name) { return (this.css  (name) || '').integerValue },

    /*  Enumerates children, returning each child as jQuery object (a handy thing that default .each lacks)
     */
    eachChild: function (selector, fn) {
        _.each (this.find (selector), function (el) { fn ($(el)) }); return this },

    /*  Calls fn when current CSS transition ends
     */
    transitionend: function (fn) {
        return this.one ('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', fn.oneShot) },
    
    /*  Calls fn when current CSS animation ends
     */
    animationend: function (fn) {
        return this.one ('animationend webkitAnimationEnd oAnimationEnd oanimation MSAnimationEnd', fn.oneShot) },

    /*  1. Adds a class (that brings CSS animation)
        2. Waits until CSS animation done
        3. Removes that class
        4. Calls 'done'
     */
    animateWith: function (cls, done) {
        if (cls) {
            this.addClass (cls)
            this.animationend (this.$ (function () { this.removeClass (cls)
                                                     if (done) { done.call (this) } })) }
        return this },

    transitionWith: function (cls, done) {
        if (cls) {
            this.addClass (cls)
            this.transitionend (this.$ (function () { this.removeClass (cls)
                                                      if (done) { done.call (this) } })) }
        return this },

    /*  Powerful drag & drop abstraction, perfectly compatible with touch devices. Documentation pending.

        Simplest example:

            $(handle).drag ({
                start: function ()             { return this.leftTop () },                          // returns 'memo'
                move:  function (memo, offset) { this.css (memo.add (offset).asLeftTop) } }) })
     */
    drag: (function () {

        /*  Helper routine
         */
        var translateTouchEvent = function (e, desiredTarget) {
            return (e.originalEvent.touches &&
                    _.find (e.originalEvent.touches, function (touch) {
                                                        return $(touch.target).hasParent (desiredTarget) })) || e }
        /*  Impl
         */
        return function (cfg) {

            if (!$platform.touch && !window.__globalDragOverlay) {
                 window.__globalDragOverlay =
                     $('<div>').css ({
                        display: 'none',
                        position: 'fixed',
                        top: 0, right: 0, bottom: 0, left: 0,
                        zIndex: 999999 }).appendTo (document.body) }

            var overlay = window.__globalDragOverlay
            var button  = cfg.button || 1
                
            var begin = this.$ (function (initialEvent) { var relativeTo = (cfg.relativeTo || this)

                this.addClass (cfg.cls || '')
                
                if ($platform.touch || initialEvent.which === button) { var offset = relativeTo.offset (), memo = undefined
                    
                    if (!cfg.start || ((memo = cfg.start.call (cfg.context || this, new Vec2 (
                            // position (relative to delegate target)
                            initialEvent.pageX - offset.left,
                            initialEvent.pageY - offset.top), initialEvent)) !== false)) /* one can cancel drag by returning false from 'start' */ {
                        
                        var abort = undefined, unbind = undefined, end = undefined

                        memo = _.clone (memo)

                        var move = this.$ (function (e) {
                            if ($platform.touch || e.which === button) {
                                e.preventDefault ()
                                var translatedEvent = translateTouchEvent (e, this[0])
                                var offset = relativeTo.offset ()

                                memo = cfg.move.call (cfg.context || this, memo, new Vec2 (
                                    // offset (relative to initial event)
                                    translatedEvent.pageX - initialEvent.pageX,
                                    translatedEvent.pageY - initialEvent.pageY), new Vec2 (
                                    // position (relative to delegate target)
                                    translatedEvent.pageX - offset.left,
                                    translatedEvent.pageY - offset.top),
                                    // the event
                                    translatedEvent) || memo }
                            else {
                                abort (e) } })

                        unbind = function () { $(overlay || document.body)
                                                .css (overlay ? { display: 'none' } : {})
                                                .off ('mouseup touchend',    end)
                                                .off ('mousemove touchmove', move) }

                        end = this.$ (function (e) { unbind ()
                            
                            if (cfg.end) { var translatedEvent = translateTouchEvent (e, this[0])
                                cfg.end.call (cfg.context || this, memo, new Vec2 (
                                    // offset (relative to initial event)
                                    translatedEvent.pageX - initialEvent.pageX,
                                    translatedEvent.pageY - initialEvent.pageY), translatedEvent) }

                            this.removeClass (cfg.cls || '') })

                        abort = this.$ (function (e) { unbind (); end (e) })

                        $(overlay || document.body)
                            .css (overlay ? { display: '', cursor: cfg.cursor || '' } : {})
                            .on ('mousemove touchmove', move)
                            .one ('mouseup touchend', end)

                        if (cfg.callMoveAtStart) {
                            cfg.move.call (cfg.context || this, memo, Vec2.zero, new Vec2 (
                                // position (relative to delegate target)
                                initialEvent.pageX - offset.left,
                                initialEvent.pageY - offset.top),
                                // the event
                                initialEvent) } } } })

            var touchstartListener = _.$ (this, function (e) {
                var where = _.extend ({}, translateTouchEvent (e, this[0])) /* copy event, cuz on iPad it's re-used by browser */
                if ($platform.touch && cfg.longPress) {
                    var cancel = undefined
                    var timeout = window.setTimeout (_.$ (this, function () {
                        this.off ('touchmove touchend', cancel)
                        begin (where) }), 300)
                    cancel = this.$ (function () {
                        window.clearTimeout (timeout)
                        this.off ('touchmove touchend', cancel) })
                    this.one ('touchmove touchend', cancel) }
                else {
                    begin (where)
                    e.preventDefault ()
                    e.stopPropagation () } })

            this.on ($platform.touch ? 'touchstart' : 'mousedown', touchstartListener)

            return _.extend (this, {
                        cancel: this.$ (function () {
                            this.off ($platform.touch ? 'touchstart' : 'mousedown', touchstartListener) }) }) } }) (),

    /*  $(el).transform ({
                translate: new Vec2 (a, b),
                scale:     new Vec2 (x, y),
                rotate:    180 })
     */
    transform: function (cfg) {
        if (arguments.length === 0) { var components = (this.css ('transform') || '').match (/^matrix\((.+\))$/)
            if (components) {
                var m = components[1].split (',').map (parseFloat)
                return new Transform ({ a: m[0], b: m[1], c: m[2], d: m[3], e: m[4], f: m[5] }) }
            else {
                return Transform.identity } }
        else {
            return this.css ('transform', (_.isStrictlyObject (cfg) && (
                (cfg.translate ? ('translate(' + cfg.translate.x + 'px,' + cfg.translate.y + 'px) ') : '') +
                (cfg.rotate ? ('rotate(' + cfg.rotate + 'rad) ') : '') +
                (cfg.scale ? ('scale(' + (new Vec2 (cfg.scale).separatedWith (',')) + ')') : ''))) || '') } },

    /*  Other transform helpers
     */
    svgTranslate: function (pt) {
        return this.attr ('transform', 'translate(' + pt.x + ',' + pt.y + ')') },
    
    svgTransformMatrix: function (t) {
        var m = t.components
        return this.attr ('transform', 'matrix(' +
            m[0][0] + ',' + m[1][0] + ',' + m[0][1] + ',' + m[1][1] + ',' + m[0][2] + ',' + m[1][2] + ')') },

    svgTransformToElement: function (el) {
        return Transform.svgMatrix (this[0].getTransformToElement (el[0])) },

    svgBBox: function (bbox) {
        if (arguments.length === 0) { return new BBox (this[0].getBBox ()) }
                               else { return this.attr (bbox.xywh) } },

    /*  To determine display size of an element
     */
    outerExtent:    function () { return new Vec2 (this.outerWidth (), this.outerHeight ()) },
    extent:         function () { return new Vec2 (this.width (),      this.height ()) },
    innerExtent:    function () { return new Vec2 (this.innerWidth (), this.innerHeight ()) },

    /*  BBox accessors
     */
    outerBBox:      function () { return BBox.fromLTWH (_.extend (this.offset (), this.outerExtent ().asWidthHeight)) },
    clientBBox:     function () { return BBox.fromLTWH (this[0].getBoundingClientRect ()) },

    /*  Position accessors
     */
    leftTop:        function () { return new Vec2.fromLT (this.offset ()) },
    offsetInParent: function () { return Vec2.fromLeftTop (this.offset ()).sub (
                                         Vec2.fromLeftTop (this.parent ().offset ())) },

    /*  $(input).monitorInput ({
                    empty: function (yes) { ... },    // called when empty state changes
                    focus: function (yes) { ... } })  // called when focus state changes
     */
    monitorInput: function (cfg) {
        var change = function () {
            if ($.trim ($(this).val ()) === '') { cfg.empty (true) }
            else                                { cfg.empty (false) } }
        return this
            .keyup (change)
            .change (change)
            .focus (_.bind (cfg.focus || _.noop, cfg, true))
            .blur (_.bind (cfg.focus || _.noop, cfg, false)) },

    /*  Use instead of .click for more responsive clicking on touch devices.
        Reverts to .click on desktop
     */
    touchClick: function (fn, cfg) {
        var self = this
        cfg = cfg || {}
        if (!cfg.disableTouch && $platform.touch) { // touch experience
            var touchstartHandler = function (e) {
                fn.apply (this, arguments)
                e.preventDefault () // prevents nasty delayed click-focus effect on iOS
                return false }

            var clickHandler = function (e) {
                e.preventDefault ()
                return false }

            if (cfg.handler) {
                cfg.handler ({
                    unbind: function () {
                        self.off ('touchstart', touchstartHandler).off ('click', clickHandler) } }) }

            return this.on ('touchstart', touchstartHandler).on ('click', clickHandler) }

        else { // mouse experience
            if (cfg.handler) {
                cfg.handler ({
                    unbind: function () {
                        self.off ('click', fn) } }) }
            return this.click (fn) } },

    /*  Use instead of .dblclick for responsive doubleclick on touch devices
        Reverts to .dblclick on desktop
     */
    touchDoubleclick: function (fn) {
        if ($platform.touch) {
            var lastTime = Date.now ()
            return this.on ('touchend', function () {
                var now = Date.now ()
                if ((now - lastTime) < 200) {
                    fn.apply (this, arguments) }
                lastTime = now }) }
        else {
            return this.dblclick (fn) } },

    /*  Taken from stackoverflow discussion on how to prevent zoom-on-double-tap behavior on iOS
     */
    nodoubletapzoom: function () {
        return $(this).bind ('touchstart', function preventZoom (e) {
            var t2 = e.timeStamp
            var t1 = $(this).data ('lastTouch') || t2
            var dt = t2 - t1
            var fingers = e.originalEvent.touches.length
            $(this).data ('lastTouch', t2)
            if (!dt || dt > 500 || fingers > 1) {
                return } // not double-tap
            e.preventDefault ()                     // double tap - prevent the zoom
            $(e.target).trigger ('click') }) }      // also synthesize click events we just swallowed up
    })

}) (jQuery) };

;

$uselessFile = 'panic.js'

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
------------------------------------------------------------------------

Unit tests (bootstrap code)

------------------------------------------------------------------------
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

_.hasAsserts = true

_.extend (_, {

/*  a namespace where you put tests (for enumeration purposes)
    ======================================================================== */

    tests: {},

/*  A degenerate case of a test shell. We use it to bootstrap most critical
    useless.js internals, where real shell (Testosterone.js) is not available,
    as it itself depends on these utility. It takes test and test's subject as
    arguments (test before code, embodying test-driven philosophy) and executes
    test immediately, throwing exception if anything fails - which is simply
    the default behavior of $assert. So expect no advanced error reporting
    and no controlled execution by using this API.
    ======================================================================== */

    withTest:   function (name, test, defineSubject) {
                    defineSubject ()
                    _.runTest (name, test)
                    _.publishToTestsNamespace (name, test) },

/*  Publishes to _.tests namespace, but does not run
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    deferTest:  function (name, test, defineSubject) {
                    defineSubject ()
                    _.publishToTestsNamespace (name, test) },

    /*  INTERNALS (you won't need that)
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        runTest:    function (name, test) {
                        try {
                            if (_.isFunction (test)) {                               test () }
                                                else { _.each (test, function (fn) { fn () }) } }
                        catch (e) {
                            if (_.isAssertionError (e)) { var printedName = ((_.isArray (name) && name) || [name]).join ('.')
                                                          console.log (printedName + ':', e.message, '\n' + _.times (printedName.length, _.constant ('~')).join ('') + '\n')
                                                         _.each (e.notMatching, function (x) { console.log ('  •', x) }) }
                            throw e } },

        publishToTestsNamespace: function (name, test) {
                        if (_.isArray (name)) { // [suite, name] case
                            (_.tests[name[0]] || (_.tests[name[0]] = {}))[name[1]] = test }
                        else {
                            _.tests[name] = test } } })
        
/*  TEST ITSELF
    ======================================================================== */

_.withTest ('assert.js bootstrap', function () {

/*  One-argument $assert (requires its argument to be strictly 'true')
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    $assert (true)

    $assert (                       // public front end, may be replaced by environment)
        _.assert ===                // member of _ namespace (original implementation, do not mess with that)
        _.assertions.assert)        // member of _.assertions (for enumeration purposes)

    $assertNot (false)
    $assertNot (5)                  // NB: assertNot means 'assert not true', hence this will pass

/*  Multi-argument assert (requires its arguments be strictly equal to each other)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    $assert (2 + 2, 2 * 2, 4)                    // any number of arguments
    $assert ({ foo: [1,2,3] }, { foo: [1,2,3] }) // compares objects (deep match)
    $assert ({ foo: { bar: 1 }, baz: 2 },        // ignores order of properties
             { baz: 2, foo: { bar: 1 } })

    $assertNot (2 + 2, 5)

/*  Nonstrict matching (a wrapup over _.matches)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    $assertMatches ({ foo: 1, bar: 2 },
                    { foo: 1 })

/*  Nonstrict matching against complex objects (stdlib.js feature)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    if (_.hasStdlib) { $assertMatches ( { foo: [1,2], bar: 3 },
                                        { foo: [1] }) }

/*  Regex matching (stdlib.js feature)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    if (_.hasStdlib) { $assertMatches ('123', /[0-9]+/) }


/*  Type matching (plain)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    if (_.hasStdlib) {  $assertTypeMatches (42, 'number')
                        $assertFails (function () {
                            $assertTypeMatches ('foo', 'number') }) }

/*  Type matching (array type)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    if (_.hasStdlib) {  $assertTypeMatches ([1,2],   [])
                        $assertTypeMatches ([],      [])
                        $assertTypeMatches ([1,2,3], ['number'])
                        $assertTypeMatches ([],      ['number'])
                        $assertFails (function () {
                            $assertTypeMatches ([1,2,3],     ['string'])
                            $assertTypeMatches ([1,2,'foo'], ['number']) }) }

/*  Type matching (deep)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    if (_.hasStdlib) {  $assertTypeMatches ({

                            /*  Input object */

                                foo: 42,
                                bar: {
                                    even: 4,
                                    many: ['foo','bar'] } }, {

                            /*  Type contract */

                                foo: 'number',      // simple type check
                                qux: 'undefined',   // nonexisting match 'undefined' 
                                bar: {                                              // breakdown of complex object 
                                    even: function (n) { return (n % 2) === 0 },    // custom contract predicate    
                                    many: ['string'] } }) }                         // array contract (here, 'array of strings')

/*  Type matching ($prototype)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    if (_.hasOOP) { var Foo = $prototype (),
                        Bar = $prototype ()

        $assertTypeMatches ({ foo: new Foo (),
                              bar: new Bar () },

                            { foo: Foo,
                              bar: Bar })

        $assertFails (function () {
            $assertTypeMatches (new Bar (), Foo) }) };


/*  Argument contracts
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

if (_.hasStdlib) {

    var testF = function (_777, _foo_bar_baz, notInvolved) { $assertArguments (arguments) }

                    testF (777, 'foo bar baz')

    $assertFails (function () { testF (777, 42) }) }

/*  Ensuring throw (and no throw)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    $assertThrows (function () { throw 42 })
    $assertNotThrows (function () {})

/*  Ensuring throw (strict version)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    $assertThrows (     function () { throw 42 }, 42) // accepts either plain value or predicate
    $assertThrows (     function () { throw new Error ('42') }, _.matches ({ message: '42' }))

    $assertFails (function () {
        $assertThrows ( function () { throw 42 }, 24)
        $assertThrows ( function () { throw new Error ('42') }, _.matches ({ message: '24' })) })

/*  Ensuring execution
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    $assertEveryCalled     (function (a, b, c) { a (); a (); b (); c () })
    $assertEveryCalledOnce (function (a, b, c) { a ();       b (); c () })
    $assertEveryCalled     (function (x__3) { x__3 (); x__3 (); x__3 (); })

    /*$assertFails (function () {
        $assertEveryCalled     (function (a, b, c) { a (); b () })
        $assertEveryCalledOnce (function (a, b, c) { a (); b (); b (); c (); })
        $assertEveryCalled     (function (x__3) { x__3 (); x__3 (); }) })*/


/*  TODO:   1) add CPS support
            2) replace $assertCPS with this
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    if (_.hasStdlib) {

            $assertCalledWithArguments (   ['foo',
                                           ['foo', 'bar']], function (fn) {

                                        fn ('foo')
                                        fn ('foo', 'bar') }) }


/*  Ensuring CPS routine result (DEPRECATED)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    $assertCPS (function (then) { then ('foo', 'bar') }, ['foo', 'bar'])
    $assertCPS (function (then) { then ('foo') }, 'foo')
    $assertCPS (function (then) { then () })


/*  Ensuring assertion failure
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    $assertFails (function () {
        $fail                                           // simplest way to generate assertion
        $stub                                           // to mark code stubs (throws error)
        $assert ('not true')                            // remember that assert is more strict than JavaScript if clauses
        $assert ({ foo: 1, bar: 2 }, { foo: 1 })        // not be confused with _.matches behavior (use $assertMatches for that)
        $assert ([1,2,3,4], [1,2,3])                    // same for arrays
        $assert (['foo'], { 0: 'foo', length: 1 })      // array-like objects not gonna pass (regression test)
        $assertFails (function () {}) })                // $assertFails fails if passed code don't

/*  Default fail behavior (never depend on that, as it's environment-dependent)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    if ($assert === _.assertions.assert) {
        $assertThrows (function () { $fail }) }


/*  IMPLEMENTATION
    ======================================================================== */

}, function () {

    var assertImpl = function (positive) {
                        return function (__) {  var args = [].splice.call (arguments, 0)

                                                if (args.length === 1) {
                                                    if (positive && (args[0] !== true)) {
                                                        _.assertionFailed ({ notMatching: args }) } }

                                                else if (positive && (_.allEqual (args) !== true)) {
                                                    _.assertionFailed ({ notMatching: args }) }

                                                return true } }

    /*  Fix for _.matches semantics (should not be true for _.matches (42) (24))
     */
    $overrideUnderscore ('matches', function (matches) {
        return function (a) {
            return _.isObject (a) ? matches (a) : function (b) { return a === b } } })

    _.extend (_, _.assertions = {

        assert:    assertImpl (true),
        assertNot: assertImpl (false),

        assertCPS: function (fn, args, then) { var requiredResult = (args && (_.isArray (args) ? args : [args])) || []
            fn (function () {
                $assert ([].splice.call (arguments, 0), requiredResult)
                if (then) { then (); return true; } }) },

        assertNotCalled: function (context) {
            var inContext = true; context (function () { if (inContext) { $fail } }); inContext = false },

        assertEveryCalledOnce: function (fn, then) {
            return _.assertEveryCalled (_.hasTags ? $once (fn) : (fn.once = true, fn), then) },

        assertEveryCalled: function (fn_, then) { var fn    = _.hasTags ? $untag (fn_)    : fn_,
                                                      async = _.hasTags ? $async.is (fn_) : fn_.async
                                                      once  = _.hasTags ? $once.is (fn_)  : fn_.once

            var match     = once ? null : fn.toString ().match (/.*function[^\(]\(([^\)]+)\)/)
            var contracts = once ? _.times (fn.length, _.constant (1)) :
                                   _.map (match[1].split (','), function (arg) {
                                                                    var parts = (arg.trim ().match (/^(.+)__(\d+)$/))
                                                                    var num = (parts && parseInt (parts[2], 10))
                                                                    return _.isFinite (num) ? (num || false) : true })
            var status    = _.times (fn.length, _.constant (false))
            var callbacks = _.times (fn.length, function (i) {
                                                    return function () {
                                                        status[i] =
                                                            _.isNumber (contracts[i]) ?
                                                                ((status[i] || 0) + 1) : true
                                                        if (async && _.isEqual (status, contracts))
                                                            then () } })
            fn.apply (null, callbacks)

            if (!async)   { _.assert (status, contracts)
                if (then) { then () } } },

        assertCalledWithArguments: function (argsPattern, generateCalls) {
                                        return _.assert (_.arr (generateCalls), argsPattern) },

        assertCallOrder: function (fn) {
            var callIndex = 0
            var callbacks = _.times (fn.length, function (i) { return function () { arguments.callee.callIndex = callIndex++ } })
            fn.apply (null, callbacks)
            return _.assert (_.pluck (callbacks, 'callIndex'), _.times (callbacks.length, _.identity.arity1)) },

        assertMatches: function (value, pattern) {
            try {       return _.assert (_.matches.apply (null, _.rest (arguments)) (value)) }
            catch (e) { throw _.isAssertionError (e) ? _.extend (e, { notMatching: [value, pattern] }) : e } },

        assertNotMatches: function (value, pattern) {
            try {       return _.assert (!_.matches.apply (null, _.rest (arguments)) (value)) }
            catch (e) { throw _.isAssertionError (e) ? _.extend (e, { notMatching: [value, pattern] }) : e } },

        assertType: function (value, contract) {
            return _.assert (_.decideType (value), contract) },

        assertTypeMatches: function (value, contract) { 
                                return _.isEmpty (mismatches = _.typeMismatches (contract, value))
                                    ? true
                                    : _.assertionFailed ({
                                        message: 'provided value type not matches required contract',
                                        asColumns: true,
                                        notMatching: [
                                            { provided: value },
                                            { required: contract },
                                            { mismatches: mismatches }] }) },

        assertFails: function (what) {
            return _.assertThrows.call (this, what, _.isAssertionError) },

        assertThrows: function (what, errorPattern) {
                            var e = undefined, thrown = false
                                try         { what.call (this) }
                                catch (__)  { e = __; thrown = true }

                            _.assert.call (this, thrown)

                            if (arguments.length > 1) {
                                _.assertMatches.call (this, e, errorPattern) } },

        assertNotThrows: function (what) {
            return _.assertEveryCalled (function (ok) { what (); ok () }) },

        assertArguments: function (args, callee, name) {
            var fn    = (callee || args.callee).toString ()
            var match = fn.match (/.*function[^\(]\(([^\)]+)\)/)
            if (match) {
                var valuesPassed   = _.asArray (args);
                var valuesNeeded   = _.map (match[1].split (','),
                                            function (_s) {
                                                var s = (_s.trim ()[0] === '_') ? _s.replace (/_/g, ' ').trim () : undefined
                                                var n = parseInt (s, 10)
                                                return _.isFinite (n) ? n : s })

                var zap = _.zipWith ([valuesNeeded, valuesPassed], function (a, b) {
                                return (a === undefined) ? true : (a === b) })

                if (!_.every (zap)) {
                    _.assertionFailed ({ notMatching: _.nonempty ([[name, fn].join (': '), valuesNeeded, valuesPassed]) }) } } },

        fail: function () {
                _.assertionFailed () },

        fails: _.constant (function () {    // higher order version
                _.assertionFailed () }),

        stub: function () {
                _.assertionFailed () } })


    /*  DEFAULT FAILURE IMPL.
        ---------------------
        We do not subclass Error, because _.isTypeOf currently does not support
        inhertitance (UPDATE: now does) and it would cause troubles in test shell
        and logging facility. Thus a subclass is defined that way.
        ======================================================================== */

    _.extend (_, {

        assertionError: function (additionalInfo) {
                            return _.extend (new Error (
                                (additionalInfo && additionalInfo.message) || 'assertion failed'), additionalInfo, { assertion: true }) },

        assertionFailed: function (additionalInfo) {
                            throw _.extend (_.assertionError (additionalInfo), {
                                        stack: _.rest ((new Error ()).stack.split ('\n'), 3).join ('\n') }) },

        isAssertionError: function (e) {        
                            return e.assertion === true } })


    /*  $assert helper
        ======================================================================== */

    _.extend (_, {

        allEqual: function (values) {
                            return _.reduce (values, function (prevEqual, x) {
                                return prevEqual && _.isEqual (values[0], x) }, true) } })

    /*  Publish asserts as $-things (will be replaced by Testosterone.js onwards,
        thus configurable=true)
        ======================================================================== */

    _.each (_.keys (_.assertions), function (name) {
        $global.define ('$' + name, _[name], { configurable: true }) })

})




;
/*  Uncaught exception handling facility
    ======================================================================== */

(function () {

    _.hasUncaught = true

    var reThrownTag = ' [re-thrown by a hook]' // marks error as already processed by globalUncaughtExceptionHandler

    var globalUncaughtExceptionHandler = _.globalUncaughtExceptionHandler = function (e) {

        var chain = arguments.callee.chain
                    arguments.callee.chain = _.reject (chain, _.property ('catchesOnce'))

        if (chain.length) {
            for (var i = 0, n = chain.length; i < n; i++) {
                try {
                    chain[i] (e)
                    break }
                catch (newE) {
                    console.log (newE)
                    if (i === n - 1) {
                        newE.message += reThrownTag
                        throw newE }
                    else {
                        if (newE && (typeof newE === 'object')) { newE.originalError = e }
                        e = newE } } } }
        else {
            e.message += reThrownTag
            throw e } }

    _.withUncaughtExceptionHandler = function (handler, context_) { var context = context_ || _.identity

        if (context_) {
            handler.catchesOnce = true }

                               globalUncaughtExceptionHandler.chain.unshift (handler)
        context (function () { globalUncaughtExceptionHandler.chain.remove  (handler) }) }

    globalUncaughtExceptionHandler.chain = []

    switch ($platform.engine) {
        case 'node':
            require ('process').on ('uncaughtException', globalUncaughtExceptionHandler); break;

        case 'browser':
            window.addEventListener ('error', function (e) {

                if (e.message.indexOf (reThrownTag) < 0) { // if not already processed by async hooks

                    if (e.error) {
                        globalUncaughtExceptionHandler (e.error) }

                    else { // emulate missing .error (that's Safari)
                        globalUncaughtExceptionHandler (_.extend (new Error (e.message), {
                            stub: true,
                            stack: 'at ' + e.filename + ':' + e.lineno + ':' + e.colno })) } } }) }
}) ();
/*  Provides call stack persistence across async call boundaries.
    ======================================================================== */

(function () {

    if ($platform.Browser) {

        _.hasUncaughtAsync = true

        var globalAsyncContext = undefined

        var listenEventListeners = function (genAddEventListener, genRemoveEventListener) {

            var override = function (obj) {

                obj.addEventListener    = genAddEventListener    (obj.addEventListener)
                obj.removeEventListener = genRemoveEventListener (obj.removeEventListener) }

            if (window.EventTarget) {
                override (window.EventTarget.prototype) }

            else {
                override (Node.prototype)
                override (XMLHttpRequest.prototype) } }

        var asyncHook = function (originalImpl, callbackArgumentIndex) {
            return __supressErrorReporting = function () {

                    var asyncContext = {
                        name: name,
                        stack: (new Error ()).stack,
                        asyncContext: globalAsyncContext }

                    var args = _.asArray (arguments)
                    var fn   = args[callbackArgumentIndex]

                    if (!_.isFunction (fn)) { throw new Error ('[uncaughtAsync.js] callback should be a function')}

                    fn.__uncaughtJS_wrapper = args[callbackArgumentIndex] = __supressErrorReporting = function () {

                        globalAsyncContext = asyncContext

                        try       { return fn.apply (this, arguments) }
                        catch (e) { _.globalUncaughtExceptionHandler (_.extend (e, { asyncContext: asyncContext })) } }

                    return originalImpl.apply (this, args) } }

        window.setTimeout = asyncHook (window.setTimeout, 0)

        /*  Manually catch uncaught exceptions at async call boundaries (providing missing .error for Safari)
         */ 
        listenEventListeners (
            function (addEventListener) { return asyncHook (addEventListener, 1) },
            function (removeEventListener) {
                return function (name, fn, bubble, untrusted) {
                   return removeEventListener.call (this, name, fn.__uncaughtJS_wrapper || fn, bubble) } }) }

}) ();
/*  Self-awareness module
    ======================================================================== */

_.hasReflection = true

_.tests.reflection = {

    'file paths': function () {
        $assert ($sourcePath .length > 0)
        $assert ($uselessPath.length > 0) },

    'readSource': function () { var uselessJS = $uselessPath + $uselessFile

        SourceFiles.read (uselessJS, function (text) {
            $assert (text.length > 0) })

        SourceFiles.line (uselessJS, 0, function (line) {
            $assert (line.length > 0) }) },

    'CallStack from error': function () {
        try {
            throw new Error ('oh fock') }
        catch (e) {
            $assertTypeMatches (CallStack.fromError (e), CallStack) } },

    '$callStack': function (testDone) {

        /*  That's how you access call stack at current location
         */
        var stack = $callStack

        /*  It is an array of entries...
         */
        $assert (_.isArray (stack))

        /*  ...each having following members
         */
        $assertTypeMatches (stack[0], {
            callee:         'string',       // function name
            calleeShort:    'string',       // short function name (only the last part of dot-sequence)
            file:           'string',       // full path to source file at which call occurred
            fileName:       'string',       // name only (with extension)
            fileShort:      'string',       // path relative to $sourcePath
            thirdParty:     'boolean',      // denotes whether the call location occured at 3rd party library
            index:          'boolean',      // denotes whether the call location occured at index page
           'native':        'boolean',      // denotes whether the call location occured in native impl.
            line:           'number',       // line number
            column:         'number',       // character number
            source:         'string',       // source code (may be not ready right away)
            sourceReady:    'function' })   // a barrier, opened when source is loaded (see dynamic/stream.js on how-to use)

        /*  $callStack is CallStack instance, providing some helpful utility:
         */
        $assert (_.isTypeOf (CallStack, stack))

        /*  1. clean CallStack (with 3rdparty calls stripped)
         */
        $assert (_.isTypeOf (CallStack, stack.clean))

        /*  2. shifted by some N (useful for error reporting, to strip error reporter calls)
         */
        $assert (_.isTypeOf (CallStack, stack.offset (2)))

        /*  3. filter and reject semantics supported, returning CallStack instances
         */
        $assert (_.isTypeOf (CallStack, stack.filter (_.identity)))
        $assert (_.isTypeOf (CallStack, stack.reject (_.identity)))

        $assertEveryCalled ($async (function (sourceReady, sourcesReady, safeLocationReady) {

            /*  4. source code access, either per entry..
             */
            stack[0].sourceReady (function (src) {               // sourceReady is barrier, i.e. if ready, called immediately
                $assert (typeof src, 'string'); sourceReady () })

            /*  5. ..or for all stack
             */
            stack.sourcesReady (function () {                     // sourcesReady is barrier, i.e. if ready, called immediately
                _.each (stack, function (entry) {
                    $assert (typeof entry.source, 'string') }); sourcesReady () })

            /*  Safe location querying
             */
            stack.safeLocation (7777).sourceReady (function (line) {
                $assert ('??? WRONG LOCATION ???', line); safeLocationReady () }) }), testDone) },

    'Prototype.$meta': function (done) {
        var Dummy = $prototype ()

        Dummy.$meta (function (meta) {
            $assertMatches (meta, { name: 'Dummy', type: 'prototype' })
            done () }) },

    'Trait.$meta': function (done) {
        var Dummy = $trait ()
        Dummy.$meta (function (meta) {
            $assertMatches (meta, { name: 'Dummy', type: 'trait' })
            done () }) }
}


/*  Custom syntax (defined in a way that avoids cross-dependency loops)
 */
_.defineKeyword ('callStack',   function () {
    return CallStack.fromRawString (CallStack.currentAsRawString).offset ($platform.NodeJS ? 1 : 0) })

_.defineKeyword ('currentFile', function () {
    return (CallStack.rawStringToArray (CallStack.currentAsRawString)[$platform.NodeJS ? 3 : 1] || { file: '' }).file })

_.defineKeyword ('uselessPath', _.memoize (function () {
    return _.initial (__filename.split ('/'), $platform.NodeJS ? 2 : 1).join ('/') + '/' }) )

_.defineKeyword ('sourcePath', _.memoize (function () { var local = ($uselessPath.match (/(.+)\/node_modules\/(.+)/) || [])[1]
    return local ? (local + '/') : $uselessPath }))


/*  Port __filename for browsers
 */
if ($platform.Browser) {
    _.defineProperty (window, '__filename', function () { return $currentFile }) }


/*  Source code access (cross-platform)
 */
SourceFiles = $singleton (Component, {

    /*apiConfig: {
        port:      1338,
        hostname: 'locahost',
        protocol: 'http:' },*/

    line: function (file, line, then) {
        SourceFiles.read (file, function (data) {
            then ((data.split ('\n')[line] || '').trimmed) }) },

    read: $memoizeCPS (function (file, then) {
        if (file.indexOf ('<') < 0) { // ignore things like "<anonymous>"
            try {
                if ($platform.NodeJS) {
                    then (require ('fs').readFileSync (file, { encoding: 'utf8' }) || '') }
                else {
                    /*  Return response body regardless of status code
                     */
                    var xhr = new XMLHttpRequest ()
                    xhr.open ('GET', file, true)
                    xhr.onreadystatechange = function () { if (xhr.readyState == 4) { then (xhr.responseText) } }
                    xhr.send (null) } }
            catch (e) {
                then ('') } }
        else {
            then ('') } }),

    write: function (file, text, then) {

        if ($platform.NodeJS) {

            this.read (file, function (prevText) { // save previous version at <file>.backups/<date>

                var fs   = require ('fs'),
                    opts = { encoding: 'utf8' }

          try { fs.mkdirSync     (file + '.backups') } catch (e) {}
                fs.writeFileSync (file + '.backups/' + Date.now (), prevText, opts)
                fs.writeFileSync (file,                             text,     opts)

                then () }) }
            
        else {
            JSONAPI
                .post ('source/' + file, _.extend2 ({}, this.apiConfig, { what: { text: text } }))
                .then (function () {
                    log.ok (file, '— successfully saved')
                    if (then) {
                        then () } }) }} })


/*  Callstack API
 */
CallStack = $extends (Array, {

    current: $static ($property (function () {
        return CallStack.fromRawString (CallStack.currentAsRawString).offset (1) })),

    fromError: $static (function (e) {
        if (e && e.parsedStack) {
            return CallStack.fromParsedArray (e.parsedStack).offset (e.stackOffset || 0) }
        else if (e && e.stack) {
            return CallStack.fromRawString (e.stack).offset (e.stackOffset || 0) }
        else {
            return CallStack.fromParsedArray ([]) } }),

    fromErrorWithAsync: $static (function (e) {
        var stackEntries = CallStack.fromError (e),
            asyncContext = e.asyncContext

        while (asyncContext) {
            stackEntries = stackEntries.concat (CallStack.fromRawString (asyncContext.stack))
            asyncContext = asyncContext.asyncContext }

        return stackEntries.mergeDuplicateLines }),

    locationEquals: $static (function (a, b) {
        return (a.file === b.file) && (a.line === b.line) && (a.column === b.column) }),

    safeLocation: function (n) {
        return this[n] || {
            callee: '', calleeShort: '', file: '',
            fileName: '', fileShort: '', thirdParty:    false,
            source: '??? WRONG LOCATION ???',
            sourceReady: _.barrier ('??? WRONG LOCATION ???') } },

    mergeDuplicateLines: $property (function () {
        return CallStack.fromParsedArray (
            _.map (_.partition2 (this, function (e) { return e.file + e.line }),
                    function (group) {
                        return _.reduce (_.rest (group), function (memo, entry) {
                            memo.callee      = (memo.callee      || '<anonymous>') + ' → ' + (entry.callee      || '<anonymous>')
                            memo.calleeShort = (memo.calleeShort || '<anonymous>') + ' → ' + (entry.calleeShort || '<anonymous>')
                            return memo }, _.clone (group[0])) })) }),

    clean: $property (function () {
        var clean = this.mergeDuplicateLines.reject (function (e, i) { return (e.thirdParty || e.hide) && (i !== 0) })
        return (clean.length === 0) ? this : clean }),

    asArray: $property (function () {
        return _.asArray (this) }),

    offset: function (N) {
        return (N && CallStack.fromParsedArray (_.rest (this, N))) || this },

    initial: function (N) {
        return (N && CallStack.fromParsedArray (_.initial (this, N))) || this },

    concat: function (stack) {
        return CallStack.fromParsedArray (this.asArray.concat (stack.asArray)) },

    filter: function (fn) {
        return CallStack.fromParsedArray (_.filter (this, fn)) },

    reject: function (fn) {
        return CallStack.fromParsedArray (_.reject (this, fn)) },

    reversed: $property (function () {
        return CallStack.fromParsedArray (_.reversed (this)) }),

    sourcesReady: function (then) {
        return _.allTriggered (_.pluck (this, 'sourceReady'), then) },

    /*  Internal impl.
     */
    constructor: function (arr) { Array.prototype.constructor.call (this)

        _.each (arr, function (entry) {
            if (!entry.sourceReady) {
                 entry.sourceReady = _.barrier ()
                 SourceFiles.line ((entry.remote ? 'api/source/' : '') + entry.file, entry.line - 1, function (src) {
                    entry.hide = src.contains ('// @hide')
                    entry.sourceReady (entry.source = src.replace ('// @hide', '')) }) }

            this.push (entry) }, this) },

    fromParsedArray: $static (function (arr) {
        return new CallStack (arr) }),

    currentAsRawString: $static ($property (function () {
        var cut = $platform.Browser ? 3 : 2
        return _.rest (((new Error ()).stack || '').split ('\n'), cut).join ('\n') })),

    shortenPath: $static (function (path) {
                    var relative = path.replace ($uselessPath, '')
                                       .replace ($sourcePath,  '')
                    return (relative !== path)
                        ? relative.replace (/^node_modules\//, '')
                        : path.split ('/').last }), // extract last part of /-separated sequence

    isThirdParty: $static (_.bindable (function (file) { var local = file.replace ($sourcePath, '')
                    return ($platform.NodeJS && (file[0] !== '/')) || // from Node source
                           (local.indexOf ('/node_modules/') >= 0) ||
                           (file.indexOf  ('/node_modules/') >= 0 && !local) ||
                           (local.indexOf ('underscore') >= 0) ||
                           (local.indexOf ('jquery') >= 0) })),

    fromRawString: $static (_.sequence (
        function (rawString) {
            return CallStack.rawStringToArray (rawString) },

        function (array) {
            return _.map (array, function (entry) {
                return _.extend (entry, {
                            calleeShort:    _.last (entry.callee.split ('.')),
                            fileName:       _.last (entry.file.split ('/')),
                            fileShort:      CallStack.shortenPath (entry.file),
                            thirdParty:     CallStack.isThirdParty (entry.file) && !entry.index }) }) },

        function (parsedArrayWithSourceLines) { return CallStack.fromParsedArray (parsedArrayWithSourceLines) })),

    rawStringToArray: $static (function (rawString) { var lines = (rawString || '').split ('\n')

        return _.filter2 (lines, function (line) { line = line.trimmed

            var callee, fileLineColumn = [], native_ = false
            var planA = undefined, planB = undefined

            if ((planA = line.match (/at (.+) \((.+)\)/)) ||
                (planA = line.match (/(.*)@(.*)/))) {

                callee         =         planA[1]
                native_        =        (planA[2] === 'native')
                fileLineColumn = _.rest (planA[2].match (/(.*):(.+):(.+)/) || []) }

            else if ((planB = line.match (/^(at\s+)*(.+):([0-9]+):([0-9]+)/) )) {
                fileLineColumn = _.rest (planB, 2) }

            else {
                return false } // filter this shit out

            if ((callee || '').indexOf ('__supressErrorReporting') >= 0) {
                return false }

            return {
                beforeParse: line,
                callee:      callee || '',
                index:       $platform.Browser && (fileLineColumn[0] === window.location.href),
               'native':     native_,
                file:        fileLineColumn[0] || '',
                line:       (fileLineColumn[1] || '').integerValue,
                column:     (fileLineColumn[2] || '').integerValue } }) }) })

/*  Reflection for $prototypes
 */
$prototype.impl.findMeta = function (stack) {

    return function (then) {

        _.cps.find (CallStack.fromRawString (stack).reversed,

                    function (entry, found) {
                        entry.sourceReady (function (text) { var match = (text || '').match (
                                                                             /([A-z]+)\s*=\s*\$(prototype|singleton|component|extends|trait|aspect)/)
                            found ((match && {
                                name: match[1],
                                type: match[2],
                                file: entry.fileShort }) || false) }) },

                    function (found) {
                        then (found || {}) }) } }

$prototype.macro (function (def, base) {

    if (!def.$meta) {

        var findMeta = _.cps.memoize ($prototype.impl.findMeta (CallStack.currentAsRawString))

        _.defineMemoizedProperty (findMeta, 'promise', function () {
              return new Promise (findMeta) })

        def.$meta = $static (findMeta) }

    return def })




;
_.hasLog = true

_.tests.log = {

    basic: function () {

        log         ('log (x)')         //  Basic API

        log.green      ('log.green')       //  Use for plain colored output.
        log.boldGreen  ('log.boldGreen')
        log.darkGreen  ('log.darkGreen')
        log.blue       ('log.blue')
        log.boldBlue   ('log.boldBlue')
        log.darkBlue   ('log.darkBlue')
        log.orange     ('log.orange')
        log.boldOrange ('log.boldOrange')
        log.darkOrange ('log.darkOrange')
        log.red        ('log.red')         //  ..for more colors, see the implementation below
        log.boldRed    ('log.boldRed')
        log.darkRed    ('log.darkRed')
        log.pink       ('log.pink')
        log.boldPink   ('log.boldPink')
        log.darkPink   ('log.darkPink')

        log.margin ()
        log.margin ()  // collapses

        log.bright ('log.bright')
        log.dark   ('log.dark')

        log.margin ()

        log.success ('log.success')     //  Use for quality production logging (logging that lasts).
        log.ok      ('log.ok')
        log.g       ('log.g')
        log.gg      ('log.gg')
        log.info    ('log.info')        //  Printed location greatly helps to find log cause in code.
        log.i       ('log.i')
        log.ii      ('log.ii')
        log.warning ('log.warning')     //  For those who cant remember which one, there's plenty of aliases
        log.warn    ('log.warn')
        log.w       ('log.w')
        log.ww      ('log.ww')        
        log.error   ('log.error')
        log.e       ('log.e')
        log.ee      ('log.ee')

        $assert (log ('log (x) === x'), 'log (x) === x')    // Can be used for debugging of functional expressions
                                                            // (as it returns it first argument, like in _.identity)

        log.info    (log.stackOffset (2), 'log.info (log.config ({ stackOffset: 2 }), ...)')

        log.write   ('Consequent', 'arguments', log.color.red, ' joins', 'with', 'whitespace')

        log.write (                     'Multi',
                    log.color.red,      'Colored',
                    log.color.green,    'Output',
                    log.color.blue,     'For',
                    log.color.orange,   'The',
                    log.color.pink,     'Fucking',
                    log.color.none,     'Win')

        log.write   (log.boldLine)  //  ASCII art <hr>
        log.write   (log.thinLine)
        log.write   (log.line)

        log.write   (log.indent (1),
                     ['You can set indentation',
                      'that is nicely handled',
                      'in case of multiline text'].join ('\n'))

        log.orange  (log.indent (2), '\nCan print nice table layout view for arrays of objects:\n')
        log.orange  (log.config ({ indent: 2, table: true }), [
            { field: 'line',    matches: false, valueType: 'string', contractType: 'number' },
            { field: 'column',  matches: true,  valueType: 'string', contractType: 'number' }])

        log.write ('\nObject:', { foo: 1, bar: 2, qux: 3 })         //  Object printing is supported
        log.write ('Array:', [1, 2, 3])                             //  Arrays too
        log.write ('Function:', _.identity)                         //  Prints code of a function

        log.write ('Complex object:', { foo: 1, bar: { qux: [1,2,3], garply: _.identity }}, '\n\n');

        log.withConfig (log.indent (1), function () {
            log.pink ('Config stack + scopes + higher order API test:')
            _.each ([5,6,7], logs.pink (log.indent (1), 'item = ', log.color.blue)) })

        $assert (log (42), 42) } }

_.extend (

    /*  Basic API
     */
    log = function () {
        return log.write.apply (this, [log.config ({ location: true, stackOffset: 1 })].concat (_.asArray (arguments))) }, {

    Config: $prototype (),

    /*  Could be passed as any argument to any write function.
     */
    config: function (cfg) {
        return new log.Config (cfg) } })


_.extend (log, {

    /*  Shortcut for common cases
     */
    indent: function (n) {
        return log.config ({ indent: n }) },

    stackOffset: function (n) {
        return log.config ({ stackOffset: n }) },

    where: function (wat) {
        return log.config ({ location: true, where: wat || undefined }) },

    color: _.extend (function (x) { return (log.color[x] || {}).color },

        _.object (
        _.map  ([['none',        '0m',           ''],
                 ['red',         '31m',          'color:crimson'],
                 ['boldRed',    ['31m', '1m'],   'color:crimson;font-weight:bold'],
                 ['darkRed',    ['31m', '2m'],   'color:crimson'],
                 ['blue',        '36m',          'color:royalblue'],
                 ['boldBlue',   ['36m', '1m'],   'color:royalblue;font-weight:bold;'],
                 ['darkBlue',   ['36m', '2m'],   'color:rgba(65,105,225,0.5)'],
                 ['boldOrange', ['33m', '1m'],   'color:saddlebrown;font-weight:bold;'],
                 ['darkOrange', ['33m', '2m'],   'color:saddlebrown'],
                 ['orange',      '33m',          'color:saddlebrown'],
                 ['brown',      ['33m', '2m'],   'color:saddlebrown'],
                 ['green',       '32m',          'color:forestgreen'],
                 ['boldGreen',  ['32m', '1m'],   'color:forestgreen;font-weight:bold'],
                 ['darkGreen',  ['32m', '2m'],   'color:forestgreen;opacity:0.5'],
                 ['pink',        '35m',          'color:magenta'],
                 ['boldPink',   ['35m', '1m'],   'color:magenta;font-weight:bold;'],
                 ['darkPink',   ['35m', '2m'],   'color:magenta'],
                 ['black',       '0m',           'color:black'],
                 ['bright',     ['0m', '1m'],    'color:rgba(0,0,0);font-weight:bold'],
                 ['dark',       ['0m', '2m'],    'color:rgba(0,0,0,0.25)']],

             function (def) {
                return [def[0], log.config ({ color: { shell: _.coerceToArray (_.map2 (def[1], _.prepends ('\u001B['))).join (), css: def[2] }})] }))),

    /*  Need one? Take! I have plenty of them!
     */
    boldLine:   '======================================',
    line:       '--------------------------------------',
    thinLine:   '......................................',

    /*  Set to true to precede each log message with date and time (useful for server side logs).
     */
    timestampEnabled: false,

    /*  For hacking log output (contextFn should be conformant to CPS interface, e.g. have 'then' as last argument)
     */
    withWriteBackend: $scope (function (release, backend, contextFn, done) { var prev = log.writeBackend.value
                                                                                        log.writeBackend.value = backend
        contextFn (function /* release */ (then) { // @hide
                     release (function () {                                             log.writeBackend.value = prev
                        if (then) then ()
                        if (done) done () }) }) }),  

    /*  For writing with forced default backend
     */
    writeUsingDefaultBackend: function (/* arguments */) { var args = arguments
        log.withWriteBackend (
            log.impl.defaultWriteBackend,
            function (done) {
                log.write.apply (null, args); done () }) },

    writeBackend: function () {
        return arguments.callee.value || log.impl.defaultWriteBackend },

    withConfig: function (config, what) {  log.impl.configStack.push (log.impl.configure ([{ stackOffset: -1 }, config]))
                     var result = what (); log.impl.configStack.pop ();
                  return result },

    currentConfig: function () { return log.impl.configure (log.impl.configStack) },

    /*  Use instead of 'log.newline ()' for collapsing newlines
     */
    margin: (function () {
                var lastWrite = undefined
                return function () {
                    if (lastWrite !== log.impl.numWrites)
                        log.newline ()
                        lastWrite   = log.impl.numWrites } }) (),

    /*  Internals
     */
    impl: {

        configStack: [],
        numWrites: 0,

        configure: function (configs) {
            return _.reduce2 (
                { stackOffset: 0, indent: 0 },
                _.nonempty (configs), function (memo, cfg) {
                                        return _.extend (memo, _.nonempty (cfg), {
                                            indent:      memo.indent      + (cfg.indent || 0),
                                            stackOffset: memo.stackOffset + (cfg.stackOffset || 0) }) }) },

        /*  Nuts & guts
         */
        write: $restArg (_.bindable (function () { var writeBackend = log.writeBackend ()

            log.impl.numWrites++

            var args   = _.asArray (arguments)
            var config = log.impl.configure ([{ stackOffset: $platform.NodeJS ? 1 : 3,
                                                indent: writeBackend.indent || 0 }].concat (log.impl.configStack))

            var runs = _.reduce2 (

                /*  Initial memo
                 */
                [],
                
                /*  Arguments split by configs
                 */
                _.partition3 (args, _.isTypeOf.$ (log.Config)),
                
                /*  Gather function
                 */
                function (runs, span) {
                    if (span.label === true) { config = log.impl.configure ([config].concat (span.items))
                                               return runs }
                                        else { return runs.concat ({ config: config,
                                                                     text: log.impl.stringifyArguments (span.items, config) }) } })

            var trailNewlinesMatch = runs.last && runs.last.text.reversed.match (/(\n*)([^]*)/)
            var trailNewlines = (trailNewlinesMatch && trailNewlinesMatch[1]) // dumb way to select trailing newlines (i'm no good at regex)
            if (trailNewlinesMatch) {
                runs.last.text = trailNewlinesMatch[2].reversed }


            /*  Split by linebreaks
             */
            var newline = {}
            var lines = _.pluck.with ('items',
                            _.reject.with (_.property ('label'),
                                _.partition3.with (_.equals (newline),
                                    _.scatter (runs, function (run, i, emit) {
                                                        _.each (run.text.split ('\n'), function (line, i, arr) {
                                                                                            emit (_.extended (run, { text: line })); if (i !== arr.lastIndex) {
                                                                                            emit (newline) } }) }))))

            var totalText       = _.pluck (runs, 'text').join ('')
            var where           = config.where || log.impl.walkStack ($callStack) || {}
            var indentation     = (config.indentPattern || '\t').repeats (config.indent)

            writeBackend ({
                lines:         lines,
                config:        config,
                color:         config.color,
                when:          Date.now (),
                args:          _.reject (args, _.isTypeOf.$ (log.Config)),
                indentation:   indentation,
                indentedText:  lines.map (_.seq (_.pluck.tails2 ('text'),
                                                 _.joinsWith (''),
                                                 _.prepends (indentation))).join ('\n'),
                text:          totalText,
                codeLocation:  (config.location && log.impl.location (where)) || '',
                trailNewlines: trailNewlines || '',
                where:         (config.location && where) || undefined })

            return _.find (args, _.not (_.isTypeOf.$ (log.Config))) })),

        walkStack: function (stack) {
            return _.find (stack.clean.offset (2), function (entry) { return (entry.fileShort.indexOf ('base/log.js') < 0) }) || stack[0] },

        defaultWriteBackend: function (params) {

            var codeLocation = params.codeLocation

            if ($platform.NodeJS) {

                var lines = _.map (params.lines, function (line) {
                                                    return params.indentation + _.map (line, function (run) {
                                                        return (run.config.color
                                                                    ? (run.config.color.shell + run.text + '\u001b[0m')
                                                                    : (                         run.text)) }).join ('') }).join ('\n')

                if (log.timestampEnabled) {
                    lines = log.color ('dark').shell + _.bullet (log.impl.timestamp (params.when) + ' ', log.color ('none').shell + lines) }

                console.log (lines,
                             log.color ('dark').shell + codeLocation + '\u001b[0m',
                             params.trailNewlines) }

            else {
                console.log.apply (console, _.reject.with (_.equals (undefined), [].concat (

                    _.map (params.lines, function (line, i) {
                                            return params.indentation + _.reduce2 ('', line, function (s, run) {
                                                return s + (run.text && ((run.config.color ? '%c' : '') +
                                                    run.text) || '') }) }).join ('\n') + (codeLocation && ('%c ' + codeLocation) || ''),

                    (_.scatter (params.lines, function (line, i, emit) {
                        _.each (line, function (run) {
                            if (run.text && run.config.color) { emit (run.config.color.css) } }) }) || []).concat (codeLocation ? 'color:rgba(0,0,0,0.25)' : []),

                    params.trailNewlines))) } },

        /*  Formats timestamp preceding log messages
         */
        timestamp: function (x) {
            var date = new Date (x)
            return (String.leadingZero (date.getDay ()) + '/' +
                    String.leadingZero (date.getMonth () + 1) + ' ' +
                    String.leadingZero (date.getHours ()) + ':' +
                    String.leadingZero (date.getMonth ())) },

        /*  Formats that "function @ source.js:321" thing
         */
        location: function (where) {
            return _.quoteWith ('()', _.nonempty ([where.calleeShort,
                                      _.nonempty ([where.fileName,
                                                   where.line]).join (':')]).join (' @ ')) },


        /*  This could be re-used by outer code for turning arbitrary argument lists into string
         */
        stringifyArguments: function (args, cfg) {
            return _.map (args, function (arg) {
                var x = log.impl.stringify (arg, cfg)
                return (cfg.maxArgLength ? x.limitedTo (cfg.maxArgLength) : x) }).join (' ') },

        /*  Smart object stringifier
         */
        stringify: function (what, cfg) { cfg = cfg || {}
            if (_.isTypeOf (Error, what)) {
                var str = log.impl.stringifyError (what)
                if (what.originalError) {
                    return str + '\n\n' + log.impl.stringify (what.originalError) }
                else {
                    return str } }

            else if (_.isTypeOf (CallStack, what)) {
                return log.impl.stringifyCallStack (what) }

            else if (typeof what === 'object') {
                if (_.isArray (what) && what.length > 1 && _.isObject (what[0]) && cfg.table) {
                    return log.asTable (what) }
                else {
                    return _.stringify (what, cfg) } }
                    
            else if (typeof what === 'string') {
                return what }

            else {
                return _.stringify (what) } },
        
        stringifyError: function (e) {
            try {       
                var stack   = CallStack.fromErrorWithAsync (e).offset (e.stackOffset || 0).clean
                var why     = (e.message || '').replace (/\r|\n/g, '').trimmed.limitedTo (120)

                return ('[EXCEPTION] ' + why + '\n\n') +
                    (e.notMatching && (_.map (_.coerceToArray (e.notMatching || []),
                                        log.impl.stringify.then (_.prepends ('\t'))).join ('\n') + '\n\n') || '') +
                    log.impl.stringifyCallStack (stack) + '\n' }
            catch (sub) {
                return 'YO DAWG I HEARD YOU LIKE EXCEPTIONS... SO WE THREW EXCEPTION WHILE PRINTING YOUR EXCEPTION:\n\n' + sub.stack +
                    '\n\nORIGINAL EXCEPTION:\n\n' + e.stack + '\n\n' } },

        stringifyCallStack: function (stack) {
            return log.columns (stack.map (
                function (entry) { return [
                    '\t' + 'at ' + entry.calleeShort.first (30),
                    _.nonempty ([entry.fileShort, ':', entry.line]).join (''),
                    (entry.source || '').first (80)] })).join ('\n') } } })


/*  Printing API
 */
;(function () {                                                var write = log.impl.write
   _.extend (log,
             log.printAPI =
                    _.object (
                    _.concat (            [[            'newline', write.$ (log.config ({ location: false }), '') ],
                                           [              'write', write                                                          ]],
                            _.flat (_.map (['red failure error e',
                                                    'blue info i',
                                               'darkBlue minor m',
                                          'orange warning warn w',
                                             'green success ok g',
                                                   'darkGreen dg',
                                            'pink notice alert p',
                                                    'boldPink pp',
                                                    'dark hint d',
                                                   'boldGreen gg',
                                                       'bright b',
                                          'boldRed bloody bad ee',
                                                    'darkPink dp',
                                                       'brown br',
                                                 'darkOrange wtf',
                                                  'boldOrange ww',
                                                     'darkRed er',
                                                    'boldBlue ii' ],
                                                    _.splitsWith  (' ').then (
                                                      _.mapsWith  (
                                                  function (name,                                   i,                         names      )  {
                                                   return  [name,  write.$ (log.config ({ location: i !== 0, color: log.color (names.first), stackOffset: 2 })) ] })))))))

}) ()


/*  Higher order API
 */
logs = _.mapWith (_.callsTo.compose (_.callsWith (log.stackOffset (1))), log.printAPI)


/*  Experimental formatting shit.
 */
_.extend (log, {

    asTable: function (arrayOfObjects) {
        var columnsDef  = arrayOfObjects.map (_.keys.arity1).reduce (_.union.arity2, []) // makes ['col1', 'col2', 'col3'] by unifying objects keys
        var lines       = log.columns ( [columnsDef].concat (
                                            _.map (arrayOfObjects, function (object) {
                                                                        return columnsDef.map (_.propertyOf (object)) })), {
                                        maxTotalWidth: 120,
                                        minColumnWidths: columnsDef.map (_.property ('length')) })

        return [lines[0], log.thinLine[0].repeats (lines[0].length), _.rest (lines)].flat.join ('\n') },

    /*  Layout algorithm for ASCII sheets (v 2.0)
     */
    columns: function (rows, cfg_) {
        if (rows.length === 0) {
            return [] }
        else {
            
            /*  convert column data to string, taking first line
             */
            var rowsToStr       = rows.map (_.map.tails2 (function (col) { return _.asString (col).split ('\n')[0] }))

            /*  compute column widths (per row) and max widths (per column)
             */
            var columnWidths    = rowsToStr.map (_.map.tails2 (_.property ('length')))
            var maxWidths       = columnWidths.zip (_.largest)

            /*  default config
             */
            var cfg             = cfg_ || { minColumnWidths: maxWidths, maxTotalWidth: 0 }

            /*  project desired column widths, taking maxTotalWidth and minColumnWidths in account
             */
            var totalWidth      = _.reduce (maxWidths, _.sum, 0)
            var relativeWidths  = _.map (maxWidths, _.muls (1.0 / totalWidth))
            var excessWidth     = Math.max (0, totalWidth - cfg.maxTotalWidth)
            var computedWidths  = _.map (maxWidths, function (w, i) {
                                                        return Math.max (cfg.minColumnWidths[i], Math.floor (w - excessWidth * relativeWidths[i])) })

            /*  this is how many symbols we should pad or cut (per column)
             */
            var restWidths      = columnWidths.map (function (widths) { return [computedWidths, widths].zip (_.subtract) })

            /*  perform final composition
             */
            return [rowsToStr, restWidths].zip (
                 _.zap.tails (function (str, w) { return w >= 0 ? (str + ' '.repeats (w)) : (_.initial (str, -w).join ('')) })
                 .then (_.joinsWith ('  ')) ) } }
})

if ($platform.NodeJS) {
    module.exports = log }


;
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
------------------------------------------------------------------------

Testosterone is a cross-platform unit test shell. Features:

    - asynchronous tests
    - asynchronous assertions
    - log handling (log.xxx calls are scheduled to current test log)
    - exception handling (uncaught exceptions are nicely handled)

------------------------------------------------------------------------
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/*  A contract for test routines that says that test should fail and it's the behavior expected
 */
_.defineTagKeyword ('shouldFail')


/*  A contract for custom assertions, says that assertion is asynchronous.
 */
_.defineTagKeyword ('async')


/*  This is test suite for tests framework itself.

    As you can see, tests are defined as _.tests.xxx. So, if you have module called 'foo',
    place tests for that module in _.tests.foo — it will be picked up by tests framework
    automagically ©
 */
_.tests.Testosterone = {


    /*  3.  To write asynchronous tests, define second argument in your test routine, which
            is 'done' callback. The framework will look into argument count of your routine,
            and if second argument is there, your routine will be considered as asynchronous,
            i.e. not completing until 'done' is explicitly triggered.
     */
    'async': function (done) {
        _.delay (function () {
            done () }) },


    /*  4.  Use $tests to define unit tests on prototypes (works only on stuff in global namespace)
     */
    '$tests': function () {

        DummyPrototypeWithTest  = $prototype ({ $test: function () {} })
        DummyPrototypeWithTests = $prototype ({ $tests: { dummy: function () {} } })

        /*  $test/$tests renders to static immutable property $tests
         */
        $assertTypeMatches (DummyPrototypeWithTests.$tests, [{ '*': 'function' }])
        $assertThrows (function () { DummyPrototypeWithTests.$tests = 42 })

        /*  Tests are added to Testosterone.prototypeTests
         */
        $assertMatches (_.pluck (Testosterone.prototypeTests, 'tests'), [DummyPrototypeWithTest .$tests,
                                                                         DummyPrototypeWithTests.$tests]) }
 }


/*  For marking methods in internal impl that should publish themselves as global keywords (like $assert)
 */
_.defineTagKeyword ('assertion')

Testosterone = $singleton ({

    prototypeTests: [],

    isRunning: $property (function () {
        return this.currentAssertion !== undefined }),

    /*  Hook up to assertion syntax defined in common.js
     */
    constructor: function () {

        _.each (_.assertions, function (fn, name) {
                                    this.defineAssertion (name, (name === 'assertFails') ?
                                        $shouldFail (function (what) { what.call (this) }) : fn) }, this);

        /*  For defining tests inside prototype definitions
         */
        (function (register) {
            $prototype.macro ('$test',  register)
            $prototype.macro ('$tests', register) }) (this.$ (function (def, value, name) {
                                                        this.prototypeTests.push ({
                                                            proto: def.constructor,
                                                            tests: value })

                                                        def.$tests = $static ($property ($constant (
                                                            (_.isStrictlyObject (value) && value) || _.object ([['test', value]]))))

                                                        return def }))
        this.run = this.$ (this.run) },

    /*  Entry point
     */
    run: _.interlocked (function (cfg_) {

        /*  Configuration
         */
        var defaults = {
            suites: [],
            silent:  true,
            verbose: false,
            timeout: 2000,
            filter: _.identity,
            testStarted:  function (test) {},
            testComplete: function (test) {} }

        var cfg = this.runConfig = _.extend (defaults, cfg_)

        /*  Read cfg.suites
         */
        var suitesIsArray = _.isArray (cfg.suites) // accept either [{ name: xxx, tests: yyy }, ...] or { name: tests, ... }
        var suites = _.map (cfg.suites, this.$ (function (suite, name) {
            return this.testSuite (suitesIsArray ? suite.name : name, suitesIsArray ? suite.tests : suite, cfg.context, suite.proto) }))

        /*  Pick prototype tests
         */
        var result = ((cfg.codebase === false) ? __([]) : this.collectPrototypeTests ()).then (this.$ (function (prototypeTests) {

            /*  Gather tests
             */
            var baseTests   = cfg.codebase === false ? [] : this.collectTests ()
            var allTests    = _.flatten (_.pluck (baseTests.concat (suites).concat (prototypeTests), 'tests'))
            var selectTests = _.filter (allTests, cfg.shouldRun || _.constant (true))

            /*  Reset context (assigning indices)
             */
            this.runningTests = _.map (selectTests, function (test, i) { return _.extend (test, { indent: cfg.indent, index: i }) })

            _.each (this.runningTests, function (t) {
                if (!(t.routine instanceof Function)) {
                    log.ee (t.suite, t.name, '– test routine is not a function:', t.routine)
                    throw new Error () } })

            this.runningTests = _.filter (this.runningTests, cfg.filter || _.identity)

            /*  Go
             */
            return __ .each (this.runningTests, this.$ (this.runTest))
                      .then (this.$ (function () {
                                _.assert (cfg.done !== true)
                                          cfg.done   = true

                                this.printLog (cfg)
                                this.failedTests = _.filter (this.runningTests, _.property ('failed'))
                                this.failed = (this.failedTests.length > 0)
                                
                                return !this.failed })) }))

        return result.catch (function (e) {
                                log.margin ()
                                log.ee (log.boldLine, 'TESTOSTERONE CRASHED', log.boldLine, '\n\n', e)
                                throw e }) }),

    onException: function (e) {
        if (this.currentAssertion) 
            this.currentAssertion.onException (e)
        else
            throw e },

    /*  You may define custom assertions through this API
     */
    defineAssertions: function (assertions) {
        _.each (assertions, function (fn, name) {
            this.defineAssertion (name, fn) }, this) },

    /*  Internal impl
     */
    runTest: function (test, i) { var self = this, runConfig = this.runConfig

        log.impl.configStack = [] // reset log config stack, to prevent stack pollution due to exceptions raised within log.withConfig (..)
    
        //return runConfig.testStarted (function () {

                                            test.verbose = runConfig.verbose
                                            test.timeout = runConfig.timeout
                                            test.startTime = Date.now ()

                                            return test.run ()
                                                       .then (function () {
                                                                test.time = (Date.now () - test.startTime)
                                                                /*return runConfig.testComplete (test)*/ /*})*/ }) },

    collectTests: function () {
        return _.map (_.tests, this.$ (function (suite, name) {
            return this.testSuite (name, suite) } )) },

    collectPrototypeTests: function () { var self = this
        return __.map (this.prototypeTests, function (def, then) {
                                                return def.proto.$meta.promise.then (function (meta) {
                                                    return self.testSuite (meta.name, def.tests, undefined, def.proto) }) }) },

    testSuite: function (name, tests, context, proto) { return { 
        name: name || '',
        tests: _(_.pairs (((typeof tests === 'function') && _.object ([[name, tests]])) || tests))
                .map (function (keyValue) {
                        var test = new Test ({ proto: proto, name: keyValue[0], routine: keyValue[1], suite: name, context: context })
                            test.complete (function () {
                                if (!(test.hasLog = (test.logCalls.length > 0))) {
                                         if (test.failed)  { log.red   ('FAIL') }
                                    else if (test.verbose) { log.green ('PASS') } } })

                            return test }) } },

    defineAssertion: function (name, def) { var self = this
        _.deleteKeyword (name)
        _.defineKeyword (name, Tags.modify (def,
                                    function (fn) {
                                        return _.withSameArgs (fn, function () { var loc = $callStack.safeLocation (($platform.Browser && !$platform.Chrome) ? 0 : 1)
                                            if (!self.currentAssertion) {
                                                return fn.apply (self, arguments) }
                                            else {
                                                return self.currentAssertion.babyAssertion (name, def, fn, arguments, loc) } }) })) },

    printLog: function (cfg) { if (!cfg.supressLog) {

        var loggedTests = _.filter (this.runningTests, function (test) { return test.failed || (!cfg.silent && test.hasLog) })
        var failedTests = _.filter (this.runningTests, _.property ('failed'))

        _.invoke (cfg.verbose ? this.runningTests : loggedTests, 'printLog')

        if (failedTests.length) {
            log.orange ('\n' + log.boldLine + '\n' + 'SOME TESTS FAILED:', _.pluck (failedTests, 'name').join (', '), '\n\n') }

        else if (cfg.silent !== true) {
            log.green ('\n' + log.boldLine + '\n' + 'ALL TESTS PASS\n\n') } } } })


/*  Encapsulates internals of test's I/O.
 */
Test = $prototype ({

    constructor: function (cfg) {
        _.defaults (this, cfg, {
            name:       '<< UNNAMED FOR UNKNOWN REASON >>',
            failed:     false,
            routine:    undefined,
            verbose:    false,
            depth:      1,
            indent:     0,
            failedAssertions: [],
            context:    this,
            complete: _.extend (_.barrier (), { context: this }) })

        this.babyAssertion = _.interlocked (this.babyAssertion) },

    finalize: function () {
        this.babyAssertion.wait (this.$ (function () {
            if (this.canFail && this.failedAssertions.length) {
                this.failed = true }
            this.complete (true) })) },

    babyAssertion: function (name, def, fn, args, loc) { var self = this

        var assertion = new Test ({
            mother: this,
            name: name,
            shouldFail: def.$shouldFail || this.shouldFail,
            depth: this.depth + 1,
            location: loc,
            context: this.context,
            timeout: this.timeout / 2,
            verbose: this.verbose,
            silent:  this.silent,
            routine: Tags.modify (def, function (fn) {
                                            return function (done) {
                                                    if ($async.is (args[0]) || $async.is (def)) {
                                                        _.cps.apply (fn, self.context, args, function (args, then) {
                                                                                                         if (then) {
                                                                                                             then.apply (this, args) }
                                                                                                         done () }) }
                                                    else {
                                                        try       { fn.apply (self.context, args); done () }
                                                        catch (e) { assertion.onException (e) } } } }) })

        return assertion.run ()
                        .finally (function (e, x) {
                                Testosterone.currentAssertion = self
                                if (assertion.failed || (assertion.verbose && assertion.logCalls.notEmpty)) {
                                    return assertion.location
                                                    .sourceReady
                                                    .promise
                                                    .then (function (src) {
                                                                log.red (log.config ({ location: assertion.location, where: assertion.location }), src)
                                                                assertion.evalLogCalls () }) } })

                        .then (function () {
                            if (assertion.failed && self.canFail) {
                                self.failedAssertions.push (assertion) } }) },

    canFail: $property (function () {
        return !this.failed && !this.shouldFail }),

    fail: function () {
        this.failed = true
        this.finalize () },

    assertionStack: $property (function () { var result = [],
                                                      a = this; do { result.push (a); a = a.mother } while (a)
                                          return result }),

    onException: function (e) {

            if (this.canFail || this.verbose) {

                if (_.isAssertionError (e)) {
                    //  • a
                    //  • b
                    if ('notMatching' in e) { var notMatching = _.coerceToArray (e.notMatching)
                        if (e.asColumns) {
                            log.orange (
                                log.columns (_.map (notMatching, function (obj) {
                                    return ['• ' + _.keys (obj)[0], _.stringify (_.values (obj)[0])] })).join ('\n')) }
                        else {
                            var cases  = _.map (notMatching, log.impl.stringify.arity1.then (_.bullet.$ ('• ')))
                            var common = _.reduce2 (cases, _.longestCommonSubstring) || ''
                            if (common.length < 4) {
                                common = undefined }

                            _.each (cases, function (what) {

                                    if (common) {                                  var where  = what.indexOf (common)
                                        log.write ( log.color.orange,  what.substr (0, where),
                                                    log.color.dark,    common,
                                                    log.color.orange,  what.substr (where + common.length)) }

                                    else {
                                        log.orange (what) } }) }} }
                        
                    // print exception
                else {
                    if (this.depth > 1) { log.newline () }
                                          log.write (e) }
                                          log.newline () }

            if (this.canFail) { this.fail () }
                        else  { this.finalize () } },

    run: function () { var self    = Testosterone.currentAssertion = this,
                           routine = Tags.unwrap (this.routine)

        return new Promise (this.$ (function (then) {

            this.shouldFail = $shouldFail.is (this.routine)
            this.failed = false
            this.hasLog = false
            this.logCalls = []
            this.failureLocations = {}

            _.withTimeout ({
                maxTime: self.timeout,
                expired: function () { if (self.canFail) { log.ee ('TIMEOUT EXPIRED'); self.fail () } } },
                self.complete)

            _.withUncaughtExceptionHandler (self.$ (self.onException), self.complete)

            log.withWriteBackend (_.extendWith ({ indent: 1 },
                                        function (x) { /*log.impl.defaultWriteBackend (x);*/ self.logCalls.push (x) }),

                                  function (doneWithLogging)  { self.complete (doneWithLogging.arity0)
                                                    if (then) { self.complete (then) }

                                        /*  Continuation-passing style flow control
                                         */
                                        if (routine.length > 0) {
                                            routine.call (self.context, self.$ (self.finalize)) }

                                        /*  Return-style flow control
                                         */
                                        else {

                                        /*  TODO:   investigate why Promise.resolve ().then (self.$ (self.finalize))
                                                    leads to broken unhandled exception handling after the Testosterone run completes  */

                                            var result = undefined

                                            try       { result = routine.call (self.context) }
                                            catch (e) { self.onException (e) }

                                            if (_.isArrayLike (result) && (result[0] instanceof Promise)) {
                                                result = __.all (result) }

                                            if (result instanceof Promise) {
                                                result.then (
                                                    function (x) { self.finalize () }.postponed,
                                                    function (e) { self.onException (e) }) }
                                            else {
                                                self.finalize () } } }) })) },
            
    printLog: function () { var suiteName = (this.suite && (this.suite !== this.name) && (this.suite || '').quote ('[]')) || ''

        log.write (log.color.blue,
            '\n' + log.boldLine,
            '\n' + _.nonempty ([suiteName, this.name]).join (' '),
            (this.index + ' of ' + Testosterone.runningTests.length).quote ('()') +
            (this.failed ? ' FAILED' : '') + ':',
            '\n')

        this.evalLogCalls () },

    evalLogCalls: function () {
        _.each (this.logCalls, log.writeBackend ().arity1) } })


/*
 */
_.defineTagKeyword ('allowsRecursion')

_.limitRecursion = function (max, fn, name) { if (!fn) { fn = max; max = 0 }
                        var depth       = -1
                        var reported    = false
                            return function () {
                                if (!reported) {
                                    if (depth > max) { reported = true
                                        throw _.extendWith ({ notMatching: _.map (arguments, function (arg, i) { return 'arg' + (i + 1) + ': ' + _.stringify (arg) }) },
                                            new Error (name + ': max recursion depth reached (' + max + ')')) }
                                    else {
                                        var result = ((++depth), fn.apply (this, arguments)); depth--
                                            return result } } } }
                                            
Testosterone.ValidatesRecursion = $trait ({

    $test: function () {

        var test = new ($component ({

            $traits: [Testosterone.ValidatesRecursion],

            foo: function () {},
            bar: function () { this.bar () },
            baz: $allowsRecursion ({ max: 2 }, function () { this.baz () }),
            qux: $allowsRecursion (function () { if (!this.quxCalled) { this.quxCalled = true; this.qux () } }) }))

                       test.foo ()
        $assertThrows (test.bar, { message: 'bar: max recursion depth reached (0)' })
                       test.bar () // should not report second time (to prevent overflood in case of buggy code)
        $assertThrows (test.baz, { message: 'baz: max recursion depth reached (2)' })
                       test.qux () },

    $constructor: function () {
        _.each (this, function (member, name) {
            if (_.isFunction ($untag (member)) && (name !== 'constructor') && (!member.$allowsRecursion || (member.$allowsRecursion.max !== undefined))) {
                this[name] = Tags.modify (member, function (fn) {
                    return _.limitRecursion ((member && member.$allowsRecursion && member.$allowsRecursion.max) || 0, fn, name) }) } }, this) } })

/*  $log for methods
 */
;(function () { var colors = _.keys (_.omit (log.color, 'none'))
                    colors.each (_.defineTagKeyword)

    _.defineTagKeyword ('verbose')

    Testosterone.LogsMethodCalls = $trait ({

        $test: $platform.Browser ? (function () {}) : function (testDone) {

                    var Proto = $prototype ({ $traits: [Testosterone.LogsMethodCalls] })
                    var Compo = $extends (Proto, {
                                        foo: $log ($pink ($verbose (function (_42) { $assert (_42, 42); return 24 }))) })

                    var compo = new Compo ()
                    var testContext = this

                    Compo.$meta (function () {
                        $assert (compo.foo (42), 24)
                        $assert (_.pluck (testContext.logCalls, 'text'), ['Compo.foo (42)', '→ 24', ''])
                        $assert (testContext.logCalls[0].color === log.color ('pink'))
                        testDone () }) },

        $macroTags: {

            log: function (def, member, name) { var param         = (_.isBoolean (member.$log) ? undefined : member.$log) || (member.$verbose ? '{{$proto}}' : '')
                                                var meta          = {}
                                                var color         = _.find2 (colors, function (color) { return log.color ((member['$' + color] && color)) || false })
                                                var template      = param && _.template (param, { interpolate: /\{\{(.+?)\}\}/g })

                $untag (def.$meta) (function (x) { meta = x }) // fetch prototype name

                return $prototype.impl.modifyMember (member, function (fn, name_) { return function () { var this_      = this,
                                                                                                             arguments_ = _.asArray (arguments)

                        var this_dump = (template && template.call (this, _.extend ({ $proto: meta.name }, _.map2 (this, _.stringifyOneLine.arity1)))) || this.desc || ''
                        var args_dump = _.map (arguments_, _.stringifyOneLine.arity1).join (', ').quote ('()')

                    log.write (log.config ({
                        color: color,
                        location: true,
                        where: member.$verbose ? undefined : { calleeShort: meta.name } }), _.nonempty ([this_dump, name, name_]).join ('.'), args_dump)

                    return log.withConfig ({ indent: 1,
                                             color: color,
                                             protoName: meta.name }, function () {

                                                                        var numWritesBefore = log.impl.numWrites
                                                                        var result          = fn.apply (this_, arguments_);          

                                                                        if (result !== undefined) {
                                                                            log.write ('→', _.stringifyOneLine (result)) }

                                                                        if ((log.currentConfig ().indent < 2) &&
                                                                            (log.impl.numWrites - numWritesBefore) > 0) { log.newline () }

                                                                        return result }) } }) } } }) }) ();


if ($platform.NodeJS) {
    module.exports = Testosterone };
/*  Measures run time of a routine (either sync or async)
    ======================================================================== */

_.measure = function (routine, then) {
    if (then) {                             // async
        var now = _.now ()
        routine (function () {
            then (_.now () - now) }) }
    else {                                  // sync
        var now = _.now ()
        routine ()
        return _.now () - now } }


/*  Measures performance: perfTest (fn || { fn1: .., fn2: ... }, then)
    ======================================================================== */

_.perfTest = function (arg, then) {
    var rounds = 500
    var routines = _.isFunction (arg) ? { test: arg } : arg
    var timings = {}

    _.cps.each (routines, function (fn, name, then) {

        /*  Define test routine (we store and print result, to assure our routine
            won't be throwed away by optimizing JIT)
         */
        var result = []
        var run = function () {
            for (var i = 0; i < rounds; i++) {
                result.push (fn ()) }
            console.log (name, result) }

        /*  Warm-up run, to force JIT work its magic (not sure if 500 rounds is enough)
         */
        run ()

        /*  Measure (after some delay)
         */
        _.delay (function () {
            timings[name] = _.measure (run) / rounds
            then () }, 100) },

        /*  all done
         */
        function () {
            then (timings) }) }
;
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
------------------------------------------------------------------------

Error reporting UI

------------------------------------------------------------------------
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/*  ======================================================================== */

(function ($ /* JQUERY */) {

if (typeof UI === 'undefined') {
	UI = {} }

Panic = function (what, cfg) { cfg = _.defaults (_.clone (cfg || {}), { dismiss: _.identity, raw: false })

	if (_.isTypeOf (Error, what)) {
		_.extend (cfg, _.pick (what, 'retry', 'dismiss')) }

	Panic.widget.append (what, cfg.raw)

	if (_.isFunction (cfg.retry)) {
		Panic.widget.onRetry (cfg.retry) }

	if (_.isFunction (cfg.dismiss)) {
		Panic.widget.onClose (cfg.dismiss) } }

Panic.init = function () {
	if (!Panic._initialized) {
		 Panic._initialized = true
	   _.withUncaughtExceptionHandler (function (e) { Panic (e); throw e /* re-throw, to make it visible in WebInspector */ }) } }

Panic.widget = $singleton (Component, {

	retryTriggered: $triggerOnce (),
	closeTriggered: $triggerOnce (),

	el: $memoized ($property (function () {

		var el = $('<div class="panic-modal-overlay" style="z-index:5000; display:none;">').append ([
			this.bg    = $('<div class="panic-modal-overlay-background">'),
			this.modal = $('<div class="panic-modal">').append ([
				this.modalBody = $('<div class="panic-modal-body">').append (
					this.title = $('<div class="panic-modal-title">Now panic!</div>')),
				$('<div class="panic-modal-footer">').append ([
					this.btnRetry = $('<button type="button" class="panic-btn panic-btn-warning" style="display:none;">Try again</button>')
						.touchClick (this.retry),
					this.btnClose = $('<button type="button" class="panic-btn panic-btn-danger" style="display:none;">Close</button>')
						.touchClick (this.close) ]) ]) ])

		el.appendTo (document.body)
		
		$(document).ready (function () {
			el.appendTo (document.body) })

		try {
			$(window).resize (this.layout).resize ()
			this.modal.enableScrollFaders ({ scroller: this.modalBody })
			$(document).keydown (this.$ (function (e) { if (e.keyCode === 27) { this.close () } })) }

		catch (e) {
			_.delay (function () { Panic (e) }) }

		return el })),

	layout: function () { var maxContentWidth = _.coerceToUndefined (_.max (_.map (this.modal.find ('pre'), _.property ('scrollWidth'))))

		this.modal.css ({ 'max-height': $(window).height () - 100,
						  'width': maxContentWidth && (maxContentWidth + 120) })

		this.modalBody.scroll () },

	toggleVisibility: function (yes) {
		if (yes !== !(this.el.css ('display') === 'none')) {
	        if (yes) {
	            this.el.css ('display', '') }
	        this.el.animateWith (yes ? 'panic-modal-appear' : 'panic-modal-disappear', this.$ (function () {
	            if (!yes) {
	                this.el.css ('display', 'none') } })) } },

	onRetry: function (retry) {
		this.retryTriggered (retry)
		this.btnRetry.css ('display', '') },

	onClose: function (close) {
		this.closeTriggered (close)
		this.btnClose.css ('display', '') },

	retry: function () {
		this._clean ()
		this.closeTriggered.off ()
		this.toggleVisibility (false)
		this.retryTriggered () },

	close: function () {
		this._clean ()
		this.retryTriggered.off ()
		this.toggleVisibility (false)
		this.closeTriggered () },

   _clean: function () {
		this.modalBody.find ('.panic-alert-error').remove ()
		this.modalBody.scroll ()
		this.btnRetry.css ('display', 'none')
		this.btnClose.css ('display', 'none') },

	append: function (what, raw) { var id = 'panic' + this.hash (what)

		var counter = $('#' + id + ' .panic-alert-counter')
		if (counter.length) {
			counter.text ((counter.text () || '1').parsedInt + 1) }
		else {
			$('<div class="panic-alert-error">').attr ('id', id)
												.append ('<span class="panic-alert-counter">')
												.append (this.print (what, raw))
												.insertAfter (this.el.find ('.panic-modal-title')) }
		this.toggleVisibility (true)
		this.layout ()  },

	hash: function (what) {
		return ((_.isTypeOf (Error, what) ? (what && what.stack) :
				(_.isTypeOf (Test, what)  ? (what.suite + what.name) :
                _.stringify (what))) || '').hash },

	print: function (what, raw) {
		return (_.isTypeOf (Error, what) ?
						this.printError (what) :
			   (_.isTypeOf (Test, what) ?
						this.printFailedTest (what) :
						this.printUnknownStuff (what, raw))) },

	printUnknownStuff: function (what, raw) {
		return raw ? what : $('<span>').text (log.impl.stringify (what)) },

	printLocation: function (where) {
		return $('<span class="location">')
					.append ([$('<span class="callee">').text (where.calleeShort),
							  $('<span class="file">')  .text (where.fileName), 
							  $('<span class="line">')  .text (where.line)]) },

	printFailedTest: function (test) { var logEl = $('<pre class="test-log" style="margin-top: 13px;">')

		log.withWriteBackend (
			this.$ (function (params) { if (_.isTypeOf (Error, params.args.first)) { console.log (params.args.first) }

				logEl.append (_.isTypeOf (Error, params.args.first)
						? ($('<div class="inline-exception-entry">')
								.append ([_.escape (params.indentation),
											$('<div class="panic-alert-error inline-exception">').append (
												this.printError (params.args.first))]))
						: $('<div class="log-entry">')
								.append (
									_.map (params.lines, function (line, i, lines) {
															return $('<div class="line">')
																		.append (_.escape (params.indentation))
																		.append (_.map (line, function (run) {
																								return $('<span>')
																									.attr ('style', (run.config.color && run.config.color.css) || '')
																									.text (run.text) }))
																		.append ((i === lines.lastIndex) ?
																			[params.where && this.printLocation (params.where),
																			 params.trailNewlines.replace (/\n/g, '<br>')] : []) }, this))) }),

			function (done) {
				test.evalLogCalls ()
				done () })

		return [$('<div class="panic-alert-error-message" style="font-weight: bold;">')
				    .text (test.name)
				    .append ('<span style="float:right; opacity: 0.25;">test failed</span>'), logEl] },

	printError: function (e) { var stackEntries = CallStack.fromErrorWithAsync (e)
		return [

			$('<div class="panic-alert-error-message" style="font-weight: bold;">')
				.text (e.message)
				.append (_.any (stackEntries, function (e, i) { return (e.thirdParty || e['native'] || e.hide) && (i !== 0) })
							? '<a class="clean-toggle" href="javascript:{}"></a>'
							: '')
				.click (this.$ (function (e) {
					$(e.delegateTarget).parent ()
						.toggleClass ('all-stack-entries')
						.transitionend (this.$ (function () {
							this.modalBody.scroll () })) })),

			$('<div class="not-matching" style="margin-top: 5px; padding-left: 10px;">').append (_.map (_.coerceToArray (e.notMatching || []), function (s) {
				return $('<pre>').text (log.impl.stringify (s)) })),

			$('<ul class="callstack">').append (_.map (stackEntries, this.$ (function (entry) {

				var dom = $('<li class="callstack-entry">')
						.toggleClass ('third-party', entry.thirdParty)
                        .toggleClass ('hide',        entry.hide)
						.toggleClass ('native',      entry['native'])
						.append ([
							$('<span class="file">').text (_.nonempty ([entry.index ? '(index)' : entry.fileShort,
																		entry.line]).join (':')),
							$('<span class="callee">').text (entry.calleeShort),
							$('<span class="src i-am-busy">').click (this.$ (function (e) { var el = $(e.delegateTarget)
								el.waitUntil (SourceFiles.read.partial ((entry.remote ? 'api/source/' : '') + entry.file), this.$ (function (text) {
									if (dom.is ('.full')) {
										dom.removeClass ('full')
										dom.transitionend (function () {
											if (!dom.is ('.full')) {
												entry.sourceReady (el.$ ($.fn.text)) } }) }
									else {
										dom.addClass ('full'); el.html (_.map (text.split ('\n'), function (line) {
																			return $('<div class="line">').text (line) }))

										var line = el.find ('.line').eq (entry.line - 1).addClass ('hili')
										if (line.length) {
											var offset = line.offset ().top - el.offset ().top
											el.scrollTop (offset - 100) }

										_.delay (this.$ (function () {
											var shouldScrollDownMore = ((el.outerBBox ().bottom + 242) - this.modalBody.outerBBox ().bottom)
											if (shouldScrollDownMore > 0) {
												this.modalBody.animate ({
													scrollTop: this.modalBody.scrollTop () + shouldScrollDownMore }, 250) }})) } })) })) ])

				entry.sourceReady (function (text) {
					dom.find ('.src').removeClass ('i-am-busy').text (text) })

				return dom }))) ] } })

$.fn.extend ({
	enableScrollFaders: function (cfg) {
		var horizontal = cfg && cfg.horizontal
		var faderTop, faderBottom, scroller = this.find ((cfg && cfg.scroller) || '.scroller')

		this.css ({ position: 'relative' })
		this.append (faderTop = $('<div class="scroll-fader scroll-fader-' + (horizontal ? 'left' : 'top') + '"></div>'))
			.append (faderBottom = $('<div class="scroll-fader scroll-fader-' + (horizontal ? 'right' : 'bottom') + '"></div>'))
		
		scroller.scroll (function () {
				var scrollTop = horizontal ? $(this).scrollLeft () : $(this).scrollTop (),
					height = horizontal ? $(this).width () : $(this).height (),
					max = (horizontal ? this.scrollWidth : this.scrollHeight) - 1
				faderTop.css ({ opacity: scrollTop > 0 ? 1 : 0 })
				faderBottom.css ({ opacity: (scrollTop + height) < max ? 1 : 0 }) }).scroll ()

		return this } })

// -- end of namespace

}) (jQuery);;
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
------------------------------------------------------------------------

Modal overlay that renders log.js output for debugging purposes

------------------------------------------------------------------------
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

(function ($ /* JQUERY */) {

	LogOverlay = $singleton (Component, {

		$defaults: {
			opaque: false,   // disables passing of printed log messages to default write backend (console.log) 
			init:   false }, // deferred init

		init: function () {
				log.withWriteBackend (this.write, function () {})

				$(document).keydown (this.$ (function (e) {
					if (e.keyCode === 192) { // ~
						this.toggle () }
					else if (e.keyCode === 27) { // Esc
						this.body.empty () } })) },

		el: $memoized ($property (function () {
									return $('<div class="useless-log-overlay" style="display: none;">')
												.append ('<div class="useless-log-overlay-body">')
												.appendTo (document.body) })),

		body: $memoized ($property (function () {
										return this.el.find ('.useless-log-overlay-body') })),

		toggle: function (yes) {
					this.el.toggle (yes) },

		visible: $property (function () {
								return this.el.is (':visible') }),

		clip: function () {
		            var elHeight   = this.el.height ()
		            var bodyHeight = this.body.height ()

		            this.body.children ().filter (this.$ (function (i, line) {

		            	var lineTop 	= bodyHeight - $(line).offsetInParent ().y
		            	var lineBottom  = lineTop    - $(line).height ()
		            	var clipHeight  = elHeight / 2

		            	return (lineTop    > clipHeight) &&
		            		   (lineBottom > clipHeight) })).remove () },

		write: function (params) { 	this.toggle (true)

									if (params.config.clear) {
										this.body.empty () }

						            this.body.append ($('<div class="ulo-line">')
										            	.attr ('style', (params.color && params.color.css) || '')
										            	.append ($('<span class="ulo-line-text">') .text (params.indentedText  + ' '))
										            	.append ($('<span class="ulo-line-where">').text (params.codeLocation  + ' '))
										            	.append ($('<span class="ulo-line-trail">').text (params.trailNewlines)))

						            this.clip.postpone ()

						            if (!this.opaque) {
										log.impl.defaultWriteBackend (params) } } })

// -- end of namespace

}) (jQuery);;

/*  ======================================================================== */

(function ($ /* JQUERY */) {
	
	Panic.init ()

	CallStack.isThirdParty.intercept (function (file, originalImpl) {
	    return (file.indexOf ('underscore') >= 0) ||
	           (file.indexOf ('jquery') >= 0)     ||
	           (file.indexOf ('useless') >= 0)    ||
	           (file.indexOf ('mootools') >= 0) })

    $('head').append ([
    	$('<style type="text/css">').text ("@-webkit-keyframes bombo-jumbo {\n  0%   { -webkit-transform: scale(0); }\n  80%  { -webkit-transform: scale(1.2); }\n  100% { -webkit-transform: scale(1); } }\n\n@keyframes bombo-jumbo {\n  0%   { transform: scale(0); }\n  80%  { transform: scale(1.2); }\n  100% { transform: scale(1); } }\n\n@-webkit-keyframes pulse-opacity {\n  0% { opacity: 0.5; }\n  50% { opacity: 0.25; }\n  100% { opacity: 0.5; } }\n\n@keyframes pulse-opacity {\n  0% { opacity: 0.5; }\n  50% { opacity: 0.25; }\n  100% { opacity: 0.5; } }\n\n.i-am-busy { -webkit-animation: pulse-opacity 1s ease-in infinite; animation: pulse-opacity 1s ease-in infinite; pointer-events: none; }\n\n.panic-modal .scroll-fader-top, .scroll-fader-bottom { left: 42px; right: 42px; position: absolute; height: 20px; pointer-events: none; }\n.panic-modal .scroll-fader-top { top: 36px; background: -webkit-linear-gradient(bottom, rgba(255,255,255,0), rgba(255,255,255,1)); }\n.panic-modal .scroll-fader-bottom { bottom: 128px; background: -webkit-linear-gradient(top, rgba(255,255,255,0), rgba(255,255,255,1)); }\n\n.panic-modal-appear {\n  -webkit-animation: bombo-jumbo 0.25s cubic-bezier(1,.03,.48,1);\n  animation: bombo-jumbo 0.25s cubic-bezier(1,.03,.48,1); }\n\n.panic-modal-disappear {\n  -webkit-animation: bombo-jumbo 0.25s cubic-bezier(1,.03,.48,1); -webkit-animation-direction: reverse;\n  animation: bombo-jumbo 0.25s cubic-bezier(1,.03,.48,1); animation-direction: reverse; }\n\n.panic-modal-overlay {\n          display: -ms-flexbox; display: -moz-flex; display: -webkit-flex; display: flex;\n          -ms-flex-direction: column; -moz-flex-direction: column; -webkit-flex-direction: column; flex-direction: column;\n          -ms-align-items: center; -moz-align-items: center; -webkit-align-items: center; align-items: center;\n          -ms-flex-pack: center; -ms-align-content: center; -moz-align-content: center; -webkit-align-content: center; align-content: center;\n          -ms-justify-content: center; -moz-justify-content: center; -webkit-justify-content: center; justify-content: center;\n          position: fixed; left: 0; right: 0; top: 0; bottom: 0; }\n\n.panic-modal-overlay-background { z-index: 1; position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: white; opacity: 0.75; }\n\n.panic-modal * { letter-spacing: 0; font-family: Helvetica, sans-serif; }\n.panic-modal { font-family: Helvetica, sans-serif; min-width: 640px; max-width: 90%; transition: 0.25s width ease-in-out; box-sizing: border-box; display: -webkit-flex; display: flex; position: relative; border-radius: 4px; z-index: 2; width: 640px; background: white; padding: 36px 42px 128px 42px; box-shadow: 0px 30px 80px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15); }\n.panic-alert-counter { float: left; background: #904C34; border-radius: 8px; width: 17px; height: 17px; display: inline-block; text-align: center; line-height: 16px; margin-right: 1em; margin-left: -2px; font-size: 10px; color: white; font-weight: bold; }\n.panic-alert-counter:empty { display: none; }\n\n.panic-modal-title { font-family: Helvetica, sans-serif; color: black; font-weight: 300; font-size: 30px; opacity: 0.5; margin-bottom: 1em; }\n.panic-modal-body { overflow-y: auto; width: 100%; }\n.panic-modal-footer { text-align: right; position: absolute; left: 0; right: 0; bottom: 0; padding: 42px; }\n\n.panic-btn { margin-left: 1em; font-weight: 300; font-family: Helvetica, sans-serif; -webkit-user-select: none; user-select: none; cursor: pointer; display: inline-block; padding: 1em 1.5em; border-radius: 4px; font-size: 14px; border: 1px solid black; color: white; }\n.panic-btn:focus { outline: none; }\n.panic-btn:focus { box-shadow: inset 0px 2px 10px rgba(0,0,0,0.25); }\n\n.panic-btn-danger       { background-color: #d9534f; border-color: #d43f3a; }\n.panic-btn-danger:hover { background-color: #c9302c; border-color: #ac2925; }\n\n.panic-btn-warning       { background-color: #f0ad4e; border-color: #eea236; }\n.panic-btn-warning:hover { background-color: #ec971f; border-color: #d58512; }\n\n.panic-alert-error { border-radius: 4px; background: #FFE8E2; color: #904C34; padding: 1em 1.2em 1.2em 1.2em; margin-bottom: 1em; font-size: 14px; }\n\n.panic-alert-error { position: relative; text-shadow: 0px 1px 0px rgba(255,255,255,0.25); }\n\n.panic-alert-error .clean-toggle { height: 2em; text-decoration: none; font-weight: 300; position: absolute; color: black; opacity: 0.25; right: 0; top: 0; display: block; text-align: right; }\n.panic-alert-error .clean-toggle:hover { text-decoration: underline; }\n.panic-alert-error .clean-toggle:before,\n.panic-alert-error .clean-toggle:after { position: absolute; right: 0; transition: all 0.25s ease-in-out; display: inline-block; overflow: hidden; }\n.panic-alert-error .clean-toggle:before { -webkit-transform-origin: center left; transform-origin: center left; content: \'more\'; }\n.panic-alert-error .clean-toggle:after { -webkit-transform-origin: center left; transform-origin: center right; content: \'less\'; }\n.panic-alert-error.all-stack-entries .clean-toggle:before { -webkit-transform: scale(0); transform: scale(0); }\n.panic-alert-error:not(.all-stack-entries) .clean-toggle:after { -webkit-transform: scale(0); transform: scale(0); }\n\n.panic-alert-error:last-child { margin-bottom: 0; }\n\n.panic-alert-error-message { line-height: 1.2em; position: relative; }\n\n.panic-alert-error .callstack { font-size: 12px; margin: 2em 0 0.1em 0; padding: 0; }\n.panic-alert-error .callstack * { font-family: Menlo, monospace; }\n\n.panic-alert-error .callstack-entry { white-space: nowrap; opacity: 1; transition: all 0.25s ease-in-out; margin-top: 10px; list-style-type: none; max-height: 38px; overflow: hidden; }\n.panic-alert-error .callstack-entry .file { }\n.panic-alert-error .callstack-entry .file:not(:empty) + .callee:not(:empty):before { content: \' → \'; }\n\n.panic-alert-error:not(.all-stack-entries) > .callstack > .callstack-entry.third-party:not(:first-child),\n.panic-alert-error:not(.all-stack-entries) > .callstack > .callstack-entry.hide:not(:first-child),\n.panic-alert-error:not(.all-stack-entries) > .callstack > .callstack-entry.native:not(:first-child) { max-height: 0; margin-top: 0; opacity: 0; }\n\n.panic-alert-error .callstack-entry,\n.panic-alert-error .callstack-entry * { line-height: initial; }\n.panic-alert-error .callstack-entry .src { overflow: hidden; transition: height 0.25s ease-in-out; height: 22px; border-radius: 2px; cursor: pointer; margin-top: 2px; white-space: pre; display: block; color: black; background: rgba(255,255,255,0.75); padding: 4px; }\n.panic-alert-error .callstack-entry.full .src { font-size: 12px; height: 200px; overflow: scroll; }\n.panic-alert-error .callstack-entry.full .src .line.hili { background: yellow; }\n.panic-alert-error .callstack-entry.full { max-height: 220px; }\n\n.panic-alert-error .callstack-entry .src.i-am-busy { background: white; }\n\n.panic-alert-error .callstack-entry        .src:empty                  { pointer-events: none; }\n.panic-alert-error .callstack-entry        .src:empty:before           { content: \'<< SOURCE NOT LOADED >>\'; color: rgba(0,0,0,0.25); }\n.panic-alert-error .callstack-entry.native .src:empty:before           { content: \'<< NATIVE CODE >>\'; color: rgba(0,0,0,0.25); }\n.panic-alert-error .callstack-entry        .src.i-am-busy:empty:before { content: \'<< SOURCE LOADING >>\'; color: rgba(0,0,0,0.5); }\n\n.panic-alert-error .test-log .location { transition: opacity 0.25s ease-in-out; color: black; opacity: 0.25; display: inline-block; overflow: hidden; text-overflow: ellipsis; vertical-align: middle; }\n.panic-alert-error .test-log .location:hover { opacity: 1; }\n\n.panic-alert-error .test-log .location:before { content: \' @ \'; }\n\n.panic-alert-error .test-log .location .callee:after  { content: \', \'; }\n.panic-alert-error .test-log .location .file          { opacity: 0.5; }\n.panic-alert-error .test-log .location .line:before   { content: \':\'; }\n.panic-alert-error .test-log .location .line          { opacity: 0.25; }\n\n/*  Hack to prevent inline-blocked divs from wrapping within white-space: pre;\n */\n.panic-alert-error .test-log .inline-exception-entry:after { content: \' \'; }\n.panic-alert-error .test-log .log-entry        .line:after { content: \' \'; }\n.panic-alert-error           .callstack-entry  .line:after { content: \' \'; }\n\n.panic-alert-error pre { overflow: scroll; border-radius: 2px; color: black; background: rgba(255,255,255,0.75); padding: 4px; margin: 0; }\n.panic-alert-error pre,\n.panic-alert-error pre * { font-family: Menlo, monospace; font-size: 11px; white-space: pre !important; }\n\n.panic-alert-error.inline-exception { max-width: 640px; border-radius: 0; margin: 0; background: none; display: inline-block; transform-origin: 0 0; transform: scale(0.95); }\n.panic-alert-error.inline-exception .panic-alert-error-message { cursor: pointer; }\n.panic-alert-error.inline-exception:not(:first-child) { margin-top: 10px; border-top: 1px solid #904C34; }\n\n"),
    	$('<style type="text/css">').text (".useless-log-overlay {	position: fixed; bottom: 10px; left: 10px; right: 10px; top: 10px; z-index: 5000;\n						overflow: hidden;\n						pointer-events: none;\n						-webkit-mask-image: -webkit-gradient(linear, left top, left bottom,\n							color-stop(0.00, rgba(0,0,0,0)),\n							color-stop(0.50, rgba(0,0,0,0)),\n							color-stop(0.60, rgba(0,0,0,0.8)),\n							color-stop(1.00, rgba(0,0,0,1))); }\n\n.useless-log-overlay-body {\n\n	font-family: Menlo, monospace;\n	font-size: 11px;\n	white-space: pre;\n	background: rgba(255,255,255,1);\n	text-shadow: 1px 1px 0px rgba(0,0,0,0.07); position: absolute; bottom: 0; left: 0; right: 0; }\n\n.ulo-line 		{ white-space: pre; word-wrap: normal; }\n.ulo-line-where { color: black; opacity: 0.25; }") ]) }) (jQuery);;