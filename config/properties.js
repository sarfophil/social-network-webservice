/**
 * Application Properties defined here
 */



const config = {
    dbConnectionHost: 'mongodb://localhost:27017/',
    dbName:'social-network-db',
    // geoDistance is used by GEOJSON to query posts based on user provided coords and geodistance
    geoDistance: {minDistance: 0,maxDistance: 1000},
    maxVoilationLimit: 20,
    jwt: {
        issuer: 'mwa-team',
        secret: '1qaz@WSX',
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        alg: 'HS256'
    },
    appcodes:{
        follow: 111,
        unfollow: 112
    }
};

module.exports = config;