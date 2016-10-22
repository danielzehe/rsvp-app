var Vue = require('../lib/vuejs/vue.js');
const {remote,ipcRenderer} =require('electron')
const main = remote.require('./index.js')


ipcRenderer.on('GuestData',(evt, body)=>{
  // console.log(body)

  v.guest = body;
});


var v = new Vue({
  el: '#app',
  data:{
  	guest:{
  		name:'',
  		surname:'',
  		dietaryRestrictions:'',
  		familyside:0,
  		invitedto:[],
  		contact:  {
  			phone:'',
  			email:'',
  			address: {
  				street_1:'',
  				street_2:'',
  				postalcode:'',
  				city:'',
  				country:''
  			}
  		}
  	}
  	
  },
  methods:{
  	addGuest: function(e){
  		e.preventDefault();
  		console.log(this.guest);
  		// main.addGuest(this.guest);

  		ipcRenderer.send('editedGuest',this.guest);
  	},
  	reset: function(){
  		ipcRenderer.send('WindowClose');
  	}		
  }
});