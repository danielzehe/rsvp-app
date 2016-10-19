var Vue = require('../lib/vuejs/vue.js');
const {remote,ipcRenderer} =require('electron')
const main = remote.require('./index.js')

var v = new Vue({
  el: '#app',
  data:{
  	invitation:{
      invitationName:'',
      guests:[]
    }
  	
  },
  methods:{
    drop:function(e){
      
      this.invitation.guests.push(JSON.parse(e.dataTransfer.getData("application/json")));
      console.log('great');
    }
  }
});