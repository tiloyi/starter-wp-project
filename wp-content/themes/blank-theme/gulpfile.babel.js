import { src, dest, watch, series, parallel } from "gulp";

// import twig from "gulp-twig";
import gulpif from "gulp-if";
import yargs from "yargs";
import sourcemaps from "gulp-sourcemaps";
import sass from "gulp-sass";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import pxtorem from "postcss-pxtorem";
import cleanCSS from "gulp-clean-css";
import imagemin from "gulp-imagemin";
import del from "del";
import webpack from "webpack-stream";
import named from "vinyl-named";
import browserSync from "browser-sync";

const PRODUCTION = yargs.argv.prod;
const OUTPUT_FOLDER = "dist";
const LOCAL_URL = "http://www.wp-blanktheme.local/";

export const styles = () => {
  return src("src/scss/*.scss")
    .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
    .pipe(sass().on("error", sass.logError))
    .pipe(
      gulpif(
        PRODUCTION,
        postcss([
          autoprefixer(),
          pxtorem({
            propList: [
              "background-size",
              "border-radius",
              "font-size",
              "*height",
              "margin*",
              "padding*",
              "top",
              "*width",
            ],
          }),
        ]),
      ),
    )
    .pipe(gulpif(PRODUCTION, cleanCSS({ compatibility: "ie8" })))
    .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
    .pipe(dest(`${OUTPUT_FOLDER}/css`))
    // .pipe(server.stream());
};

export const images = () => {
  return src("src/images/**/*.{jpg,jpeg,png,svg,gif}")
    .pipe(gulpif(PRODUCTION, imagemin()))
    .pipe(dest(`${OUTPUT_FOLDER}/images`));
};

export const scripts = () => {
  return src("src/js/*.js")
    .pipe(named())
    .pipe(
      webpack({
        module: {
          rules: [
            {
              test: /\.js$/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: [],
                },
              },
            },
          ],
        },
        mode: PRODUCTION ? "production" : "development",
        devtool: !PRODUCTION ? "inline-source-map" : false,
        output: {
          filename: "[name].js",
        },
        externals: {
          jquery: "jQuery",
        },
      }),
    )
    .pipe(dest(`${OUTPUT_FOLDER}/js`));
};

export const copy = () => {
  return src([
    "src/**/*",
    "!src/{images,js,scss,favicon}",
    "!src/{images,js,scss,favicon}/**/*",
    "src/favicon/**/*",
  ]).pipe(dest(`${OUTPUT_FOLDER}`));
};

export const clean = () => {
  return del([`${OUTPUT_FOLDER}`]);
};

// BrowserSync
const server = browserSync.create();
export const serve = (done) => {
  server.init({
    proxy: `${LOCAL_URL}`, // put your local website link here
  });
  done();
};

export const reload = (done) => {
  server.reload();
  done();
};

// WATCH
export const watchForChanges = () => {
  watch("src/scss/**/*.scss", series(styles, reload));
  watch("src/images/**/*.{jpg,jpeg,png,svg,gif}", series(images, reload));
  watch("src/js/**/*.js", series(scripts, reload));
  watch(
    [
      "src/**/*",
      "!src/{images,js,scss,favicon}",
      "!src/{images,js,scss,favicon}/**/*",
      "src/favicon/**/*",
    ],
    series(copy, reload),
  );
  watch("**/*.php", reload);
};

// Main tasks
export const compile = series(clean, parallel(styles, images, copy, scripts));

export const dev = series(
  clean,
  parallel(styles, images, copy, scripts),
  serve,
  watchForChanges,
);

export const build = series(clean, parallel(styles, images, copy, scripts));

export default dev;
