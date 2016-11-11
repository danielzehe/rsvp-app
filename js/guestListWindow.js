
var Vue = require('../lib/vuejs/vue.js');

const {remote,ipcRenderer} =require('electron')
const main = remote.require('./index.js')


main.getGuests();


ipcRenderer.on('guests',(evt, body)=>{
	// console.log(body)
	v.guests = body;
})


var v = new Vue({
	el:'#app',
	data:{
		guests:[],
	},
	methods:{
		getAttendanceStatusforGuestatEvent: function(personID,event){
			  let guest = this.guests.find((guest) =>{
			    return guest.personID == personID;
			  });
			  // console.log(guest.attending);
			  let invitation = main.getInvitationForGuest(guest.personID);
			  // console.log(invitation);
			  if (invitation.rsvptime==undefined){
			  	if(guest.invitedto.indexOf(event)!=-1){
			  		return "❓"
			  	}
			  }
			  else{

				  	if(guest.invitedto.indexOf(event)!=-1 && guest.attending.indexOf(event)!=-1){
			  			return "✅"
			  		}
			  		else{
			  			return "❌"
			  		}
				  	
			  }
		},
		print:function(){
			ipcRenderer.send('printGuestList');
		}
	}
});