var gulp = require('gulp');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');

var rootPaths =  {
    app: './app/',
    bower: './bower_components/',
    node: './node_modules/'
};
var basePaths = {
    frontend: rootPaths.app + 'frontend/',
    backend: rootPaths.app + 'backend/'
};

var publicFilesPath = basePaths.backend + 'public/';
var paths = {
    backend: {
        src: basePaths.backend + 'src/'
    },
    app: {
        src: basePaths.frontend + 'src/',
        test: basePaths.frontend + 'test/',
        dest: publicFilesPath + 'app/'
    },
    lib: {
        dest: publicFilesPath + 'lib/'
    },
    styles: {
        src: basePaths.backend + 'less/',
        dest: publicFilesPath + 'stylesheets/'
    }
};
var server = paths.backend.src + 'bin/www';

gulp.task('lint', function() {
  return gulp.src([paths.backend.src + '**/*.js', paths.app.src + '**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('deployFrontEnd', function() {
    return gulp.src(paths.app.src + '**')
    .pipe(gulp.dest(paths.app.dest));
});

gulp.task('deployLibraries', function() {
    return gulp.src([
        rootPaths.node + 'angular2/bundles/angular2-polyfills.js',
        rootPaths.node + 'rxjs/bundles/Rx.umd.js',
        rootPaths.node + 'angular2/bundles/angular2-all.umd.js'
    ])
    .pipe(gulp.dest(paths.lib.dest));
});

gulp.task('start', function () {
    nodemon({
        script: server,
        watch: [paths.backend.src],
        env: { 'NODE_ENV': 'development' }
    })
})

gulp.task('default', function() {
    gulp.start('deployFrontEnd', 'deployLibraries');
});