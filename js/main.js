
var Vue = require('../lib/vuejs/vue.js');

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
  	search:''
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
  	}
  }
});

Vue.component('guest-list-item', {
  // The todo-item component now accepts a
  // "prop", which is like a custom attribute.
  // This prop is called todo.
  props: ['guest'],
  template: '<li class="list-group-item"><span class="icon icon-user" ></span><strong>{{guest.name}} {{guest.surname}}</strong></li>',
})


