//require node modules
const fs = require('fs');
const path = require('path');

//require files
const calculateSizeD = require('./calculateSizeD.js');
const calculateSizeF = require('./calculateSizeF.js');


const buildMainContent = (fullStaticPath, pathname) => {
	let mainContent = '';
	let items;
	//loop through elements inside of folder
	//name and link
	try{
		items = fs.readdirSync(fullStaticPath);
      console.log(items);
	}catch(err){
      console.log(`readdirSync error: ${err}`);
       return `<div class="alert alert-danger">Internal Server Error 21</div>`;
  };
       
	//remove .DS_Store
  items = items.filter(element => element !== '.DS_Store');
	
//Home directory, remove project_files
if(pathname === '/'){
  items = items.filter(element => element !== 'project_files');
}


	//get the following elements for each item
	items.forEach(item => {
         //store item details in object
         let itemDetails = {};
         //name
         itemDetails.name = item;
	
        //link
     const link = path.join(pathname, item);
         
       
         //get stats of the item
         const itemFullStaticPath = path.join(fullStaticPath, item);
         
         try{
             itemDetails.stats = fs.statSync(itemFullStaticPath)
         }catch(err){
         	//console.log(`statSync error: ${err}`)
         	mainContent = `<div class="alert alert-danger">Internal Server Error 22!!!</div>`;
         	    return false;
         }
           //icon
         if(itemDetails.stats.isDirectory()){
              itemDetails.icon = `<ion-icon name="folder"></ion-icon> `;
              [itemDetails.size, itemDetails.sizeBytes] = calculateSizeD(itemFullStaticPath);
         }else if(itemDetails.stats.isFile()){
              itemDetails.icon = `<ion-icon name="document"></ion-icon>`;
              [itemDetails.size, itemDetails.sizeBytes] =
              calculateSizeF(itemDetails.stats);
         }
         //console.log(stats);
        //when was the file last modified? (unix timestamp);
        itemDetails.timeStamp = parseInt(itemDetails.stats.mtimeMs);

        //convert timestamp to a date
        itemDetails.date = new Date(itemDetails.timeStamp).toLocaleString();
        //console.log(itemDetails.date); 



         mainContent += `<tr data-name="${itemDetails.name}" data-size="${itemDetails.sizeBytes}" data-time="${itemDetails.timeStamp}">
       <td>${itemDetails.icon}&nbsp;<a href="${link}" target='${itemDetails.stats.isFile() ? "_blank" : ""}'>${item}</a></td>
       <td>${itemDetails.size}</td>
       <td>${itemDetails.date}</td>
    </tr>`;

	});
	    //name
	    //icon
	    //size
	    //last modified
   
    return mainContent;
};


module.exports = buildMainContent;


 