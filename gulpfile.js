const gulp = require('gulp')
const print = require('gulp-print').default
const ts = require('gulp-typescript')
const prettyError = require('gulp-prettyerror')
const merge = require('merge-stream')
const babel = require('gulp-babel')
const del = require('del')
const path = require('path')
const newer = require('gulp-newer')

function clean (cb) {
  process.chdir(__dirname)
  del.sync('dest/server/*')
  cb()
}

function server (cb) {
  process.chdir(path.join(__dirname, 'projects/server'))

  let tsProject = ts.createProject('tsconfig.json')

  return merge(
    gulp.src([
        '**/*',
        '!**/*.ts'
      ], { cwd: 'src'})
      .pipe(newer(path.join(__dirname, 'build/server')))
      .pipe(gulp.dest('build/server', { cwd: __dirname })),

    gulp.src('**/*.ts', { cwd: 'src' })
      .pipe(prettyError())
      .pipe(tsProject())
      .js
      .pipe(babel())
      .pipe(gulp.dest('build/server', { cwd: __dirname }))
  )
}

module.exports = {
  default: gulp.series(clean, server)
}
