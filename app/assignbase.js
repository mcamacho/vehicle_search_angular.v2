'use strict';
var baseURL, base = window.location.pathname.split('/');
if (base[1] === 'inventory') {
  baseURL = '/' + base[1] + '/';
} else if (base.length > 3) {
  baseURL = '/' + base[1] + '/' + base[2] + '/';
} else {
  baseURL = window.location.pathname;
}
var newbase = document.createElement('base');
newbase.setAttribute('href', baseURL);
document.getElementsByTagName('head')[0].appendChild(newbase);