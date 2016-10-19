const {app, BrowserWindow,ipcMain} = require('electron')
const request = require('request')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

let api_endpoint = 'http://192.168.1.17:3000/API'

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600,'accept-first-mouse':true,'titleBarStyle':'hidden'})

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/HTML/main.html`)

  // Open the DevTools.
  win.webContents.openDevTools()

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
      request.get(api_endpoint+'/guest/personID/b58/'+personID,function(err,res,body){
        if(!err && res.statusCode == 200){
          editGuestWindow.webContents.send('GuestData',JSON.parse(body));  
        }
    });
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

ipcMain.on('addGuestClose',(event,args) => {
    // console.log(event.sender);
    event.sender.executeJavaScript('window.close()');
})

ipcMain.on('addGuest', (event, guest) => {

  // console.log(guest);
  // console.log(event);
  request.put({url:api_endpoint+ '/guest',body:guest,json:true},function(err,httpresponse,body){
    console.log([err,httpresponse]);
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
    console.log([err,httpresponse]);
    if(!err && httpresponse.statusCode == 200){
      console.log('update great');
      event.sender.executeJavaScript('window.close()');
      getGuestList()
    }
  })
})

//functions

const getGuestList = () => {

   request(api_endpoint+'/guests',function(err,res,body){
      if (!err && res.statusCode == 200) {
        win.webContents.send('guests', JSON.parse(body));
      }
  });
}

const getInvitationList = () =>{
   request(api_endpoint+'/invitations',function(err,res,body){
      if (!err && res.statusCode == 200) {
        win.webContents.send('invitations', JSON.parse(body));
      }
  }); 
}
