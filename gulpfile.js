'use strict'

const gulp        = require('gulp')
const concat      = require('gulp-concat')
const sass        = require('gulp-sass')
const rename      = require('gulp-rename')
const uglify      = require('gulp-uglify')
const cleanCSS    = require('gulp-clean-css')
const babel       = require('gulp-babel')
const gulpsync    = require('gulp-sync')(gulp)
const jshint      = require('gulp-jshint')
const stylish     = require('jshint-stylish')
const expect      = require('gulp-expect-file')
const plumber     = require('gulp-plumber')
const browserSync = require('browser-sync').create()
const autoprefixer= require('gulp-autoprefixer')
const stylus      = require('gulp-stylus')

const _srcdir = 'src/'
const _tpldir = 'templates/'

const listCssFiles = [
  _srcdir + 'css/styles.styl'
]
const listJsFiles = [
  _srcdir + 'js/scripts_es5.js'
]

// CSS task
gulp.task('css', function () {
  return gulp.src(listCssFiles)
    .pipe(expect({verbose: true}, listCssFiles))
    //.pipe(sass().on('error', sass.logError))
    .pipe(stylus())
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(concat('all.css'))
    .pipe(gulp.dest(_srcdir + '/dist/'))
    .pipe(browserSync.stream())
})

// JS tasks
gulp.task('js_hint', function() {
  return gulp.src(_srcdir + '/js/scripts.js')
    .pipe(expect({verbose: true}, _srcdir + '/js/scripts.js'))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
})
gulp.task('js_transpiling', function() {
  return gulp.src(_srcdir + '/js/scripts.js')
    .pipe(plumber())
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(concat('scripts_es5.js'))
    .pipe(gulp.dest(_srcdir + '/js/'))
})
gulp.task('js_concat', function() {
  return gulp.src(listJsFiles)
    .pipe(expect({verbose: true}, listJsFiles))
    .pipe(concat('all.js'))
    .pipe(gulp.dest(_srcdir + '/dist/'))
    .pipe(browserSync.stream())
})
gulp.task('js_sync', gulpsync.sync(['js_transpiling', 'js_concat']))
gulp.task('js', ['js_hint', 'js_sync'])

// BUILD tasks
gulp.task('dev', ['css','js']) // exec css and js in parallel
gulp.task('prod', ['css','js'], function() {
  gulp.src(listCssFiles)
    //.pipe(sass().on('error', sass.logError))
    .pipe(stylus())
    .pipe(cleanCSS({keepSpecialComments:0}))
    .pipe(concat('all.min.css'))
    .pipe(gulp.dest(_srcdir + '/dist/'))

  gulp.src(listJsFiles)
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(_srcdir + '/dist/'))
})

// WATCH task
gulp.task('watch', function () {
  gulp.watch([
    _srcdir + '/js/*.js',
    '!'+_srcdir+'/js/scripts_es5.js',
    '!'+_srcdir+'/js/*.min.*'
  ], {verbose: true, debounceDelay: 2000}, ['js'])

  gulp.watch([
    _srcdir + '/css/*{.styl, .css}',
    '!'+_srcdir+'/css/*.min.*',
    '!'+_srcdir+'/css/*.map'
  ], ['css'])
})

// LIVERELOAD task
gulp.task('livesync', function() {
  browserSync.init({
    proxy: "127.0.0.1:5000",
    browser: "chromium",
    port: 5001
  })

  gulp.watch(_tpldir + '**/*.html').on('change', browserSync.reload)
})

gulp.task('watchsync', ['watch', 'livesync'])

// DEFAULT task
gulp.task('default', function () {
  console.log(`
    Usable tasks : watchsync, watch, dev, prod, js, css
    Other available tasks : livesync, js_sync, js_concat, js_hint
  `)
})
