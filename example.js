"use strict";

/*  Usage:

        npm start example
        
*/

require ('./useless')

const Examples = $singleton (Component, {

    $defaults: {
        runCodeBaseTests: false,
        webpackEntries: {
            entry: {
                'example/shared': {
                    'example/useless.client':   "./useless.client.js",
                    'example/useless.devtools': "./useless.devtools.js",
                    'example/index':            "./example/index.js",
                }
            }
        },
        config: {
            webpack: {
                hotReload: true
            }
        }
    },

    api () {
        return {
            '/': this.template.$ ('./example/index.html'),
            'api/erroneous-method': { post: this.erroneousMethod } } },

    $depends: [
        
        require ('./server/supervisor'),
        require ('./server/webpack'),
        require ('./server/templating'),
        require ('./server/websocket'),
        require ('./server/REPL'),
        require ('./server/source')
    ],

    erroneousMethod () {
        unknownFunction () },
                                        
    init () {
        log.green ('Example app is running at http://localhost:1333') } })
