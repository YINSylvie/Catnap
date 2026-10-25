
(()=>{
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),toast=document.getElementById('toast'),stateLabel=document.getElementById('stateLabel'),snackLabel=document.getElementById('snackLabel'),snackBtn=document.getElementById('snackBtn'),ghost=document.getElementById('ghost');
const W=960,H=560;let state='relaxed',cat={x:485,y:427},snack=null,mouse={x:-500,y:-500},lastMove=performance.now(),alert=0,peeking=0,win=false,scaredUntil=0,toastUntil=0,toastText='',toastKind='',drag=false,armed=false,frame=0;
const hides=[{x:170,y:422,w:160,h:100,type:'box'},{x:765,y:364,w:105,h:140,type:'curtain'}];
function msg(text,kind='',ms=2500){toastText=text;toastKind=kind;toastUntil=performance.now()+ms;toast.textContent=text;toast.className='toast '+kind}
function label(){let s=state==='relaxed'?'悠闲中':state==='alert'?'竖起耳朵':state==='hidden'?'躲起来了':state==='eating'?'正在吃！':'被抓住啦';stateLabel.textContent=s;snackLabel.textContent=snack?'已放置':'未放置'}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}function poly(points,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fill()}function line(x1,y1,x2,y2,c,w=2){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function drawRoom(t){ // warm pixel room
rect(0,0,W,H,'#e4c998');rect(0,0,W,330,'#e8d3a6'); // wall panels
for(let x=0;x<W;x+=48){rect(x,0,3,330,'#d8bd8d');rect(x+4,0,1,330,'#f1dfb9')}
rect(0,286,W,72,'#9a5944');rect(0,296,W,7,'#b66d4d');for(let x=8;x<W;x+=28){rect(x,310,3,45,'#7f453c');rect(x+4,310,2,45,'#b56d4d')}
// floor
poly([[0,355],[960,355],[960,560],[0,560]],'#bb7350');for(let y=370;y<570;y+=40){line(0,y,960,y,'#a45e48',2);let off=(Math.floor(y/40)%2)*55;for(let x=off;x<960;x+=110)line(x,y,x,y+40,'#a45e48',2)}
// rug
poly([[285,400],[648,400],[725,535],[210,535]],'#52746a');poly([[305,414],[635,414],[690,520],[245,520]],'#78917a');for(let x=280;x<670;x+=22)rect(x,512,9,3,'#e6c37d');
// window
rect(664,42,214,182,'#945744');rect(675,53,192,160,'#fff1c8');rect(682,60,178,146,'#9dc6a0');rect(691,69,72,56,'#d5edc1');rect(775,69,75,56,'#a9d5a4');rect(691,137,72,61,'#84b997');rect(775,137,75,61,'#b7d7a7');rect(762,58,8,147,'#fff1cd');rect(680,128,184,8,'#fff1cd');rect(651,224,240,12,'#75423d');rect(650,235,242,7,'#c88657');
// picture frames
rect(65,62,112,99,'#7b493c');rect(73,70,96,83,'#fff0c9');rect(78,75,86,73,'#91b69c');poly([[78,133],[110,99],[130,122],[149,94],[164,112],[164,148],[78,148]],'#d9bd82');rect(208,86,78,69,'#795044');rect(215,93,64,55,'#f7dba8');rect(223,101,48,38,'#de996a');rect(229,108,17,22,'#f3d791');
// couch
rect(333,241,304,116,'#cf8861');rect(322,222,326,81,'#f2c496');rect(333,235,96,105,'#f5d2a7');rect(436,235,95,105,'#f2c99f');rect(538,235,98,105,'#f6d5a9');rect(332,343,16,22,'#75443b');rect(618,343,16,22,'#75443b');for(let x of [345,445,545]){rect(x,257,36,4,'#e5a77d');rect(x+6,275,5,5,'#e5a77d')}
// side table and lamp
rect(794,275,88,12,'#9e5941');rect(803,287,8,56,'#74463e');rect(865,287,8,56,'#74463e');rect(815,208,9,66,'#69443b');poly([[791,211],[806,178],[837,178],[850,211]],'#f3d5a1');rect(786,208,68,6,'#9e654a');
// plant
rect(702,274,35,33,'#a85845');rect(699,270,41,8,'#d58c57');for(let i=0;i<7;i++){let x=719+Math.sin(i*2.4)*24,y=266-Math.cos(i*1.6)*28;line(720,273,x,y,'#547a50',4);rect(x-5,y-8,11,9,['#708d55','#88a35f','#64844c'][i%3])}rect(713,306,8,18,'#bc7954');
// box hiding spot
rect(94,402,169,105,'#a75f43');rect(106,416,143,91,'#c98555');rect(94,402,169,16,'#e4ac6a');poly([[136,420],[219,420],[203,471],[151,471]],'#75453c');rect(122,480,14,20,'#75453c');rect(230,480,14,20,'#75453c');rect(256,440,13,10,'#f0c077');
// curtain hide area
rect(878,238,31,184,'#a15b47');rect(884,244,17,180,'#ca7d52');for(let x=885;x<904;x+=7)line(x,247,x,419,'#e19b63',3);rect(873,234,42,8,'#70443a');
// decor little toy and cushions
rect(405,382,48,20,'#e0a15f');rect(413,373,28,12,'#efc77d');rect(478,472,18,18,'#d97d62');rect(494,459,16,19,'#7c9c73');rect(506,474,20,15,'#ebc56f');
// soft sun streak
ctx.globalAlpha=.11;poly([[690,237],[840,238],[960,508],[818,508]],'#fff4c8');ctx.globalAlpha=1;
}
function catDraw(x,y,scale=1,face='happy'){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale); // ground shadow
ctx.globalAlpha=.22;ctx.fillStyle='#573b36';ctx.beginPath();ctx.ellipse(0,13,38,9,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
// tail
ctx.strokeStyle='#bd7546';ctx.lineWidth=10;ctx.lineCap='square';ctx.beginPath();ctx.moveTo(25,-9);ctx.lineTo(40,-18+Math.sin(frame/9)*3);ctx.lineTo(48,-11+Math.sin(frame/9)*3);ctx.stroke();
// body + head pixel silhouette
rect(-30,-24,56,29,'#d8955c');rect(-25,-30,45,9,'#e4a66b');rect(-28,-39,48,28,'#e4a66b');poly([[-28,-39],[-25,-53],[-12,-42]],'#e4a66b');poly([[2,-42],[15,-54],[20,-36]],'#e4a66b');poly([[-23,-42],[-22,-49],[-16,-43]],'#d77d69');poly([[7,-43],[14,-50],[15,-40]],'#d77d69');
// chest + paws
rect(-11,-19,17,20,'#f7dfb8');rect(-25,0,12,7,'#f0d3a7');rect(5,0,13,7,'#f0d3a7');
// eyes
if(face==='sleep'){line(-17,-32,-10,-32,'#563b36',2);line(5,-32,12,-32,'#563b36',2)}else{rect(-17,-34,5,7,'#533a36');rect(5,-34,5,7,'#533a36');rect(-16,-33,2,3,'#fff2c9');rect(6,-33,2,3,'#fff2c9')}
poly([[-7,-26],[0,-26],[-3,-22]],'#bd6e64');line(-3,-22,-7,-19,'#69463c',1);line(-3,-22,2,-19,'#69463c',1);
// whiskers
line(-22,-25,-32,-27,'#795548',1);line(-21,-22,-32,-21,'#795548',1);line(16,-25,27,-27,'#795548',1);line(16,-22,28,-20,'#795548',1);
if(face==='alert'){rect(-22,-44,9,3,'#794c3d');rect(3,-44,9,3,'#794c3d')}
ctx.restore()}
function drawHideCat(){if(state!=='hidden'&&peeking<=0)return;let h=peeking>0?1:0;if(hides[0].active){catDraw(195,446,.75,'sleep');}else{catDraw(813,372,.68,'alert')}}
function drawSnack(){if(!snack)return;ctx.fillStyle='#6d493b';ctx.beginPath();ctx.ellipse(snack.x,snack.y+5,20,7,0,0,Math.PI*2);ctx.fill();rect(snack.x-16,snack.y-5,32,9,'#e8a65e');rect(snack.x-10,snack.y-11,20,7,'#f2cc7d');rect(snack.x-4,snack.y-16,8,6,'#fff0bd');}
function drawHUD(){rect(20,18,206,31,'#fff4d9');rect(20,18,206,3,'#c98555');ctx.fillStyle='#68473b';ctx.font='bold 13px system-ui';ctx.fillText('✦  找到猫猫的安心时刻',31,39);if(state==='hidden'){ctx.fillStyle='#fff4dc';ctx.font='bold 13px system-ui';ctx.fillText('嘘……听听躲在哪儿？',355,45)}if(state==='eating'){ctx.fillStyle='#fff4dc';ctx.font='bold 13px system-ui';ctx.fillText('它正专心吃零食！快轻点它！',350,45)}}
function render(now){frame++;ctx.clearRect(0,0,W,H);drawRoom(now); // highlight hiding hotspots
if(state!=='hidden'){ctx.globalAlpha=.13+Math.sin(now/260)*.05;ctx.fillStyle='#ffdd8c';ctx.fillRect(102,408,157,95);ctx.fillRect(878,243,29,174);ctx.globalAlpha=1}
if(state==='hidden'){// reveal cue tail peeking
if(hides[0].active){rect(215,439,24,8,'#d8955c');rect(233,434,7,12,'#d8955c')}else{rect(885,365,10,33,'#d8955c');rect(891,391,7,8,'#f5d4a7')}}
if(!win&&state!=='hidden'){let face=state==='alert'?'alert':state==='eating'?'happy':'sleep';catDraw(cat.x,cat.y+Math.sin(now/320)*2,1,face)}drawHideCat();drawSnack();drawHUD();
if(state==='eating'&&snack){ // crumbs hearts
ctx.fillStyle='#f5d17f';for(let i=0;i<3;i++){let xx=cat.x+30+Math.sin(now/240+i)*13, yy=cat.y-44+Math.cos(now/220+i)*7;ctx.fillRect(xx,yy,5,5)} }
if(win){ctx.fillStyle='rgba(52,39,38,.24)';ctx.fillRect(0,0,W,H);rect(295,190,370,145,'#fff3d8');rect(295,190,370,9,'#e9a35f');ctx.fillStyle='#69463a';ctx.textAlign='center';ctx.font='bold 29px system-ui';ctx.fillText('抓到啦！',480,247);ctx.font='bold 17px system-ui';ctx.fillText('你用耐心赢得了猫猫的信任 ♡',480,284);ctx.font='26px serif';ctx.fillText('🐈  ♥  🐾',480,318);ctx.textAlign='left'}
requestAnimationFrame(render)}
function pos(e){let r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
function nearHide(p){return hides.findIndex(h=>p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h)}
canvas.addEventListener('pointermove',e=>{let p=pos(e);let d=Math.hypot(p.x-cat.x,p.y-cat.y);if(Math.hypot(p.x-mouse.x,p.y-mouse.y)>5){lastMove=performance.now();if(d<120&&state==='relaxed'){state='alert';alert++;label();msg('喵！它注意到你了，先停一停～','bad')}if(d<100&&state==='alert'){alert++;if(alert>5){state='hidden';hides[0].active=Math.random()<.5;cat.x=hides[0].active?195:813;cat.y=hides[0].active?446:372;peeking=0;label();msg('它嗖地躲起来了！点纸箱或窗帘找找','bad')}}}mouse=p});
canvas.addEventListener('pointerdown',e=>{if(drag)return;let p=pos(e);let hi=nearHide(p);if(win)return;if(state==='hidden'&&hi>=0){hides[0].active=hi===0;state='alert';peeking=1;cat.x=hi===0?195:813;cat.y=hi===0?446:372;alert=0;label();msg(hi===0?'纸箱动了动……猫猫探头啦！':'窗帘后露出一条尾巴！猫猫探头啦！','good');return}
if(state==='eating'&&Math.hypot(p.x-cat.x,p.y-(cat.y-24))<64){win=true;state='caught';label();msg('太棒啦！猫猫开心地呼噜呼噜～','good',8000);return}
if(state==='relaxed'||state==='alert'){if(Math.hypot(p.x-cat.x,p.y-(cat.y-23))<58){state='hidden';hides[0].active=Math.random()<.5;cat.x=hides[0].active?195:813;cat.y=hides[0].active?446:372;label();msg('差一点！猫猫受惊躲起来了～','bad');return}}
if(armed){snack={x:p.x,y:p.y};armed=false;state='alert';label();msg('零食放好啦！保持安静，等猫猫靠近…','good');return}
if(hi>=0&&state!=='hidden'){msg(hi===0?'纸箱空空的？留意它的动静～':'窗帘轻轻晃了一下……','');}
});
snackBtn.addEventListener('pointerdown',e=>{e.preventDefault();drag=true;armed=false;ghost.style.display='block';ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';snackBtn.setPointerCapture(e.pointerId)});snackBtn.addEventListener('pointermove',e=>{if(drag){ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px'}});snackBtn.addEventListener('pointerup',e=>{if(!drag)return;drag=false;ghost.style.display='none';let r=canvas.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){let p=pos(e);snack={x:p.x,y:p.y};state='alert';label();msg('零食放好啦！保持安静，等猫猫靠近…','good')}else{armed=true;msg('点一下房间地板，把零食放下吧','good')}});
snackBtn.addEventListener('click',()=>{if(!drag){armed=true;msg('选好位置，点房间地板放下零食 🍪','good')}});
document.getElementById('resetBtn').addEventListener('click',()=>{state='relaxed';cat={x:485,y:427};snack=null;mouse={x:-500,y:-500};alert=0;win=false;peeking=0;hides[0].active=false;lastMove=performance.now();label();msg('慢慢靠近吧——太急会把它吓跑！')});
function update(now){if(state==='alert'&&now-lastMove>2200){state='relaxed';alert=0;label();msg('它放松下来啦，现在可以慢慢靠近','good')}if(state==='hidden'){peeking+=.016;if(peeking>2.4&&now-lastMove>1800){state='alert';cat.x=485;cat.y=427;label();msg('猫猫又溜回房间中间啦','good')}}if(snack&&!win&&state!=='hidden'&&state!=='eating'){if(state==='relaxed'||state==='alert'){if(Math.hypot(cat.x-snack.x,cat.y-snack.y)<95||now-(window.snackAt|| (window.snackAt=now))>3600){state='eating';cat.x=snack.x;cat.y=snack.y+20;window.snackAt=0;label();msg('它开始吃零食了！现在轻点猫猫！','good',6000)}}}requestAnimationFrame(update)}
label();requestAnimationFrame(render);requestAnimationFrame(update);
})();
