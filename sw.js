let currencyCacheName = 'currencyConversion-v2';
let filesToCache = [
	'./index.html',
	'./main.css',
	'./converter.js',
	'https://free.currencyconverterapi.com/api/v5/currencies',
	'https://maxcdn.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css',
	'https://maxcdn.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js',
	'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'
];


self.addEventListener('install', (event)=>{
	//console.log('sw installing');

  	event.waitUntil(
  		caches.open(currencyCacheName).then((cache)=>{
  		//console.log('caching files');
    	return cache.addAll(filesToCache);
  }));

});

self.addEventListener('activate', (event)=>{

  event.waitUntil(caches.keys().then((cacheNames)=>{
    return Promise.all(cacheNames.map((cacheName)=>{
    	if(cacheName !== currencyCacheName){
    		//console.log('deleting old cache from ',cacheName);
    		return caches.delete(cacheName);
    	}	      
    }));
  }));
  //console.log('sw activated');
});

self.addEventListener('fetch', (event)=>{
 
  	event.respondWith(
  		//function tries to get resource from cache,
  		//otherwise loads from the network
  			serveCurrency(event.request)
  		);
  });

//function that responds to request
//and checks for request in the cache,
//if no cache, it loads from the network
serveCurrency = (request)=>{
	let currUrl = request.url;
	//opning cache
	return caches.open(currencyCacheName).then((cache)=>{
		//try match the request with the request in the cache
		return cache.match(currUrl).then((response)=>{
			if (response) {
				//console.log('sw Response found in cache ', request.url);
				return response;
			}
			//if no request cached, fetch from the network
			return fetch(request).then((networkResponse)=>{
				//add new request into the cache
				cache.put(currUrl, networkResponse.clone());
				return networkResponse;
			}).catch((error)=>{
			console.log('Error occurred while getting data. Check internet connection.',error);
		});
		});
	}
 )}