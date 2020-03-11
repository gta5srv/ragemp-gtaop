const gulp = require('gulp')
const ts = require('gulp-typescript')
const babel = require('gulp-babel')
const del = require('del')
const path = require('path')
const newer = require('gulp-newer')


if (!process.env.PROJECT_ROOT) {
  throw Error("Environmental variable 'PROJECT_ROOT' is required")
}


const PROJECT_ROOT = process.env.PROJECT_ROOT


function clean (cb) {
  del.sync(path.join(PROJECT_ROOT, 'build/server/*'), {
    force: true
  })

  cb()
}


function typeScript () {
  const tsProject = ts.createProject('tsconfig.json')

  return gulp.src('**/*.ts', { cwd: 'src' })
    .pipe(tsProject())
    .js
    .pipe(babel())
    .pipe(gulp.dest('build/server', { cwd: PROJECT_ROOT }))
}


function static () {
  return gulp.src([
      '**/*',
      '!**/*.ts'
    ], { cwd: 'src'})
    .pipe(newer(path.join(PROJECT_ROOT, 'build/server')))
    .pipe(gulp.dest('build/server', { cwd: PROJECT_ROOT }))
}


function watch () {
  gulp.watch('**/*.ts', { cwd: 'src' }, typeScript)
  gulp.watch([
    '**/*',
    '!**/*.ts'
  ], { cwd: 'src' }, typeScript)
}


module.exports = {
  default: gulp.series(clean, gulp.parallel(typeScript, static)),
  watch: gulp.series(watch)
}
