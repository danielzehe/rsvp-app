
var Vue = require('../lib/vuejs/vue.js');
var qr = require('qr-encode');
// var VueRouter = require('../lib/vuejs/vue-router.js');

const {remote,ipcRenderer} =require('electron')
const main = remote.require('./index.js')


main.getGuests();

main.getInvitations();


ipcRenderer.on('guests',(evt, body)=>{
	// console.log(body)
	v.guests = body;
})

ipcRenderer.on('invitations',(evt,body)=>{
  v.invitations = body;
})

ipcRenderer.on('progressUpdate',(evt, body)=>{
  console.log(body);
  v.progress = body;
});


// console.log(guests);
var v = new Vue({
  el: '#app',
  data:{
  	guests:[],
    invitations:[],
  	searchText:'',
    searchInvitations:'',
  	currentSelectedGuestID:'',
    currentSelectedInvitationID:'',
    progress : 0.0
  },
  computed:{
  	filteredGuestData:function(){
  		var filterKey = this.searchText && this.searchText.toLowerCase()
  		var data = this.guests;
  		if(filterKey){
  			data = data.filter(function(row){
  				return Object.keys(row).some(function (key){
  					return String(row[key]).toLowerCase().indexOf(filterKey)>-1
  				})
  			})
  		}
  		return data.sort(function(a,b) {return (a.surname > b.surname) ? 1 : ((b.surname > a.surname) ? -1 : 0);} ); ;
  	},
    filteredInvitationData: function(){
      var filterKey = this.searchText && this.searchText.toLowerCase()
      var data = this.invitations;
      if(filterKey){
        data = data.filter(function(row){
          return Object.keys(row).some(function (key){
            return String(row[key]).toLowerCase().indexOf(filterKey)>-1
          })
        })
      }
      return data;
    },
    guestsinInvitation:function(){
      let guestdata = this.guests
      if(this.currentInvitation===undefined){
        return [];
      }
      let guestIDs = this.currentInvitation.guests
      returndata = guestdata.filter(function(guest){
        for (let personID of guestIDs) {
          if(personID==guest.personID){
            return true;
          }
        }
      });
      return returndata;
    },
  	currentGuest: function(){

  		if(this.currentSelectedGuestID==''){
  			return this.guests[0];
  		}
  		else{
  			let data = this.guests
  			let currentpersonID = this.currentSelectedGuestID
	  		return data.find(function(guest){
	  			return guest.personID == currentpersonID;
	  		});
  		}
  	},
    currentInvitation: function(){
      if(this.currentSelectedInvitationID==''){
        return this.invitations[0];
      }
      else {
        let data = this.invitations
        let currentinvitationID = this.currentSelectedInvitationID
        return data.find(function(invitation){
          return invitation.inviteID == currentinvitationID;
        });
      }
    },
    numberofnonEaters:function(){
      let noneater=0;
      let kidseater=0;
      let fulleater = 0;
      for (guest of this.guests){
        if(guest.eatinggroup==1){
          noneater++;
        }
        else if(guest.eatinggroup==2){
          kidseater++;
        }
        else{
          fulleater++;
        }
      }
      let object ={};
      object.fulleater = fulleater;
      object.noneater = noneater;
      object.kidseater = kidseater;
      return object; 
    }
  },
  methods:{
    showhome:function(){
      this.currentSelectedGuestID = '';
      this.currentSelectedInvitationID = '';
    },
  	addGuest:function(){
  		main.openAddGuestWindow();
  	},
    addInvitation:function(){
      main.openAddInvitationWindow();
    },
  	selectedGuest:function(personID){
  		// console.log('clicked');
  		// console.log(evt);
  		this.currentSelectedGuestID = personID
      this.currentSelectedInvitationID = '';
  		
  	},
    selectedInvitation:function(invitationID){
      // console.log('clicked');
      // console.log(evt);
      this.currentSelectedInvitationID = invitationID
      this.currentSelectedGuestID = '';
    },
  	editGuest:function(personID){
  		console.log(personID);
  		main.openEditGuestWindow(personID);
  	},
    editInvitation: function(invitationID){
      console.log(invitationID);
      main.openEditInvitationWindow(invitationID);
    },
    rsvpInvitation : function(invitationID){
      console.log(invitationID);
      main.openRSVPInvitationWindow(invitationID);
    },
    isGuestActive: function(personID){
      return this.currentSelectedGuestID==personID;
    },
    genInvitationPackage:function(invitationID){
      main.saveInvitationPackage(invitationID);
    },
    exportAllInvitations:function(){
      main.saveAllInvitationPackages();
    },
    showGuestList:function(){
      main.showGuestList();
    },
    showInvitationList:function(){
      main.showInvitationList();
    }
   }
});

Vue.component('guest-list-item', {
  // The todo-item component now accepts a
  // "prop", which is like a custom attribute.
  // This prop is called todo.
  name:"guest-list-item",
  props: ['guest','isactive'],
  template: '<li draggable="true" @dragstart="start" class="list-group-item" v-bind:class="{active:isactive}" style="padding:2px 5px;"  v-on:click="clicking"><div v-bind:value="guest.personID"><strong  v-bind:value="guest.personID">{{guest.name}} {{guest.surname}} {{isBaby()}}</strong></div></li>',
  methods: {
    clicking: function (event) {
      // this.counter += 1
      // console.log('click '+ event.target.value);
      event.preventDefault();
      this.$emit('clicking',event.target.value);
    },
    start: function(event){
      event.dataTransfer.setData("application/json",JSON.stringify(this.guest));
    },
    isBaby : function(event){
      if(this.guest.eatinggroup==1){
        return "🐣";
      }
      else if( this.guest.eatinggroup==2){
        return "🐥";
      }
    }   
  }
})

Vue.component('invitation-list-item', {
  // The todo-item component now accepts a
  // "prop", which is like a custom attribute.
  // This prop is called todo.
  name:"invitation-list-item",
  props: ['invitation'],
  template: '<li class="list-group-item" v-on:click="clicking"><div v-bind:value="invitation.inviteID"><span v-bind:style="getHighlightStyle" class="icon icon-users" ></span> {{invitation.invitationName}}</div></li>',
  methods: {
    clicking: function (event) {
      // this.counter += 1
      // console.log('click '+ event.target.value);

      this.$emit('clicking',event.target.value);
    }
  },
  computed:{
    getHighlightStyle:function(){
      if(this.invitation.rsvptime!=undefined){
        return {color:'green'}
      }

    }
  }
})

Vue.component('home-view',{
  template:'#home-view-template',
  props:['guests'],
  data:function(){
    return {};  
  },
  methods:{
    getPercentComing:function(weddinglocation){
      var invitedCount = 0;
      var comingCount = 0;
      for(guest of this.guests){
        if(guest.invitedto.indexOf(weddinglocation)!=-1)
        {
          invitedCount+=1;
        }
        if(guest.attending!==undefined && guest.attending.indexOf(weddinglocation)!=-1){
          comingCount+=1;
        }
      }
      return 100*(comingCount/invitedCount);
    },
    getInvitedCount: function(weddinglocation){
      var invitedCount = 0;
      for(guest of this.guests){
        if(guest.invitedto.indexOf(weddinglocation)!=-1)
        {
          invitedCount+=1;
        }
      }
      return invitedCount;  
    },
    getComingCount: function(weddinglocation){
      var comingCount = 0;
      for(guest of this.guests){
        if(guest.attending!==undefined && guest.attending.indexOf(weddinglocation)!=-1){
          comingCount+=1;
        }
      }
      return comingCount;
    },
    getNotRSVPCount: function(weddinglocation){
      var count =0;
      for(guest of this.guests){
        if(guest.attending===undefined && guest.invitedto.indexOf(weddinglocation)!=-1){
          count+=1;
        }
      }
      return count;
    },
    getNotComingCount:function(weddinglocation){
      var count = 0;
      for(guest of this.guests){
        if(guest.attending!==undefined && guest.invitedto.indexOf(weddinglocation)!=-1 && guest.attending.indexOf(weddinglocation)==-1){
          count+=1;
          // console.log(guest.name +' '+ guest.surname)
        }
      }
      return count;
    },
    guestsonSide(side){
      
      var returnguests = this.guests.filter(function(guest){

        return parseInt(guest.familyside)==side;

      }) 
      return returnguests;
    }

  },
  computed:{
    getTimeLeft:function(){
      wd = new Date(2017,4,6,17,30,00,00);
      console.log(wd)
      now = new Date();
      remaining = wd-now;
      return Math.floor(remaining/(1000*60*60*24))
    }
    
  }
})



Vue.component('guest-detail-view',{
	props:['guest'],
	template:'#guest-detail-view-template',
  data:function () {
    return {
      showqr: false
    }
  },
	methods: {
		getFlags: function(){
			let emojies = this.guest.invitedto.map((element)=>{
				switch(element){
					case 'SGS':
            let attendingSGS = this.guest.attending===undefined ? false : this.guest.attending.indexOf('SGS')!=-1;
						return {em:"🇸🇬💒", attend:attendingSGS==true ? "✅" : "❌"};
					case 'SG':
             let attendingSG = this.guest.attending===undefined ? false :this.guest.attending.indexOf('SG')!=-1;
						return {em:"🇸🇬🎉", attend:attendingSG==true ? "✅" : "❌"};
					case 'DE':
            let attendingDE = this.guest.attending===undefined ? false :this.guest.attending.indexOf('DE')!=-1;
						return {em:"🇩🇪🎉",attend:attendingDE==true ? "✅" : "❌"};
				}
			});
			return emojies;
		},
		getQRdata: function(){
			return qr("http://rsvp.danielwithsilver.com/web/invitation/personID/b58/"+this.guest.personID,{type:6,size:6,level:'Q'});
		},
    toggleQR:function(){
      this.showqr = !this.showqr;
    },
    isBaby : function(event){
      if(this.guest.eatinggroup==1){
        return "🐣";
      }
      else if( this.guest.eatinggroup==2){
        return "🐥";
      }
    }   
	}
})

Vue.component('invitation-detail-view',{
  props:['invitation','usedguests'],
  template:'#invitation-detail-view-template',
  computed:{
    getRSVPTime:function(){
      if(this.invitation.rsvptime!=undefined){
        d = new Date(this.invitation.rsvptime)
        return d.toLocaleDateString()+' '+d.toLocaleTimeString();
      }
      return null;
    }
  }
})
