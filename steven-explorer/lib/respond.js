//require node modules
const url = require('url');
const path = require('path');
//use console.log() comments for direction!!!

const fs = require('fs');

//file imports
const buildBreadcrumb = require('./breadCrumb.js');
const buildMainContent = require('./mainContent.js');
const getMimeType = require('./getMimeType.js');

//static base path: location of your static folder
const staticBasePath = path.join(__dirname, '..', 'static');
//console.log(staticBasePath + ' :21');

//respond to a request
//The following is the function passed to createServer() used to create the server
//(response() sends data to web page)
const respond = (request, response) => {
//console.log('Respond fired!');

//before working with the pathname, you need to decode it
let pathname = url.parse(request.url, true).pathname;
//console.log(pathname + ' :22');

//void default pathname
if(pathname === '/favicon.ico'){
	return false;
}

//pathname decoded
pathname = decodeURIComponent(pathname);
//console.log(pathname + ' :23');

//get the corresponding full static path located in the static folder
//path.join(staticBasePath, pathname)
const fullStaticPath = path.join(staticBasePath, pathname);
//console.log(fullStaticPath + ' :24');


//See if you can we find request in fulllStaticPath?
//If no: send '404': file not found!
if(!fs.existsSync(fullStaticPath)){
	console.log(` ${fullStaticPath} does not exists`);
	response.write('404: File not found');
	response.end();
	return false;
}
	//If we found a request?
	//Is it a file or directory?
	let stats;
	try{
	stats = fs.lstatSync(fullStaticPath);
	//console.log(stats + ' :25');//returns [object object]
	}catch(err){
		console.log(`lstatSync Error: ${err}`);
	}
	
	

//If it is a directory:
if(stats.isDirectory()){
	//get content from the template index.html
	let data = fs.readFileSync(path.join(staticBasePath, 'project_files/index.html'), 'utf-8');
	          //build the page title
	          //console.log(pathname + ' :26');

	          let pathElements = pathname.split('/').reverse();
	          //console.log(pathElements + ' :27');
	          pathElements = pathElements.filter(element => element !== '');
	          //console.log(pathElements + ' :28');
	         let folderName = pathElements[0];
	         if(folderName === undefined){
	         	folderName = 'Home';
	         }
	         //console.log(folderName + ' :29');
	         
	          //build the breadcrumb( make and import function)
	          const breadcrumb = buildBreadcrumb(pathname);
	          //console.log(breadcrumb + ' :30');
	          
	          //build table rows (make and import function)
              const mainContent = buildMainContent(fullStaticPath, pathname);

	          //(main content)
	          //fill the template data with: the page
	          //title, breadcrumb and table rows
	          //(main content)
	          data = data.replace('page_title', folderName);
              data = data.replace('pathname', breadcrumb);
              data = data.replace('mainContent', mainContent);

	          //print data to the webpage
	    response.statusCode = 200;//print to header      
	    response.write(data);
	    return response.end();     
    
}

	      //it is not a directory but not a file either
	           //send: 401: Access denied!
        if(!stats.isFile()){
          response.statusCode = 401;
          response.write('401: Access denied');
          console.log('not a file!');
          return response.end();	
        }
	      //it is a file
	          //let's get the file extension
	          let fileDetails = {};
	          fileDetails.extname = path.extname(fullStaticPath);
	          //console.log(fileDetails.extname + ' :31');

	          //filesize
               let stat;
               try{
                  stat = fs.statSync(fullStaticPath);
               }catch(err){
                  console.log(`error ${err}`);
               }
               fileDetails.size = stat.size;
               


	          //get the file mime type and
	          // add it to the response header
	          getMimeType(fileDetails.extname)
	          .then(mime => {

	          	//store headers here.
	          	let head = {};
	          	let options = {};

	          	//response status code
	          	let statusCode = 200;

	          	//set content-type header for all file types.
	          	head['Content-Type'] = mime;
	          	
                
              //get the file size and add it to the response header
	          //pdf file? -> display in browser
	          if(fileDetails.extname === '.pdf'){
	          	//Use this head to view pdf in browser
	          	head['Content-Disposition'] = 'inline';
	          	//Use this head to to request download pdf
	          	// head['Content-Disposition'] = 'attachment;filename=file.pdf';
	          }
	          //audio/video file? -> stream in ranges
	          if(RegExp('audio').test(mime) || RegExp('video').test(mime)){
	          	//header
               head['Accept-Ranges'] = 'bytes';
               const range = request.headers.range;
               console.log(`range: ${range}`);
               if(range){
               	const start_end = range.replace(/bytes=/, "").split('-');
               	const start = parseInt(start_end[0]);
               	const end = start_end[1] ? parseInt(start_end[1]) : fileDetails.size - 1;
               	//headers
               	//Content-Range

               
               head['Content-Range'] = `bytes ${start}-${end}/${fileDetails.size}`;
               // Content-Length
               head['Content-Length'] = end - start + 1;
               statusCode = 206;
               
               //options
               options = {start, end};

               }
               // Content-Range
               
	          }
	          //all other files stream in a normal way
	          	
	          
               //streaming method
               const fileStream = fs.createReadStream(fullStaticPath, options);
               //stream chunks to your response object
               response.writeHead(statusCode, head);
               fileStream.pipe(response);
                  //events
                  fileStream.on('close', () => {
                  	return response.end();
                  });
                  fileStream.on('error', error => {
                  	response.statusCode = 404;
                  	response.write('404: FileStream error!');
                  	return response.end();
                  });
	          })//.then on mime
	          .catch(err => {
	          	response.statusCode = 500;
	          	response.write('500: Internal server error');
	          	console.log(`Promise error: ${err}`);
	          	return response.end();
               });
	         
}//respond



module.exports = respond;

//read the file using fs.readFile
//promise method
	          // 	fs.promises.readFile(fullStaticPath, 'utf-8')
	          // 	.then(data => {
           //              response.writeHead(statusCode, head);
	          // 			response.write(data);
	          // 			return response.end();
           //      })
	          // 	.catch(err => {
	          // 		response.statusCode = 404;
          	// 		response.write('404: File reading error!');
          	// 		return response.end();
	          // 	});
	          // })