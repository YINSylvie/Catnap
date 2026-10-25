'use strict';
(() => {
const $ = id => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d');
const W=800,H=530, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const P=(u,v,z=0)=>({x:400+u-v,y:171+(u+v)*.48-z});
const unproject=(x,y)=>({u:((y-171)/.48+x-400)/2,v:((y-171)/.48-x+400)/2});
const C={outline:'#694b3d',wood:'#a76746',woodLight:'#c88857',woodDark:'#84523d',cream:'#efd6a0',green:'#71866a',leaf:'#5b7956',wall:'#dfcd9f'};
let g, clock=0,last=0,night=false,paused=false,sound=false,audio=null,prevUI='',lastMessage='',lastPetMessage=-9;
let pointer={x:-999,y:-999,u:180,v:190},keyboard=false,held=false,hoverCat=false,hotspotButtons=[];
let memory;try{memory=JSON.parse(localStorage.getItem('catnap-memories-v1')||'[]');if(!Array.isArray(memory))memory=[]}catch{memory=[]}
const stamps=[['curious','⌕','Little Room Explorer','Discover the stories behind three objects'],['snack','♧','Treat Diplomat','Let Ginger finish a fish treat'],['play','⚑','Best Playmate','Help Ginger pounce on the feather three times'],['gentle','♡','A Gentle Friend','Complete a gentle head pet'],['hug','⌂','Chosen by a Cat','Share your first cuddle with Ginger']];
const objects=[
 {id:'books',u:36,v:245,z:93,label:'Bookshelf',text:'A photo of Ginger is tucked between the pages. Every book here seems to have a tiny set of tooth marks.'},
 {id:'plant',u:315,v:40,z:98,label:'Window plant',text:'A little furball hides behind the leaves. Ginger has been gardening again: loosening the soil, one paw at a time.'},
 {id:'radio',u:190,v:23,z:88,label:'Little radio',text:'Turn the dial. The static gives way to a gentle tune. Ginger perks up his ears. He seems to approve.'},
 {id:'box',u:50,v:290,z:23,label:'Cardboard box',text:'The box says “Ginger Manor.” Inside is a tiny fish toy, carefully hidden away like treasure.'},
 {id:'cushion',u:290,v:77,z:49,label:'Sofa cushion',text:'Under the cushion: three ginger hairs and a nap schedule. The plan? Sleep. Sleep. More sleep.'}
];
function say(text,speaker='A LITTLE WORD FROM GINGER'){lastMessage=text;$('message').textContent=text;$('speaker').textContent=speaker}
function earn(id){if(memory.includes(id))return;memory.push(id);try{localStorage.setItem('catnap-memories-v1',JSON.stringify(memory))}catch{}$('albumCount').textContent=`${memory.length} / 5 memory stamps`;chime('stamp')}
function reset(){g={tool:'explore',trust:0,fear:0,cat:{u:180,v:195},target:null,mode:'idle',food:null,foods:3,found:new Set(),fed:0,pounces:0,pet:0,petDone:false,petCooldown:0,hiddenAt:null,hideUntil:0,nextWander:clock+6,lastPlay:-10,lastPet:-10,lastScare:-10,started:clock,won:false,particles:[],stats:{snacks:0,plays:0,pets:0},motion:0,steps:[]};held=false;paused=false;prevUI='';$('pauseScreen').hidden=true;$('pause').textContent='Ⅱ Pause';$('pause').setAttribute('aria-pressed','false');say('Mew? A new friend! Have a look around, then come say hello. Slowly, please.');updateUI();positionTargets()}
function chime(kind='soft'){
 if(!sound)return;try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const notes=kind==='win'?[523,659,784,1046]:kind==='stamp'?[659,880]:kind==='scare'?[180,140]:[440,554];notes.forEach((f,i)=>{const o=audio.createOscillator(),gain=audio.createGain();o.type='sine';o.frequency.value=f;o.connect(gain);gain.connect(audio.destination);const t=audio.currentTime+i*.12;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.045,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+.3);o.start(t);o.stop(t+.31)})}catch{sound=false;$('sound').setAttribute('aria-pressed','false')}}
function burst(u,v,kind='heart',n=6){for(let i=0;i<n;i++)g.particles.push({u,v,z:25,age:0,life:1.4+i*.1,dx:(Math.random()-.5)*22,dz:15+Math.random()*20,kind})}
function setTool(tool){if(g.won)return;if(tool==='food'&&g.foods<=0){say('All the treats are gone. Ginger would still love a game or a gentle head pet.');return}g.tool=tool;held=false;g.pet=0;keyboard=false;const tips={explore:'Look for the sparkling objects. Each one has a little story about Ginger.',food:'Click a clear patch of floor to leave a fish treat. Give Ginger time to wander over.',toy:'Click the floor to invite Ginger, then move the feather. When he comes close, click to let him pounce!',pet:'Wait until Ginger settles down, then press and hold on him for 1.8 seconds. Let him relax first if he is nervous.',catch:'With at least 75 trust and alertness below 30, click Ginger to share a cuddle.'};say(tips[tool]);updateUI()}
function validFloor(u,v){if(u<22||v<25||u>333||v>323)return false;if(u>198&&v<106)return false;if(u<66&&v<263)return false;if(u>276&&v>240)return false;if(u<91&&v>263)return false;if(u>112&&u<208&&v>104&&v<179)return false;return true}
function pathTo(u,v){
 const size=15,n=23,key=(a,b)=>a*n+b,free=(a,b)=>a>=0&&b>=0&&a<n&&b<n&&validFloor(a*size,b*size);
 const nearest=p=>{let best=null,d=Infinity;for(let a=0;a<n;a++)for(let b=0;b<n;b++)if(free(a,b)){const dd=(a*size-p.u)**2+(b*size-p.v)**2;if(dd<d){d=dd;best=[a,b]}}return best};
 const start=nearest(g.cat),end=nearest({u,v});if(!start||!end)return[];
 const queue=[start],seen=new Map([[key(...start),null]]);let found=false;
 for(let i=0;i<queue.length;i++){const [a,b]=queue[i];if(a===end[0]&&b===end[1]){found=true;break}for(const [da,db]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const aa=a+da,bb=b+db,k=key(aa,bb);if(free(aa,bb)&&!seen.has(k)&&(!da||!db||free(aa,b)&&free(a,bb))){seen.set(k,[a,b]);queue.push([aa,bb])}}}
 if(!found)return[];const result=[{u,v}];let at=end;while(at&&(at[0]!==start[0]||at[1]!==start[1])){result.unshift({u:at[0]*size,v:at[1]*size});at=seen.get(key(...at))}return result;
}
function travel(u,v){if(!validFloor(u,v))return;g.route=pathTo(u,v);g.target=g.route.shift()||{u,v};g.destination={u,v};g.mode='walking';g.nextWander=clock+9}
function dist(a,b){return Math.hypot(a.u-b.u,a.v-b.v)}
function isCat(p){const c=P(g.cat.u,g.cat.v);return Math.hypot((p.x-c.x)/1.1,(p.y-(c.y-17))*1.3)<35}
function interact(p){if(paused||g.won||$('modal').open)return;
 if(g.mode==='hidden'){const correct=objects.find(o=>o.id===g.hiddenAt);if(g.tool==='explore'&&correct&&dist(p,correct)<50){reveal();return}if(g.tool!=='food'){say('Shh… he is hiding. Look for a twitching tail, or tempt him out with a fish treat.');return}}
 const catHit=isCat(p)&&g.mode!=='hidden';
 if(g.tool==='explore'){if(catHit){say(g.trust>=50?'Purr, purr… Ginger brushes against your hand. You are becoming good friends.':'Ginger tilts his head. A little playtime first, maybe?');burst(g.cat.u,g.cat.v,'note',2)}else{const nearest=objects.find(o=>dist(p,o)<48);if(nearest)inspect(nearest.id);else say('The wooden floor is warm. Offer a fish treat or a little feather game to invite Ginger over.')}return}
 if(g.tool==='food'){
  if(g.foods<=0){say('That was the last treat for today. Playing and gentle pets build trust, too.');return}
  if(g.food){say('There is already a treat on the floor. Let Ginger finish it first.');return}
  if(!validFloor(p.u,p.v)){say('Try a clear spot on the wooden floor or rug, away from the furniture.');return}
  g.food={u:p.u,v:p.v,progress:0};g.foods--;if(g.mode==='hidden'){reveal(false);g.fear=Math.min(g.fear,25)}g.fear=Math.max(0,g.fear-12);travel(p.u,p.v);say('He caught the scent! Ginger is on his way. Finishing the treat will help him trust you.');chime();updateUI();return}
 if(g.tool==='toy'){
  if(g.food){say('Ginger has spotted the treat. Let him walk over and finish it before you play.');return}
  if(!validFloor(p.u,p.v)&&!catHit){say('Keep the feather low. Try a clear patch of floor in the room.');return}
  if(dist(g.cat,p)<78&&clock-g.lastPlay>1.1){g.lastPlay=clock;g.pounces++;g.trust=clamp(g.trust+12,0,100);g.fear=Math.max(0,g.fear-9);g.stats.plays++;g.mode='pouncing';g.motion=.6;g.target=null;burst(g.cat.u,g.cat.v,'star');chime();say(g.pounces%3===0?'Got it! Ginger raises his tail proudly. You two are the best of playmates.':`Pounce! This little feather is fun. Play with him a little longer. (${Math.min(g.pounces,3)} / 3)`);if(g.pounces>=3)earn('play')}
  else if(clock-g.lastPlay<=1.1)say('Give him a moment to catch his breath, then wiggle the feather again.');else{travel(p.u,p.v);say('The feather moves! Ginger is coming over. Click again when he is close enough to pounce.')}return}
 if(g.tool==='pet'){if(!catHit){say('Press and hold gently on Ginger until the little heart fills up.');return}if(g.fear>30||g.mode==='walking'||g.mode==='pouncing'){say('He is a little restless right now. Give him a moment to settle down.');return}if(g.mode==='eating'){say('A good meal deserves some peace. Let him finish before you pet him.');return}if(clock<g.petCooldown){say('Purr… let him enjoy that lovely feeling for a moment before another pet.');return}held=true;g.target=null;g.mode='petting';g.pet=0;say('Softly, softly… keep holding still. Let Ginger feel how gentle you can be.');return}
 if(g.tool==='catch'){
  if(!catHit){say('Click Ginger when he is ready. A lovely cuddle needs a willing cat.');return}
  if(g.trust<75||g.fear>=30||g.mode==='eating'){g.fear=clamp(g.fear+15,0,100);say(g.mode==='eating'?'Let him finish his meal first. That fish treat is far too good to miss.':'A little more trust first. Offer a treat, play a game, or try a gentle head pet.');burst(g.cat.u,g.cat.v,'alert',2);if(g.fear>65)hide();return}win()
 }
}
function inspect(id){if(paused||g.won)return;const o=objects.find(o=>o.id===id);if(g.mode==='hidden'&&g.hiddenAt===id){reveal();return}if(g.mode==='hidden'){say('Nobody here… look for a little tail peeking out somewhere else.');return}if(g.tool!=='explore'){setTool('explore')}if(!g.found.has(id)){g.found.add(id);g.trust=clamp(g.trust+5,0,100);burst(o.u,o.v,'star',4);chime();if(g.found.size>=3)earn('curious')}say(o.text,'A LITTLE DISCOVERY · '+o.label);if(id==='radio'){burst(o.u,o.v,'note',5);chime('stamp')}updateUI()}
function hide(){g.mode='hidden';g.hiddenAt=Math.random()<.5?'box':'cushion';g.hideUntil=clock+9;g.target=null;g.pet=0;held=false;say('Whoosh! He is hiding. Look for a tail behind the box or cushion, and help him feel safe again.');chime('scare')}
function reveal(talk=true){const o=objects.find(o=>o.id===g.hiddenAt);g.cat={u:o.id==='box'?100:265,v:o.id==='box'?268:119};g.hiddenAt=null;g.mode='idle';g.fear=Math.max(15,g.fear-25);g.nextWander=clock+5;if(talk)say('Found you! Ginger peeks out. Softly this time, okay?');burst(g.cat.u,g.cat.v,'note',3)}
function win(){g.won=true;g.mode='happy';g.target=null;held=false;earn('hug');burst(g.cat.u,g.cat.v,'heart',18);chime('win');say('A cuddle at last! A little patience has earned you a warm, fluffy friend.');updateUI();showModal(`<p class="eyebrow">A SMALL MOMENT, A BIG FRIENDSHIP</p><div class="win-art">ฅ ♡ ฅ</div><h2>Chosen by a cat.</h2><p>Ginger nestles into your arms with a tiny, contented purr.<br>You made this little afternoon a gentler place to be.</p><div class="result"><div><b>${Math.round(g.trust)}</b><small>TRUST EARNED</small></div><div><b>${g.found.size}</b><small>SECRETS FOUND</small></div><div><b>${g.stats.plays+g.stats.pets+g.stats.snacks}</b><small>KIND MOMENTS</small></div></div><button class="primary" id="again">Another little afternoon →</button><p class="modal-note">“Chosen by a Cat” has been added to your afternoon album.</p>`);$('again').onclick=()=>{$('modal').close();reset()}}
function update(dt){if(paused||g.won||$('modal').open)return;g.fear=Math.max(0,g.fear-dt*5);g.petCooldown=Math.max(g.petCooldown,0);
 if(g.mode==='hidden'){if(clock>g.hideUntil)reveal();return}
 if(g.tool==='toy'&&!g.food&&g.mode!=='eating'&&g.mode!=='pouncing'&&validFloor(pointer.u,pointer.v)&&pointer.x>=0&&dist(g.cat,pointer)>24&&(!g.destination||dist(g.destination,pointer)>22)&&clock>(g.routeAt||0)){travel(pointer.u,pointer.v);g.routeAt=clock+.35}
 if(g.target&&g.mode==='walking'){
  const d=dist(g.cat,g.target),speed=g.tool==='toy'?85:47;
  if(d<3){g.cat={...g.target};g.target=g.route?.shift()||null;if(!g.target){g.destination=null;g.mode=g.food&&dist(g.cat,g.food)<8?'eating':'idle';g.nextWander=clock+6}}
  else{const step=Math.min(d,speed*dt);g.cat.u+=(g.target.u-g.cat.u)/d*step;g.cat.v+=(g.target.v-g.cat.v)/d*step;if(Math.random()<dt*4){g.steps.push({u:g.cat.u,v:g.cat.v,life:1})}}
 }
 if(g.mode==='eating'&&g.food){g.food.progress+=dt;if(g.food.progress>2.8){g.food=null;g.trust=clamp(g.trust+25,0,100);g.fear=Math.max(0,g.fear-25);g.fed++;g.stats.snacks++;g.mode='idle';g.nextWander=clock+7;earn('snack');burst(g.cat.u,g.cat.v,'heart');chime();say('Crunch, crunch. Delicious! Trust +25. Ginger is happy to let you a little closer.')}}
 if(g.mode==='pouncing'){g.motion-=dt;if(g.motion<=0){g.mode='idle';g.nextWander=clock+6}}
 if(g.mode==='petting'){
  if(held&&(hoverCat||keyboard)){g.pet+=dt;if(g.pet>=1.8){g.trust=clamp(g.trust+18,0,100);g.fear=Math.max(0,g.fear-20);g.petDone=true;g.stats.pets++;g.mode='idle';g.pet=0;g.petCooldown=clock+3;held=false;g.nextWander=clock+8;earn('gentle');burst(g.cat.u,g.cat.v,'heart');chime();say('Purr, purr… his eyes drift closed. Trust +18. The room feels a little safer now.')}}
  else{g.mode='idle';g.pet=0;if(clock-lastPetMessage>2){lastPetMessage=clock;say('No rush. Try again: press and hold gently on Ginger for a little longer.')}}
 }
 if(g.mode==='idle'&&clock>g.nextWander){g.nextWander=clock+6+Math.random()*6;const u=100+Math.random()*160,v=130+Math.random()*125;if(validFloor(u,v))travel(u,v)}
}
function updateUI(){const trust=Math.round(g.trust),fear=Math.round(g.fear);const mood=g.won?'● Purring happily':g.mode==='hidden'?'● Hiding away':g.mode==='eating'?'● Enjoying a treat':g.mode==='petting'?'● Enjoying a head pet':g.mode==='pouncing'?'● Pouncing happily':fear>30?'● A little nervous':trust>=75?'● Ready for a cuddle':trust>35?'● Warming up to you':'● Just looking around';const key=[trust,fear,mood,g.tool,g.foods,g.found.size,g.won,g.pounces,g.petDone].join('|');if(prevUI===key)return;prevUI=key;$('trustValue').textContent=`${trust} / 100`;$('fearValue').textContent=`${fear} / 100`;$('trustBar').style.width=trust+'%';$('fearBar').style.width=fear+'%';$('mood').textContent=mood;$('foodCount').textContent=g.foods;$('stateNote').textContent=trust>=75?'He is ready! Choose Cuddle, then click Ginger.':'Reach 75 trust to ask for a cuddle.';
 const tasks=[g.found.size>=3,g.fed>0||g.pounces>=3||g.petDone,g.won];['taskExplore','taskPlay','taskCatch'].forEach((id,i)=>{$(id).classList.toggle('done',tasks[i]);$(id).querySelector('.check').textContent=tasks[i]?'✓':`0${i+1}`});$('taskCount').textContent=`${tasks.filter(Boolean).length} / 3`;
 document.querySelectorAll('[data-tool]').forEach(b=>{const active=b.dataset.tool===g.tool;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));b.disabled=b.dataset.tool==='food'&&g.foods<=0});hotspotButtons.forEach(({button,o})=>{const found=g.found.has(o.id);button.classList.toggle('found',found);button.textContent=found?'✓':'✦';button.setAttribute('aria-label',`Explore ${o.label}${found?', discovered':''}`);button.style.visibility=g.tool==='explore'?'visible':'hidden';button.disabled=paused||g.won});
 $('hint').textContent=g.mode==='hidden'?'Look for a tail behind the box or sofa cushion.':trust>=75?'Ginger trusts you now. Try a cuddle!':g.food?'Let Ginger wander over and finish his treat.':g.tool==='pet'?'Hold on Ginger for 1.8 seconds to fill the heart.':g.tool==='toy'?'Click when Ginger is close to let him pounce.':'Treats, playtime, and gentle pets all build trust.';
 $('sceneTip').textContent={explore:'Click a sparkle to discover a little secret',food:'Leave a treat on clear floor and let Ginger come over',toy:'Move the feather · Click near Ginger for a pounce',pet:'When Ginger is calm, hold on him for 1.8 seconds',catch:'Trust ≥ 75 · Alertness < 30 · Click Ginger for a cuddle'}[g.tool];$('albumCount').textContent=`${memory.length} / 5 memory stamps`;canvas.setAttribute('aria-label',`Pixel room. Ginger: ${mood.slice(2)}. Trust ${trust}, alertness ${fear}. Selected tool: ${document.querySelector('[data-tool="'+g.tool+'"] b').textContent}. Arrow keys move the cursor; Enter interacts.`)}
function showModal(html){held=false;if(g.mode==='petting'){g.mode='idle';g.pet=0}$('modalContent').innerHTML=html;if(!$('modal').open)$('modal').showModal()}
function help(){showModal('<p class="eyebrow">A GUIDE TO A SLOW AFTERNOON</p><h2>Make friends with Ginger.</h2><p>There is no timer. Earn a little trust, then share a cuddle.</p><ol><li><b>Explore the room:</b>Choose Explore and click the sparkling objects to discover their stories.</li><li><b>Offer a treat:</b>Click a clear spot on the floor. Once Ginger walks over and finishes eating, trust +25. You have 3 treats each round.</li><li><b>Play together:</b>Choose Feather Wand and move it over clear floor to invite him closer. Click near him for a pounce and trust +12. Let him finish his jump before playing again.</li><li><b>Pet him gently:</b>When he is still and alertness is no higher than 30, hold on him for 1.8 seconds for trust +18. Allow a 3-second break between pets.</li><li><b>Share a cuddle:</b>With trust at least 75 and alertness below 30, choose Cuddle and click Ginger. Asking too soon makes him nervous. Sudden mouse movements near him can also startle him.</li></ol><p class="modal-note">Keyboard: 1–5 select tools · Arrows move the floor cursor · Enter uses a tool / hold to pet · Space pauses · Esc closes dialogs. Use Tab to focus objects or Ginger, then press Enter.</p><button class="primary" id="begin">Meet Ginger →</button>');$('begin').onclick=()=>$('modal').close()}
function album(){showModal(`<p class="eyebrow">OUR LITTLE COLLECTION</p><h2>Our afternoon album</h2><p>The little things you do together deserve to be remembered.</p><div class="stamps">${stamps.map(([id,icon,name,desc])=>`<div class="stamp ${memory.includes(id)?'earned':''}"><span>${icon}</span><div><b>${name} ${memory.includes(id)?'✓':'· Not yet earned'}</b><p>${desc}</p></div></div>`).join('')}</div><p class="modal-note">Your memories stay in this browser when you start over. Private browsing or browser restrictions may prevent them from being saved.</p>`)}

// Native canvas artwork: every piece of furniture is drawn locally, without image downloads.
function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(Math.round(p.x),Math.round(p.y)):ctx.moveTo(Math.round(p.x),Math.round(p.y)));ctx.closePath();ctx.fill()}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function line(a,b,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(Math.round(a.x),Math.round(a.y));ctx.lineTo(Math.round(b.x),Math.round(b.y));ctx.stroke()}
function plane(u,v,w,d,z,c){polygon([P(u,v,z),P(u+w,v,z),P(u+w,v+d,z),P(u,v+d,z)],c)}
function box(u,v,w,d,h,z=0,colors=[C.woodLight,C.wood,C.woodDark]){plane(u,v,w,d,z+h,colors[0]);polygon([P(u,v+d,z),P(u+w,v+d,z),P(u+w,v+d,z+h),P(u,v+d,z+h)],colors[1]);polygon([P(u+w,v,z),P(u+w,v+d,z),P(u+w,v+d,z+h),P(u+w,v,z+h)],colors[2])}
function shadow(u,v,w,d){ctx.globalAlpha=.13;plane(u,v,w,d,1,'#3d3430');ctx.globalAlpha=1}
function pot(u,v,z,size=1,flowers=false){box(u-8*size,v-8*size,16*size,16*size,18*size,z,['#bd8059','#a56348','#7e4f3c']);box(u-10*size,v-10*size,20*size,20*size,5*size,z+16*size,['#d39963','#b87752','#946044']);const p=P(u,v,z+20*size);for(let i=0;i<9;i++){const a=i*2.4,x=p.x+Math.sin(a)*19*size,y=p.y-13*size-Math.abs(Math.cos(a))*23*size;line(p,{x,y},'#59714d',2*size);rect(x-5*size,y-4*size,10*size,7*size,['#698751','#8a9a5b','#506f50'][i%3]);rect(x-2*size,y-7*size,6*size,5*size,'#91a26b');if(flowers&&i%2===0){rect(x-4*size,y-9*size,8*size,7*size,'#c9888c');rect(x-1*size,y-7*size,3*size,3*size,'#f3d298')}}}
function book(u,v,w,d,h,z,c){box(u,v,w,d,h,z,[c,c,'#675348']);const p=P(u+w*.5,v+d,z+h*.75);rect(p.x-2,p.y,4,2,'#dfc99f')}
function frameWall(u,v,z,w,h,side,palette){const a=P(u,v,z);const dir=side==='left'?-1:1;const p=(x,y)=>({x:a.x+dir*x,y:a.y+x*.48-y});polygon([p(0,0),p(w,0),p(w,h),p(0,h)],'#75533e');polygon([p(3,4),p(w-3,4),p(w-3,h-3),p(3,h-3)],'#f3e2b7');polygon([p(6,7),p(w-6,7),p(w-6,h-6),p(6,h-6)],palette[0]);polygon([p(6,7),p(w-6,7),p(w-6,h*.45),p(w*.65,h*.7),p(w*.4,h*.35),p(6,h*.55)],palette[1]);const sun=p(w*.7,h*.72);rect(sun.x-3,sun.y-3,6,6,palette[2])}
function walls(t){
 // floating diorama base, warm wallpaper, and cedar wainscoting
 box(0,0,350,350,16,-16,['#b87c52','#87503e','#694637']);
 polygon([P(0,0,0),P(0,350,0),P(0,350,166),P(0,0,166)],'#d7c599');
 polygon([P(0,0,0),P(350,0,0),P(350,0,166),P(0,0,166)],'#e7d5aa');
 for(let n=0;n<350;n+=24){polygon([P(0,n,0),P(0,n+11,0),P(0,n+11,163),P(0,n,163)],'#cdbc94');polygon([P(n,0,0),P(n+11,0,0),P(n+11,0,163),P(n,0,163)],'#ddcba0')}
 polygon([P(0,0,0),P(0,350,0),P(0,350,52),P(0,0,52)],'#a36646');polygon([P(0,0,0),P(350,0,0),P(350,0,52),P(0,0,52)],'#af724c');
 for(let n=0;n<350;n+=12){line(P(0,n,2),P(0,n,50),'#81553e',2);line(P(n,0,2),P(n,0,50),'#956041',2);line(P(0,n+3,3),P(0,n+3,50),'#be8a59');line(P(n+3,0,3),P(n+3,0,50),'#d0925c')}
 box(-4,0,4,353,6,51,['#c58f58','#b97e4c','#8c583c']);box(0,-4,354,4,6,51,['#d69c61','#c58a51','#946044']);
 box(-5,-5,5,360,7,165,['#c18450','#9a5e3e','#8b5339']);box(0,-5,355,5,7,165,['#d59b5e','#b37446','#965c3d']);
 // individual staggered floorboards with grain
 for(let u=0;u<350;u+=35){for(let v=0;v<350;v+=35){plane(u+1,v+1,33,33,1,((u/35+v/35)%3===0)?'#c08a5d':((u/35)%2===0?'#c89465':'#c38a5c'));if((u+v)%70===0)line(P(u+8,v+12,2),P(u+26,v+12,2),'#b17b53');}}
 // afternoon window, drawn along the right wall
 const a=91,b=271;polygon([P(a,1,73),P(b,1,73),P(b,1,154),P(a,1,154)],'#89613f');polygon([P(a+5,2,77),P(b-5,2,77),P(b-5,2,150),P(a+5,2,150)],night?'#455670':'#eaf0b6');
 for(let u=100;u<264;u+=24){polygon([P(u,3,80),P(u+18,3,80),P(u+18,3,147),P(u,3,147)],night?'#536784':'#bed09a');for(let n=0;n<3;n++){const z=86+n*19;polygon([P(u+2,4,z),P(u+17,4,z),P(u+17,4,z+9),P(u+2,4,z+9)],night?['#6e7c95','#455b7b','#586b88'][n]:['#87a678','#a0b77e','#c3d899'][n])}line(P(u-3,5,78),P(u-3,5,150),'#fff0c7',4)}
 for(const z of [79,113,149])line(P(96,6,z),P(266,6,z),'#fff1c9',4);
 box(88,-1,188,13,5,72,['#e9c58e','#be8853','#a26c43']);
 // curtains with visible folded edges
 for(const u of [84,271]){for(let i=0;i<4;i++)box(u+i*3,7,3,6,90,70,[i%2?'#a5ad86':'#bdc399',i%2?'#8e9b79':'#acb68d','#79866c']);const p=P(u+6,15,98);rect(p.x-7,p.y,17,4,'#cfad76')}
 frameWall(0,34,79,43,43,'left',['#8c9d81','#d2ba84','#f0d5a0']);
 frameWall(0,100,98,28,35,'left',['#acaa83','#c08260','#ebc488']);
 frameWall(0,158,98,34,43,'left',['#7e9b95','#b7b887','#f1d6a1']);
 // cat portrait: a miniature local drawing in the third frame
 const catPic=P(0,177,119);rect(catPic.x-6,catPic.y-3,12,13,'#c79360');rect(catPic.x-6,catPic.y-7,4,5,'#c79360');rect(catPic.x+3,catPic.y-7,4,5,'#c79360');rect(catPic.x-4,catPic.y,2,2,'#5b4d3b');rect(catPic.x+3,catPic.y,2,2,'#5b4d3b');
 frameWall(300,0,87,29,38,'right',['#c6b183','#7b8d6b','#f0d6a0']);
 // green entrance door on the left with brass handle and small welcome mat
 polygon([P(1,281,2),P(1,343,2),P(1,343,139),P(1,281,139)],'#795640');polygon([P(3,286,4),P(3,337,4),P(3,337,133),P(3,286,133)],'#738d79');
 for(let v=291;v<336;v+=8)line(P(4,v,9),P(4,v,129),'#607966');line(P(4,289,73),P(4,335,73),'#a1b49a',3);const handle=P(7,296,60);rect(handle.x-3,handle.y,7,4,'#d8b574');plane(9,288,36,48,3,'#718875');plane(12,291,30,42,4,'#90a087');const paw=P(28,314,4);rect(paw.x-3,paw.y-2,7,5,'#c6b58a');
 // vines and shelf above the framed pictures
 box(0,205,25,58,5,105,['#c48a56','#a86c48','#80533d']);pot(12,218,110,.65,true);book(6,238,6,17,24,110,'#8a8e72');book(12,240,5,17,20,110,'#b98361');
}
function rug(){plane(96,93,202,172,2,'#526d62');plane(100,97,194,164,3,'#8da38a');plane(109,106,176,146,4,'#c3c6a1');plane(114,111,166,136,5,'#a3b293');for(let u=109;u<290;u+=9){line(P(u,94,3),P(u,88,3),'#e5d2a3',2);line(P(u,263,3),P(u,269,3),'#e5d2a3',2)}for(let u=120;u<278;u+=20)for(let v=115;v<245;v+=20){plane(u,v,3,3,6,'#8da084')};plane(159,152,44,33,6,'#c5c6a2');plane(173,144,15,49,6,'#c5c6a2')}
function sofa(){shadow(210,30,125,82);for(const u of [211,320])for(const v of [29,88])box(u,v,7,7,15,0,['#9a6749','#82533c','#654738']);box(205,24,126,72,25,13,['#dcb887','#c8a077','#ac825b']);box(204,19,128,16,59,18,['#e7c997','#d8b787','#b49065']);for(let u=213;u<320;u+=36){box(u,32,32,50,13,34,['#f0d6a4','#e4c590','#c6a371']);box(u,23,32,8,39,42,['#f3d7a2','#e9c996','#cba775']);const p=P(u+16,32,61);rect(p.x-2,p.y-2,4,4,'#cfac76');line(P(u+3,80,49),P(u+29,80,49),'#f6dfb4')}
 box(199,24,15,75,38,20,['#e6c894','#dabc88','#b48d63']);box(326,24,14,75,38,20,['#efcf9d','#d8b584','#b28a60']);box(283,49,23,28,12,49,['#879675','#a6ae88','#718164']);for(let u=286;u<307;u+=6)line(P(u,51,62),P(u,72,62),'#c7c3a0',2);
 // striped knitted throw
 for(let u=220;u<241;u+=4){box(u,62,4,36,2,49,['#bb8e73','#aa7c63','#956c58']);line(P(u,98,49),P(u,98,30),'#bb8e73',3)}
}
function bookcase(){shadow(7,106,60,143);box(7,107,48,139,75,2,['#b48255','#956445','#76513d']);box(6,104,52,145,6,77,['#ca9760','#b68454','#8d6141']);for(let v=112;v<241;v+=43){box(9,v,44,38,59,10,['#795d43','#72513c','#694c39']);box(10,v+35,43,4,5,35,['#c08e5b','#b27b4e','#875c40']);for(let j=0;j<4;j++){const h=16+(j%3)*5;book(20,v+3+j*7,30,5,h,41,['#82917a','#c5a178','#b67f65','#899e9a'][j])}for(let j=0;j<3;j++)book(20,v+4+j*9,30,7,19+j%2*4,13,['#b59c71','#8c8b71','#ba876b'][j])}pot(28,118,83,.8);box(13,188,29,22,5,84,['#d8c69e','#c7b48b','#a59476']);book(15,192,25,16,4,89,'#89947f');const p=P(26,226,89);rect(p.x-6,p.y-12,12,14,'#dec699');rect(p.x-4,p.y-10,8,8,'#796650');rect(p.x-1,p.y-9,2,7,'#ded1a7')}
function coffeeTable(){shadow(122,116,79,57);for(const u of [126,190])for(const v of [119,159])box(u,v,5,5,32,3,['#c18f59','#a77348','#885d3d']);box(119,111,83,59,6,34,['#eed5a3','#d6b984','#bb975f']);box(130,121,26,22,2,41,['#9aa491','#929a7c','#67745f']);box(133,123,23,20,2,43,['#dfcb9e','#cfb58b','#af956e']);box(134,122,5,21,2,45,['#ae7c5c','#aa7958','#966b4f']);pot(181,127,41,.55,true);box(157,149,13,13,12,41,['#f1e1b7','#d6c393','#b9a77e']);const p=P(163,156,56);line({x:p.x+8,y:p.y+5},{x:p.x+14,y:p.y+1},'#e6d3a6',3);if(!night){ctx.globalAlpha=.2;line({x:p.x,y:p.y-6},{x:p.x+2,y:p.y-15-Math.sin(clock)*2},'#fff8d4',2);ctx.globalAlpha=1}}
function radio(){box(154,13,56,27,40,0,['#af8155','#946444','#78563e']);box(152,11,59,31,5,40,['#d2a16c','#b48558','#91633f']);box(161,17,37,20,24,45,['#7e826a','#66745e','#52604e']);const p=P(178,38,59);rect(p.x-12,p.y-9,25,15,'#343f3b');for(let i=0;i<5;i++)rect(p.x-9+i*4,p.y-6,2,9,'#98a088');rect(p.x-6,p.y-14,14,3,'#d6c493');const knob=P(192,39,52);rect(knob.x,knob.y,5,5,'#d6bf8e');line(P(166,20,69),P(158,20,102),'#6a6758',2)}
function lamp(){const u=292,v=15;box(u-11,v-9,23,19,5,0,['#86816a','#716c58','#565545']);box(u-2,v-2,4,4,95,5,['#a89b76','#8a8064','#71694e']);const a=P(u,v,98);polygon([{x:a.x-21,y:a.y},{x:a.x+21,y:a.y},{x:a.x+13,y:a.y-29},{x:a.x-12,y:a.y-29}],night?'#f9d98b':'#f0dfac');rect(a.x-22,a.y,45,4,'#b89b6e');rect(a.x-12,a.y-30,26,3,'#d1b98a');for(let i=-12;i<16;i+=6)line({x:a.x+i,y:a.y-26},{x:a.x+i*1.3,y:a.y-2},'#dfc798');if(night){const glow=ctx.createRadialGradient(a.x,a.y,1,a.x,a.y,95);glow.addColorStop(0,'#ffe3a54d');glow.addColorStop(1,'#ffe3a500');ctx.fillStyle=glow;ctx.fillRect(a.x-95,a.y-95,190,190)}}
function boxHide(){box(20,270,62,48,33,2,['#c49968','#b18454','#956d48']);plane(22,273,58,40,36,'#70563e');box(18,268,67,7,3,35,['#ddb784','#c49a66','#a17b52']);box(18,314,67,7,3,35,['#d3ab76','#bf955f','#987349']);plane(18,269,22,51,38,'#c9a16f');line(P(41,272,39),P(41,317,39),'#a57f53');const p=P(80,293,18);rect(p.x-11,p.y-8,20,12,'#dfc799');rect(p.x-7,p.y-5,12,2,'#a48c65');rect(p.x-5,p.y-1,8,2,'#a48c65');const b=P(43,318,14);rect(b.x-10,b.y-2,20,4,'#997148')}
function catTree(){const u=300,v=270;shadow(u-14,v-14,42,40);box(u-13,v-15,41,40,7,1,['#b9aa7e','#a4916b','#867557']);box(u,v,9,9,78,8,['#c1af82','#a9966f','#94815e']);for(let z=13;z<84;z+=5)line(P(u+9,v,z),P(u+9,v+9,z),'#81765b');box(u-17,v-15,43,39,6,86,['#96a082','#7f8c70','#66745c']);box(u+10,v+14,9,9,39,8,['#baa47a','#a38c66','#8d7658']);box(u+1,v+7,38,32,5,49,['#d8c59a','#baaa83','#a0916e']);const p=P(u+1,v+10,92);rect(p.x-4,p.y+4,8,8,'#c0b698');line({x:p.x,y:p.y+8},{x:p.x-3,y:p.y+25},'#766950');rect(p.x-7,p.y+23,8,8,'#b88865')}
function bowl(){box(265,169,26,24,8,2,['#d1c2a1','#ad9b7d','#96866b']);plane(269,173,18,16,11,'#788f94');plane(271,174,12,11,12,'#a1b9b0');const p=P(279,180,12);rect(p.x,p.y,4,1,'#e1d9ba')}
function decor(){// entry slippers, plant stand, toy ball and handwoven floor basket
 for(let i=0;i<2;i++){box(75+i*12,87+i*4,8,19,4,1,['#a3aa8a','#7e8c70','#68765e']);plane(76+i*12,89+i*4,6,8,6,'#c4c5a1')}
 box(313,23,27,28,46,0,['#b58555','#9c6c47','#7a553c']);pot(327,37,46,1.12,true);
 box(91,265,24,20,4,0,['#aa8267','#966f56','#77553f']);const p=P(175,275,7);rect(p.x-5,p.y-4,10,8,'#b68369');rect(p.x-3,p.y-7,6,12,'#c89579');rect(p.x-6,p.y-1,12,2,'#e0bd8e');line({x:p.x+4,y:p.y},{x:p.x+16,y:p.y+5},'#9c825d');
 // hanging foliage at the top left corner
 const hanging=P(0,17,152);line({x:hanging.x,y:hanging.y-10},{x:hanging.x,y:hanging.y+12},'#8b8364');for(let i=0;i<7;i++){rect(hanging.x-7+(i%3)*6,hanging.y+8+i*5,9,7,i%2?'#728558':'#8d9b67')}
}
function drawCat(x,y,t,scale=1,mood='idle',facing=1){ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale*facing,scale);ctx.globalAlpha=.16;rect(-23,-1,46,9,'#4b4739');ctx.globalAlpha=1;
 const walking=mood==='walking',jump=mood==='pouncing'?Math.sin((.6-g.motion)/.6*Math.PI)*13:0,breathe=Math.round(Math.sin(t*2.5));ctx.translate(0,-jump+breathe);
 // deliberately stepped pixel silhouette, cream belly and ginger stripes
 const tail=Math.round(Math.sin(t*3)*3);rect(15,-15,16,6,'#ad764c');rect(28,-27+tail,6,16,'#ad764c');rect(27,-30+tail,7,7,'#d1a06a');rect(28,-18+tail,6,3,'#805c41');
 rect(-20,-25,35,24,'#bc8958');rect(-17,-30,29,23,'#d5a16a');rect(-14,-34,25,12,'#dbac73');rect(-21,-49,7,18,'#d4a06a');rect(7,-49,7,18,'#d4a06a');rect(-24,-40,41,24,'#d6a16a');rect(-20,-43,33,29,'#e2b17a');rect(-18,-45,6,8,'#d5a06b');rect(5,-45,7,8,'#d5a06b');rect(-18,-42,4,5,'#c78e77');rect(7,-43,4,6,'#c78e77');
 rect(-6,-40,4,7,'#a7774e');rect(-14,-39,4,5,'#bd8a58');rect(4,-39,4,5,'#bd8a58');rect(-20,-27,6,4,'#c69560');rect(8,-27,6,4,'#c69560');rect(-9,-22,15,19,'#f2d9a9');rect(-12,-24,21,8,'#efcf9f');
 const sleepy=mood==='petting'||mood==='happy'||(mood==='idle'&&Math.sin(t*.6)>.97);if(sleepy){rect(-15,-32,7,2,'#624c3a');rect(3,-32,7,2,'#624c3a')}else{rect(-15,-34,5,6,'#4d4935');rect(4,-34,5,6,'#4d4935');rect(-14,-34,2,2,'#fff1bd');rect(5,-34,2,2,'#fff1bd')}
 rect(-5,-26,5,3,'#b98270');rect(-3,-23,2,3,'#7e5944');rect(-7,-21,4,1,'#92694c');rect(-1,-21,4,1,'#92694c');rect(-24,-26,8,1,'#8b7152');rect(12,-26,9,1,'#8b7152');rect(-25,-23,9,1,'#8b7152');rect(12,-23,10,1,'#8b7152');
 const step=walking?Math.round(Math.sin(t*16)*3):0;rect(-18,-4+step,12,6,'#efd2a1');rect(3,-4-step,12,6,'#efd2a1');rect(-18,-15,5,4,'#9b704a');rect(12,-16,5,4,'#9b704a');
 if(mood==='eating'){rect(13,-22,4,3,'#e7bc7c');rect(19,-18,3,3,'#e7bc7c')}
 ctx.restore()}
function heart(x,y,size,color){rect(x-size,y-size,size,size,color);rect(x+size,y-size,size,size,color);rect(x-size,y,size*3,size,color);rect(x,y+size,size,size,color)}
function drawFood(){if(!g.food)return;const p=P(g.food.u,g.food.v,4);ctx.globalAlpha=.15;rect(p.x-17,p.y,34,8,'#594739');ctx.globalAlpha=1;rect(p.x-17,p.y-3,34,7,'#d0b380');rect(p.x-14,p.y-5,28,5,'#f1d7a3');for(let i=0;i<3;i++){rect(p.x-10+i*8,p.y-8,6,3,'#ad7b49');rect(p.x-12+i*8,p.y-9,3,5,'#c4945c')}if(g.mode!=='eating'){const a=p.y-20-Math.sin(clock*3)*3;heart(p.x,a,2,'#c58c65')}}
function atmosphere(t){if(night){ctx.globalAlpha=.21;rect(0,0,W,H,'#252d54');ctx.globalAlpha=1;const windowPos=P(188,10,110);for(let i=0;i<8;i++){const x=windowPos.x-58+i*18,y=windowPos.y-17+(i%3)*13;rect(x,y,2,2,'#f7e8c0')}}else{ctx.globalAlpha=.10;polygon([P(102,5,73),P(260,5,73),P(293,246,3),P(170,246,3)],'#fff9ce');ctx.globalAlpha=.08;polygon([P(137,12,73),P(173,12,73),P(231,220,4),P(200,220,4)],'#fff9df');ctx.globalAlpha=1}
 for(let i=0;i<18;i++){const x=150+((i*49+t*(3+i%3))%510),y=90+((i*31-t*(2+i%2))%280+280)%280;ctx.globalAlpha=.14+Math.sin(t+i)*.1;rect(x,y,i%3===0?2:1,2,night?'#fff0c8':'#fff9da')}ctx.globalAlpha=1}
function draw(t,dt){ctx.clearRect(0,0,W,H);rect(0,0,W,H,night?'#b5b2b0':'#e7ddc4');
 // sparse landscape framing the floating house
 ctx.globalAlpha=.35;polygon([{x:0,y:385},{x:58,y:350},{x:388,y:510},{x:343,y:530},{x:0,y:530}],'#b7bc93');polygon([{x:800,y:345},{x:735,y:366},{x:440,y:530},{x:800,y:530}],'#c5bf98');ctx.globalAlpha=1;
 const baseShadow=[{x:45,y:337},{x:401,y:507},{x:765,y:332},{x:405,y:157}];ctx.globalAlpha=.12;polygon(baseShadow,'#665b4a');ctx.globalAlpha=1;
 walls(t);rug();radio();lamp();sofa();bookcase();
 g.steps=g.steps.filter(p=>p.life>0);for(const step of g.steps){if(!paused&&!$('modal').open)step.life-=dt;const p=P(step.u,step.v,7);ctx.globalAlpha=Math.max(0,step.life)*.13;rect(p.x-2,p.y,4,2,'#775d43');ctx.globalAlpha=1}
 // Sort foreground props and the moving cat by floor depth for proper occlusion.
 const items=[{d:288,f:coffeeTable},{d:97,f:()=>pot(327,37,46,1.12,true)},{d:590,f:catTree},{d:638,f:()=>{}},{d:335,f:boxHide},{d:434,f:bowl}];
 if(g.mode!=='hidden')items.push({d:g.cat.u+g.cat.v,f:()=>{const p=P(g.cat.u,g.cat.v,5);drawCat(p.x,p.y,t,1.08,g.mode,g.target&&g.target.u<g.cat.u?-1:1)}});
 if(g.food)items.push({d:g.food.u+g.food.v,f:drawFood});items.sort((a,b)=>a.d-b.d).forEach(o=>o.f());decor();
 if(g.mode==='hidden'){const o=objects.find(o=>o.id===g.hiddenAt),p=P(o.u,o.v,o.id==='box'?37:60),wiggle=Math.sin(t*4)*4;rect(p.x+15,p.y-8,19,6,'#c8925d');rect(p.x+28,p.y-18+wiggle,6,15,'#dfa86e');rect(p.x+28,p.y-9+wiggle,6,3,'#9e714c');if(Math.sin(t*2)>.6){ctx.fillStyle='#765c43';ctx.font='12px monospace';ctx.fillText('?',p.x-9,p.y-18)}}
 // a tufted stool in the entryway
 for(let i=0;i<2;i++)box(92+i*22,304,4,4,17,0,['#b48251','#956640','#785337']);box(87,287,37,29,7,18,['#bc9b71','#a8845d','#8d6f4b']);for(let i=0;i<4;i++)line(P(91+i*7,289,26),P(91+i*7,312,26),'#d0b58a');
 atmosphere(t);
 if(g.tool==='toy'&&pointer.x>=0&&!g.won&&g.mode!=='hidden'){const p={x:pointer.x,y:pointer.y};line({x:p.x+5,y:p.y-19},{x:p.x+26,y:p.y-67},'#7a5d41',3);line({x:p.x+5,y:p.y-19},{x:p.x,y:p.y-5+Math.sin(t*6)*2},'#bcab83');rect(p.x-5,p.y-11,7,12,'#9c8d91');rect(p.x+1,p.y-9,5,9,'#baa7a0');rect(p.x-2,p.y-4,5,8,'#c0a071')}
 if(g.mode==='petting'){const p=P(g.cat.u,g.cat.v,76);rect(p.x-25,p.y,50,6,'#f4e8c9');rect(p.x-23,p.y+2,46*(g.pet/1.8),2,'#8fa278');heart(p.x,p.y-10,3,'#bc7c65')}
 if(g.mode==='eating'&&g.food){const p=P(g.cat.u,g.cat.v,70);rect(p.x-18,p.y,36,5,'#f2dfb3');rect(p.x-16,p.y+1,32*clamp(g.food.progress/2.8,0,1),3,'#b78c57')}
 if(!paused&&!$('modal').open){g.particles=g.particles.filter(p=>p.age<p.life);g.particles.forEach(p=>{p.age+=dt;p.z+=p.dz*dt;const q=P(p.u+p.dx*p.age,p.v,p.z+20);ctx.globalAlpha=Math.max(0,1-p.age/p.life);if(p.kind==='heart')heart(q.x,q.y,3,'#bb7b69');else{ctx.fillStyle=p.kind==='note'?'#718467':p.kind==='alert'?'#b2764f':'#fff0bd';ctx.font='bold 15px monospace';ctx.fillText(p.kind==='note'?'♪':p.kind==='alert'?'!':'✦',q.x,q.y)}ctx.globalAlpha=1})}
 if(keyboard&&!g.won){const p=P(pointer.u,pointer.v,3);ctx.strokeStyle='#f9efcb';ctx.lineWidth=2;ctx.strokeRect(p.x-9,p.y-4,18,9);rect(p.x-1,p.y-9,2,5,'#fff3c9')}
 positionTargets();
}
function positionTargets(){if(!g)return;const p=P(g.cat.u,g.cat.v,3);$('catTarget').style.left=p.x/W*100+'%';$('catTarget').style.top=p.y/H*100+'%';$('catTarget').hidden=g.mode==='hidden';$('catTarget').disabled=paused||g.won;hotspotButtons.forEach(({button,o})=>{const q=P(o.u,o.v,o.z);button.style.left=q.x/W*100+'%';button.style.top=q.y/H*100+'%'})}
function point(e){const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;return{x,y,...unproject(x,y)}}
function move(e){if(paused||$('modal').open||g.won)return;const p=point(e),now=performance.now(),elapsed=Math.max(16,now-(move.at||now)),speed=Math.hypot(p.x-pointer.x,p.y-pointer.y)/elapsed;hoverCat=isCat(p);if(e.pointerType==='mouse'&&g.tool!=='toy'&&g.tool!=='pet'&&g.mode!=='hidden'&&g.mode!=='eating'&&pointer.x>=0&&speed>1.8&&isCat(p)&&clock-g.lastScare>.22){g.lastScare=clock;g.fear=clamp(g.fear+14,0,100);if(g.fear>65)hide();else if(g.fear>32)say('Easy there! Sudden movements make me nervous. Stay still for a moment and I will relax.')}move.at=now;pointer=p;keyboard=false}
canvas.addEventListener('pointermove',move);
canvas.addEventListener('pointerdown',e=>{e.preventDefault();pointer=point(e);hoverCat=isCat(pointer);keyboard=false;canvas.setPointerCapture(e.pointerId);interact(pointer)});
canvas.addEventListener('pointerleave',()=>{if(!held){pointer.x=-999;hoverCat=false}});
function release(){held=false;if(g?.mode==='petting'){g.mode='idle';g.pet=0;say('Hold for a little longer. Ginger will slowly close his eyes and relax.')}}
window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);window.addEventListener('blur',release);
$('catTarget').addEventListener('pointermove',move);
$('catTarget').addEventListener('pointerdown',e=>{e.preventDefault();pointer=point(e);hoverCat=true;keyboard=false;$('catTarget').setPointerCapture(e.pointerId);interact(pointer)});
$('catTarget').addEventListener('click',e=>{if(e.detail===0){keyboard=true;hoverCat=true;const p=P(g.cat.u,g.cat.v,18);pointer={...p,...g.cat};interact(pointer)}});
$('catTarget').addEventListener('keydown',e=>{if(e.code==='Enter'||e.code==='Space'){e.preventDefault();if(e.repeat)return;keyboard=true;hoverCat=true;const p=P(g.cat.u,g.cat.v,18);pointer={...p,...g.cat};interact(pointer)}});
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
objects.forEach(o=>{const button=document.createElement('button');button.className='hotspot';button.type='button';button.title=o.label;button.onclick=()=>inspect(o.id);$('hotspots').append(button);hotspotButtons.push({button,o})});
$('sound').onclick=()=>{sound=!sound;$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Turn sound off':'Turn sound on');$('sound').textContent=sound?'♫':'♪';if(sound)chime('stamp')};
$('day').onclick=()=>{night=!night;$('day').textContent=night?'☾ Evening':'☼ Afternoon';$('day').setAttribute('aria-pressed',String(night));$('roomName').textContent=night?'02 / MOONLIT HIDEAWAY':'01 / SUNLIT LIVING ROOM';say(night?'Evening settles in and the lamp glows. There is a whole quiet night to become friends.':'Sunlight rests on the wooden floor. Everything feels a little warmer.')};
function togglePause(){if($('modal').open)return;paused=!paused;held=false;if(g.mode==='petting'){g.mode='idle';g.pet=0}$('pauseScreen').hidden=!paused;$('pause').textContent=paused?'▷ Resume':'Ⅱ Pause';$('pause').setAttribute('aria-pressed',String(paused));prevUI='';updateUI()}
$('pause').onclick=togglePause;$('resume').onclick=togglePause;$('help').onclick=help;$('album').onclick=album;$('reset').onclick=()=>{if($('modal').open)$('modal').close();reset()};$('closeModal').onclick=()=>$('modal').close();$('modal').addEventListener('click',e=>{if(e.target===$('modal')){const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('modal').close()}});
window.addEventListener('keydown',e=>{if($('modal').open)return;if(e.target.closest('button')&&['Space','Enter'].includes(e.code))return;if(e.code==='Space'){e.preventDefault();if(!e.repeat)togglePause();return}if(paused||g.won)return;const map={Digit1:'explore',Digit2:'food',Digit3:'toy',Digit4:'pet',Digit5:'catch'};if(map[e.code]){setTool(map[e.code]);return}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)){e.preventDefault();if(!keyboard){pointer={u:180,v:220};keyboard=true}let q=P(pointer.u,pointer.v,0);q.x+=e.code==='ArrowLeft'?-12:e.code==='ArrowRight'?12:0;q.y+=e.code==='ArrowUp'?-8:e.code==='ArrowDown'?8:0;let uv=unproject(q.x,q.y);pointer={u:clamp(uv.u,20,330),v:clamp(uv.v,25,325)};Object.assign(pointer,P(pointer.u,pointer.v));hoverCat=isCat(pointer)}if(e.code==='Enter'){e.preventDefault();if(!e.repeat){if(!keyboard&&!validFloor(pointer.u,pointer.v)){pointer={u:180,v:220};Object.assign(pointer,P(pointer.u,pointer.v))}keyboard=true;interact(pointer)}}});window.addEventListener('keyup',e=>{if(e.code==='Enter'||e.code==='Space')release()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!paused&&!g.won&&!$('modal').open)togglePause()});
reset();const pc=$('portrait').getContext('2d'); // portrait is rendered from the same hand-drawn sprite
drawCat(45,62,0,1.3,'idle');pc.imageSmoothingEnabled=false;pc.drawImage(canvas,5,0,83,80,0,0,88,80);ctx.clearRect(0,0,W,H);
function frame(time){const dt=Math.min(.05,(time-(last||time))/1000);last=time;if(!paused&&!$('modal').open)clock+=dt;update(dt);updateUI();draw(clock,dt);requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();
