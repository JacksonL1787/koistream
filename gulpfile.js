const gulp = require('gulp');
const stylus = require('gulp-stylus');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const nodemon = require('gulp-nodemon')
const del = require('del');
const using = require('gulp-using')
const cache = require('gulp-cached');
const isDev = process.env.NODE_ENV === 'development'

gulp.task('stylus', () => {
  return gulp.src('./src/static/css/**/*.styl')
    .pipe(stylus({}))
    .pipe(cache('style'))
    .pipe(using({}))
    .pipe(gulp.dest('./bin/css'))
})

gulp.task('babel', () => {
    return gulp.src('./src/static/js/**/*.js')
        .pipe(cache('jsfiles'))
        .pipe(using({}))
        .pipe(gulp.dest('./bin/js'))
})

gulp.task('img', () => {
    return gulp.src('./src/static/img/**/*')
        .pipe(cache('images'))
        .pipe(gulp.dest('./bin/img'))
})

exports.static = gulp.series([ 'stylus', 'babel', 'img']);

gulp.task('watch', (done) => {
    gulp.watch(['./src/static/**/*.*'], gulp.series(['static']));
    nodemon({
        script: './src/app.js',
        watch: ['./src/db/**/*.js', './src/routes/**/*.js', './src/app.js', './src/models/**/*.js', './src/config/**/*.js'],
        env: process.env,
        done
    })
});
