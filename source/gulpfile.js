var gulp = require('gulp');

// gulp plugins and utils
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var zip = require('gulp-zip');

// postcss plugins
var autoprefixer = require('autoprefixer');
var colorFunction = require('postcss-color-function');
var cssnano = require('cssnano');
var customProperties = require('postcss-custom-properties');
var easyimport = require('postcss-easy-import');

function swallowError(error) {
    gutil.log(error.toString());
    gutil.beep();
    this.emit('end');
}

function nodemonServerInit(done) {
    livereload.listen(1234);
    done();
}

function cssTask() {
    var processors = [
        easyimport,
        customProperties,
        colorFunction(),
        autoprefixer({browsers: ['last 2 versions']}),
        cssnano()
    ];

    return gulp.src('assets/css/*.css')
        .on('error', swallowError)
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('assets/built/'))
        .pipe(livereload());
}

function watchTask() {
    return gulp.watch('assets/css/**', cssTask);
}

function zipTask() {
    var targetDir = 'dist/';
    var themeName = require('./package.json').name;
    var filename = themeName + '.zip';

    return gulp.src([
        '**',
        '!node_modules', '!node_modules/**',
        '!dist', '!dist/**'
    ])
        .pipe(zip(filename))
        .pipe(gulp.dest(targetDir));
}

var build = gulp.series(cssTask, nodemonServerInit);

gulp.task('css', cssTask);
gulp.task('watch', watchTask);
gulp.task('build', build);
gulp.task('zip', gulp.series(cssTask, zipTask));
gulp.task('default', gulp.series(build, watchTask));
