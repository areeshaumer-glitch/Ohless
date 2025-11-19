'use strict';

var gulp          = require('gulp');
var sass          = require('gulp-sass')(require('sass'));
var browserSync   = require('browser-sync').create();
var sourcemaps    = require('gulp-sourcemaps');
var rename        = require('gulp-rename');
var rtlcss        = require('gulp-rtlcss');
var gulpif        = require('gulp-if');

var enableRTL     = false; // TODO: RTL CSS will be only generated if this is TRUE

var Paths = {
    TEMPLATE: './template',
    SCSS: 'template/assets/scss/**/*.scss',
    CSS: 'template/assets/css/',
    JS: 'template/**/*.js',
    HTML: 'template/**/*.html'
};

// Function to dynamically import gulp-autoprefixer with error handling
async function getAutoprefixer() {
    try {
        const autoprefixer = await import('gulp-autoprefixer');
        return autoprefixer.default;
    } catch (error) {
        console.error('Error importing gulp-autoprefixer:', error);
        throw error;
    }
}

// Compile sass into CSS
gulp.task('sass', async function() {
    try {
        const autoprefixer = await getAutoprefixer();
        return gulp.src(Paths.SCSS)
            .pipe(sourcemaps.init())
            .pipe(sass.sync({
                outputStyle: 'expanded' // Output Style options: nested, compact, expanded or compressed
            }).on('error', sass.logError))
            .pipe(autoprefixer({
                overrideBrowserslist: ['last 2 versions']
            }))
            .pipe(gulp.dest(Paths.CSS))
            .pipe(gulpif(enableRTL, rtlcss()))
            .pipe(gulpif(enableRTL, rename({ suffix: '-rtl' })))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(Paths.CSS))
            .pipe(browserSync.stream());
    } catch (error) {
        console.error('Error in sass task:', error);
    }
});

// Static Server
gulp.task('serve', function(done) {
    browserSync.init({
        server: Paths.TEMPLATE
    });
    done();
});

// Watching files
gulp.task('watch', function(done) {
    gulp.watch(Paths.SCSS).on('change', gulp.series('sass', browserSync.reload));
    gulp.watch(Paths.HTML).on('change', browserSync.reload);
    gulp.watch(Paths.JS).on('change', browserSync.reload);
    done();
});

gulp.task('default', gulp.series('sass', 'serve', 'watch'));
