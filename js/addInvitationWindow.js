var Vue = require('../lib/vuejs/vue.js');
const {remote,ipcRenderer} =require('electron')
const main = remote.require('./index.js')

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
      console.log(this.guest);
      // main.addGuest(this.guest);

      let guestIDarray = this.invitation.guests.map(function(guest){
        return guest.personID;
      });

      let invitationObject = this.invitation;
      invitationObject.guests = guestIDarray;

      ipcRenderer.send('addInvitation',invitationObject);
    },
    reset: function(){
      ipcRenderer.send('addInvitationClose');
    }   
  }
});