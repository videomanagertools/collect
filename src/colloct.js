import fs from 'fs';
import path from 'path';

import getSize from 'get-folder-size';
import rimraf from 'rimraf';
import chalk from 'chalk';

const { log } = console;

const DEFREG = /(.mp4|.rmvb|.avi|.wmv)$/;
const REPLACEREG = /(_|-)(HD|hd|full|all|720P|720p|1080P|1080p)/g;

let root = '';
function readDir(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function collectVideo(targetPath, regex = DEFREG, isRecursive = false) {
  if (!isRecursive) root = targetPath;
  const filePath = path.resolve(targetPath);
  let rmdir = false;
  readDir(filePath).then((files) => {
    files.forEach((file) => {
      const childPath = path.join(filePath, file);
      const stats = fs.statSync(childPath);
      if (stats.isDirectory()) {
        collectVideo(childPath, regex, true);
      }
      if (stats.isFile()) {
        if (regex.test(file)) {
          const name = file.replace(REPLACEREG, '');
          log(chalk.blue(name));
          const collectDirPath = path.join(root, 'Collection');
          if (!fs.existsSync(collectDirPath)) {
            fs.mkdirSync(collectDirPath);
          }
          fs.renameSync(childPath, path.join(root, 'Collection', name));
          if (filePath !== root && !/Collection$/.test(filePath)) {
            //   非根目录下删除文件夹
            rmdir = true;
          }
        }
      }
    });
    if (rmdir) {
      fs.rmdir(filePath, (err) => {
        if (err) {
          getSize(filePath, (error, size) => {
            const M = (size / 1024 / 1024).toFixed(2);
            if (M < 10) {
              rimraf(filePath, () => {
                log(chalk.green('force del dir'));
              });
            }
          });
        } else {
          log(chalk.green('del dir'));
        }
      });
    }
  });
}

export default collectVideo;
