const { task, series, parallel, src, dest, watch } = require('gulp')

const sass = require('gulp-sass')(require('sass'))
const browserSync = require('browser-sync').create()
const cssnano = require('cssnano')
const rename = require('gulp-rename')
const postcss = require('gulp-postcss')
const csscomb = require('gulp-csscomb')
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker')
const sortCSSmq = require('sort-css-media-queries')
const dc = require('postcss-discard-comments')

const PATH = {
  scssRoot: './assets/scss/style.scss',
  scssFiles: ['./assets/scss/**/*.scss', '!**/_media.scss'],
  scssFolder: './assets/scss',
  htmlFiles: './*.html',
  jsFiles: './assets/js/**/*.js',
  cssRoot: './assets/css',
}

const PLUGINS = [
  dc({ discardComments: true }),
  autoprefixer({
    overrideBrowserslist: ['last 5 versions', '> 1%', 'ie 11']
  }),
  mqpacker({ sort: sortCSSmq })
]

function scss() {
  return src(PATH.scssRoot)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(dest(PATH.cssRoot))
    .pipe(browserSync.stream())
}


function scssMin() {
  const pluginsForMinify = [...PLUGINS, cssnano({ preset: 'default' })]

  return src(PATH.scssRoot)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(pluginsForMinify))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.cssRoot))
}

function scssDev() {
  const pluginsForDevMode = [...PLUGINS]
  pluginsForDevMode.splice(1, 1)

  return src(PATH.scssRoot, { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(pluginsForDevMode))
    .pipe(dest(PATH.cssRoot, { sourcemaps: true }))
    .pipe(browserSync.stream())
}

function comb() {
  return src(PATH.scssFiles)
    .pipe(csscomb('.csscomb.json'))
    .pipe(dest(PATH.scssFolder))
}

function syncInit() {
  browserSync.init({
    server: {
      baseDir: './',
    },
  })
}
function syncReload() {
  browserSync.reload()
}

function watchFiles() {
  syncInit()
  watch(PATH.scssFiles, scss)
  watch(PATH.htmlFiles, syncReload)
  watch(PATH.jsFiles, syncReload)
}


function watchDevFiles() {
  syncInit()
  watch(PATH.scssFiles, scssDev)
  watch(PATH.htmlFiles, syncReload)
  watch(PATH.jsFiles, syncReload)
}


task('comb', series(comb, scss, scssMin))
task('scss', series(comb, scss, scssMin))
task('dev', scssDev)
task('watch', watchFiles)
task('watchDev', watchDevFiles)


