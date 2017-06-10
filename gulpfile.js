var gulp = require('gulp');
var electron = require('electron');
var childProcess = require('child_process');

gulp.task('default', function () {
  childProcess.spawn(electron, ['.'], { stdio: 'inherit' });
});

gulp.task('buildClient', function () {
  // childProcess.exec('cd client && npm run build && cd .. &&cp -a ./client/dist ./view')
  // cd client && npm run build && cd .. &&cp -a ./client/dist ./view
  //   childProcess.spawn(electron, ['.'], {stdio: 'inherit'});

  // 将你的默认的任务代码放在这
//    gulp.watch(['./app/dist/**/*.{html,js,css}'], electron.reload);

});