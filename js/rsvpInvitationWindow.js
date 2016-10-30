var Vue = require('../lib/vuejs/vue.js');
const {remote,ipcRenderer} =require('electron')
const main = remote.require('./index.js')


ipcRenderer.on('InvitationData',(evt, body)=>{
  // console.log(body);

  v.invitation.invitationName = body.invitationName;
  v.invitation.lang = body.lang;
  v.invitation.inviteID = body.inviteID;
  // v.invitation.guests = [];
  for(let guestid of body.guests){
    console.log(guestid);
    ipcRenderer.send('getGuestInfo',guestid);
  }
});


ipcRenderer.on('GuestData',(evt,body)=>{
  v.invitation.guests.push(body);
  for (var i = 0; i < v.invitation.guests.length; i++) {
    if(v.invitation.guests[i].attending===undefined){
      console.log('no attendance record yet');
      v.invitation.guests[i].attending =[];
    }
    if(v.invitation.guests[i].attending.constructor === Array){
      console.log('is array')
    }
    else{
      console.log('no array');
      var oldattending = v.invitation.guests[i].attending;
      v.invitation.guests[i].attending = [];
      v.invitation.guests[i].attending.push(oldattending);
    }
    console.log(v.invitation.guests[i].attending);  
  }
})

var v = new Vue({
  el: '#app',
  data:{
    invitation:{
      invitationName:'',
      guests:[],
      lang:[]
    }
  },
    computed:{
      guestInvitedTo:function(guest,eventID){
        console.log(guest.name+" "+eventID);
        return true;
      }
    },
    methods:{
      saveChanges:function(event){ 
          // console.log("saveing changes");

          let returnobject ={
            inviteID: this.invitation.inviteID,
            attendance:[]
          }

          for (var i = 0; i < this.invitation.guests.length; i++) {
            console.log(this.invitation.guests[i].attending);
            
            let attendingobject = {
              guestid: this.invitation.guests[i].personID,
              attending:this.invitation.guests[i].attending
            }

            returnobject.attendance.push(attendingobject);
          }




          ipcRenderer.send('setAttendance',returnobject);


      }
    }
});
