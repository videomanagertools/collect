import { collect, rebuild } from './colloct';

export default function CRD(filepath, opt) {
  return collect(filepath, opt).then(files => rebuild(filepath, files).then(res => collect(res)));
}
export { collect, rebuild } from './colloct';
