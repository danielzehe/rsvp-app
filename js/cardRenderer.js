const fs = require('fs');
const nativeImage = require('electron').nativeImage;
var qr = require('qr-encode');
const {remote,ipcRenderer} =require('electron')
const main = remote.require('./index.js')


let folderpath;
ipcRenderer.on('InvitationData',(evt, body)=>{
  console.log(body.invitation.invitationName);





  // invitation = body.invitation;

  folderpath = body.folderpath;
  console.log(folderpath);

  const type = body.type;

  switch (type){
  	case "DE_de":
  		renderInvitation_DE_DE(body.invitation,type);
  		break;
  	case "DE_en":
  		renderInvitation_DE_EN(body.invitation,type);
  		break;
  	case "SG_de":
  		renderInvitation_SG_DE(body.invitation,type);
  		break;
  	case "SG_en":
  		renderInvitation_SG_EN(body.invitation,type);
  		break;
  	case "SGS_de":
  		renderSolemnization_DE(body.invitation,type);
  		break;
  	case "SGS_en":
  		renderSolemnization_EN(body.invitation,type);
  		break;
  	case "Info_de":
  		renderInformation_DE(body.invitation,type);
  		break;
  	case "Info_en":
  		renderInformation_EN(body.invitation,type);
  		break;
  }
  
  

});

function save(invitation,type){
  ipcRenderer.send('saveCard',{"folderpath":folderpath+'/'+invitation.invitationName,"filename":invitation.inviteID+'_'+type})

}

function renderInvitation_SG_EN(invitation,type){
	fs.readFile(__dirname+'/../resources/Invitation_English_Reception_SG.svg', (err, data) => {
	  if (err) throw err;
	  document.body.innerHTML = data;


	  document.getElementById("invite_name").innerHTML = invitation.invitationName;


	  // document.getElementById("secondbody").getElementById("XMLID_168_").innerHTML = "HTETLSLFDF";
	  
	  save(invitation,type);
	});
}

function renderInvitation_SG_DE(invitation,type){
	fs.readFile(__dirname+'/../resources/Invitation_German_Reception_SG'+singleorcouple(invitation)+'.svg', (err, data) => {
	  if (err) throw err;
	  document.body.innerHTML = data;


	  document.getElementById("invite_name").innerHTML = invitation.invitationName;
	  save(invitation,type);

	});
}

function renderInvitation_DE_DE(invitation,type){
	fs.readFile(__dirname+'/../resources/Invitation_German_Reception_DE'+singleorcouple(invitation)+'.svg', (err, data) => {
	  if (err) throw err;
	  document.body.innerHTML = data;
	  console.log(invitation);
	  document.getElementById("invite_name").innerHTML = invitation.invitationName;
	  save(invitation,type);

	});
}

function renderInvitation_DE_EN(invitation,type){
	fs.readFile(__dirname+'/../resources/Invitation_English_Reception_DE.svg', (err, data) => {
	  if (err) throw err;
	  document.body.innerHTML = data;


	  document.getElementById("invite_name").innerHTML = invitation.invitationName;
	  save(invitation,type);

	});
}



function renderInformation_DE(invitation,type){
	fs.readFile(__dirname+'/../resources/Information_German'+singleorcouple(invitation)+'.svg', (err, data) => {
	  if (err) throw err;
	  document.body.innerHTML = data;

	  let qrcode = qr("http://rsvp.danielwithsilver.com/web/invitation/inviteID/b58/"+invitation.inviteID,{type:6,size:32,level:'Q'});

	  document.getElementById("qr_code").setAttribute("xlink:href",qrcode);
	  document.getElementById("invite_id").innerHTML = invitation.inviteID;
	  save(invitation,type);
	});
}
function renderInformation_EN(invitation,type){
	fs.readFile(__dirname+'/../resources/RSVP_English.svg', (err, data) => {
	  if (err) throw err;
	  document.body.innerHTML = data;

	  let qrcode = qr("http://rsvp.danielwithsilver.com/web/invitation/inviteID/b58/"+invitation.inviteID,{type:6,size:32,level:'Q'});
	  document.getElementById("qr_code").setAttribute("xlink:href",qrcode);
	  document.getElementById("invite_id").innerHTML = invitation.inviteID;
	  document.getElementById("invite_name").innerHTML = 'Dear '+invitation.invitationName+',';
	  save(invitation,type);

	});
}


function renderSolemnization_DE(invitation,type){
	fs.readFile(__dirname+'/../resources/Solemnization_German'+singleorcouple(invitation)+'.svg', (err, data) => {
	  if (err) throw err;
	  document.body.innerHTML = data;
	  save(invitation,type);
	});
}

function renderSolemnization_EN(invitation,type){
	fs.readFile(__dirname+'/../resources/Solemnization_English.svg', (err, data) => {
	  if (err) throw err;
	  document.body.innerHTML = data;
	  save(invitation,type);

	});
}

function singleorcouple(invitation){
	if(invitation.guests.length ==1){
		return '_Single';
	}
	else {
		return '_Couple';
	}
}