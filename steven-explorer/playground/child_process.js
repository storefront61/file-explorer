
const {execSync} = require('child_process');
    
try{
	const result =
    execSync(`du -sh "/home/steven/Desktop/html/node/fileExplorer"`).toString();
    //console.log(result);
}catch(err){
	console.log(`Error ${err}`)
}



// /home/steven/Desktop/html/node/fileExplorer