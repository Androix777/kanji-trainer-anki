var KanjiTrainerVisualizer=(function(e){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});function t(e,t,n){let r=Math.floor(e*6),i=e*6-r,a=n*(1-t),o=n*(1-i*t),s=n*(1-(1-i)*t),c=0,l=0,u=0;switch(r%6){case 0:c=n,l=s,u=a;break;case 1:c=o,l=n,u=a;break;case 2:c=a,l=n,u=s;break;case 3:c=a,l=o,u=n;break;case 4:c=s,l=a,u=n;break;case 5:c=n,l=a,u=o;break}return[Math.round(c*255),Math.round(l*255),Math.round(u*255)]}function n(e){let[n,r,i]=t((e*.618033988749895%1+1)%1,.42,.56);return`rgb(${n}, ${r}, ${i})`}let r=1e-9;function i(e,t,n){return e+(t-e)*n}function a(e){if(e.length===0)return{x:0,y:0};let t=0,n=0;for(let r of e)t+=r.x,n+=r.y;return{x:t/e.length,y:n/e.length}}function o(e,t){let n=Math.cos(t),r=Math.sin(t);return{x:e.x*n-e.y*r,y:e.x*r+e.y*n}}function s(e,t){let n=t-e;for(;n>Math.PI;)n-=Math.PI*2;for(;n<-Math.PI;)n+=Math.PI*2;return n}function c(e){let t=0;for(let n=1;n<e.length;n+=1){let r=e[n-1],i=e[n];t+=Math.hypot(i.x-r.x,i.y-r.y)}return t}function l(e){if(e.points.length>=2)return e;if(e.points.length===1){let t=e.points[0];return{points:[t,t],label_pos:null}}return{points:[{x:0,y:0},{x:0,y:0}],label_pos:null}}function u(e,t){let n=l(e).points;if(t<=1)return[n[0]];let a=[0];for(let e=1;e<n.length;e+=1){let t=n[e-1],r=n[e];a.push(a[e-1]+Math.hypot(r.x-t.x,r.y-t.y))}let o=a[a.length-1];if(o<=r)return Array.from({length:t},()=>({...n[0]}));let s=[];for(let e=0;e<t;e+=1){let c=e/(t-1)*o,l=1;for(;l<a.length&&a[l]<c;)l+=1;let u=Math.min(l,n.length-1),d=Math.max(0,u-1),f=a[d],p=a[u],m=n[d],h=n[u],g=p-f<=r?0:(c-f)/(p-f);s.push({x:i(m.x,h.x,g),y:i(m.y,h.y,g)})}return s}function d(e){let t=e[0],n=e[e.length-1];return Math.atan2(n.y-t.y,n.x-t.x)}function f(e){let t=e[0],n=e[e.length-1],i=Math.hypot(n.x-t.x,n.y-t.y);if(i>r)return i;let a=c(e);return a>r?a:1}function p(e,t,n,i){let a=Math.cos(-n),o=Math.sin(-n),s=1/Math.max(i,r);return e.map(e=>{let n=e.x-t.x,r=e.y-t.y;return{x:(n*a-r*o)*s,y:(n*o+r*a)*s}})}function m(e,t,n){let r=u(t,24),i=u(n,24),o=a(r),s=a(i),c=d(r),m=d(i),h=f(r),g=f(i);return{strokeIndex:e,userRaw:l(t),referenceRaw:l(n),userLocal:p(r,o,c,h),referenceLocal:p(i,s,m,g),userCenter:o,referenceCenter:s,userAngle:c,referenceAngle:m,userLength:h,referenceLength:g}}function h(e,t){let n=e.userAngle+s(e.userAngle,e.referenceAngle)*t,r=i(e.userLength,e.referenceLength,t),a={x:i(e.userCenter.x,e.referenceCenter.x,t),y:i(e.userCenter.y,e.referenceCenter.y,t)},c=[];for(let s=0;s<e.userLocal.length;s+=1){let l=e.userLocal[s],u=e.referenceLocal[s],d=o({x:i(l.x,u.x,t),y:i(l.y,u.y,t)},n);c.push({x:a.x+d.x*r,y:a.y+d.y*r})}return{points:c,label_pos:null}}function g(e,t,n=420,r=1400,i=420){let a=Math.min(e.strokes.length,t.strokes.length),o=[];for(let n=0;n<a;n+=1)o.push(m(n,t.strokes[n],e.strokes[n]));let s=[];for(let e=a;e<t.strokes.length;e+=1)s.push({stroke:l(t.strokes[e]),strokeIndex:e});let c=[];for(let t=a;t<e.strokes.length;t+=1)c.push({stroke:l(e.strokes[t]),strokeIndex:t});return{reference:e,user:t,removeDurationMs:n,morphDurationMs:r,addDurationMs:i,totalDurationMs:n+r+i,pairs:o,extraUser:s,missingReference:c}}function _(e,t){let n=Math.max(0,Math.min(e.totalDurationMs,t)),i=[],a=e.removeDurationMs,o=a+e.morphDurationMs;if(n<=a){let t=a<=r?1:n/a;for(let t of e.pairs)i.push({stroke:t.userRaw,strokeIndex:t.strokeIndex,alpha:1});for(let n of e.extraUser)i.push({stroke:n.stroke,strokeIndex:n.strokeIndex,alpha:1-t});return{strokes:i,isComplete:!1}}if(n<=o){let t=e.morphDurationMs<=r?1:(n-a)/e.morphDurationMs;for(let n of e.pairs)i.push({stroke:h(n,t),strokeIndex:n.strokeIndex,alpha:1});return{strokes:i,isComplete:!1}}let s=e.addDurationMs<=r?1:(n-o)/e.addDurationMs;for(let t of e.pairs)i.push({stroke:t.referenceRaw,strokeIndex:t.strokeIndex,alpha:1});for(let t of e.missingReference)i.push({stroke:t.stroke,strokeIndex:t.strokeIndex,alpha:s});return{strokes:i,isComplete:n>=e.totalDurationMs-r}}let v=2.5,y=2.5,b={light:{panelBackground:`transparent`,panelBorder:`#d4d4d4`,title:`#555555`,referenceGhost:`rgba(120, 120, 120, 0.18)`},dark:{panelBackground:`transparent`,panelBorder:`#57637d`,title:`#d1d6e0`,referenceGhost:`rgba(190, 200, 220, 0.22)`}};function x(e,t){return{x:t.scale_x*e.x+t.translate_x,y:t.scale_y*e.y+t.translate_y}}function S(e,t){return{strokes:e.strokes.map(e=>({points:e.points.map(e=>x(e,t)),label_pos:e.label_pos?x(e.label_pos,t):e.label_pos}))}}function C(e){let t=1/0,n=1/0,r=-1/0,i=-1/0,a=!1;for(let o of e)for(let e of o.strokes)for(let o of e.points)a=!0,t=Math.min(t,o.x),n=Math.min(n,o.y),r=Math.max(r,o.x),i=Math.max(i,o.y);return a?{minX:t,minY:n,maxX:r,maxY:i}:null}function w(e,t,n){let r=Math.max(n.width-24,1),i=Math.max(n.height-24,1),a=Math.max(t.maxX-t.minX,1e-9),o=Math.max(t.maxY-t.minY,1e-9),s=Math.min(r/a,i/o),c=n.x+12+(r-a*s)/2,l=n.y+12+(i-o*s)/2;return{x:c+(e.x-t.minX)*s,y:l+(e.y-t.minY)*s}}function T(e,t,n){return{strokes:e.strokes.map(e=>({points:e.points.map(e=>w(e,t,n)),label_pos:e.label_pos?w(e.label_pos,t,n):e.label_pos}))}}function ee(e,t,n){e.fillStyle=n.panelBackground,e.fillRect(t.x,t.y,t.width,t.height),e.strokeStyle=n.panelBorder,e.lineWidth=1,e.strokeRect(t.x+.5,t.y+.5,t.width-1,t.height-1)}function E(e,t,n,r){if(!(t.points.length<2)){e.strokeStyle=n,e.lineWidth=r,e.lineCap=`round`,e.lineJoin=`round`,e.beginPath(),e.moveTo(t.points[0].x,t.points[0].y);for(let n=1;n<t.points.length;n++)e.lineTo(t.points[n].x,t.points[n].y);e.stroke()}}function te(e,t,r,i,a){if(t.points.length<2||r<=0)return;if(e.strokeStyle=n(i),e.lineWidth=a,e.lineCap=`round`,e.lineJoin=`round`,r>=1){e.beginPath(),e.moveTo(t.points[0].x,t.points[0].y);for(let n=1;n<t.points.length;n++)e.lineTo(t.points[n].x,t.points[n].y);e.stroke();return}let o=0;for(let e=1;e<t.points.length;e++){let n=t.points[e-1],r=t.points[e];o+=Math.hypot(r.x-n.x,r.y-n.y)}if(o<=0)return;let s=o*r;e.beginPath(),e.moveTo(t.points[0].x,t.points[0].y);for(let n=1;n<t.points.length;n++){let r=t.points[n-1],i=t.points[n],a=Math.hypot(i.x-r.x,i.y-r.y);if(!(a<=0))if(s>=a)e.lineTo(i.x,i.y),s-=a;else{let t=s/a;e.lineTo(r.x+(i.x-r.x)*t,r.y+(i.y-r.y)*t);break}}e.stroke()}function D(e,t){return!e||e.points.length===0?null:t===`End`?e.points[e.points.length-1]??null:e.points[0]??null}function O(e,t,r,i){if(i.size===0)return;let a=performance.now()/1e3,o=.5+.5*Math.sin(a*7),s=6.2+o*3,c=26+o*22;e.save(),e.lineCap=`round`,e.lineJoin=`round`,e.globalAlpha=.56;for(let a of i){let i=n(a);e.shadowBlur=c,e.shadowColor=i;let o=t.strokes[a],l=r.strokes[a];o&&E(e,o,i,s),l&&E(e,l,i,s)}e.restore()}function k(e,t,n,r,i){let a=n.x-t.x,o=n.y-t.y,s=Math.hypot(a,o);if(s<1e-6)return;let c=a/s,l=o/s,u=Math.max(.04,Math.min(1,i)),d=t.x+a*u,f=t.y+o*u,p=Math.hypot(d-t.x,f-t.y),m=Math.min(10,Math.max(6,p*.2)),h=m*.45,g=d-c*m,_=f-l*m,v=-l,y=c;e.lineWidth=2.4,e.lineCap=`round`,e.strokeStyle=r,e.beginPath(),e.moveTo(t.x,t.y),e.lineTo(d,f),e.stroke(),e.fillStyle=r,e.beginPath(),e.moveTo(d,f),e.lineTo(g+v*h,_+y*h),e.lineTo(g-v*h,_-y*h),e.closePath(),e.fill()}function ne(e,t,r,i,a,o=!0){let[s,c]=i.strokeIndices,l=D(t.strokes[s],i.pointTypes?.[0]),u=D(t.strokes[c],i.pointTypes?.[1]),d=D(r.strokes[s],i.pointTypes?.[0]),f=D(r.strokes[c],i.pointTypes?.[1]);if(!l||!u||!d||!f)return;if(o){let i=.5+.5*Math.sin(a*7),o=6.2+i*2.8,l=24+i*20;e.save(),e.lineCap=`round`,e.lineJoin=`round`,e.globalAlpha=.52;for(let i of[s,c]){let a=n(i);e.shadowBlur=l,e.shadowColor=a,t.strokes[i]&&E(e,t.strokes[i],a,o),r.strokes[i]&&E(e,r.strokes[i],a,o)}e.restore();for(let i of[s,c]){let a=n(i);t.strokes[i]&&E(e,t.strokes[i],a,v),r.strokes[i]&&E(e,r.strokes[i],a,y)}}let p=.62,m=p+.24,h=Math.min(a,m)<p?Math.min(a,m)/p:1;k(e,d,f,`rgba(210, 35, 35, 0.58)`,h),k(e,l,u,`rgba(35, 165, 70, 0.58)`,h)}let A={playDraw:()=>{},pauseDraw:()=>{},toggleDrawLoop:()=>!1,setDrawProgress:()=>{},getDrawProgress:()=>0,playMorph:()=>{},pauseMorph:()=>{},toggleMorphLoop:()=>!1,setMorphProgress:()=>{},getMorphProgress:()=>0,toggleOverallMode:()=>!1,setAngleIssueFocus:()=>{},setMetricFocus:()=>{},getStrokeCount:()=>0,dispose:()=>{}};function j(e){return typeof e==`string`?JSON.parse(e):e}function re(e,t,r){let i=j(t),a=b[r?.themeMode??`light`],o=e.getContext(`2d`);if(!o)return A;let s=S(i.reference_raw,i.composition.alignment.reference_to_aligned),c=S(i.user_raw,i.composition.alignment.user_to_aligned),l=C([s,c]);if(!l)return A;let u={x:0,y:0,width:(e.width-16)/2,height:e.height},d={x:u.width+16,y:0,width:u.width,height:e.height},f=T(s,l,u),p=T(s,l,d),m=T(c,l,d),h=g(p,m),x=Math.max(f.strokes.length,m.strokes.length),w=Math.max(x,1)*450,D={dtw:new Set,rms:new Set,position:new Set};for(let e=0;e<x;e++){let t=i.dtw?.strokes?.[e]?.dtw_error,n=i.rms?.strokes?.[e]?.rms,r=i.composition.stroke_details?.find(t=>t.stroke_idx===e),a=r?Math.max(r.start.distance,r.end.distance):void 0;i.thresholds?.dtw!==void 0&&t!==void 0&&t>i.thresholds.dtw&&D.dtw.add(e),i.thresholds?.rms!==void 0&&n!==void 0&&n>i.thresholds.rms&&D.rms.add(e),i.thresholds?.position!==void 0&&a!==void 0&&a>i.thresholds.position&&D.position.add(e)}let k=[],re=i.thresholds?.relative_angle;for(let e of i.composition.angle_details??[])(re===void 0?e.weighted_diff>0:e.weighted_diff>re)&&k.push({strokeIndices:e.stroke_indices,pointTypes:e.point_types});let M=`draw`,N=!1,P=0,F=1,I=!1,L=0,R=1,z=!1,B=null,V=null,H=!1,U=e=>{I!==e&&(I=e,r?.onDrawLoopChange?.(e))},ie=e=>{z!==e&&(z=e,r?.onMorphLoopChange?.(e))},ae=e=>{H!==e&&(H=e,r?.onOverallModeChange?.(e))},oe=()=>H&&M===`draw`&&!B&&!V,W=()=>{M===`morph`&&(N=!1,$(),ie(!1),M=`draw`)},se=()=>{N=!1,$(),U(!1),ae(!1),B=null,V=null,M=`morph`},G=()=>{let e=x>0?Math.max(0,Math.min(1,P/x)):0,t=x>0?Math.min(x-1,Math.max(0,Math.floor(P))):-1;r?.onDrawProgress?.(e),r?.onStrokeIndexChange?.(t)},K=()=>{r?.onMorphProgress?.(Math.max(0,Math.min(1,L)))},q=document.createElement(`canvas`);q.width=e.width,q.height=e.height;let J=q.getContext(`2d`),Y=!0,ce=-1,le=-1,ue=null,de=!1,fe=()=>{if(J.clearRect(0,0,q.width,q.height),ee(J,u,a),ee(J,d,a),M===`morph`&&!B&&!V){for(let e=0;e<f.strokes.length;e++)f.strokes[e]&&E(J,f.strokes[e],n(e),v);let e=_(h,L*h.totalDurationMs);for(let t of e.strokes)t.alpha<=0||(J.save(),J.globalAlpha=t.alpha,E(J,t.stroke,n(t.strokeIndex),y),J.restore())}else{let e=B!==null||V!==null;for(let t=0;t<x;t++){let n=e?1:Math.max(0,Math.min(1,P-t));f.strokes[t]&&te(J,f.strokes[t],n,t,v),m.strokes[t]&&te(J,m.strokes[t],n,t,y)}}ce=P,le=L,ue=M,de=B!==null||V!==null,Y=!1},pe=()=>!!(Y||ue!==M||M===`morph`&&L!==le||M===`draw`&&P!==ce||(B!==null||V!==null)!==de),X=()=>{if(pe()&&fe(),o.clearRect(0,0,e.width,e.height),o.drawImage(q,0,0),!(M===`morph`&&!B&&!V)){if(B)ne(o,f,m,B,performance.now()/1e3%1.05);else if(V)O(o,f,m,D[V]);else if(oe()&&(O(o,f,m,new Set([...D.dtw,...D.rms,...D.position])),k.length>0)){let e=performance.now()/1e3;ne(o,f,m,k[Math.floor(e/1.05)%k.length],e%1.05,!1)}}},Z=null,me=0,he=0,ge=()=>N||B!==null||V!==null||oe(),_e=()=>!N&&(B!==null||V!==null||oe()),Q=()=>{Z===null&&ge()&&(me=0,Z=requestAnimationFrame(be))},$=()=>{Z!==null&&(cancelAnimationFrame(Z),Z=null)},ve=e=>{if(w<=0)return;let t=e/w*x;I?(P+=t*F,P>=x?(P=x,F=-1):P<=0&&(P=0,F=1)):(P=Math.min(P+t,x),P>=x&&(N=!1)),G()},ye=e=>{if(h.totalDurationMs<=0)return;let t=L+e/h.totalDurationMs*R;t>1?z?(t=1,R=-1):(t=1,N=!1):t<0&&(z?(t=0,R=1):(t=0,N=!1)),L=t,K()},be=e=>{let t=me>0?Math.max(0,e-me):0;me=e,N?(M===`draw`?ve(t):ye(t),X()):_e()&&e-he>=33.333333333333336&&(he=e,X()),Z=ge()?requestAnimationFrame(be):null};return X(),G(),{playDraw:()=>{W(),ae(!1),I&&(P>=x?F=-1:P<=0&&(F=1)),N=!0,Q()},pauseDraw:()=>{M===`draw`&&(N=!1,$(),Q())},toggleDrawLoop:()=>(I=!I,r?.onDrawLoopChange?.(I),I||(N=!1,$(),Q()),I),setDrawProgress:e=>{W(),ae(!1),N=!1,$(),P=Math.max(0,Math.min(1,e))*x,X(),G(),Q()},getDrawProgress:()=>x>0?Math.max(0,Math.min(1,P/x)):0,playMorph:()=>{se(),B=null,V=null,R=1,N=!0,X(),K(),Q()},pauseMorph:()=>{M===`morph`&&(N=!1,$(),Q())},toggleMorphLoop:()=>(z=!z,r?.onMorphLoopChange?.(z),z||(N=!1,$(),M===`morph`&&(X(),K()),Q()),z),setMorphProgress:e=>{se(),N=!1,$(),L=Math.max(0,Math.min(1,e)),R=1,X(),K()},getMorphProgress:()=>L,toggleOverallMode:()=>(M===`morph`&&W(),H=!H,r?.onOverallModeChange?.(H),X(),G(),Q(),H),setAngleIssueFocus:e=>{B=e,e&&(V=null),X(),M===`morph`?K():G(),Q()},setMetricFocus:e=>{V=e,e&&(B=null),X(),M===`morph`?K():G(),Q()},getStrokeCount:()=>x,dispose:()=>{N=!1,$()}}}var M=`.kvp-root {\r
	width: 100%; height: 100%;\r
	display: grid;\r
	grid-template-rows: 70px 1fr;\r
	gap: 10px;\r
	font-family: ui-sans-serif, system-ui, sans-serif;\r
	color: var(--kvp-text);\r
	background: transparent;\r
}\r
.kvp-top {\r
	display: grid;\r
	grid-template-rows: 1fr 1fr;\r
	gap: 6px;\r
}\r
.kvp-tl-row {\r
	display: grid;\r
	grid-template-columns: 30px 30px 30px 52px 1fr;\r
	align-items: center;\r
	gap: 8px;\r
}\r
.kvp-btn {\r
	height: 24px;\r
	border: 1px solid var(--kvp-border);\r
	border-radius: 6px;\r
	background: var(--kvp-btn-bg);\r
	color: var(--kvp-text);\r
	cursor: pointer;\r
	display: inline-flex;\r
	align-items: center;\r
	justify-content: center;\r
}\r
.kvp-scrub-wrap {\r
	position: relative;\r
	height: 24px;\r
	overflow: visible;\r
}\r
.kvp-scrub-segments {\r
	position: absolute;\r
	left: 0; right: 0;\r
	top: 7px;\r
	height: 10px;\r
	padding: 0 8px;\r
	box-sizing: border-box;\r
	display: flex;\r
	align-items: center;\r
	background: var(--kvp-track-bg);\r
	border-radius: 4px;\r
}\r
.kvp-scrub-marker {\r
	position: absolute;\r
	top: 2px;\r
	left: 8px;\r
	width: 4px;\r
	height: 20px;\r
	background: var(--kvp-marker);\r
	border-radius: 2px;\r
	pointer-events: none;\r
	transform: translateX(-2px);\r
	box-shadow: var(--kvp-marker-shadow);\r
}\r
.kvp-scrub-input {\r
	position: absolute;\r
	inset: 0;\r
	width: 100%;\r
	height: 24px;\r
	margin: 0;\r
	display: block;\r
	background: transparent;\r
	opacity: 0;\r
}\r
.kvp-body {\r
	display: grid;\r
	grid-template-columns: 1fr 340px;\r
	gap: 16px;\r
	min-height: 0;\r
}\r
.kvp-viewer {\r
	width: 100%; height: 100%;\r
	align-self: start;\r
	background: transparent;\r
}\r
.kvp-side {\r
	border: 1px solid var(--kvp-border);\r
	background: transparent;\r
	padding: 12px;\r
	display: flex;\r
	flex-direction: column;\r
	gap: 8px;\r
	min-height: 0;\r
	overflow: hidden;\r
}\r
.kvp-summary-header {\r
	display: grid;\r
	grid-template-columns: 1fr auto;\r
	align-items: center;\r
	gap: 8px;\r
}\r
.kvp-title { font-weight: 600; }\r
.kvp-flex-col {\r
	display: flex;\r
	flex-direction: column;\r
	gap: 8px;\r
}\r
.kvp-angle-hover {\r
	display: flex;\r
	flex-direction: column;\r
	gap: 8px;\r
	flex: 1 1 auto;\r
	min-height: 0;\r
}\r
.kvp-lower {\r
	position: relative;\r
	flex: 1 1 auto;\r
	min-height: 0;\r
}\r
.kvp-layer {\r
	display: flex;\r
	flex-direction: column;\r
	gap: 8px;\r
	position: absolute;\r
	inset: 0;\r
	overflow: hidden;\r
	transition: opacity 120ms ease;\r
}\r
.kvp-layer-hidden { opacity: 0; pointer-events: none; }\r
.kvp-layer-visible { opacity: 1; pointer-events: auto; }\r
.kvp-divider { border-top: 1px solid var(--kvp-border); }\r
.kvp-preview { width: 100%; height: 120px; }\r
.kvp-metric-row {\r
	display: grid;\r
	grid-template-columns: 90px 1fr 48px;\r
	align-items: center;\r
	gap: 6px;\r
	padding: 4px 6px;\r
	border-radius: 8px;\r
	transition: background-color 100ms ease, box-shadow 100ms ease;\r
}\r
.kvp-metric-name { font-size: 12px; }\r
.kvp-metric-bar {\r
	position: relative;\r
	height: 8px;\r
	border: 1px solid var(--kvp-bar-border);\r
	background: var(--kvp-bar-bg);\r
	overflow: hidden;\r
}\r
.kvp-metric-fill { height: 100%; width: 0%; }\r
.kvp-metric-threshold {\r
	position: absolute;\r
	top: -1px; bottom: -1px;\r
	width: 2px;\r
	background: var(--kvp-threshold);\r
	left: 100%;\r
}\r
.kvp-mono {\r
	font-family: ui-monospace, SFMono-Regular, Menlo, monospace;\r
	font-size: 11px;\r
	text-align: right;\r
}\r
.kvp-angle-row {\r
	display: grid;\r
	grid-template-columns: 1fr 46px;\r
	gap: 5px;\r
	align-items: center;\r
	padding: 6px 8px;\r
	border-radius: 8px;\r
	cursor: pointer;\r
	transition: background-color 100ms ease, box-shadow 100ms ease;\r
}\r
.kvp-angle-bar {\r
	position: relative;\r
	height: 6px;\r
	border: 1px solid var(--kvp-bar-border);\r
	background: var(--kvp-bar-bg);\r
	overflow: hidden;\r
}\r
.kvp-angle-fill { height: 100%; }\r
.kvp-zone {\r
	position: relative;\r
	flex: 1;\r
	height: 100%;\r
	opacity: 0.9;\r
	display: inline-block;\r
}\r
.kvp-zone:first-child { border-top-left-radius: 3px; border-bottom-left-radius: 3px; }\r
.kvp-zone:last-child { border-top-right-radius: 3px; border-bottom-right-radius: 3px; }\r
.kvp-badge {\r
	position: absolute;\r
	top: -7px;\r
	left: 50%;\r
	transform: translateX(-50%);\r
	width: 11px; height: 11px;\r
	border-radius: 999px;\r
	background: #cf2f2f;\r
	color: #fff;\r
	font-size: 9px;\r
	font-weight: 700;\r
	line-height: 11px;\r
	text-align: center;\r
	box-shadow: 0 0 0 1px rgba(255,255,255,0.8);\r
}\r
.kvp-angle-list {\r
	display: flex;\r
	flex-direction: column;\r
	gap: 10px;\r
}\r
.kvp-empty {\r
	font-size: 11px;\r
	color: var(--kvp-muted-text);\r
}\r
`;let N={light:{"--kvp-text":`#1f232b`,"--kvp-muted-text":`#777777`,"--kvp-border":`#d4d4d4`,"--kvp-track-bg":`#e6e6e6`,"--kvp-marker":`#202020`,"--kvp-marker-shadow":`0 0 0 1px rgba(255,255,255,0.7)`,"--kvp-btn-bg":`#f3f5f8`,"--kvp-btn-active-bg":`#dce7ff`,"--kvp-bar-bg":`#f8f8f8`,"--kvp-bar-border":`#cfcfcf`,"--kvp-threshold":`#364fc7`,"--kvp-hover-bg":`rgba(54, 79, 199, 0.10)`,"--kvp-hover-ring":`inset 0 0 0 1px rgba(54, 79, 199, 0.35)`,"--kvp-panel-bg":`transparent`,"--kvp-canvas-border":`#d4d4d4`},dark:{"--kvp-text":`#e3e8f1`,"--kvp-muted-text":`#adb7ca`,"--kvp-border":`#57637d`,"--kvp-track-bg":`#3f4b63`,"--kvp-marker":`#f2f5fa`,"--kvp-marker-shadow":`0 0 0 1px rgba(0,0,0,0.45)`,"--kvp-btn-bg":`#2f394c`,"--kvp-btn-active-bg":`#3e5382`,"--kvp-bar-bg":`#2f394c`,"--kvp-bar-border":`#6a7895`,"--kvp-threshold":`#8ea3ff`,"--kvp-hover-bg":`rgba(142, 163, 255, 0.13)`,"--kvp-hover-ring":`inset 0 0 0 1px rgba(142, 163, 255, 0.45)`,"--kvp-panel-bg":`transparent`,"--kvp-canvas-border":`#57637d`}};function P(e){let t=document.createElement(`style`);t.textContent=M,e.prepend(t)}function F(e,t){for(let[n,r]of Object.entries(N[t]))e.style.setProperty(n,r)}function I(e,t,...n){let r=document.createElement(e);if(t?.cls&&(r.className=t.cls),t?.style&&Object.assign(r.style,t.style),t?.text&&(r.textContent=t.text),t?.html&&(r.innerHTML=t.html),t?.dataset)for(let[e,n]of Object.entries(t.dataset))r.dataset[e]=n;if(t?.attrs)for(let[e,n]of Object.entries(t.attrs))r.setAttribute(e,n);for(let e of n)e&&r.appendChild(e);return r}function L(e,t){e.style.background=t?`var(--kvp-hover-bg)`:`transparent`,e.style.boxShadow=t?`var(--kvp-hover-ring)`:`none`}let R=`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" /></svg>`;function z(e,t){let n=I(`div`,{cls:`kvp-tl-row`}),r=I(`button`,{cls:`kvp-btn`,html:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.496 4.136l-12 7a1 1 0 0 0 0 1.728l12 7a1 1 0 0 0 1.504 -.864v-14a1 1 0 0 0 -1.504 -.864z" /><path d="M4 4a1 1 0 0 1 .993 .883l.007 .117v14a1 1 0 0 1 -1.993 .117l-.007 -.117v-14a1 1 0 0 1 1 -1z" /></svg>`}),i=I(`button`,{cls:`kvp-btn`,html:R}),a=I(`button`,{cls:`kvp-btn`,html:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5v14a1 1 0 0 0 1.504 .864l12 -7a1 1 0 0 0 0 -1.728l-12 -7a1 1 0 0 0 -1.504 .864z" /><path d="M20 4a1 1 0 0 1 .993 .883l.007 .117v14a1 1 0 0 1 -1.993 .117l-.007 -.117v-14a1 1 0 0 1 1 -1z" /></svg>`}),o=I(`button`,{cls:`kvp-btn`,text:`Loop`});n.append(r,i,a,o);let s=I(`div`,{cls:`kvp-scrub-wrap`}),c=I(`div`,{cls:`kvp-scrub-segments`,style:{gap:e?`1px`:`0`}}),l=I(`div`,{cls:`kvp-scrub-marker`}),u=I(`input`,{cls:`kvp-scrub-input`,attrs:{type:`range`,min:`0`,max:`1000`,step:`1`}});return u.value=String(t),s.append(c,l,u),n.appendChild(s),{row:n,startBtn:r,playBtn:i,endBtn:a,loopBtn:o,input:u,segments:c,updateMarker:()=>{let e=Number(u.value),t=Number.isFinite(e)?Math.max(0,Math.min(1,e/1e3)):0,n=Math.max(s.clientWidth-8,8);l.style.left=`${8+(n-8)*t}px`},setLoopState:e=>{o.style.background=e?`var(--kvp-btn-active-bg)`:`var(--kvp-btn-bg)`},setPlayState:e=>{i.innerHTML=e?`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" /><path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" /></svg>`:R,i.style.background=e?`var(--kvp-btn-active-bg)`:`var(--kvp-btn-bg)`}}}let B=`#31a24c`,V=`#cf2f2f`;function H(e){let t=I(`div`,{cls:`kvp-metric-fill`,style:{background:B}}),n=I(`div`,{cls:`kvp-metric-threshold`}),r=I(`div`,{cls:`kvp-metric-bar`},t,n),i=I(`span`,{cls:`kvp-mono`,text:`-`});return{row:I(`div`,{cls:`kvp-metric-row`},I(`div`,{cls:`kvp-metric-name`,text:e}),r,i),valueLabel:i,fill:t,thresholdLine:n}}function U(e,t,n){if(t===void 0||Number.isNaN(t)){e.valueLabel.textContent=`-`,e.fill.style.width=`0%`,e.fill.style.background=`#999999`,e.thresholdLine.style.display=`none`;return}let r=Math.max(0,Math.min(1,t));if(e.valueLabel.textContent=`${Math.round(r*100)}%`,e.fill.style.width=`${r*100}%`,n===void 0||Number.isNaN(n)){e.fill.style.background=B,e.thresholdLine.style.display=`none`;return}let i=Math.max(0,Math.min(1,n));e.thresholdLine.style.display=`block`,e.thresholdLine.style.left=`calc(${i*100}% - 1px)`,e.fill.style.background=t<=n?B:V}function ie(e,t){let n=Math.max(0,Math.min(1,e)),r=I(`div`,{cls:`kvp-angle-bar`},I(`div`,{cls:`kvp-angle-fill`,style:{width:`${n*100}%`,background:t!==void 0&&e>t?V:B}}));if(t!==void 0&&!Number.isNaN(t)){let e=Math.max(0,Math.min(1,t));r.appendChild(I(`div`,{cls:`kvp-metric-threshold`,style:{left:`calc(${e*100}% - 1px)`}}))}let i=I(`span`,{cls:`kvp-mono`,text:`${Math.round(n*100)}%`});return I(`div`,{cls:`kvp-angle-row`},I(`div`,void 0,r),i)}function ae(e,t,r){e.innerHTML=``;let i=Math.max(t,1);for(let t=0;t<i;t+=1){let i=I(`span`,{cls:`kvp-zone`,style:{background:n(t)}});r[t]&&i.appendChild(I(`span`,{cls:`kvp-badge`,text:`!`})),e.appendChild(i)}}function oe(e,t){let n=Array.from({length:t},()=>!1),r=e.thresholds,i=e.reference_raw.strokes.length,a=e.user_raw.strokes.length,o=new Map;for(let t of e.composition.stroke_details??[])o.set(t.stroke_idx,Math.max(t.start.distance,t.end.distance));for(let s=0;s<t;s+=1){let t=s>=i||s>=a,c=e.dtw?.strokes?.[s]?.dtw_error,l=e.rms?.strokes?.[s]?.rms,u=o.get(s),d=r?.dtw!==void 0&&c!==void 0&&c>r.dtw,f=r?.rms!==void 0&&l!==void 0&&l>r.rms,p=r?.position!==void 0&&u!==void 0&&u>r.position;n[s]=t||d||f||p}return n}function W(e,t){return{x:t.scale_x*e.x+t.translate_x,y:t.scale_y*e.y+t.translate_y}}function se(e,t){return e?.map(e=>W(e,t))}function G(e,t,n,r){if(!(t.points.length<2)){e.strokeStyle=n,e.lineWidth=r,e.lineCap=`round`,e.lineJoin=`round`,e.beginPath(),e.moveTo(t.points[0].x,t.points[0].y);for(let n=1;n<t.points.length;n+=1)e.lineTo(t.points[n].x,t.points[n].y);e.stroke()}}function K(e,t,r,i,a,o){let s=e.getContext(`2d`);if(!s)return;s.clearRect(0,0,e.width,e.height),s.fillStyle=a,s.fillRect(0,0,e.width,e.height),s.strokeStyle=o,s.strokeRect(.5,.5,e.width-1,e.height-1);let c=t?{points:t,label_pos:null}:void 0,l=r?{points:r,label_pos:null}:void 0,u=[c,l].filter(Boolean);if(u.length===0)return;let d=1/0,f=1/0,p=-1/0,m=-1/0;for(let e of u)for(let t of e.points)d=Math.min(d,t.x),f=Math.min(f,t.y),p=Math.max(p,t.x),m=Math.max(m,t.y);let h=Math.max(p-d,1e-9),g=Math.max(m-f,1e-9),_=Math.max(e.width-24,1),v=Math.max(e.height-24,1),y=Math.min(_/h,v/g),b=12+(_-h*y)/2,x=12+(v-g*y)/2,S=e=>({points:e.points.map(e=>({x:b+(e.x-d)*y,y:x+(e.y-f)*y})),label_pos:null}),C=n(i);c&&G(s,S(c),C.replace(`rgb(`,`rgba(`).replace(`)`,`, 0.25)`),5),l&&G(s,S(l),C,2.4)}function q(e){return typeof e==`string`?JSON.parse(e):e}function J(e,t){let n=t?.themeMode??`light`,r=t?.initialMode??`morph_loop`,i=`transparent`,a=n===`dark`?`#57637d`:`#d4d4d4`,o=I(`div`,{cls:`kvp-root`});P(o),F(o,n);let s=z(!0,1e3),c=z(!1,0),l=I(`div`,{cls:`kvp-top`},s.row,c.row);o.appendChild(l);let u=I(`canvas`,{cls:`kvp-viewer`});u.width=1,u.height=1;let d=I(`button`,{cls:`kvp-btn`,text:`Show`,dataset:{overallBtn:`1`}}),f=I(`div`,{cls:`kvp-summary-header`},I(`div`,{cls:`kvp-title`,text:`Overall`}),d),p=H(`Direction`),m=H(`Shape`),h=H(`Placement`),g=H(`Angles`);p.row.dataset.metricFocus=`dtw`,m.row.dataset.metricFocus=`rms`,h.row.dataset.metricFocus=`position`;let _=I(`div`,{cls:`kvp-flex-col`},f,p.row,m.row,h.row),v=I(`div`,{cls:`kvp-title`,text:`Stroke -`}),y=I(`canvas`,{cls:`kvp-preview`});y.width=220,y.height=120;let b=H(`Direction`),x=H(`Shape`),S=H(`Placement`),C=I(`div`,{cls:`kvp-layer kvp-layer-visible`},I(`div`,{cls:`kvp-divider`}),v,y,b.row,x.row,S.row),w=I(`div`,{cls:`kvp-angle-list`}),T=I(`div`,{cls:`kvp-layer kvp-layer-hidden`},I(`div`,{cls:`kvp-divider`}),I(`div`,{cls:`kvp-title`,text:`Top Angle Issues`}),w),ee=I(`div`,{cls:`kvp-lower`},C,T),E=I(`div`,{cls:`kvp-angle-hover`},g.row,ee),te=I(`div`,{cls:`kvp-body`},u,I(`div`,{cls:`kvp-side`},_,E));o.appendChild(te);let D=null,O=q(e),k=!1,ne=!1,A=!1,j=!1,M=null,N=null,R=null,B=!1,V=e=>{d.textContent=e?`Showing`:`Show`,d.style.background=e?`var(--kvp-btn-active-bg)`:`var(--kvp-btn-bg)`},W=e=>{D?.setMetricFocus(e)},G=()=>{N&&=(L(N,!1),null),M=null,W(null)},J=()=>{R&&=(L(R,!1),null),D?.setAngleIssueFocus(null)},Y=()=>{G(),J()},ce=()=>{let e=O.max_errors,t=O.thresholds;U(p,e?.dtw,t?.dtw),U(m,e?.rms,t?.rms),U(h,e?.position,t?.position),U(g,e?.relative_angle,t?.relative_angle)},le=()=>{B||(B=!0,C.className=`kvp-layer kvp-layer-hidden`,T.className=`kvp-layer kvp-layer-visible`)},ue=()=>{B&&(B=!1,T.className=`kvp-layer kvp-layer-hidden`,C.className=`kvp-layer kvp-layer-visible`,D?.setAngleIssueFocus(null),W(null))},de=()=>{w.innerHTML=``,R=null;let e=[...O.composition.angle_details??[]];e.sort((e,t)=>t.weighted_diff-e.weighted_diff);let t=e.slice(0,5);if(t.length===0){w.appendChild(I(`div`,{cls:`kvp-empty`,text:`No angle details`}));return}let n=O.thresholds?.relative_angle;for(let e of t){let t=ie(e.weighted_diff,n),r={strokeIndices:e.stroke_indices,pointTypes:e.point_types};t.addEventListener(`mouseenter`,()=>{R&&R!==t&&L(R,!1),R=t,L(t,!0),D?.setAngleIssueFocus(r)}),w.appendChild(t)}},fe=e=>{let t=D?.getStrokeCount()??0,n=O.reference_raw.strokes.length;if(e<0||t===0){v.textContent=`Stroke - / ${n}`,U(b,void 0,O.thresholds?.dtw),U(x,void 0,O.thresholds?.rms),U(S,void 0,O.thresholds?.position),K(y,void 0,void 0,0,i,a);return}v.textContent=`Stroke ${e+1} / ${n}`;let r=O.dtw?.strokes?.[e]?.dtw_error,o=O.rms?.strokes?.[e],s=o?.rms,c=O.composition.stroke_details?.find(t=>t.stroke_idx===e),l=c?Math.max(c.start.distance,c.end.distance):void 0;U(b,r,O.thresholds?.dtw),U(x,s,O.thresholds?.rms),U(S,l,O.thresholds?.position),K(y,o?.reference_points_normalized??se(O.reference_raw.strokes[e]?.points,O.composition.alignment.reference_to_aligned),o?.user_points_normalized??se(O.user_raw.strokes[e]?.points,O.composition.alignment.user_to_aligned),e,i,a)},pe=e=>{O=q(e);let t=Math.max(o.clientWidth||1e3,320),i=Math.max(o.clientHeight||500,260),a=Math.max(t-340-16,220),l=Math.max(i-70-10,180);u.width=a,u.height=l,u.style.height=`${l}px`,D?.dispose(),D=re(u,O,{onDrawProgress:e=>{s.input.value=String(Math.round(e*1e3)),s.updateMarker()},onMorphProgress:e=>{c.input.value=String(Math.round(e*1e3)),c.updateMarker()},onStrokeIndexChange:e=>fe(e),onDrawLoopChange:e=>{k=e,s.setLoopState(e)},onMorphLoopChange:e=>{ne=e,c.setLoopState(e)},onOverallModeChange:e=>V(e),themeMode:n});let d=D.getStrokeCount();ae(s.segments,d,oe(O,d)),ce(),de(),ue(),s.setLoopState(!1),c.setLoopState(!1),s.setPlayState(!1),c.setPlayState(!1),V(!1),k=!1,ne=!1,A=!1,j=!1,D.setDrawProgress(1),s.input.value=`1000`,c.input.value=`0`,s.updateMarker(),c.updateMarker(),fe(Math.max(0,d-1)),r===`overall`?V(D.toggleOverallMode()):r===`draw`?(D.setDrawProgress(0),D.playDraw(),A=!0,s.setPlayState(!0)):r===`draw_loop`?(D.setDrawProgress(0),s.setLoopState(D.toggleDrawLoop()),D.playDraw(),A=!0,s.setPlayState(!0)):r===`morph`?(D.setMorphProgress(0),D.playMorph(),j=!0,c.setPlayState(!0)):r===`morph_loop`&&(D.setMorphProgress(0),c.setLoopState(D.toggleMorphLoop()),D.playMorph(),j=!0,c.setPlayState(!0))};return s.playBtn.addEventListener(`click`,()=>{D&&(A?(D.pauseDraw(),A=!1,s.setPlayState(!1)):(D.playDraw(),A=!0,s.setPlayState(!0)))}),s.loopBtn.addEventListener(`click`,()=>{if(D)if(k){let e=D.toggleDrawLoop();s.setLoopState(e),!e&&A&&(D.pauseDraw(),A=!1,s.setPlayState(!1))}else s.setLoopState(D.toggleDrawLoop()),D.playDraw(),A=!0,s.setPlayState(!0)}),s.startBtn.addEventListener(`click`,()=>{if(D){if(Y(),k){let e=D.toggleDrawLoop();s.setLoopState(e),k=e}D.pauseDraw(),s.input.value=`0`,s.updateMarker(),D.setDrawProgress(0),A=!1,s.setPlayState(!1)}}),s.endBtn.addEventListener(`click`,()=>{D&&(D.pauseDraw(),D.setDrawProgress(1),A=!1,s.setPlayState(!1))}),s.input.addEventListener(`input`,()=>{D&&(D.setDrawProgress(Number(s.input.value)/1e3),s.updateMarker())}),c.playBtn.addEventListener(`click`,()=>{D&&(Y(),j?(D.pauseMorph(),j=!1,c.setPlayState(!1)):(D.playMorph(),j=!0,c.setPlayState(!0)))}),c.loopBtn.addEventListener(`click`,()=>{if(D)if(ne){let e=D.toggleMorphLoop();c.setLoopState(e),!e&&j&&(D.pauseMorph(),j=!1,c.setPlayState(!1))}else c.setLoopState(D.toggleMorphLoop()),D.playMorph(),j=!0,c.setPlayState(!0)}),c.startBtn.addEventListener(`click`,()=>{D&&(D.pauseMorph(),D.setMorphProgress(0),j=!1,c.setPlayState(!1))}),c.endBtn.addEventListener(`click`,()=>{D&&(D.pauseMorph(),D.setMorphProgress(1),j=!1,c.setPlayState(!1))}),c.input.addEventListener(`input`,()=>{D&&(D.setMorphProgress(Number(c.input.value)/1e3),c.updateMarker())}),d.addEventListener(`click`,()=>{D&&(Y(),V(D.toggleOverallMode()))}),_.addEventListener(`mousemove`,e=>{let t=e.target,n=t?.closest(`[data-metric-focus]`);if(!n){t?.closest(`[data-overall-btn='1']`)&&(N&&=(L(N,!1),null),M=null,W(null));return}let r=n.dataset.metricFocus;!r||r===M||(M=r,N&&L(N,!1),N=n,L(N,!0),W(r))}),_.addEventListener(`mouseleave`,()=>{M=null,N&&L(N,!1),N=null,W(null)}),w.addEventListener(`mouseleave`,()=>{R&&=(L(R,!1),null),D?.setAngleIssueFocus(null)}),g.row.addEventListener(`mouseenter`,()=>{L(g.row,!0),le()}),T.addEventListener(`mouseenter`,()=>le()),E.addEventListener(`mouseleave`,()=>{L(g.row,!1),ue()}),requestAnimationFrame(()=>pe(O)),{element:o,setData:e=>pe(e),play:()=>D?.playDraw(),pause:()=>{},restart:()=>{D?.setDrawProgress(0),D?.playDraw()},dispose:()=>{D?.dispose(),D=null,o.remove()}}}return e.createValidationGuiPanel=J,e.renderValidationPanel=re,e})({});