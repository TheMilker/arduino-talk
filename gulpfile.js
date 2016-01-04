var gulp = require('gulp');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var tsd = require('gulp-tsd');
var typescript = require('gulp-typescript');
var browserSync = require('browser-sync').create();

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
var server = paths.backend.src + 'bin/www.js';

gulp.task('tsd', function (callback) {
    tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
});

// gulp.task('lint', function() {
//   return gulp.src([paths.backend.src + '**/*.js', paths.app.src + '**/*.js'])
//     .pipe(jshint())
//     .pipe(jshint.reporter('default'));
// });

var tsBackendProject = typescript.createProject(paths.backend.src + 'tsconfig.json');
gulp.task('compileBackend', function () {
    return gulp.src(paths.backend.src+'**/*.ts')
        .pipe(typescript(tsBackendProject)) 
        .pipe(gulp.dest(''));
});

// var tsFrontendProject = typescript.createProject({
// 	declaration: true,
// 	noExternalResolve: true
// });
// gulp.task('compileFrontend', function() {
    
// });

gulp.task('deployFrontendApp', function() {
    return gulp.src(paths.app.src + '**')
        .pipe(gulp.dest(paths.app.dest));
});

gulp.task('deployFrontendLibraries', function() {
    return gulp.src([
        rootPaths.node + 'angular2/bundles/angular2-polyfills.js',
        rootPaths.node + 'rxjs/bundles/Rx.umd.js',
        rootPaths.node + 'angular2/bundles/angular2-all.umd.js'
    ])
    .pipe(gulp.dest(paths.lib.dest));
});

// run browser-sync on for client changes
gulp.task('browser-sync', ['deployFrontend', 'nodemon', 'watch'], function () {
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        files: [publicFilesPath + "**/*.*"],
        browser: "google chrome",
        port: 7000,
    });
});

// run nodemon on server file changes
gulp.task('nodemon', ['compileBackend', 'deployFrontend'], function (cb) {
    var started = false;

    return nodemon({
        script: server,
        watch: [paths.backend.src + '**/*.ts'],
        env: { 'NODE_ENV': 'development' }
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    }).on('restart', function onRestart() {
        setTimeout(function reload() {
            browserSync.reload({
                stream: false
            });
        }, 500);  // browserSync reload delay
    });
});

gulp.task('watch', ['compileBackend', 'deployFrontendApp'], function () {
    gulp.watch(paths.backend.src + '**/*.ts', ['compileBackend']); 
    gulp.watch(paths.app.src + '**/*.js', ['deployFrontendApp']);
}); 

gulp.task('deployFrontend', ['deployFrontendApp', 'deployFrontendLibraries']);
gulp.task('default', ['deployFrontend', 'browser-sync']);