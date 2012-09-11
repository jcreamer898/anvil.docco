var docco = require("docco");

// ###anvil.docco
// author: Jonathan Creamer
var doccoFactory = function( _, anvil ) {
    return anvil.plugin({
        name: "anvil.docco",
        activity: "post-process",
        all: false,
        inclusive: false,
        exclusive: false,
        output: "./docs/",
        fileList: [],
        commander: [
            ["-d, --docco", "document all files"]
        ],
        // Configure the plugin
        configure: function(config, command, done) {
            var doccoConfig = config[ "docco" ];
            
            if ( doccoConfig ) {

                if ( doccoConfig.all) {
                    this.all = true;
                } else if ( doccoConfig.include) {
                    this.inclusive = true;
                    this.fileList = doccoConfig.include;
                } else if ( doccoConfig.exclude ) {
                    this.exclusive = true;
                    this.fileList = doccoConfig.exclude;
                }

                if ( doccoConfig.output ) {
                    this.output = doccoConfig.output;
                }
            }
            else if ( command.docco ) {
                this.all = true;
            }


            done();
        },
        // Run the plugin
        run: function( done ) {
            var jsFiles = [];
            
            // Include these files
            if ( this.inclusive ) {
                jsFiles = this.inclusive;
            }
            // Get all the files, then exclude the one's we don't want.
            else if ( this.all || this.exclusive ) {
                jsFiles = _.filter( anvil.project.files, function(file) {
                    return file.extension() === ".js";
                });

                if ( this.exclusive ) {
                    // REJECTION!
                    jsFiles = _.reject( jsFiles, function(file) {
                        return _.any( this.fileList, function(excluded) {
                            return excluded.fullPath === file.fullPath;
                        });
                    });
                }
            }
            
            // Schedule the documentation.
            if ( jsFiles.length > 0 ) {
                anvil.log.step( "Documenting " + jsFiles.length + " files" );
                
                this.doc( jsFiles, function() {
                    done();
                });
                
                // anvil.scheduler.parallel( jsFiles, this.doc, function() {
                //     done();
                // });
            } else {
                done();
            }
        },
        // ### doc
        // This is where the magic happens.
        doc: function( files, done ) {
            var self = this;
            
            // Gotta make sure the output is correct.
            anvil.fs.ensurePath( self.output, function( err ) {
                if ( err ) {
                    anvil.log.error( "Could not create a docs directory" );
                    return;
                }
                docco.document( _.map(files, function(file) {
                    return file.fullPath;
                }), {
                    output: self.output
                });

                done();
            });
        }
    });
};

module.exports = doccoFactory;