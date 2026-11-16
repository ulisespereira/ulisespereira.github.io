(async()=>{
const root=document.querySelector('#engagement'),canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),button=root.querySelector('button');
const data=await fetch('sa-identity.json').then(r=>r.json());const W=760,H=390,ratio=Math.min(devicePixelRatio||1,2);canvas.width=W*ratio;canvas.height=H*ratio;ctx.scale(ratio,ratio);
const colors=['#8246E1','#01A49B','#d9534f','#3b6fb6'];let elapsed=0,last=null,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;
function path(p,color,width,alpha){ctx.beginPath();p.forEach((v,i)=>i?ctx.lineTo(...v):ctx.moveTo(...v));ctx.strokeStyle=color;ctx.globalAlpha=alpha;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.globalAlpha=1}
const pos=p=>[540+p[0]*66,195-p[1]*66];
function draw(){ctx.clearRect(0,0,W,H);let cycle=elapsed/5500,index=Math.floor(cycle)%5,next=(index+1)%5,phase=cycle%1;let blend=Math.max(0,(phase-.65)/.35);blend=blend*blend*(3-2*blend);const a=data.samples[index],b=data.samples[next];
// Loading samples change by crossfade, not by inventing moving neurons.
for(const [sample,opacity]of [[a,1-blend],[b,blend]])for(const item of sample.points){ctx.beginPath();ctx.arc(180+item.p[0]*43,195-item.p[1]*43,1.7,0,Math.PI*2);ctx.fillStyle=colors[item.pop];ctx.globalAlpha=.55*opacity;ctx.fill()}ctx.globalAlpha=1;
// Show the finite-network family lightly behind the active realization.
for(const sample of data.samples)sample.traj.forEach((p,i)=>path(p.map(pos),colors[Math.floor(i/6)],.7,.09));
for(const [sample,opacity]of [[a,1-blend],[b,blend]])sample.traj.forEach((p,i)=>{const pts=p.map(pos),color=colors[Math.floor(i/6)];path(pts,color,1.15,.55*opacity);let progress=(elapsed/3300+i*.037)%1,q=progress*(pts.length-1),j=Math.floor(q),f=q-j,v=pts[j],w=pts[Math.min(j+1,pts.length-1)];ctx.beginPath();ctx.arc(v[0]*(1-f)+w[0]*f,v[1]*(1-f)+w[1]*f,2.1,0,Math.PI*2);ctx.globalAlpha=opacity;ctx.fillStyle=color;ctx.fill()});ctx.globalAlpha=1;
}
function label(){button.textContent=playing?'Ⅱ':'▷';button.setAttribute('aria-label',playing?'Pause collective dynamics animation':'Play collective dynamics animation')}
button.onclick=()=>{playing=!playing;last=null;label()};function tick(now){if(last!==null&&playing&&!document.hidden)elapsed+=Math.min(70,now-last);last=now;draw();requestAnimationFrame(tick)}label();requestAnimationFrame(tick);
})();
