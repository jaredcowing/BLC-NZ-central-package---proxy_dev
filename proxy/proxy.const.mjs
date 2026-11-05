//set the url of the server you want to test your code with and start the development server using the following command:
// ng serve --proxy-config ./proxy/proxy.conf.mjs
const environments = {
    'blc_union': 'https://blc.primo.exlibrisgroup.com',
};

export const PROXY_TARGET = environments['blc_union']; 
console.log(`[proxy] Active proxy target: ${PROXY_TARGET}`);