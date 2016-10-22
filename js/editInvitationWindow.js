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
  methods:{
    drop:function(e){
      
      this.invitation.guests.push(JSON.parse(e.dataTransfer.getData("application/json")));
      console.log('great');
    },
    addInvitation: function(e){
      e.preventDefault();
      console.log(this.invitation);
      // main.addGuest(this.guest);

      let guestIDarray = this.invitation.guests.map(function(guest){
        return guest.personID;
      });

      let invitationObject = this.invitation;
      invitationObject.guests = guestIDarray;

      ipcRenderer.send('editedInvitation',invitationObject);
    },
    removeGuest: function(guestid){
      let guestlist = this.invitation.guests.filter(function(guest){
        return guest.personID!=guestid;
      })
      this.invitation.guests=guestlist;
    },
    reset: function(){
      ipcRenderer.send('WindowClose');
    }   
  }
});