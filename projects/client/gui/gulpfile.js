// General
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')

// Gulp
const gulp = require('gulp')
const gulpif = require('gulp-if')
const rename = require('gulp-rename')
const print = require('gulp-print')
const prettyError = require('gulp-prettyerror')
const sourceMaps = require('gulp-sourcemaps')
const del = require('del')
const stripDebug = require('gulp-strip-debug')
const newer = require('gulp-newer')
const sass = require('gulp-sass')
const browserify = require('browserify');
const babelify = require('babelify')
const csso = require('gulp-csso')
const htmlmin = require('gulp-htmlmin')
const uglify = require('gulp-uglify')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

function clear (cb) {
  del.sync('**/*', { cwd: 'build' })
  cb()
}

function scripts () {
  const ENTRY_FILE = 'index.js'

  return browserify(ENTRY_FILE, {
      basedir: 'src/js',
      debug: true,
      paths: [ './node_modules', './src/js/' ]
    })
    .transform(babelify, {
        sourceMaps: true
    })
    .bundle()
    .pipe(prettyError())
    .pipe(source(ENTRY_FILE))
    .pipe(buffer())
    .pipe(gulpif(!IS_PRODUCTION, sourceMaps.init({ loadMaps: true })))
    .pipe(gulpif(IS_PRODUCTION, uglify()))
    .pipe(gulpif(IS_PRODUCTION, stripDebug()))
    .pipe(rename(path => {
      path.dirname = ''
      path.extname = '.bundle.js'
    }))
    .pipe(gulpif(!IS_PRODUCTION, sourceMaps.write('./')))
    .pipe(gulp.dest('assets/js', { cwd: 'build' }))
}

function styles () {
  return gulp.src('scss/**/*.scss', {
      cwd: 'src',
      nodir: true
    })
    .pipe(prettyError())
    .pipe(gulpif(!IS_PRODUCTION, sourceMaps.init()))
    .pipe(sass())
    .pipe(gulpif(IS_PRODUCTION, csso()))
    .pipe(gulpif(!IS_PRODUCTION, sourceMaps.write('.')))
    .pipe(gulp.dest('assets/css', { cwd: 'build' }))
}

function html () {
  return gulp.src('static/**/*.html', {
      cwd: 'src',
      nodir: true
    })
    .pipe(prettyError())
    .pipe(gulpif(IS_PRODUCTION, htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest('.', { cwd: 'build' }))
}

function static () {
  return gulp.src([
      'static/**/*',
      '!static/**/*.html'
    ], {
      cwd: 'src',
      nodir: true,
      dot: true
    })
    .pipe(newer('build'))
    .pipe(prettyError())
    .pipe(gulp.dest('.', { cwd: 'build' }))
}

function watch () {
  gulp.watch('scss/**/*.scss', { cwd: 'src' }, styles)
  gulp.watch('js/**/*.js', { cwd: 'src' }, scripts)
  gulp.watch([
    'static/**/*',
    '!static/**/*.html'
  ], { cwd: 'src' }, static)
  gulp.watch('static/**/*.html', { cwd: 'src' }, static)
}

module.exports = {
  clear: clear,
  watch: watch,
  default: gulp.series(clear, gulp.parallel(
    scripts,
    styles,
    html,
    static
  ))
}
