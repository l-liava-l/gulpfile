'use strict'

var dependens = ['fs', 'path', 'gulp', 'gulp-csso', 'gulp-uglify',
                'gulp-concat', 'gulp-less', 'gulp-bower',
                'gulp-watch', 'main-bower-files'];

dependens.forEach(function(name) {
    global[name.replace('gulp-', '')] = require(name);
});


(function() {

    var modules = fs.readdirSync('./modules/');

    modules.forEach(function(name){
        createModuleTasks(name, false);
    })

    gulp.task('all', function() {
        modules.forEach(run)
        function run(name) {gulp.run(name)}
    });

    gulp.task('default', function(){
        console.log('');
        console.log('  gulp [moduleName]:[type] -- build files in module by type.');
        console.log('  gulp [moduleName] -- build module.');
        console.log('  gulp all -- build all modules.');
        console.log('');
        console.log('  types: js, styles, assets, bower');
        console.log('  modules: ' + modules);
        console.log('');
    });


    function createModuleTasks(moduleName) {

        var modulePath = moduleName

        moduleName === 'global' ? modulePath = '../' : null

        var buildDir = '../_public/',

          //==============================
            min = false, watch = true; //=
          //==============================

        //============= js
        gulp.task(moduleName + ':js' , function() {
            var src = './modules/' + moduleName + '/js/**/*.js',
                dest = buildDir + 'modules/' +  modulePath  + '/';

            gulp.src(src)
                .pipe(concat(moduleName + '.js'))
                .pipe(min ? uglify() : gulp.dest(dest))
                .pipe(gulp.dest(dest));

            if(watch) gulp.watch(src, function() {  gulp.run(moduleName + ':js'); });
        });

        //============= less && css
        gulp.task(moduleName + ':styles', function() {
            var src = './modules/' + moduleName + '/styles/**/*',
                dest = buildDir + 'modules/' +  modulePath  + '/';

            gulp.src(src)
                .pipe(less({
                    paths: [ path.join(__dirname, 'less', 'includes') ]
                }))
                .pipe(concat(moduleName + '.css'))
                .pipe(min ? csso() : gulp.dest(dest))
                .pipe(gulp.dest(dest));

            if(watch) gulp.watch(src, function() {  gulp.run(moduleName + ':styles'); });
        });


        //============= copy assets
        gulp.task(moduleName + ':assets', function() {
            var src = ['./modules/' + moduleName + '/assets/**/*'];

            gulp.src(src)
                .pipe(gulp.dest(buildDir + 'modules/' +  modulePath  + '/' ));

            if(watch) gulp.watch(src, function() {  gulp.run(moduleName + ':assets'); });
        });


        //============= bower (concat to vendor and copy)
        gulp.task(moduleName + ':bower', function() {

            function mainBowerFiles(filter) {
                return global['main-bower-files']({
                    paths: './modules/' + moduleName,
                    filter: filter
                });
            }

            gulp.src(mainBowerFiles('/**/*.js'))
                .pipe(concat(moduleName + '.vendor.js'))
                .pipe(gulp.dest(buildDir + 'modules/' +  modulePath  + '/vendor'));

            gulp.src(mainBowerFiles('/**/*.css'))
                .pipe(concat(moduleName + '.vendor.css'))
                .pipe(gulp.dest(buildDir + 'modules/' +  modulePath  + '/vendor'));

            gulp.src(mainBowerFiles(/\.eot$|\.svg$|\.ttf$|\.woff$/))
                .pipe(gulp.dest(buildDir + 'modules/' +  modulePath  + '/fonts'));
        });

        gulp.task(moduleName, function() {
            gulp.run(moduleName + ':js');
            gulp.run(moduleName + ':assets');
            gulp.run(moduleName + ':styles');
            gulp.run(moduleName + ':bower');
        });

    }
})();

