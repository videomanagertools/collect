import { collect, rebuild } from './colloct';

export default function CRD(filepath) {
  return collect(filepath).then(files => rebuild(filepath, files).then(res => collect(res)));
}
export { collect, rebuild } from './colloct';
