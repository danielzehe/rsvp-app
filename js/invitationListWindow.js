
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
			  			return "coming"
			  		}
			  		else if (guest.invitedto.indexOf(event)!=-1 && guest.attending.indexOf(event)==-1){
			  			return "not coming"
			  		}
			  		else if (guest.invitedto.indexOf(event)==-1){
			  			return ""
			  		}
				  	
			  }
		},
		getGuest:function(personID){
			return main.getGuest(personID);

		},

		getPersonType:function(personID){
			let guest = main.getGuest(personID);
			console.log(guest);
			if(guest.eatinggroup==1){
				return "Baby";
			}
			else if(guest.eatinggroup==2){
				return "Kid"
			}
			else{
				return "Adult"
			}
		},
		
		getRSVPTime:function(invitation){
			if(invitation.rsvptime!=undefined){
		        d = new Date(invitation.rsvptime)
		        return d.toLocaleDateString()+' '+d.toLocaleTimeString();
		      }
		      return "--";
		},

		print:function(){
			ipcRenderer.send('printGuestList');
		},




	}
});