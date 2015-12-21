var gulp = require('gulp');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');

var basePaths = {
    src: './frontend/',
    dest: './public/',
    bower: './bower_components/',
    node: './node_modules/'
};

var paths = {
    app: {
        src: basePaths.src + 'src/',
        dest: basePaths.dest + 'app/'
    },
    lib: {
        dest: basePaths.dest + 'lib/'
    },
    styles: {
        src: basePaths.src + 'less/',
        dest: basePaths.dest + 'css/min/'
    }
};

gulp.task('lint', function() {
  return gulp.src(paths.app.src + '**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('deployFrontEnd', function() {
    return gulp.src(paths.app.src + '**')
    .pipe(gulp.dest(paths.app.dest));
});

gulp.task('deployLibraries', function() {
    return gulp.src([
        basePaths.node + 'angular2/bundles/angular2-polyfills.js',
        basePaths.node + 'rxjs/bundles/Rx.umd.js',
        basePaths.node + 'angular2/bundles/angular2-all.umd.js'
    ])
    .pipe(gulp.dest(paths.lib.dest));
});

gulp.task('default', function() {
    gulp.start('deployFrontEnd', 'deployLibraries');
});