              /*   local macros, to help define stuff
               */
(function () { var is   = function (tag) { return function () { return this.tagName === tag } }
               var make = function (tag) { return function () { return document.createElement (tag.uppercase) } }


/*  $mixin is like 'take $prototype-like definition and unroll it onto
     some existing stuff': not for creating new types, but for patching
     existing ones.

     P.S.   Not every feature of $prototype is applicable here (check
            implementation at useless/base/OOP.js for details)
            
    ======================================================================== */

    $mixin (Node, {

        $: $prototype.impl.$,    // brings this.$ semantics from $prototype


    /*  Constructors
        ======================================================================== */

        $static: {

            make: make.then (_.call),
            text: function (text) { return document.createTextNode (text) },

            $property: {    linebreak: make ('BR'),
                            paragraph: make ('P'),
                            div:       make ('DIV'),
                            span:      make ('SPAN'),
                            button:    make ('BUTTON'),
                            iframe:    make ('IFRAME'),
                            pre:       make ('PRE') } },
        
    /*  Various predicates
        ------------------

        New $callableAsFreeFunction tag means that its subject will be available
        as context-free (static) version along with instance method. For example,
        following two calls are equivalent:

            console.log (document.body.isLinebreak)
            console.log (Node.isLinebreak (document.body))

        Having dual calling convention for common predicates is super useful, as
        you can use them in functional data-crunching expressions, where free
        functions are far more suitable than instance methods.

        It was inspired by $extensionMethods from Useless, where it carries the
        exact same semantics for member definitions. Those definitions served
        a very limited purpose of merging Underscore functions to built-in types,
        so a more generic tool needed.
        
        ======================================================================== */

        $callableAsFreeFunction: {

            $property: {

                isElement: function () { return (this.nodeType === Node.ELEMENT_NODE) },
                isText:    function () { return (this.nodeType === Node.TEXT_NODE) },

                isLinebreak: is ('BR'),
                isDiv:       is ('DIV'),
                isParagraph: is ('P'),
                isHyperlink: is ('A'),

                isEmptyParagraph: function () {
                    return this.noChildren ||
                         ((this.childNodes.length === 1) && this.firstChild.isLinebreak) },

                isAttachedToDocument: function () {
                    return this.matchUpwards (_.equals (document.body)) ? true : false },

                /*  TODO: make use of native .isContentEditable
                 */
                forbidsEditing: function () {
                    return (this.nodeType === Node.ELEMENT_NODE) &&
                           (this.getAttribute ('contenteditable') === 'false') } } },

    /*  Up/outside means
        ======================================================================== */

        grandParentNode: $property (function () { return this.parentNode && this.parentNode.parentNode }),

        isFirstInParent: $property (function () { return this.parentNode && (this.parentNode.firstChild === this) }),
        isLastInParent:  $property (function () { return this.parentNode && (this.parentNode.lastChild  === this) }),

        removeFromParent: $callableAsFreeFunction (function () { this.parentNode.removeChild (this); return this }),

        outerLeftBoundaryIn: function (container) { var n = this
            while (n.grandParentNode && (n.parentNode !== container) && n.isFirstInParent) { n = n.parentNode }
            return n },

        outerRightBoundaryIn: function (container) { var n = this
            while (n.grandParentNode && (n.parentNode !== container) && n.isLastInParent) { n = n.parentNode }
            return n },

        matchUpwards: function (pred) { var n = this
                   while (n && !pred (n)) { n = n.parentNode }
                                     return n },

        isLeftmostNodeIn: function (parent) {
                             return parent && ((this.matchUpwards (function (n) {
                                                                     return (n === parent) ||
                                                                            !n.isFirstInParent })) === parent) },

        isRightmostNodeIn: function (parent) {
                             return parent && ((this.matchUpwards (function (n) {
                                                                     return (n === parent) ||
                                                                            !n.isLastInParent })) === parent) },

    /*  Down/inside means
        ======================================================================== */

        hasChildren: $property (function () { return   this.hasChildNodes () }),
        noChildren:  $property (function () { return !(this.hasChildNodes ()) }),
        numChildren: $property (function () { return   this.childNodes.length }),

        length: $property (function () { return (this.childNodes ? this.childNodes.length :
                                                (this.nodeValue  ? this.nodeValue .length  : 0)) }),

        /*  If you modify childNodes while iterating it, you'll get into problem.
            Use following method to safely do so.
         */
        safeEnumChildren: function (fn, context) {
            _.each (this.childNodesArray, fn, context || this); return this },

        /*  childNodes is not really an array, so to get Array instance, use this helper
         */
        childNodesArray: $property (function () { return _.asArray (this.childNodes) }),

        appendChildren: function (nodes) { _.each (_.coerceToArray (nodes), function (n) { this.appendChild (n) }, this); return this },
        removeChildren: function (nodes) { _.each (_.coerceToArray (nodes), function (n) { this.removeChild (n) }, this); return this },

        removeAllChildren: function () { this.removeChildren (this.childNodesArray); return this },

        /*  Useful for clutterless DOM trees construction. Can append text nodes via .append ('text')
         */
        append: function (what) { return this.appendChildren (_.isString (what) ? Node.text (what) : what) },

        walkTree: function (cfg, accept) { accept = (arguments.length === 1) ? cfg : accept

                    var walker = document.createTreeWalker (this,   (cfg && cfg.what) || NodeFilter.SHOW_ALL,
                                                                    (cfg && cfg.filter) || null,
                                                                    (cfg && cfg.entityReferenceExpansion) || null)

                    while ((node = walker.nextNode ())) { accept (node) } },

        firstInnermostChild: $callableAsMethod ($property (function (n) { while (n && n.firstChild) { n = n.firstChild } return n })),

        /*  foo<b>123</b>bar    →   <b>.unwrapChildren  →   foo123bar
         */
        unwrapChildren: $callableAsFreeFunction (function () {      this.insertAfterMe (this.childNodesArray)
                                                       var parent = this.parentNode
                                                           parent.removeChild (this)
                                                    return parent }),

    /*  Sideways means
        ======================================================================== */

        prevSiblings: $property (function ()  { var r = [],     n = this.previousSibling
                                    while (n) {     r.push (n); n =    n.previousSibling } return r.reversed }),

        nextNextSibling: $property (function () {
            return (this.nextSibling && this.nextSibling.nextSibling) }),

        nextOutermostSibling: $callableAsMethod ($property (function ( n) {
                                                                while (n && !n.nextSibling) { n = n.parentNode  } // walk upwards until has next sibling
                                                                   if (n)                   { n = n.nextSibling } // take next sibling
                                                                return n })),

        nextInnermostSibling: $callableAsMethod ($property (function (n) { Node.firstInnermostChild (Node.nextOutermostSibling (this)) })),

        appendTo: function (ref) {
            ref.appendChild (this); return this },

        prependTo: function (ref) {
            ref.insertBefore (this, ref.firstChild); return this },

        insertMeBefore: function (ref) {
            ref.parentNode.insertBefore (this, ref); return this },

        insertMeAfter: function (ref) {
            ref.parentNode.insertBefore (this, ref.nextSibling); return this },

        insertBeforeMe: function (nodes) { var parent = this.parentNode
                                           var me     = this

            _.each (_.coerceToArray (nodes).reversed, function (n) { parent.insertBefore (n, me) }); return this },

        insertAfterMe: function (nodes) { var parent = this.parentNode
                                          var next   = this.nextSibling

            _.each (_.coerceToArray (nodes).reversed, function (n) { parent.insertBefore (n, next) }); return this },


    /*  Caret & selection
        ======================================================================== */

        moveCaret: function (offset) { NormalizedCaretPosition.move (this, offset); return this },


    /*  Events
        ======================================================================== */

        on: function (e, fn) { this.addEventListener (e, fn); return this },


    /*  Properties
        ======================================================================== */

        extend: function (props) { return _.extend (this, props) },


    /*  Attributes
        ======================================================================== */

        toggleAttribute: function (name, value) {
                                     if (value) { this.setAttribute    (name, true) }
                                           else { this.removeAttribute (name) }
                                    return this },

        toggleAttributes: function (cfg) { _.map (cfg, _.flip2 (this.toggleAttribute), this); return this },
        setAttributes:    function (cfg) { _.map (cfg, _.flip2 (this.setAttribute),    this); return this },

        intAttribute: function (name) { return (this.getAttribute (name) || '').parsedInt },

        attr: $alias ('setAttributes'),



    /*  Metrics
        ======================================================================== */

        clientBBox: $property (function () { return BBox.fromLTWH (this.getBoundingClientRect ()) }),


    /*  Splitting
        ======================================================================== */

        splitSubtreeBefore: function (node) { // returns right (remaining) subtree
            if (!node || (node.parentNode === this)) {
                return node }
            else {
                return this.splitSubtreeBefore (
                                    !node.previousSibling // if first node in parent, nothing to split – simply proceed to parent
                                        ? node.parentNode
                                        : document.createElement  (node.parentNode.tagName)
                                                  .insertMeBefore (node.parentNode)
                                                  .appendChildren (node.prevSiblings)
                                                  .nextSibling) } },

        splitSubtreeAt: function (location) { var n = location.node, i = location.offset
            return (i > 0) ? (location.node.isText ?
                                this.splitSubtreeBefore (Node.text (n.nodeValue.substr (i)).insertMeAfter (_.extend (n, { nodeValue: n.nodeValue.substr (0, i) }))) :
                                this.splitSubtreeBefore (n.childNodes[i])) :
                                this.splitSubtreeBefore (n) } })


/*  New Safari (as seen in technology preview) defines its own Element.append
    method, which gets into conflict with our previously-defined Node.append
    So will explicitly overrride it.
    ========================================================================= */

    $mixin (Element, {
        append: Node.prototype.append })


/*  Image extensions (again found myself writing the same repetitive
    Image-loading snippet, so decided to finally make a reusable abstraction,
    utilizing the recent Promise concept just for fun)
    ========================================================================= */

    $mixin (Image, {
        fetch: $static (function (url) {
            return new Promise (function (resolve, reject) {
                                _.extend (new Image (), {
                                                src: url,
                                             onload: function ()  { resolve (this) },
                                            onerror: function (e) { reject (e) } }) }) }) })

/*  ======================================================================== */

_.tests.NodePlus = {

    'tree splitting': function () {

        Testosterone.defineAssertions ({
            assertSplitAtBr: function (html, desiredResult) {   var node = _.extend (Node.div, { innerHTML: html })
                                                                    node.splitSubtreeBefore (node.querySelector ('br'))
                                                                    return _.assert (node.innerHTML, desiredResult) } })
        $assertSplitAtBr ('<b><br>foo</b>', '<b><br>foo</b>')
        $assertSplitAtBr ('<b>foo<br></b>', '<b>foo</b><b><br></b>')
        $assertSplitAtBr ('<b>foo<i>bar<br>baz</i>qux</b>', '<b>foo<i>bar</i></b>' + '<b><i><br>baz</i>qux</b>') } }

/*  ======================================================================== */

}) ()





