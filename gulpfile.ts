import { task, series, src, dest } from 'gulp';
import del from 'del';

const releaseDir = '../web-client/release/web_server';


function cleanServer() {
  return del([
    `${releaseDir}/**`,
    `!${releaseDir}`,
  ], { force: true });
}

function copyFiles() {
  return src([
    './**/*.js',
    './**/*.key',
    './**/*.pem',
    './package.json',
    './package-lock.json',
    './config.json',
    './run.sh',
    '!./node_modules/**',
    '!test.js',
  ])
  .pipe(dest(releaseDir));
}


task('release', series(
  cleanServer,
  copyFiles
));



