import {
  readdir, statSync, mkdir, move
} from 'fs-extra';
import path from 'path';
import rimraf from 'rimraf';

const { log } = console;

const DEFREG = /(.mp4|.rmvb|.avi|.wmv)$/;

function collect(
  filepath,
  opt = {
    clear: true,
    whitelist: ['.actor'],
  },
) {
  const { clear, whitelist } = opt;
  const walk = async (walkpath) => {
    const walkRes = await readdir(walkpath).then(files => Promise.all(
      files.map((file) => {
        if (statSync(path.join(walkpath, file)).isDirectory()) {
          return walk(path.join(walkpath, file));
        }
        if (DEFREG.test(file)) {
          return path.resolve(walkpath, file);
        }
        return null;
      }),
    ),);
    if (walkRes.some(v => !!v)) {
      return walkRes.filter(v => v);
    }
    if (clear && !whitelist.some(v => walkpath.indexOf(v) !== -1)) {
      rimraf(walkpath, () => {
        log('rm==>', walkpath);
      });
    }
    return null;
  };
  return walk(filepath).then(res => flat(res, Infinity));
}
const rebuild = (dir, files) => Promise.all(
  files.map((file) => {
    const p = `${dir}/${path.basename(file, path.extname(file))}`;
    const mp = () => new Promise((resolve) => {
      mkdir(p)
        .then((r) => {
          resolve(r);
        })
        .catch((e) => {
          resolve(e);
        });
    });
    const p2 = () => (file === `${p}/${path.basename(file)}` ? Promise.resolve() : move(file, `${p}/${path.basename(file)}`));
    return Promise.all([mp(), p2()]);
  }),
).then(() => dir);
function flat(arr, depth) {
  return arr.reduce((acc, toFlatten) => acc.concat(Array.isArray(toFlatten) && depth > 1 ? flat(toFlatten, depth - 1) : toFlatten), []);
}

export { collect, rebuild };
