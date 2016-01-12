var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var tsd = require('gulp-tsd');
var typescript = require('gulp-typescript');
var browserSync = require('browser-sync').create();
var rimraf = require('rimraf');
var less = require('gulp-less');
var tslint = require('gulp-tslint');

var rootPaths =  {
    app: './app/',
    bower: './bower_components/',
    node: './node_modules/',
    deploy: './deploy/'
};
var basePaths = {
    frontend: rootPaths.app + 'frontend/',
    backend: rootPaths.app + 'backend/'
};

var publicFilesPath = rootPaths.deploy + 'public/';
var backendSrcPath = basePaths.backend + 'src/';
var paths = {
    backend: {
        src: backendSrcPath,
        views: backendSrcPath + 'views/',
        dest: rootPaths.deploy + 'src/'
        
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
        src: basePaths.frontend + 'less/',
        dest: publicFilesPath + 'stylesheets/'
    },
    images: {
        src: basePaths.frontend + 'images/',
        dest: publicFilesPath + 'images/'
    }
};
var server = paths.backend.dest + 'bin/www.js';

gulp.task('tsd', function (callback) {
    tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
});

gulp.task('tslint', function() {
    gulp.src(paths.backend.src+'**/*.ts')
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

var tsBackendProject = typescript.createProject(paths.backend.src + 'tsconfig.json');
gulp.task('compileBackend', ['tslint'], function() {
    gulp.src(paths.backend.src+'**/*.ts', {base: basePaths.backend})
        .pipe(typescript(tsBackendProject)) 
        .pipe(gulp.dest(rootPaths.deploy));
    gulp.src(paths.backend.views + '*.hbs')
        .pipe(gulp.dest(paths.backend.dest +'views/'));
});

// var tsFrontendProject = typescript.createProject({
// 	declaration: true,
// 	noExternalResolve: true
// });
// gulp.task('compileFrontend', function() {
    
// });

gulp.task('deployFrontendApp', function() {
    return gulp.src(paths.app.src + '**/*.js')
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
        proxy: 'http://localhost:3000',
        files: [publicFilesPath + '**/*.*'],
        browser: 'google chrome',
        port: 7000,
    });
});

// run nodemon on server file changes
gulp.task('nodemon', ['compileBackend', 'deployFrontend'], function (cb) {
    var started = false;

    return nodemon({
        script: server,
        watch: [paths.backend.dest + '/bin/'],
        ext: 'js',
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

gulp.task('watch', ['compileBackend', 'deployFrontendApp', 'less'], function () {
    gulp.watch([paths.backend.src + '**/*.ts', paths.backend.views + '*.hbs'], ['compileBackend']); 
    gulp.watch(paths.app.src + '**/*.js', ['deployFrontendApp']);
    gulp.watch(paths.styles.src + '**/*.less', ['less']);
}); 

gulp.task('clean', function (cb) {
  rimraf(rootPaths.deploy, cb);
});

gulp.task('less', function () {
  return gulp.src(paths.styles.src+ '**/*.less')
    .pipe(less().on('error', function(err) {
        console.log(err);
    }))
    .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('deployFrontend', ['deployFrontendApp', 'deployFrontendLibraries']);
gulp.task('default', ['compileBackend', 'deployFrontend', 'less', 'browser-sync']);