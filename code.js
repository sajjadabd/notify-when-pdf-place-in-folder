const notifier = require('node-notifier');
let alert = require('alert');
const child_process = require('child_process');

const path = require('path');

const fs = require('fs');
const readline = require('readline');
//const readdir = require('node:fs/promises');
const varedi_path = 'P:\واردی' ;






/*
const files = fs.readFileSync(varedi_path);
for (const file of files) {
	console.log(file);
}
*/

/*
notifier.notify({
  'app-name': 'چهار امضا',
  title: 'چهار امضا در پوشه قرار داده شد',
  message: 'لطفاً جهت جمع آوری امضا اقدام کنید' ,
  icon: __dirname + '/icon.jpg',
  label : 'چهار امضا' ,
  wait : true ,
});


notifier.on('click', function (notifierObject, options, event) {
  //console.log('you clicked...');
  child_process.exec('start "" ' + varedi_path + '');
});
*/

let title = '';
let stats = '' ;
let found_today = false;




// https://bobbyhadz.com/blog/javascript-convert-milliseconds-to-date
// https://bobbyhadz.com/blog/javascript-convert-milliseconds-to-hours-minutes-seconds
// https://stackoverflow.com/questions/4681067/how-do-i-run-a-node-js-application-as-its-own-process/28542093#28542093
// https://flaviocopes.com/how-to-check-if-file-exists-node/

const d = Date.now();
let today = new Date(d);
//console.log('today date ' , today.toLocaleString('sv').split(' '));


var lastMidnight = new Date();
lastMidnight.setHours(0,0,0,0); // last midnight
lastMidnight = lastMidnight.toLocaleString('sv');
//console.log('lastMidnight' , lastMidnight);

let today_date = lastMidnight.split(' ');
//console.log('midnight ' , today_date);


let fileName = `${today_date[0].replace(',','').split('/').join('-')}.txt`;




let date = '' ;
let file_exists = false;

console.log(path.join(__dirname , fileName));

setInterval( () => {
	if (fs.existsSync(path.join(__dirname , fileName))) {
		
	  file_exists = true;
	  console.log('file exists'); // means today pdf is put in public
	  fs.readFile(path.join(__dirname, fileName) , {encoding: 'utf-8'},  (err, data) => {
		  //console.log(data);
		  checkForFileInPublic(data);
	  });
	  //let data = fs.readFileSync(fileName, 'utf8');
	  //console.log(data);
	} else {
	  file_exists = false;
	  console.log('file not exists'); // means today pdf isn't in public yet
	  
	  
	  
	  checkForFileInPublic();
	}
} , 1000 * 30  ); // * 60 * 1



let exitProcess = () => {
	setTimeout( () => {
		process.exit(0);
	} , 2000 );
}


let showNotification = () => {
	notifier.notify({
	  'app-name': 'چهار امضا',
	  title: 'چهار امضا در پوشه قرار داده شد',
	  message: 'لطفاً جهت جمع آوری امضا اقدام کنید' ,
	  icon: path.join(__dirname , 'images/icon.jpg'),
	  label : 'چهار امضا' ,
	  wait : true ,
	  timeout: 5,
	});


	notifier.on('click', function (notifierObject, options, event) {
	  //console.log('you clicked...');
	  child_process.exec('start "" ' + varedi_path + '');
	  //exitProcess();		
	});


	notifier.on('timeout', function (notifierObject, options) {
	  // Triggers if `wait: true` and notification closes
	  child_process.exec('start "" ' + varedi_path + '');
	  //exitProcess();
	});
}




let createTxtFileWithTodayDate = (time) => {
	fs.writeFile( fileName, `${time}`, function (err) {
	  if (err) throw err;
	  console.log('File Created!');
    });
}



let createTxtFileWithAllFileNames = (files) => {
	//console.log(files);
	fs.writeFile( 'files.txt', '', function (err) {
	  if (err) throw err;
	  for(let i=0;i<files.length;i++) {
		  if( i < files.length-1 ) {
			  fs.appendFile('files.txt', files[i].fileName + "\r\n", function (err) {
				if (err) throw err;
			  });
		  } else {
			  fs.appendFile('files.txt', files[i].fileName, function (err) {
				if (err) throw err;
			  });
		  }
	  }
    });
}


let filesInTxt = []


let processLineByLine = async () => {
  const fileStream = fs.createReadStream('files.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    filesInTxt.push(line);
  }
  
  
}

processLineByLine();




let checkAllOcurrenceWithFilesNames = () => {
	
	if( allOcurrence.length != filesInTxt.length ) {
			return false;
	}
	
	for( let i=0;i<allOcurrence.length;i++ ) {
		if (  allOcurrence[i].fileName != filesInTxt[i] ) {
			return false;
		}
	}
	
	return true;
}




let deleteAllTxtFileExceptWithTodayDate = () => {
	fs.readdir( __dirname , (err, files) => {
	  if (err) {
		throw err
	  }
	  
	  
	  files.forEach( file => {
	    if(path.extname(file) == '.txt' && file != fileName) {
			fs.unlink( path.join(__dirname , file) , () => {} )
			console.log(file);
		} else {
			console.log(path.extname(file));
		}
	  })
	})
}



let timeOfLatestFile ;
let theMostRecentFile;
let allOcurrence = [];


let returnTheMostRecentFile = () => {
	let theMostRecentFile;
	for(let i=0;i<allOcurrence.length;i++) {
		if(i == 0) {
			theMostRecentFile = allOcurrence[i] ;
		} else {
			if( Date.parse(allOcurrence[i].date) > Date.parse(theMostRecentFile.date) ) {
				theMostRecentFile = allOcurrence[i] ;
			}
		}
	}
	return theMostRecentFile ;
}


let checkForFileInPublic = async ( time = undefined ) => {
	
	allOcurrence = [];
	
	await fs.readdir( varedi_path , async (err, files) => {
	  if (err) {
		throw err
	  }
	  // files object contains all files names
	  // log them on console
	  await files.forEach( file => {   
		  if ( file.includes('چهار') || file.includes('امضا')  || file.includes('روزانه') ) {
				//console.log(file);
				title = file;
				stats = fs.statSync( path.join(varedi_path , file) ) ;
				date = new Date(stats.birthtimeMs);
				date = date.toLocaleString('sv');
				//console.log(stats);
				//console.log('birthtimeMs : ' , date.toLocaleTimeString('en-US'));
				//console.log('file date' , date.toLocaleString('sv').split(' '));
				allOcurrence.push({
					fileName : file ,
					date
				})
				//console.log('ctimeMs : ' , new Date(stats.ctimeMs).toLocaleTimeString('en-US'));
				//console.log('mtimeMs : ' , new Date(stats.mtimeMs).toLocaleTimeString('en-US'));
				//console.log('atimeMs : ' , new Date(stats.atimeMs).toLocaleTimeString('en-US'));

		  }
	  })
	  
	  createTxtFileWithAllFileNames(allOcurrence);
	  theMostRecentFile = returnTheMostRecentFile();	
	  
	  
	  
	  //console.log(allOcurrence);
	  //console.log(filesInTxt);
	  
	  //console.log(theMostRecentFile);
	  
	  
	  if(theMostRecentFile != undefined) {
		  date = theMostRecentFile.date;
	  }
	  
	  
	  
	  if( file_exists == true && time != undefined ) {
		if( Date.parse(date) > Date.parse(time) ) {
			//console.log('time of file in notepad : ' , time);
			//console.log('latest file : ' , date);
			showNotification();
			alert('چهار امضا در پوشه قرار داده شد');
			createTxtFileWithTodayDate(date.toLocaleString('sv'));
		}
	  } else if( file_exists == false ) {
		  
		  //console.log('here...');
		  //timeOfLatestFile = date.toLocaleString('sv').split(' ')[1];
		  //console.log(date , Date.parse(date));
		  //console.log(lastMidnight , Date.parse(lastMidnight));
		  if( Date.parse(date) > Date.parse(lastMidnight) ) {
			  //console.log(date , '>' , lastMidnight);
			  showNotification();
			  alert('چهار امضا در پوشه قرار داده شد');
			  // create file with today date name means that the pdf file was exist
			  createTxtFileWithTodayDate(date.toLocaleString('sv'));
		  } else {
			  // console.log('here...');
			  let equalFiles = checkAllOcurrenceWithFilesNames();
			  if( equalFiles == false ) {
				  if( allOcurrence.length > filesInTxt.length ) {
					  showNotification();
					  alert('چهار امضا در پوشه قرار داده شد');
					  createTxtFileWithTodayDate(lastMidnight.toLocaleString('sv'));
				  }
			  }
		  }
	  }

	})

	
}


