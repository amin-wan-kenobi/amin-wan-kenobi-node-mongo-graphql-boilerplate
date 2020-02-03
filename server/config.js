import config from './config/config.json';

const env = process.env.NODE_ENV || 'development';
if (env === 'Boilerplate-Prod') {
    //It is prod environment so no need for console log anymore
    console.log = function () {
        //Do nothing
    };
    console.warn = function () {
        //Do nothing
    };
}
let envConfig = config[env];
if (envConfig) {
  Object.keys(envConfig).forEach((key) => {
      // Do not override environment with config file
      if(!process.env[key]) {
        process.env[key] = envConfig[key];
      }
  });
}
console.log('env *******', env);
