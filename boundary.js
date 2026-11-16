(async()=>{
const root=document.querySelector('#engagement'),c=root.querySelector('canvas'),ctx=c.getContext('2d'),button=root.querySelector('button'),d=await fetch('oblique.json').then(r=>r.json());
const ratio=Math.min(devicePixelRatio||1,2);c.width=500*ratio;c.height=430*ratio;ctx.scale(ratio,ratio);
const [xmin,xmax]=d.win,ymin=-40,ymax=75,scale=420/(xmax-xmin),height=(ymax-ymin)*scale;
const project=p=>[40+(p[0]-xmin)*scale,95+(ymax-p[1])*scale],boundary=d.boundary.map(project),paths=d.paths.map(p=>p.points.map(project)),shared=d.shared.points.map(project),colors=['#2c5aa0','#c0392b'];
let elapsed=0,last=null,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;if(!playing)elapsed=8500;
function line(p,color,w,a=1){if(p.length<2)return;ctx.beginPath();p.forEach((v,i)=>i?ctx.lineTo(...v):ctx.moveTo(...v));ctx.strokeStyle=color;ctx.lineWidth=w;ctx.globalAlpha=a;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.globalAlpha=1}
function dot(p,color,r=4){ctx.beginPath();ctx.arc(...p,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
function partial(points,times,t){let j=times.findIndex(v=>v>=t);if(j<0)return points.slice();if(j===0)return [points[0]];let f=(t-times[j-1])/(times[j]-times[j-1]);return [...points.slice(0,j),points[j].map((v,k)=>points[j-1][k]+f*(v-points[j-1][k]))]}
function draw(){
ctx.clearRect(0,0,500,430);ctx.save();ctx.beginPath();ctx.rect(40,95,420,height);ctx.clip();
ctx.fillStyle='#fbe7e6';ctx.fillRect(40,95,420,height);ctx.beginPath();ctx.moveTo(...boundary[0]);boundary.slice(1).forEach(p=>ctx.lineTo(...p));ctx.lineTo(...project([xmax,d.win[2]]));ctx.lineTo(...boundary[0]);ctx.closePath();ctx.fillStyle='#e3ecf8';ctx.fill();line(boundary,'#353535',1.5,.75);
const cycle=elapsed%11000,branch=cycle>=2600;
const preT=d.shared.t[0]+Math.min(1,cycle/2100)*(d.shared.t.at(-1)-d.shared.t[0]);
const pre=partial(shared,d.shared.t,preT);line(pre,'#454b50',3,branch?.75:1);
if(!branch){dot(pre.at(-1),'#454b50',4.5)}else{
const t=cycle<4600?d.pulse+(cycle-2600)/2000*d.duration:d.pulse+d.duration+Math.min(1,(cycle-4600)/3300)*(d.paths[0].t.at(-1)-d.pulse-d.duration);
for(let i=0;i<2;i++){
 const times=d.paths[i].t,p=paths[i],end=d.pulse+d.duration;
 const pushed=partial(p,times,Math.min(t,end));ctx.setLineDash([4,4]);line(pushed,colors[i],2.8);ctx.setLineDash([]);
 const visible=partial(p,times,t);if(t>end){const first=times.findIndex(v=>v>end);line([pushed.at(-1),...visible.slice(first)],colors[i],2.8)}
 dot(visible.at(-1),colors[i],4.5);
}
}
ctx.restore();
ctx.globalCompositeOperation='destination-in';
const mask=ctx.createRadialGradient(285,210,55,265,210,230);mask.addColorStop(0,'rgba(0,0,0,1)');mask.addColorStop(.65,'rgba(0,0,0,.95)');mask.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=mask;ctx.fillRect(0,0,500,430);ctx.globalCompositeOperation='source-over';
ctx.globalCompositeOperation='destination-in';const edge=ctx.createLinearGradient(0,95,0,95+height);edge.addColorStop(0,'transparent');edge.addColorStop(.2,'black');edge.addColorStop(.75,'black');edge.addColorStop(1,'transparent');ctx.fillStyle=edge;ctx.fillRect(0,0,500,430);ctx.globalCompositeOperation='source-over';
if(cycle>9800){ctx.globalCompositeOperation='destination-in';ctx.fillStyle=`rgba(0,0,0,${1-(cycle-9800)/1200})`;ctx.fillRect(0,0,500,430);ctx.globalCompositeOperation='source-over';}
}
function label(){button.textContent=playing?'Ⅱ':'▷';button.setAttribute('aria-label',playing?'Pause trajectory animation':'Play trajectory animation')}
button.onclick=()=>{playing=!playing;last=null;label()};
function tick(now){if(last!==null&&playing&&!document.hidden)elapsed+=Math.min(65,now-last);last=now;draw();requestAnimationFrame(tick)}label();requestAnimationFrame(tick);
})();
