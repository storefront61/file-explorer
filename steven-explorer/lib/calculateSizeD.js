//require node modules
const {execSync} = require('child_process');

const calculateSizeD = itemFullStaticPath => {

const itemFullStaticPathCleaned = itemFullStaticPath.replace(/\s/g, '\ ');


const commandOutput =
   execSync(`du -sh "${itemFullStaticPathCleaned}"`).toString();
    
 //console.log(commandOutput);

//remove all spaces, tabs, etc
let filesize = commandOutput.replace(/\s/g, '');

//split filesize using the '/' seperator
filesize = filesize.split('/');

//human size is the first item of the array
filesize = filesize[0];
//console.log(filesize);


//unit
const filesizeUnit = filesize.replace(/\d|\./g, '');
//console.log(`${filesizeUnit} unit`);

//size number
const filesizeNumber = parseFloat(filesize.replace(/[a-z]/i, ''));
 //console.log(filesizeNumber);
 
const units = "BKMGT";
// B 10B -> 10 bytes
//K 10K -> 10*1024 bytes
//M 10M -> 10*1024*1024 bytes
//G 10G -> 10*1024*1024*1024 bytes
//T 10T -> 10*1024*1024*1024*1024 bytes
const filesizeBytes = filesizeNumber * Math.pow(1024, units.indexOf(filesizeUnit));

//console.log(filesizeBytes);

  return [filesize, filesizeBytes];
};


module.exports = calculateSizeD;