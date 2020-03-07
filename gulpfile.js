const gulp = require('gulp')
const print = require('gulp-print').default
const ts = require('gulp-typescript')
const prettyError = require('gulp-prettyerror')
const merge = require('merge-stream')
const babel = require('gulp-babel')
const del = require('del')

function clean (cb) {
  del.sync('dest/server/*')
  cb()
}

function server (cb) {
  process.chdir('projects/server')

  let tsProject = ts.createProject('tsconfig.json')

  return merge(
    gulp.src([
        '**/*',
        '!**/*.ts'
      ], { cwd: 'src'})
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
