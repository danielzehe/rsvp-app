
var Vue = require('../lib/vuejs/vue.js');
var qr = require('qr-encode');
// var VueRouter = require('../lib/vuejs/vue-router.js');

const {remote,ipcRenderer} =require('electron')
const main = remote.require('./index.js')


let guests = main.getGuests();

ipcRenderer.on('guests',(evt, body)=>{
	// console.log(body)

	v.guests = body;
})


console.log(guests);
var v = new Vue({
  el: '#app',
  data:{
  	guests:[],
  	search:'',
  	currentSelected:''
  },
  computed:{
  	filteredData:function(){
  		var filterKey = this.search && this.search.toLowerCase()
  		var data = this.guests;
  		if(filterKey){
  			data = data.filter(function(row){
  				return Object.keys(row).some(function (key){
  					return String(row[key]).toLowerCase().indexOf(filterKey)>-1
  				})
  			})
  		}
  		return data
  	},
  	currentGuest: function(){

  		if(this.currentSelected==0){
  			return this.guests[0];
  		}
  		else{
  			let data = this.guests
  			let currentpersonID = this.currentSelected
	  		return data.find(function(guest){
	  			return guest.personID == currentpersonID;
	  		});
  		}
  	}
  },
  methods:{
  	addGuest:function(){
  		main.openAddGuestWindow();
  	},
  	selectedGuest:function(personID){
  		// console.log('clicked');
  		// console.log(evt);
  		this.currentSelected = personID
  		
  	},
  	editGuest:function(personID){
  		console.log(personID);
  		main.openEditGuestWindow(personID);
  	}
  }
});

Vue.component('guest-list-item', {
  // The todo-item component now accepts a
  // "prop", which is like a custom attribute.
  // This prop is called todo.
  name:"guest-list-item",
  props: ['guest'],
  template: '<li class="list-group-item" v-bind:value="guest.personID" v-on:click="clicking"><span class="icon icon-user" v-bind:value="guest.personID"></span><strong v-bind:value="guest.personID">{{guest.name}} {{guest.surname}}</strong></li>',
  methods: {
    clicking: function (event) {
      // this.counter += 1
      // console.log('click '+ event.target.value);

      this.$emit('clicking',event.target.value);
    }
  }
})

Vue.component('guest-detail-view',{
	props:['guest'],
	template:'#hello-world-template',
	methods: {
		getFlags: function(){
			let emojies = this.guest.invitedto.map((element)=>{
				switch(element){
					case 'SGS':
						return "🇸🇬💒";
					case 'SG':
						return "🇸🇬🎉";
					case 'DE':
						return "🇩🇪🎉"
				}
			});
			return emojies;
		},
		getQRdata: function(){
			return qr("http://192.168.1.17:3000/api/guest/personID/b58/"+this.guest.personID,{type:6,size:6,level:'Q'});
		}
	}
})
