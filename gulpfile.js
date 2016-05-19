var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var typescript = require('gulp-typescript');
var browserSync = require('browser-sync').create();
var rimraf = require('gulp-rimraf');
var less = require('gulp-less');
var tslint = require('gulp-tslint');
var spawn = require('child_process').spawn;
var gulpTypings = require("gulp-typings");

var rootPaths =  {
    app: './app/',
    bower: './bower_components/',
    node: './node_modules/',
    deploy: './deploy/',
    typings: './typings/'
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

gulp.task("installTypings",function(){
    var stream = gulp.src("./typings.json").pipe(gulpTypings());
    return stream;
});

gulp.task('tslint:backend', () => {
    gulp.src([paths.backend.src+'**/*.ts', '!'+paths.backend.src+'tsd.d.ts'])
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('tslint:frontend', () => {
    gulp.src([paths.app.src+'**/*.ts', '!'+paths.app.src+'tsd.d.ts'])
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

var tsBackendProject = typescript.createProject(paths.backend.src + 'tsconfig.json');
gulp.task('compile:backend', ['installTypings', 'tslint:backend'], () => {
    gulp.src(paths.backend.src+'**/*.ts', {base: basePaths.backend})
        .pipe(typescript(tsBackendProject))
        .pipe(gulp.dest(rootPaths.deploy));
    gulp.src(paths.backend.views + '*.hbs')
        .pipe(gulp.dest(paths.backend.dest +'views/'));
});

var tsFrontendProject = typescript.createProject(paths.app.src + 'tsconfig.json');
gulp.task('compile:frontend', ['tslint:frontend'], () => {
    gulp.src(paths.app.src+'**/*.ts', {base: paths.app.src})
        .pipe(typescript(tsFrontendProject))
        .pipe(gulp.dest(paths.app.dest));
});

gulp.task('deploy:frontendLibraries', () => {
    return gulp.src([
        rootPaths.node + 'angular2/bundles/angular2-polyfills.js',
        rootPaths.node + 'rxjs/bundles/Rx.js',
        rootPaths.node + 'angular2/bundles/angular2.dev.js',
        rootPaths.node + 'systemjs/dist/system.js',
        rootPaths.node + 'systemjs/dist/system.js.map',
        rootPaths.node + 'jsmpeg/jsmpg.js'
    ])
    .pipe(gulp.dest(paths.lib.dest));
});

// run browser-sync on for client changes
gulp.task('browser-sync', ['deploy:frontend', 'nodemon', 'watch'], () => {
    browserSync.init(null, {
        proxy: 'http://localhost:3000',
        files: [publicFilesPath + '**/*.*'],
        browser: 'google chrome',
        port: 7000,
    });
});

// run nodemon on server file changes
gulp.task('nodemon', ['compile:backend', 'deploy:frontend'], (cb) => {
    var started = false;

    return nodemon({
        script: server,
        watch: [paths.backend.dest + '/bin/'],
        ext: 'js',
        env: { 'NODE_ENV': 'development' }
    }).on('start', () => {
        if (!started) {
            cb();
            started = true;
        }
    }).on('restart', () => {
        setTimeout(() => {
            browserSync.reload({
                stream: false
            });
        }, 500);  // browserSync reload delay
    });
});

gulp.task('watch', ['compile:backend', 'compile:frontend', 'compile:less'], () => {
    gulp.watch([paths.backend.src + '**/*.ts', paths.backend.views + '*.hbs'], ['compile:backend']);
    gulp.watch(paths.app.src + '**/*.ts', ['compile:frontend']);
    gulp.watch(paths.styles.src + '**/*.less', ['compile:less']);
});

gulp.task('compile:less', () => {
  return gulp.src(paths.styles.src+ '**/*.less')
    .pipe(less().on('error', (err) => {
        console.log(err);
    }))
    .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('server', ['compile:backend', 'deploy:frontend', 'compile:less'], (cb) => {
    var child = spawn('node', [server]);
    child.stdout.on('data', (chunk) => {
        console.log(`${chunk}`);
    });
    child.stderr.on('data', (chunk) => {
        console.log(`${chunk}`);
    });
})

gulp.task('clean:build', (cb) => {
    return gulp.src([rootPaths.deploy, rootPaths.typings], { read: false })
        .pipe(rimraf({ force: true }));
});

gulp.task('deploy:frontend', ['compile:frontend', 'deploy:frontendLibraries']);
gulp.task('build', ['installTypings', 'compile:backend', 'deploy:frontend', 'compile:less']);
gulp.task('dev', ['compile:backend', 'deploy:frontend', 'compile:less', 'browser-sync']);
gulp.task('default', ['compile:backend', 'deploy:frontend', 'compile:less', 'server']);