(()=>{
  const LOCATIONS=[
    {name:'Lakewood',state:'NJ',latitude:40.0821,longitude:-74.2097},
    {name:'Toms River',state:'NJ',latitude:39.9537,longitude:-74.1979}
  ];
  const REFRESH_MS=15*60*1000;
  let loading=false,lastUpdated=null;

  function weatherInfo(code,isDay){
    const night=Number(isDay)===0;
    if(code===0)return {label:'Clear',icon:night?'bi-moon-stars-fill':'bi-sun-fill',tone:night?'night':'sunny'};
    if(code===1)return {label:'Mostly Clear',icon:night?'bi-moon-stars':'bi-sun',tone:night?'night':'sunny'};
    if(code===2)return {label:'Partly Cloudy',icon:night?'bi-cloud-moon-fill':'bi-cloud-sun-fill',tone:'cloudy'};
    if(code===3)return {label:'Cloudy',icon:'bi-cloud-fill',tone:'cloudy'};
    if(code===45||code===48)return {label:'Foggy',icon:'bi-cloud-fog2-fill',tone:'fog'};
    if([51,53,55,56,57].includes(code))return {label:'Drizzle',icon:'bi-cloud-drizzle-fill',tone:'rain'};
    if([61,63,65,66,67].includes(code))return {label:'Rain',icon:'bi-cloud-rain-heavy-fill',tone:'rain'};
    if([71,73,75,77,85,86].includes(code))return {label:'Snow',icon:'bi-cloud-snow-fill',tone:'snow'};
    if([80,81,82].includes(code))return {label:'Showers',icon:'bi-cloud-rain-fill',tone:'rain'};
    if([95,96,99].includes(code))return {label:'Thunderstorms',icon:'bi-cloud-lightning-rain-fill',tone:'storm'};
    return {label:'Current Conditions',icon:'bi-cloud-sun-fill',tone:'cloudy'};
  }

  function apiUrl(){
    const url=new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude',LOCATIONS.map(x=>x.latitude).join(','));
    url.searchParams.set('longitude',LOCATIONS.map(x=>x.longitude).join(','));
    url.searchParams.set('current','temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m');
    url.searchParams.set('daily','temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max');
    url.searchParams.set('temperature_unit','fahrenheit');
    url.searchParams.set('wind_speed_unit','mph');
    url.searchParams.set('timezone','America/New_York');
    url.searchParams.set('forecast_days','3');
    return url.toString();
  }

  function ensureWidget(){
    const card=document.querySelector('#profile > .card');
    if(!card)return null;
    let widget=card.querySelector('#maWeatherWidget');
    if(!widget){
      widget=document.createElement('section');
      widget.id='maWeatherWidget';
      widget.className='ma-weather-widget';
      widget.setAttribute('aria-label','Local weather');
      widget.innerHTML=`
        <div class="ma-weather-head">
          <div><h3><i class="bi bi-cloud-sun"></i> Local Weather</h3><div class="ma-weather-updated" id="maWeatherUpdated">Loading current conditions…</div></div>
          <button type="button" id="maWeatherRefresh" aria-label="Refresh weather"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
        </div>
        <div id="maWeatherCards" class="ma-weather-grid" aria-live="polite"></div>
        <div class="ma-weather-source">Weather data: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a></div>`;
      const dashboard=card.querySelector('.ma-dashboard');
      const heading=card.querySelector('.queue-title');
      if(dashboard)dashboard.insertAdjacentElement('afterend',widget);
      else if(heading)heading.insertAdjacentElement('afterend',widget);
      else card.prepend(widget);
      widget.querySelector('#maWeatherRefresh').onclick=()=>refreshWeather(true);
    }
    return widget;
  }

  function ensureStyles(){
    if(document.querySelector('#maWeatherStyles'))return;
    const style=document.createElement('style');
    style.id='maWeatherStyles';
    style.textContent=`
      .ma-weather-widget{margin:0 0 18px;padding:16px;border:1px solid #d9e4ef;border-radius:16px;background:linear-gradient(135deg,#f8fbff,#eef6ff);box-shadow:0 7px 22px rgba(30,61,91,.08)}
      .ma-weather-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}
      .ma-weather-head h3{margin:0 0 4px;font-size:20px;color:#173b63}.ma-weather-head h3 i{color:#d39a2f;margin-right:6px}
      .ma-weather-updated{font-size:13px;color:#687386;font-weight:700}
      #maWeatherRefresh{background:#fff;border-color:#b8cadd;color:#245786;font-weight:800}
      .ma-weather-grid{display:grid;grid-template-columns:repeat(2,minmax(260px,1fr));gap:12px}
      .ma-weather-card{position:relative;overflow:hidden;min-height:184px;border-radius:15px;padding:17px;color:#fff;box-shadow:0 8px 20px rgba(25,58,88,.16)}
      .ma-weather-card:after{content:'';position:absolute;width:145px;height:145px;border-radius:50%;right:-45px;bottom:-64px;background:rgba(255,255,255,.12)}
      .ma-weather-card.sunny{background:linear-gradient(135deg,#337fbb,#4da8d8 62%,#f0b94a)}
      .ma-weather-card.night{background:linear-gradient(135deg,#1e2f59,#314d7c 65%,#5c6fa8)}
      .ma-weather-card.cloudy,.ma-weather-card.fog{background:linear-gradient(135deg,#536f87,#7894aa)}
      .ma-weather-card.rain{background:linear-gradient(135deg,#24547d,#407ca3)}
      .ma-weather-card.snow{background:linear-gradient(135deg,#4d7b9f,#8bb6cf)}
      .ma-weather-card.storm{background:linear-gradient(135deg,#343a64,#625b86)}
      .ma-weather-location{font-size:18px;font-weight:900;letter-spacing:.2px}.ma-weather-location small{font-size:13px;opacity:.84}
      .ma-weather-main{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:11px}
      .ma-weather-temp{font-size:42px;font-weight:900;line-height:1}.ma-weather-condition{font-size:14px;font-weight:800;margin-top:5px}
      .ma-weather-icon{font-size:48px;line-height:1;filter:drop-shadow(0 4px 8px rgba(0,0,0,.14))}
      .ma-weather-details{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:15px;position:relative;z-index:1}
      .ma-weather-detail{padding:7px 8px;border-radius:9px;background:rgba(255,255,255,.14)}
      .ma-weather-detail span{display:block;font-size:12px;font-weight:700;opacity:.85}.ma-weather-detail b{display:block;font-size:14px;margin-top:2px}
      .ma-weather-source{text-align:right;font-size:12px;color:#687386;margin-top:9px}.ma-weather-source a{color:#245786;font-weight:700}
      .ma-weather-error{grid-column:1/-1;padding:18px;border:1px solid #efc0c0;border-radius:12px;background:#fff5f5;color:#8d2f2f;font-weight:800;text-align:center}
      .ma-weather-loading{grid-column:1/-1;padding:20px;border:1px dashed #b8cadd;border-radius:12px;background:#fff;color:#52697f;text-align:center;font-weight:800}
      @media(max-width:760px){.ma-weather-grid{grid-template-columns:1fr}.ma-weather-card{min-height:174px}}
      @media(max-width:430px){.ma-weather-details{grid-template-columns:1fr}.ma-weather-detail{display:flex;justify-content:space-between;gap:12px}.ma-weather-detail span,.ma-weather-detail b{display:inline;margin:0}}
    `;
    document.head.appendChild(style);
  }

  function weatherCard(location,data){
    const current=data.current||{},daily=data.daily||{};
    const info=weatherInfo(Number(current.weather_code),current.is_day);
    const temp=Math.round(Number(current.temperature_2m));
    const feels=Math.round(Number(current.apparent_temperature));
    const high=Math.round(Number(daily.temperature_2m_max?.[0]));
    const low=Math.round(Number(daily.temperature_2m_min?.[0]));
    const rain=daily.precipitation_probability_max?.[0];
    const wind=Math.round(Number(current.wind_speed_10m));
    return `<article class="ma-weather-card ${info.tone}">
      <div class="ma-weather-location">${location.name} <small>${location.state}</small></div>
      <div class="ma-weather-main"><div><div class="ma-weather-temp">${temp}°</div><div class="ma-weather-condition">${info.label}</div></div><i class="bi ${info.icon} ma-weather-icon"></i></div>
      <div class="ma-weather-details">
        <div class="ma-weather-detail"><span>Feels Like</span><b>${feels}°</b></div>
        <div class="ma-weather-detail"><span>High / Low</span><b>${high}° / ${low}°</b></div>
        <div class="ma-weather-detail"><span>Rain / Wind</span><b>${rain??'—'}% · ${wind} mph</b></div>
      </div>
    </article>`;
  }

  async function refreshWeather(force=false){
    const widget=ensureWidget();
    if(!widget||loading)return;
    if(!force&&lastUpdated&&Date.now()-lastUpdated.getTime()<REFRESH_MS)return;
    loading=true;
    const cards=widget.querySelector('#maWeatherCards');
    const updated=widget.querySelector('#maWeatherUpdated');
    const button=widget.querySelector('#maWeatherRefresh');
    cards.innerHTML='<div class="ma-weather-loading"><i class="bi bi-cloud-arrow-down"></i> Loading Lakewood and Toms River weather…</div>';
    updated.textContent='Updating current conditions…';
    button.disabled=true;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch(apiUrl(),{cache:'no-store',signal:controller.signal});
      if(!response.ok)throw new Error(`Weather service returned ${response.status}`);
      const payload=await response.json();
      const results=Array.isArray(payload)?payload:[payload];
      if(results.length!==LOCATIONS.length)throw new Error('Weather locations were incomplete');
      cards.innerHTML=results.map((data,index)=>weatherCard(LOCATIONS[index],data)).join('');
      lastUpdated=new Date();
      updated.textContent=`Updated ${lastUpdated.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}`;
    }catch(error){
      console.error('Weather widget:',error);
      cards.innerHTML='<div class="ma-weather-error"><i class="bi bi-exclamation-cloud"></i> Weather is temporarily unavailable. Select Refresh to try again.</div>';
      updated.textContent='Unable to update weather';
    }finally{
      clearTimeout(timer);loading=false;button.disabled=false;
    }
  }

  function start(){
    ensureStyles();
    setTimeout(()=>refreshWeather(false),500);
    setTimeout(()=>{ensureWidget();refreshWeather(false)},1600);
    document.addEventListener('click',event=>{if(event.target.closest('[data-tab="profile"]'))setTimeout(()=>refreshWeather(false),150)});
    setInterval(()=>refreshWeather(false),REFRESH_MS);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
