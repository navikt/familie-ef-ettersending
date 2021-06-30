const isProd = () => {
  if (typeof window === 'undefined') {
    return process.env.ENV === 'prod';
  }
  return window.location.hostname.indexOf('www') > -1;
};

const isDev = () => {
  if (typeof window === 'undefined') {
    return process.env.ENV === 'dev';
  }
  return window.location.hostname.indexOf('dev') > -1;
};

const getEnv = () => {
  if (isProd()) {
    console.log('Miljø -> Prod');
    return {
      loginService: 'https://loginservice.nav.no/login?',
      apiUrl: 'https://www.nav.no/familie/alene-med-barn/soknad-api',
      dekoratørUrl: 'https://www.nav.no/dekoratoren/?simple=true',
      port: 9000,
    };
  } else if (isDev()) {
    console.log('Miljø -> Dev');
    return {
      loginService: 'https://loginservice.dev.nav.no/login?',
      apiUrl: 'https://www-q0.nav.no/familie/alene-med-barn/soknad-api',
      dekoratørUrl: 'https://www.nav.no/dekoratoren/?simple=true',
      port: 9000,
    };
  } else {
    console.log('Miljø -> Prod or dev not defined');
    return {
      loginService: 'https://loginservice.dev.nav.no/login?',
      apiUrl: 'http://localhost:8091',
      dekoratørUrl: 'https://www.nav.no/dekoratoren/?simple=true',
      port: 3000,
    };
  }
};

export default getEnv;
