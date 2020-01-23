const gulp = require('gulp')
const glob = require('glob')
const print = require('gulp-print').default
const path = require('path')
const rename = require('gulp-rename')
const prettyError = require('gulp-prettyerror')
// const source = require('vinyl-source-stream')
// const buffer = require('vinyl-buffer')
// const browserify = require('browserify');
// const babelify = require('babelify')
const merge = require('merge-stream')
const sourceMaps = require('gulp-sourcemaps')
const babel = require('gulp-babel')

const js = (cb) => {
  let streams = []

  const inputDir = 'src/gta-op'
  const outputDir = 'packages/gta-op'
  //
  // streams.push(
    gulp.src('**/*.js', { cwd: inputDir })
    .pipe(prettyError())
    .pipe(sourceMaps.init())
    .pipe(print())
    .pipe(babel())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest(outputDir))
  // )

  // streams.push(
    gulp.src([
        '**/*',
        '!**/*.js'
      ], {
        cwd: inputDir,
        nodir: true
      })
      .pipe(prettyError())
      .pipe(print())
      .pipe(gulp.dest(outputDir))

  cb()
  // )
  //
  // merge.apply(null, streams).on('finish', () => {
  //   console.log('finish')
  //   cb()
  // })
}
module.exports = {
  js,
  default: gulp.parallel(js)
}
