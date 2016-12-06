const {app, BrowserWindow,ipcMain,dialog} = require('electron')
const request = require('request')
const fs = require('fs')
var fixPath = require('fix-path');
fixPath();
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

let guests = [];
let invitations = [];

let api_endpoint = 'https://daniel:zehe@rsvp.danielwithsilver.com/API'
// let api_endpoint = 'http://daniel:zehe@localhost:3000/API'


if(handleSquirrelEvent()){
  return;
}
function handleSquirrelEvent() {
  if (process.argv.length === 1 || process.platform !== 'win32') {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};


function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600,'accept-first-mouse':true,'titleBarStyle':'hidden'})

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/HTML/main.html`)

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

let exportProgressSet = new Set();
let exportQueue = [];
exports.saveAllInvitationPackages = () =>{
  let counter = 0
    const folderpath = dialog.showOpenDialog({buttonLabel:'Use folder',properties:['openDirectory'],title:'select a folder to output the invitations'});
  for(let invite of invitations){
    // this.saveInvitationPackageWithFolderName(invite.inviteID,folderpath);

    exportQueue.push({id:invite.inviteID,fp:folderpath});

    console.log(counter++ + "of " + invitations.length + "-" +invite.invitationName);
  }
  scheduleNext();
}


const scheduleNext = () =>{
  console.log('progress set is '+exportProgressSet.size);
  win.webContents.send('progressUpdate',((invitations.length-exportQueue.length))/invitations.length);
  while(exportProgressSet.size<4){
    if(exportQueue.length!=0){
      let nextobject = exportQueue.pop();
      console.log("doing "+ JSON.stringify(nextobject));

      this.saveInvitationPackageWithFolderName(nextobject.id,nextobject.fp);
    }
    else{
      console.log("no more obects in queue");
      break;
    }
  }
  console.log("broke from while");
}

exports.saveInvitationPackage = (inviteID) =>{
    const folderpath = dialog.showOpenDialog({buttonLabel:'Use folder',properties:['openDirectory'],title:'select a folder to output the invitations'});
    this.saveInvitationPackageWithFolderName(inviteID,folderpath);
}

exports.saveInvitationPackageWithFolderName = (inviteID,folderpath) =>{
  console.log("Generate Package for "+ inviteID);
  let Invitation = this.getInvitation(inviteID);
  // assigning the GuestObjects for this invitation
  let invitationGuests = [];
  for(let guestID of Invitation.guests){
    invitationGuests.push(this.getGuest(guestID));
  }

  //creating a set of Events to attend to
  let invitationSet = new Set();
  for(let guest of invitationGuests){
    for(let attend of guest.invitedto){
      invitationSet.add(attend);
    }
  }


  //getting the ouput folder


  
  if(invitationSet.has("DE")){
    if(Invitation.lang.indexOf('de')!=-1){
      cardRenderer(Invitation,folderpath[0],'DE_de',invitationSet.has("SG"));
      cardRenderer(Invitation,folderpath[0],'Info_de');
      // renderInvitation_DE_DE();
    }
    else{
      cardRenderer(Invitation,folderpath[0],'DE_en',invitationSet.has("SG"));


      cardRenderer(Invitation,folderpath[0],'Info_en');
      // renderInvitation_DE_EN(); 
    }
    
  }
  if(invitationSet.has("SG")){

    if(Invitation.lang.indexOf('de')!=-1){
      cardRenderer(Invitation,folderpath[0],'SG_de',false);
      // renderInvitation_SG_DE();
      cardRenderer(Invitation,folderpath[0],'Info_de');
    }
    else{
      cardRenderer(Invitation,folderpath[0],'SG_en',false);
      cardRenderer(Invitation,folderpath[0],'RSVP_en');
      // renderInvitation_SG_EN();
    }
  }
  if(invitationSet.has("SGS")){
    if(Invitation.lang.indexOf('de')!=-1){
      cardRenderer(Invitation,folderpath[0],'SGS_de');
      // renderSolemnization_DE();
    }
    else{
      cardRenderer(Invitation,folderpath[0],'SGS_en');
      // renderSolemnization_EN();
    }
  }


  // if(Invitation.lang.indexOf('de')!=-1){
  //     cardRenderer(Invitation,folderpath[0],'Info_de');
    
  // }
  // else {
  //     cardRenderer(Invitation,folderpath[0],'RSVP_en');
    
  // }

}

const cardRenderer = (invitation,folderpath,type,withborder) =>{
  console.log("open renderer "+ type);
  exportProgressSet.add(invitation.inviteID+'_'+type);
  // console.log(exportProgressSet.size)
  let cardRendererWindow = new BrowserWindow({width:1053,height:1053,frame:false,show: false});
  // cardRendererWindow.webContents.openDevTools();
  cardRendererWindow.loadURL(`file://${__dirname}/HTML/showSVGInvitationWindow.html`)
  cardRendererWindow.on('closed',()=>{
    cardRendererWindow = null;
  })

  cardRendererWindow.webContents.once('did-finish-load',()=>{
    console.log("sending info");
    cardRendererWindow.webContents.send('InvitationData',{"invitation":invitation,"folderpath":folderpath,"type":type,"border":withborder}); 
        
  });
}



exports.getInvitation =(inviteID) =>{
  let returnInvitation = invitations.find((invite) =>{
    return invite.inviteID == inviteID;
  });
  return returnInvitation;
}


exports.getGuest = (personID) =>{

  let returnguest =guests.find((guest)=>{
    return guest.personID == personID
  });
  // console.log(returnguest);
  return returnguest;
}

exports.getInvitationForGuest = (personID) =>{
  // console.log(personID);
  let returnInvitation = invitations.find((invite)=>{
    let returnvalue=false;
    for(let guest of invite.guests){
      if (guest==personID){
        // console.log(guest);
        return true;
      }
    }
    return returnvalue;
  });
  // console.log(returnInvitation);
  return returnInvitation;
}

exports.getInvitations = () =>{
  getInvitationList()
}
exports.getGuests = () =>{
  getGuestList()
 
}
exports.openAddGuestWindow = () =>{
  let addGuestWindow = new BrowserWindow({width:300,height:700,titleBarStyle:'hidden','accept-first-mouse':true});
  addGuestWindow.loadURL(`file://${__dirname}/HTML/addGuestWindow.html`)
  addGuestWindow.on('closed',() =>{
    addGuestWindow= null;
  })
}
exports.openEditGuestWindow = function(personID) {
  let editGuestWindow = new BrowserWindow({width:300,height:700,titleBarStyle:'hidden'});
  editGuestWindow.loadURL(`file://${__dirname}/HTML/editGuestWindow.html`)
  editGuestWindow.on('closed',()=>{
    editGuestWindow = null
  });
  editGuestWindow.webContents.once('did-finish-load',()=>{
    getGuestInfo(personID,(guest)=>{
      editGuestWindow.webContents.send('GuestData',guest); 
    })
       
   })
}
exports.addGuest = (guest) =>{
  console.log(guest);

  request.put({url:api_endpoint+ '/guest',body:guest,json:true},function(err,httpresponse,body){
    console.log([err,httpresponse]);
    if(!err && httpresponse.statusCode == 200){
      console.log('added');

    }
  })
}

exports.openAddInvitationWindow = () =>{
    let addInvitationWindow = new BrowserWindow({width:300,height:700,titleBarStyle:'hidden','accept-first-mouse':true});
  addInvitationWindow.loadURL(`file://${__dirname}/HTML/addInvitationWindow.html`)
  addInvitationWindow.on('closed',() =>{
    addInvitationWindow= null;
  })
}

exports.openEditInvitationWindow = function(inviteID){
  let editInvitationWindow = new BrowserWindow({width:300,height:700,titleBarStyle:'hidden'});
  editInvitationWindow.loadURL(`file://${__dirname}/HTML/editInvitationWindow.html`)
  editInvitationWindow.on('closed',()=>{
    editInvitationWindow = null
  });

  editInvitationWindow.webContents.once('did-finish-load',()=>{
      request.get(api_endpoint+'/invitation/inviteID/b58/'+inviteID,function(err,res,body){
        if(!err && res.statusCode == 200){
          editInvitationWindow.webContents.send('InvitationData',JSON.parse(body));  
        }
    });
   })
}

exports.openRSVPInvitationWindow = (inviteID)=>{
  let rsvpInvitationWindow = new BrowserWindow({height:300,width:400, titleBarStyle:'hidden','accept-first-mouse':true});
  rsvpInvitationWindow.loadURL(`file://${__dirname}/HTML/rsvpInvitationWindow.html`)
  rsvpInvitationWindow.on('closed',()=>{
    rsvpInvitationWindow=null;
  })

  rsvpInvitationWindow.webContents.once('did-finish-load',()=>{
    request.get(api_endpoint+'/invitation/inviteID/b58/'+inviteID,function(err,res,body){
      if(!err && res.statusCode==200){
        rsvpInvitationWindow.webContents.send('InvitationData',JSON.parse(body));
      }
    });
  })
}

exports.showGuestList = ()=>{
  let guestListWindow = new BrowserWindow({height:400,width:800});
  guestListWindow.loadURL(`file://${__dirname}/HTML/guestListWindow.html`);
  guestListWindow.on('closed',()=>{
    guestListWindow = null;
  })

  guestListWindow.webContents.once('did-finish-load',()=>{
    guestListWindow.webContents.send('guests',guests);
  });

}

exports.showInvitationList = ()=>{
  let invitationListWindow = new BrowserWindow({height:400,width:800});
  invitationListWindow.loadURL(`file://${__dirname}/HTML/invitationListWindow.html`);
  invitationListWindow.on('closed',()=>{
    invitationListWindow = null;
  })

  invitationListWindow.webContents.once('did-finish-load',()=>{
    invitationListWindow.webContents.send('invitations',invitations);
  });
}

ipcMain.on('saveCard',(event,args) =>{
    console.log("Saving to "+args.folderpath);

    let folderpath = args.folderpath;
    let filename = args.filename;
    let ismain = filename.substr(filename.length-4)=='main';
    // let size =160000;
    let size = 155000;
    if(!ismain){
      // size = 179665;
      size = 174050
    }
    event.sender.webContents.printToPDF({pageSize:{width:size,height:size},marginsType:1}, (error, data) => {
    if (error) throw error
   

    if (!fs.existsSync(folderpath)){
      fs.mkdirSync(folderpath);
    }

    fs.writeFile(folderpath+'/'+filename+'.pdf', data, (error) => {
      if (error) throw error
      console.log('Write PDF successfully.')

      if(ismain){
        console.log(exportProgressSet.delete(filename.substr(0,filename.length-5)));
      }
      else{
         console.log(exportProgressSet.delete(filename));
      }

      
      scheduleNext();
      event.sender.executeJavaScript('window.close()');
    })
  })

});

ipcMain.on('printCard',(event,args) =>{
  console.log("printing "+args.filename);
  event.sender.webContents.printToPDF({pageSize:{width:179665,height:179665},marginsType:1}, (error, data) => {
    if (error) throw error

    var folderpath = dialog.showOpenDialog({buttonLabel:'Use folder',properties:['openDirectory'],title:'select a folder to output the invitations'});
    fs.writeFile(folderpath+'/'+args.filename+'.pdf', data, (error) => {
      if (error) throw error
      console.log('Write PDF successfully.')
    })
  })
});


ipcMain.on('printGuestList',(event,args) =>{
  console.log("printing Guest List");
  event.sender.webContents.print();
})

ipcMain.on('setAttendance', (event,attendanceObject) =>{
  console.log(attendanceObject)
// /invitation/inviteID/b58/:id/attendance'
  request.post({url:api_endpoint+'/invitation/inviteID/b58/'+attendanceObject.inviteID+'/attendance', body:attendanceObject,json:true},function(err,httpresponse,body){
    if(!err && httpresponse.statusCode == 200){
      console.log('update great');
      event.sender.executeJavaScript('window.close()');
      getGuestList()
    }
  })

})


ipcMain.on('WindowClose',(event,args) => {
    // console.log(event.sender);
    event.sender.executeJavaScript('window.close()');
})

ipcMain.on('addGuest', (event, guest) => {

  // console.log(guest);
  // console.log(event);
  request.put({url:api_endpoint+ '/guest',body:guest,json:true},function(err,httpresponse,body){
    // console.log([err,httpresponse]);
    if(!err && httpresponse.statusCode == 200){
      // console.log('added');
       // close the add window
       event.sender.executeJavaScript('window.close()');

       //update the list in the main window
       getGuestList()

    }
  })
})


ipcMain.on('editedGuest',(event,guest) =>{
  console.log('sending guest update');
  request.post({url:api_endpoint+'/guest/personID/b58/'+guest.personID,body:guest,json:true},function(err,httpresponse,body){
    // console.log([err,httpresponse]);
    if(!err && httpresponse.statusCode == 200){
      console.log('update great');
      event.sender.executeJavaScript('window.close()');
      getGuestList()
    }
  })
})


ipcMain.on('editedInvitation',(event,invitation) =>{
  console.log('sending Invitation update');
  request.post({url:api_endpoint+'/invitation/inviteID/b58/'+invitation.inviteID,body:invitation,json:true},function(err,httpresponse,body){
    // console.log([err,httpresponse]);
    if(!err && httpresponse.statusCode == 200){
      console.log('update great');
      event.sender.executeJavaScript('window.close()');
      getInvitationList();
    }
  })
});


ipcMain.on('getGuestInfo',(event,guestID)=>{
  console.log("getting guest "+guestID);
  getGuestInfo(guestID,(guest)=>{
    // console.log(guest);
    event.sender.webContents.send('GuestData',guest);
  })
})


ipcMain.on('addInvitation',(event,invitation) =>{
  console.log("add invitation");
  request.put({url:api_endpoint+ '/invitation',body:invitation,json:true},function(err,httpresponse,body){
    // console.log([err,httpresponse]);
    if(!err && httpresponse.statusCode == 200){
      // console.log('added');
       // close the add window
       event.sender.executeJavaScript('window.close()');

       //update the list in the main window
       getInvitationList()

    }
  })
});


//functions

const getGuestList = () => {

   request(api_endpoint+'/guests',function(err,res,body){
      if (!err && res.statusCode == 200) {
        win.webContents.send('guests', JSON.parse(body));
        guests = JSON.parse(body);
      }
  });
}

const getInvitationList = () =>{
   request(api_endpoint+'/invitations',function(err,res,body){
      if (!err && res.statusCode == 200) {
        win.webContents.send('invitations', JSON.parse(body));
        invitations = JSON.parse(body);
      }
  }); 
}

const getGuestInfo = (guestID, callback) =>{
  request.get(api_endpoint+'/guest/personID/b58/'+guestID,function(err,res,body){
        if(!err && res.statusCode == 200){
          callback(JSON.parse(body));
        }
    });
}
