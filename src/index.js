import colloct from './colloct';

const argv = process.argv.slice(2);
const cwd = process.cwd();

colloct(argv || cwd);
