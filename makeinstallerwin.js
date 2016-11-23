var electronInstaller = require('electron-winstaller');
var path = require('path');

var iconpath = path.join('C:','Users','daniel.zehe','Documents','rsvp-app','Icon_windows.ico');
// var gifpath = path.join('C:','Users','daniel.zehe','Documents','SEMSim_Cloud_App','src','assets','img','Logo_gif.gif');
console.log(iconpath);

var resultPromise = electronInstaller.createWindowsInstaller({
	appDirectory:'Wedding App-win32-x64',
	ouputDirectory:'.',
	authors:'Daniel',
	exe:'Wedding App.exe',
	description:"Install Daniel and Xiu Fen's Wedding App",
	setupExe:"Wedding App Setup.exe",
	iconUrl:iconpath,
	setupIcon:iconpath,
	noMsi:true
});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
