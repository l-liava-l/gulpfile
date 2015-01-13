'use strict'

var dependens = ['fs', 'path', 'gulp', 'gulp-csso', 'gulp-uglify',
                'gulp-concat', 'gulp-less', 'gulp-bower',
                'gulp-watch', 'main-bower-files', 'karma', 
                'child_process', 'gulp-html-tag-include'];

dependens.forEach(function(name) {
    global[name.replace('gulp-', '')] = require(name);
});


(function() {

    var config = {
        pathToBuildDir: '/home/lev/projects/solvy/v2.1/_public/',
        pathToDevDir: '/home/lev/projects/solvy/v2.1/front-end/',
        minification: false,
        watching: true
    };


    findModules(createTasks);


    //Run for each module
    function createTasks(moduleName) {

        var modulePath = moduleName,
            buildDir = config.pathToBuildDir,
            devDir = config.pathToDevDir,
            min = config.minification,
            watch = config.watching;


        moduleName === 'global' ? modulePath = '../' : null

        var gSrc = devDir + '/modules/' + moduleName,
            gDest = buildDir + '/modules/' + modulePath ;



        gulp.task(moduleName + ':js', js);
        gulp.task(moduleName + ':styles', styles);
        gulp.task(moduleName + ':assets', assets);
        gulp.task(moduleName + ':vendor', vendor);
        gulp.task(moduleName + ':karma', testsKarma);
        gulp.task(moduleName + ':installDep', installDep);    

       
        gulp.task(moduleName, function() {   
            gulp.run(moduleName + ':vendor');   
            gulp.run(moduleName + ':js');
            gulp.run(moduleName + ':assets');
            gulp.run(moduleName + ':styles');

            if(config.testing) {
                gulp.run(moduleName + ':karma');
            }
        });

        gulp.task(moduleName + ':lib')

        function js() {
            var src = gSrc + '/js/**/*.js',
                dest = gDest + "/";

            gulp.src(src)
                .pipe(concat(moduleName + '.js'))
                .pipe(min ? uglify() : gulp.dest(dest))
                .pipe(gulp.dest(dest));

            if(watch) gulp.watch(src, function() {  gulp.run(moduleName + ':js'); });
        }

        function styles() {
            var src =  gSrc + '/includes.less',
                dest = gDest + "/";

            gulp.src(src)
                .pipe(less({
                    paths: [ path.join() ]
                }))
                .pipe(concat(moduleName + '.css'))
                .pipe(min ? csso() : gulp.dest(dest))
                .pipe(gulp.dest(dest));

            if(watch) gulp.watch(src, function() {  gulp.run(moduleName + ':styles'); });
        }


         function assets() {
            var src = gSrc + '/assets/**/',
                dest = gDest + "/";

            gulp.src(src + "!(*.html)")
                .pipe(gulp.dest(dest));

            gulp.src(src + "*.html")
                .pipe(global['html-tag-include']())
                .pipe(gulp.dest(dest));

            if(watch) gulp.watch(src, function() {  gulp.run(moduleName + ':assets'); });
        }

    

       function vendor() {

            var jsStatic = gSrc + '/lib/**/*.js',
                cssStatic = gSrc + '/lib/**/*.css',
                cssJsDest = gDest + '/vendor',
                fonts = gDest + '/fonts';

            var srcJs = mainBowerFiles('/**/*.js'),
                srcCss = mainBowerFiles('/**/*.css');

            srcJs.push(jsStatic);
            srcCss.push(cssStatic);

            gulp.src(srcJs)
                .pipe(concat(moduleName + '.vendor.js'))
                .pipe(min ? uglify() : gulp.dest(cssJsDest))
                .pipe(gulp.dest(cssJsDest));
            gulp.src(srcCss)
                .pipe(concat(moduleName + '.vendor.css'))
                .pipe(min ? csso() : gulp.dest(cssJsDest))
                .pipe(gulp.dest(cssJsDest));
            gulp.src(mainBowerFiles(/\.eot$|\.svg$|\.ttf$|\.woff$/)).pipe(gulp.dest(fonts));

            function mainBowerFiles(filter) {
                var bowerComp = global['main-bower-files']({
                    paths: gSrc,
                    filter: filter
                });

                return bowerComp;             
            }
        }

        function testsKarma(done) {
            karma.server.start({
                configFile:  devDir + 'tests/' + moduleName + '/karma.conf.js',
                singleRun: false
            }, done);
        }


        function installDep(done) {
           var options = { 
                cwd: gSrc
            };

           child_process.exec('bower install', options);
        }        
    }


    function findModules(createModuleTasks) {
        var modules = fs.readdirSync(config.pathToDevDir +'/modules/');

        modules.forEach(function(name){
            createModuleTasks(name, false);
        })

        gulp.task('build', function() {
            modules.forEach(run)
            function run(name) {gulp.run(name)}
        });

        gulp.task('install', function() {
            modules.forEach(run)
            function run(name) {
                gulp.run(name + ':installDep'); 
            }
        });

        gulp.task('default', function(){
            console.log('=============================================================');
            console.log('  gulp install  -- Will be installed all dependens for each module.')
            console.log('  gulp build  -- Build all.')
            console.log('  gulp [moduleName] -- Build a module.');
            console.log('  gulp [moduleName]:[type] -- Build files by type.');
            console.log('                        -------                          ');
            console.log('  types: js, styles, assets, vendor, installDep');
            console.log('  modules: ' + modules.join(', '));
            console.log('                        -------                          ');
            console.log('  gulp editor:karma -- run tests and native karma watcher');
            console.log('=============================================================');  
        });
    }
})();

