const $ = require ('jquery')

log.timestampEnabled = true

/*  Bind Panic as default exception handler
 */
Panic.init ()

function initErrorHandlingDemo () {

    /*  Define some function that throws error
     */
    function erroneousFunction () {
        _.map ([1,2,3], callMe) }

    function callErroneousFunctionTwoTimes () {
        _.delay (erroneousFunction)
        _.delay (erroneousFunction) }

    /*  Bind to button to trigger that function
     */
    $('#panic-demo-0').click (function () { erroneousFunction () })
    $('#panic-demo-1').click (callErroneousFunctionTwoTimes)

    /*  Bind to button to trigger server's method
     */
    $('#panic-demo-2').click (function () { JSONAPI.post ('erroneous-method').panic }) }

function initComponentDemo () {

    /*  Defines slider component
     */
    const Sliddah = $component ({

        $requires: {
            min:   'number',
            max:   'number',
            value: 'number' },

        value: $observableProperty (),

        init: function () {
            this.dom = $('<div class="sliddah">')
                .append (this.handle = $('<em>'))
                .drag ({
                    callMoveAtStart: true,
                    move: this.$ (function (memo, where, offset) {
                        this.value = _.rescale (offset.x,
                            [0,        this.dom.width ()],
                            [this.min, this.max], { clamp: true }) }) })

            _.delay (this.$ (function () {
                this.valueChange (this.$ (function (v) {
                    this.handle.css ({
                        left: Math.round (_.rescale (v,
                                            [this.min, this.max],
                                            [0, this.dom.width ()], { clamp: true })) }) })) })) },

        destroy: function () {
            this.dom.remove () } })

    /*  Constructs slider instance
     */
    const slider1 = new Sliddah ({
	        min:   10,
	        max:   100,
	        value: 42,                                          // inits $observableProperty from config
	        valueChange: function (x) {                         // binds from config
	            this.handle.text (x.toFixed (0))  } })          // 'this' passed to trigger callback
	          
    const slider2 = new Sliddah ({ min: 0, max: 1, value: 1,
				        valueChange: function (x) {
				            $(document.body).css ('background',
				                _.RGB2CSS ([x, 1, 1])) } })

    /*  Appends slider to DOM tree
     */
    $('#component-demo').append ([slider1.dom, slider2.dom]) }

/*  Init demos
 */
$(document).ready (function () {

    initErrorHandlingDemo ()
    initComponentDemo ()  })