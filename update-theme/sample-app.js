import{_ as p,o,c as l,a as s,F as g,r as y,b,t as L,d as w,e as S,f as U,g as _,n as V,h as I,w as A,i as x,v as F,j as m,k as P,l as O}from"./tify.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))d(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&d(c)}).observe(document,{childList:!0,subtree:!0});function i(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function d(a){if(a.ep)return;a.ep=!0;const r=i(a);fetch(a.href,r)}})();const H={},B={class:"tify-icon",viewBox:"0 0 24 24"};function R(t,e){return o(),l("svg",B,e[0]||(e[0]=[s("path",{d:"M20.41 19L22.54 21.12L21.12 22.54L19 20.41L16.88 22.54L15.47 21.12L17.59 19L15.47 16.88L16.88 15.47L19 17.59L21.12 15.47L22.54 16.88L20.41 19M13.09 18H4V6H20V13.09C20.72 13.21 21.39 13.46 22 13.81V6C22 4.89 21.11 4 20 4H4C2.9 4 2 4.89 2 6V18C2 19.11 2.9 20 4 20H13.09C13.04 19.67 13 19.34 13 19C13 18.66 13.04 18.33 13.09 18Z"},null,-1)]))}const N=p(H,[["render",R]]),T={},E={class:"tify-icon",viewBox:"0 0 24 24"};function z(t,e){return o(),l("svg",E,e[0]||(e[0]=[s("path",{d:"M21 15V18H24V20H21V23H19V20H16V18H19V15H21M14 18H3V6H19V13H21V6C21 4.89 20.11 4 19 4H3C1.9 4 1 4.89 1 6V18C1 19.11 1.9 20 3 20H14V18Z"},null,-1)]))}const j=p(T,[["render",z]]);class D{constructor(e={}){this.colorMode="auto",this.contentStateActive=new URL(window.location).searchParams.get("iiif-content"),this.id=e.id,this.language=e.language||"en",this.manifestUrl=e.manifestUrl||"",this.sidebarOpen=!1,this.tify=null}destroy(){var i;this.manifestUrl="",(i=this.tify)==null||i.destroy(),this.tify=null;const e=new URL(window.location);e.searchParams.delete(`language${this.id}`),e.searchParams.delete(`manifest${this.id}`),e.searchParams.delete(`tify${this.id}`),window.history.pushState(null,"",e.toString())}loadManifest(e){var d;this.sidebarOpen=!1,e&&(this.manifestUrl=e),(d=this.tify)==null||d.destroy();const i=new URL(window.location);!this.contentStateActive&&i.searchParams.get(`manifest${this.id}`)!==this.manifestUrl&&(i.searchParams.delete(`tify${this.id}`),i.searchParams.set(`manifest${this.id}`,this.manifestUrl),window.history.pushState(null,"",i.toString())),this.tify=new Tify({container:document.getElementById(`container${this.id}`),colorMode:this.colorMode,contentStateEnabled:this.contentStateActive,manifestUrl:this.manifestUrl,translationsDirUrl:"translations",language:this.language,urlQueryKey:`tify${this.id}`}),window.tify=this.tify}setLanguage(e){var d;this.language=e,(d=this.tify)==null||d.setLanguage(e);const i=new URL(window.location);e==="en"?i.searchParams.delete(`language${this.id}`):i.searchParams.set(`language${this.id}`,e),window.history.pushState(null,"",i.toString())}}const q={},W={class:"tify-icon",viewBox:"0 0 24 24"};function Z(t,e){return o(),l("svg",W,e[0]||(e[0]=[s("path",{d:"M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.64 6.35,17.66C9.37,20.67 14.19,20.78 17.33,17.97Z"},null,-1)]))}const K=p(q,[["render",Z]]),J={},Q={class:"tify-icon",viewBox:"0 0 24 24"};function Y(t,e){return o(),l("svg",Q,e[0]||(e[0]=[s("path",{d:"M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56L12,22Z"},null,-1)]))}const G=p(J,[["render",Y]]),X={},ee={class:"tify-icon",viewBox:"0 0 24 24"};function te(t,e){return o(),l("svg",ee,e[0]||(e[0]=[s("path",{d:"M7.5,2C5.71,3.15 4.5,5.18 4.5,7.5C4.5,9.82 5.71,11.85 7.53,13C4.46,13 2,10.54 2,7.5A5.5,5.5 0 0,1 7.5,2M19.07,3.5L20.5,4.93L4.93,20.5L3.5,19.07L19.07,3.5M12.89,5.93L11.41,5L9.97,6L10.39,4.3L9,3.24L10.75,3.12L11.33,1.47L12,3.1L13.73,3.13L12.38,4.26L12.89,5.93M9.59,9.54L8.43,8.81L7.31,9.59L7.65,8.27L6.56,7.44L7.92,7.35L8.37,6.06L8.88,7.33L10.24,7.36L9.19,8.23L9.59,9.54M19,13.5A5.5,5.5 0 0,1 13.5,19C12.28,19 11.15,18.6 10.24,17.93L17.93,10.24C18.6,11.15 19,12.28 19,13.5M14.6,20.08L17.37,18.93L17.13,22.28L14.6,20.08M18.93,17.38L20.08,14.61L22.28,17.15L18.93,17.38M20.08,12.42L18.94,9.64L22.28,9.88L20.08,12.42M9.63,18.93L12.4,20.08L9.87,22.27L9.63,18.93Z"},null,-1)]))}const ie=p(X,[["render",te]]),ne={props:{instance:{type:Object,required:!0}},emits:["change"]},se={"aria-description":"TIFY color mode",role:"radiogroup"},ae={class:"radio"},oe=["value","checked","aria-label","title","onClick"];function le(t,e,i,d,a,r){const c=ie,f=G,v=K;return o(),l("ul",se,[(o(),l(g,null,y(["auto","light","dark"],h=>s("li",{key:h},[s("label",ae,[s("input",{type:"radio",value:h,checked:i.instance.colorMode===h,"aria-label":t.$t(h,i.instance),title:t.$t(h,i.instance),onClick:$=>t.$emit("change",h)},null,8,oe),h==="auto"?(o(),b(c,{key:0})):h==="light"?(o(),b(f,{key:1})):(o(),b(v,{key:2}))])])),64))])}const re=p(ne,[["render",le],["__scopeId","data-v-0f57f6f7"]]),ce={props:{instance:{type:Object,required:!0}},emits:["change"],computed:{languages(){return window.tifyLanguages}}},de=["value"],ue=["value"];function he(t,e,i,d,a,r){return o(),l("p",null,[s("select",{value:i.instance.language,class:"select","aria-label":"TIFY Language",onChange:e[0]||(e[0]=c=>t.$emit("change",c.target.value))},[(o(!0),l(g,null,y(r.languages,(c,f)=>(o(),l("option",{key:f,value:f},L(c),9,ue))),128))],40,de)])}const pe=p(ce,[["render",he],["__scopeId","data-v-9c9fc2e9"]]),fe=[{title:"Historia Astronomiae",url:"https://manifests.sub.uni-goettingen.de/iiif/presentation/PPN623133725/manifest",type:"manifest"},{title:"Algebra Vorlesungsmanuskript",url:"https://manifests.sub.uni-goettingen.de/iiif/presentation/DE-611-HS-3216958/manifest",type:"manifest"},{title:"Johann Christian Wächtlers Commodes Manual, Oder Hand-Buch",url:"https://manifests.sub.uni-goettingen.de/iiif/presentation/PPN1887397396/manifest?version=7a696723",type:"manifest"},{title:"Ragini Bhairavi",url:"https://manifests.collections.yale.edu/yuag/obj/38907",type:"manifest"},{title:"Papyrus of Dioscorus of Aphrodito",url:"https://adore.ugent.be/IIIF/manifests/archive.ugent.be%3A4B39C8CA-6FF9-11E1-8C42-C8A93B7C8C91",type:"manifest"},{title:"Speyerer Evangelistar",url:"https://digital.blb-karlsruhe.de/i3f/v20/1209510/manifest",type:"manifest"},{title:"The Natural Method of Healing",url:"https://iiif.wellcomecollection.org/presentation/v2/b20417081",type:"manifest"},{title:"Jane Eyre Vol. 1",url:"https://api.digitale-sammlungen.de/iiif/presentation/v2/bsb11256781/manifest",type:"manifest"},{title:"Field with Poppies",url:"https://bremen.museum-digital.de/apis/iiif-presentation/147/manifest",type:"manifest"},{title:"IIIF Cookbook",url:"https://develop.uni-goettingen.de/files/iiif-cookbook-collection.json",type:"collection"},{title:"Bodleian Libraries",url:"https://iiif.bodleian.ox.ac.uk/iiif/collection/top",type:"collection"},{title:"Northwestern University Libraries",url:"https://api.dc.library.northwestern.edu/api/v2/collections?as=iiif",type:"collection"},{title:"TU Delft",url:"https://heritage.tudelft.nl/iiif/collection.json",type:"collection"},{title:"Universitätsbibliothek Leipzig",url:"https://iiif.ub.uni-leipzig.de/static/collections/toplevel.json",type:"collection"},{title:"Villanova University",url:"https://digital.library.villanova.edu/Collection/vudl:3/IIIF",type:"collection"},{title:"Wellcome Collection",url:"https://iiif.wellcomecollection.org/presentation/v3/collections/archives",type:"collection"}],me={props:{instance:{type:Object,required:!0}},emits:["load"],data(){return{sampleManifests:fe}}},ge=["aria-description"],_e=["onClick"],Le=["src"],ye={key:0,class:"badge"},ve={class:"title"};function be(t,e,i,d,a,r){return o(),l("section",{"aria-description":t.$t("Sample IIIF Manifests",i.instance)},[s("ul",null,[(o(!0),l(g,null,y(a.sampleManifests,c=>(o(),l("li",{key:c.url},[s("button",{type:"button",onClick:f=>t.$emit("load",c.url)},[s("img",{src:`thumbnails/${c.url.replace(/[^\w]/g,"")}.avif`,alt:"",width:"240",height:"240"},null,8,Le),c.type==="collection"?(o(),l("span",ye,L(t.$t("Collection",i.instance)),1)):w("",!0),s("span",ve,L(c.title),1)],8,_e)]))),128))])],8,ge)}const $e=p(me,[["render",be],["__scopeId","data-v-a9c3e7f3"]]),Ce={},Ie={width:"592",height:"240",viewBox:"0 0 592 240",xmlns:"http://www.w3.org/2000/svg"};function we(t,e){return o(),l("svg",Ie,e[0]||(e[0]=[S('<rect x="12" y="12" width="568" height="216" fill="none" stroke-width="24" data-v-8761aecf></rect><path fill="#06b" d="M199 82h9v76h-9z" opacity=".33" data-v-8761aecf></path><path d="M72 64h96v26h-34v86h-28V90H72" data-v-8761aecf></path><path fill="#06b" d="M208 74h12v92h-12z" opacity=".67" data-v-8761aecf></path><path d="M296 64h84v26h-56v23h52v26h-52v37h-28" data-v-8761aecf></path><path fill="#06b" d="M220 64h28v112h-28z" data-v-8761aecf></path><path d="m520 64-38 75.27V176h-28v-36.73L416 64h30.16L468 107l21.84-43" data-v-8761aecf></path>',7)]))}const Me=p(Ce,[["render",we],["__scopeId","data-v-8761aecf"]]),ke={components:{ColorModeSwitcher:re,LanguageSwitcher:pe,SampleManifests:$e,TifyLogo:Me},data(){return{instances:[]}},mounted(){const t=new URL(window.location).searchParams;t.forEach((e,i)=>{if(!i.startsWith("manifest")&&i!=="iiif-content")return;const d=i==="iiif-content"?"":i.replace("manifest",""),a=this.addInstance({id:d,language:t.get(`language${d}`),manifestUrl:e,urlQueryKey:`tify${d}`});this.$nextTick(()=>{a.loadManifest()})}),this.instances.length||this.addInstance({language:t.get("language")})},methods:{addInstance(t={}){const e={...t};t.id||(e.id=this.getInstanceId());const i=U(new D(e));return this.instances.push(i),i},getInstanceId(){let t="";for(;this.instances.find(e=>e.id===t);)t=((parseInt(t,10)||1)+1).toString();return t},removeInstance(t){t.destroy(),this.instances.length>1&&this.instances.splice(this.instances.findIndex(e=>e.id===t.id),1)}}},Se={class:"app"},Ue={class:"header"},Ve=["aria-controls","aria-expanded","onClick"],Ae=["onSubmit"],xe=["id","onUpdate:modelValue","aria-label","placeholder"],Fe=["disabled"],Pe={style:{display:"flex"}},Oe=["id","hidden"],He={class:"sidebar-controls"},Be={class:"logo"},Re={style:{display:"flex",gap:".5rem","list-style":"none"}},Ne={style:{display:"flex",gap:"1px",flex:"1"}},Te=["aria-label","title"],Ee=["disabled","aria-label","title","onClick"],ze=["id"];function je(t,e,i,d,a,r){const c=_("TifyLogo"),f=j,v=N,h=_("ColorModeSwitcher"),$=_("LanguageSwitcher"),k=_("SampleManifests");return o(),l("div",Se,[(o(!0),l(g,null,y(a.instances,n=>(o(),l("section",{key:n.id,class:"instance",style:V(`color-scheme: ${n.colorMode==="auto"?"light dark":n.colorMode}`)},[s("header",Ue,[n.tify?(o(),l("button",{key:0,type:"button",class:"button","aria-label":"Toggle sidebar","aria-controls":`sidebar${n.id}`,"aria-expanded":n.sidebarOpen,style:{"font-size":"1rem",height:"1.5rem","margin-right":".25rem",padding:".125rem",width:"1.5rem"},onClick:u=>n.sidebarOpen=!n.sidebarOpen},[n.sidebarOpen?(o(),l(g,{key:1},[I(" 🐣 ")],64)):(o(),l(g,{key:0},[I(" 🥚 ")],64))],8,Ve)):w("",!0),s("form",{style:{display:"flex",flex:"1",gap:".5rem"},onSubmit:A(u=>n.loadManifest(),["prevent"])},[x(s("input",{id:`manifest${n.id}`,"onUpdate:modelValue":u=>n.manifestUrl=u,type:"url",class:"input","aria-label":t.$t("IIIF manifest URL",n),placeholder:t.$t("IIIF manifest URL",n),onFocus:e[0]||(e[0]=u=>u.target.select())},null,40,xe),[[F,n.manifestUrl]]),s("button",{type:"submit",class:"button",disabled:!n.manifestUrl},L(t.$t("Load",n)),9,Fe)],40,Ae)]),s("div",Pe,[s("div",{id:`sidebar${n.id}`,class:"sidebar",hidden:!n.sidebarOpen&&n.tify},[s("div",He,[s("div",Be,[m(c)]),s("ul",Re,[s("li",Ne,[s("button",{type:"button",class:"button",style:{"border-radius":"2px 0 0 2px",padding:".125rem",width:"100%"},"aria-label":t.$t("Add instance",n),title:t.$t("Add instance",n),onClick:e[1]||(e[1]=u=>r.addInstance())},[m(f)],8,Te),s("button",{type:"button",class:"button",disabled:!n.tify&&a.instances.length<2,style:{"border-radius":"0 2px 2px 0",padding:".125rem",width:"100%"},"aria-label":t.$t("Remove instance",n),title:t.$t("Remove instance",n),onClick:u=>r.removeInstance(n)},[m(v)],8,Ee)]),s("li",null,[m(h,{instance:n,onChange:u=>{var C;n.colorMode=u,(C=n.tify)==null||C.updateOptions({colorMode:u})}},null,8,["instance","onChange"])])]),m($,{instance:n,onChange:u=>n.setLanguage(u)},null,8,["instance","onChange"])]),m(k,{instance:n,onLoad:u=>n.loadManifest(u)},null,8,["instance","onLoad"])],8,Oe),s("div",{id:`container${n.id}`,class:"container"},null,8,ze)])],4))),128))])}const De=p(ke,[["render",je]]),qe={de:{"Add instance":"Neue Instanz",auto:"automatisch",Collection:"Sammlung",dark:"dunkel","IIIF manifest URL":"IIIF-Manifest-URL",light:"hell",Load:"Laden","Remove instance":"Entferne Instanz","Sample IIIF Manifests":"Beispiel-IIIF-Manifeste"},fr:{"Add instance":"Nouvelle instance",auto:"automatique",Collection:"Collection",dark:"sombre","IIIF manifest URL":"URL du manifeste IIIF",light:"clair",Load:"Charger","Remove instance":"Supprimer l'instance","Sample IIIF Manifests":"Exemples de manifestes IIIF"}},M=P({render:()=>O(De)});M.config.globalProperties.$t=(t,e)=>{var i;return((i=qe[e.language])==null?void 0:i[t])||t};M.mount("#app");
