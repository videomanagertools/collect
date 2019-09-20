import {
  readdir, statSync, mkdir, move
} from 'fs-extra';
import path from 'path';
import rimraf from 'rimraf';

const { log } = console;

const DEFREG = /(.mp4|.rmvb|.avi|.wmv)$/;

function collect(filepath) {
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
    rimraf(walkpath, () => {
      console.log('rm==>', walkpath);
    });
    return null;
  };
  return walk(filepath).then(res => _flat(res, Infinity));
}
const rebuild = (dir, files) => Promise.all(
  files.map((file) => {
    const p = `${dir}/${path.basename(file, path.extname(file))}`;
    const mp = () => new Promise((resolve, reject) => {
      mkdir(p)
        .then((r) => {
          resolve(r);
        })
        .catch((e) => {
          resolve(e);
        });
    });
    return Promise.all([mp(), move(file, `${p}/${path.basename(file)}`)]);
  }),
).then(res => dir);
function _flat(arr, depth) {
  return arr.reduce(
    (flat, toFlatten) => flat.concat(Array.isArray(toFlatten) && depth > 1 ? _flat(toFlatten, depth - 1) : toFlatten),
    [],
  );
}

export { collect, rebuild };
