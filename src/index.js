#!/usr/bin/env node

import CRD from './method';

// const argv = process.argv.slice(2);
const cwd = process.cwd();

CRD(cwd);
