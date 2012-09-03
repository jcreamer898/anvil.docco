var docco = require("docco");

// ###anvil.docco
// author: Jonathan Creamer
var doccoFactory = function( _, anvil ) {
    return anvil.plugin({
        name: "anvil.docco",
        activity: "post-process",
        all: true,
        inclusive: false,
        exclusive: false,
        fileList: [],
        commander: [
            ["-d, --docco", "document all files"]
        ],
        // Configure the plugin
        configure: function(config, command, done) {
            var anvilConfig = config[ "anvil.config" ],
                doccoConfig = config[ "anvil.docco" ];

            if ( anvilConfig ) {
                if ( doccoConfig.all) {
                    this.all = true;
                } else if ( doccoConfig.include) {
                    this.inclusive = true;
                    this.fileList = doccoConfig.include;
                } else if ( doccoConfig.exclude ) {
                    this.exclusive = true;
                    this.fileList = doccoConfig.exclude;
                }
            } else if ( command.docco ) {
                this.all = true;
            }
            done();
        },
        // Run the plugin
        run: function( done ) {
            var jsFiles = [];
            if ( this.inclusive ) {
                jsFiles = this.inclusive;
            } else if ( this.all || this.exclusive ) {
                jsFiles = _.filter( anvil.project.files, function(file) {
                    return file.extension() === ".js";
                });

                if ( this.exclusive ) {
                    jsFiles = _.reject( jsFiles, function(file) {
                        return _.any( this.fileList, function(excluded) {
                            return excluded.fullPath === file.fullPath;
                        });
                    });
                }
            }
            if ( jsFiles.length > 0 ) {
                anvil.log.step( "Documenting " + jsFiles.length + " files" );
                anvil.scheduler.parallel( jsFiles, this.doc, function() {
                    done();
                });
            } else {
                done();
            }
        },

        doc: function( file, done ) {
            var self = this;
            
            docco.document([ file.fullPath ], {
                output: "./lib/"
            });
        }
    });
};

module.exports = doccoFactory;