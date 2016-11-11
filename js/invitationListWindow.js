
var Vue = require('../lib/vuejs/vue.js');

const {remote,ipcRenderer} =require('electron')
const main = remote.require('./index.js')



ipcRenderer.on('invitations',(evt, body)=>{
	// console.log(body)
	v.invitations = body;
})


var v = new Vue({
	el:'#app',
	data:{
		invitations:[]
	},
	methods:{
		getAttendanceStatusforGuestatEvent: function(personID,event){
			 
			  let guest = main.getGuest(personID);
			  // console.log(guest.attending);
			  let invitation = main.getInvitationForGuest(personID);
			  // console.log(invitation);
			  if (invitation.rsvptime==undefined){
			  	if(guest.invitedto.indexOf(event)!=-1){
			  		return "?"
			  	}
			  }
			  else{

				  	if(guest.invitedto.indexOf(event)!=-1 && guest.attending.indexOf(event)!=-1){
			  			return "comming"
			  		}
			  		else{
			  			return "not comming"
			  		}
				  	
			  }
		},
		getGuest:function(personID){
			return main.getGuest(personID);

		},
		print:function(){
			ipcRenderer.send('printGuestList');
		}
	}
});