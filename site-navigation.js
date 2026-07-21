document.querySelectorAll('[data-mvm-header]').forEach((header)=>{
  const burger=header.querySelector('[data-mvm-burger]');
  const menu=document.getElementById(header.getAttribute('data-mvm-menu'));
  const serviceToggle=menu?.querySelector('[data-mvm-services-toggle]');
  const services=menu?.querySelector('.mvm-services');
  if(!burger||!menu)return;
  const closeMenu=()=>{document.body.classList.remove('mvm-menu-open');burger.setAttribute('aria-expanded','false');services?.classList.remove('mvm-services-open');serviceToggle?.setAttribute('aria-expanded','false')};
  burger.addEventListener('click',()=>{const open=document.body.classList.toggle('mvm-menu-open');burger.setAttribute('aria-expanded',open?'true':'false')});
  serviceToggle?.addEventListener('click',()=>{const open=services.classList.toggle('mvm-services-open');serviceToggle.setAttribute('aria-expanded',open?'true':'false')});
  menu.querySelectorAll('a').forEach((link)=>link.addEventListener('click',closeMenu));
  document.addEventListener('click',(event)=>{header.querySelectorAll('.mvm-more[open]').forEach((item)=>{if(!item.contains(event.target))item.removeAttribute('open')})});
});
