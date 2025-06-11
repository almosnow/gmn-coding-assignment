import { AFB_x_AS_x_OPT } from './util.js';

function main() {
  // Read command line argument
  const argv2 = process.argv[2];
  if(!argv2) {
    console.error('Enter a number n as a command line argument.');

    process.exit(1);
  }

  // Make command line argument is valid
  const n = Number(argv2);
  if(!Number.isInteger(n) || n < 1) {
    console.error('n must be a positive integer (> 0).');

    process.exit(1);
  }

  /*
    Fill in the shuffled array
    See README for an explanation on why `AFB_x_AS_x_OPT` was
    the best performing function for this.
  */
  const a = AFB_x_AS_x_OPT(n)();

  // Write to STDOUT
  for(let i=0;i<a.length;++i) {
    if(i > 0)
      process.stdout.write(',');
    
    process.stdout.write(a[i].toString());
  }

  process.stdout.write('\n');
};

main();
