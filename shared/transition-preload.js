if (sessionStorage.getItem('hub-transition') && localStorage.getItem('hub-transitions-enabled') !== 'false') {
  document.documentElement.classList.add('page-enter-pending');
}
