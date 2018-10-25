'use strict';

var gulp = require('gulp'),
    inject = require('gulp-inject'),
    fs = require('fs'),
    path = require('path'),
    series = require('stream-series'),
    CONFIG = require('./config/gulp'),
    hash = require('gulp-hash-filename'),
    uglify = require("gulp-uglify"),// minify js
    concat = require('gulp-concat'), //all minify files into this
    cleanCSS = require('gulp-clean-css'); //minify css

var environment = 'development'
var gulpJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "./config/gulp.json"), "utf8"));

gulp.task('site-development', function () {
    var JSvendorStream = gulp.src(CONFIG.app.site.vendor.js.src, {read: false});
    var CSSvendorStream = gulp.src(CONFIG.app.site.vendor.css.src, {read: false});
    var JSappStream = gulp.src(CONFIG.app.site.modules.js.src, {read: false});

    return gulp.src('./views/index.html')
        .pipe(inject(series(JSvendorStream, CSSvendorStream, JSappStream)))
        .pipe(gulp.dest('./views'));

});

gulp.task('site-production', function () {
    // var hashFormat = "{name}.min{ext}";
    // if (environment === 'production') {
        var hashFormat = "{name}.{hash}.min{ext}";
    // }
    var CSSvendorStream = gulp.src(CONFIG.app.site.vendor.css.src)
        .pipe(concat('vendor.css'))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(hash({"format": hashFormat}))
        .pipe(gulp.dest(CONFIG.app.site.vendor.css.dest));

    var JSvendorStream = gulp.src(CONFIG.app.site.vendor.js.src)
        .pipe(concat('vendor.js'))
        .pipe(uglify({mangle: false}).on('error', function (e) {
            console.error('Error in compress task', e.toString());
        }))
        .pipe(hash({"format": hashFormat}))
        .pipe(gulp.dest(CONFIG.app.site.vendor.js.dest));

    var JSappStream = gulp.src(CONFIG.app.site.modules.js.src)
        .pipe(concat('main.js'))
        .pipe(uglify({mangle: false}).on('error', function (e) {
            console.error('JSappStream Error = ', e.toString());
        }))
        .pipe(hash({"format": hashFormat}))
        .pipe(gulp.dest(CONFIG.app.site.modules.js.dest));

    gulp.src('./views/index.html')
        .pipe(inject(series(CSSvendorStream, JSvendorStream, JSappStream)))
        .pipe(gulp.dest('./views'));
});

gulp.task('development', ['site-development']);
gulp.task('production', ['site-production']);