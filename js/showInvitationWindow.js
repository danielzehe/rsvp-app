const nativeImage = require('electron').nativeImage;
var qr = require('qr-encode');
const {remote,ipcRenderer} =require('electron')


const invitation = {};
invitation.guests =[];

let guestcount = 0;

ipcRenderer.on('InvitationData',(evt, body)=>{
  // console.log(body);

  invitation.invitationName = body.invitationName;
  invitation.lang = body.lang;
  invitation.inviteID = body.inviteID;
  
  guestcount = body.guests.length;
  // v.invitation.guests = [];
  for(let guestid of body.guests){
    console.log(guestid);
    ipcRenderer.send('getGuestInfo',guestid);
  }

});

ipcRenderer.on('GuestData',(evt,body)=>{
  invitation.guests.push(body);

  if(guestcount==invitation.guests.length){
  	//renderQRCodePage()
  	renderGermanInformationPage()
  }

})

function renderQRCodePage(){

	var can = document.getElementById('invitation');
	var ctx = can.getContext('2d');

	var img = new Image();
	img.onload = function() {
		can.width = img.width;
		can.height = img.height;
	    ctx.drawImage(img, 0, 0,img.width,img.height,0,0,img.width,img.height);
	    var qrimg = new Image();
		qrimg.onload = function(){
			ctx.drawImage(qrimg, 0, 0,qrimg.width,qrimg.height,1175.181,1775.585,qrimg.width,qrimg.height);
			ctx.fillStyle = "blue";
			ctx.font = "73.22pt Baskerville";
			ctx.fillText(invitation.inviteID, 2302.769, 3283.917);


			ctx.fillStyle = "red";
			ctx.font = "69.559pt MrsEavesRoman Regular";
			ctx.textAlign="center";
			ctx.fillText(invitation.invitationName+",", 1830.5, 940.877);



			let dataurl = can.toDataURL();

			var nimage =nativeImage.createFromDataURL(dataurl);

			var fs = require('fs');

			fs.open(invitation.inviteID+'_RSVP.png','w',function(err,fd){
				fs.write(fd,nimage.toPNG(),0,nimage.toPNG().length,function(err2){
					console.log(err2);
					
				})
			})
		}
		// qrimg.src = "test.gif";
		qrimg.src = qr("http://rsvp.danielwithsilver.com/web/invitation/inviteID/b58/"+invitation.inviteID,{type:6,size:32,level:'Q'});



		
	}
	img.src = "../resources/English_RSVP.png";
	// img.src = "http://worldsoccertalk.com/wp-content/uploads/2009/01/cristiano-ronaldo-sporting-lisbon.jpg"

}

function renderGermanInformationPage(){
	var can = document.getElementById('invitation');
	var ctx = can.getContext('2d');

	var img = new Image();
	img.onload = function() {
		can.width = img.width;
		can.height = img.height;
	    ctx.drawImage(img, 0, 0,img.width,img.height,0,0,img.width,img.height);
	    var qrimg = new Image();
		qrimg.onload = function(){
			ctx.drawImage(qrimg, 0, 0,qrimg.width,qrimg.height,2675,2640,qrimg.width,qrimg.height);


			ctx.fillStyle = "blue";
			ctx.font = "73.22pt Baskerville";
			ctx.fillText(invitation.inviteID, 1656, 3306);


			// ctx.fillStyle = "red";
			// ctx.font = "69.559pt MrsEavesRoman Regular";
			// ctx.textAlign="center";
			// ctx.fillText(invitation.invitationName+",", 1830.5, 940.877);



			let dataurl = can.toDataURL();

			var nimage =nativeImage.createFromDataURL(dataurl);

			var fs = require('fs');

			fs.open(invitation.inviteID+'_RSVP.png','w',function(err,fd){
				fs.write(fd,nimage.toPNG(),0,nimage.toPNG().length,function(err2){
					console.log(err2);
					
				})
			})
		}
		// qrimg.src = "test.gif";
		qrimg.src = qr("http://rsvp.danielwithsilver.com/web/invitation/inviteID/b58/"+invitation.inviteID,{type:6,size:21,level:'Q'});



		
	}
	img.src = "../resources/German_RSVP.png";
	// img.src = "http://worldsoccertalk.com/wp-content/uploads/2009/01/cristiano-ronaldo-sporting-lisbon.jpg"

}