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

// Se på disse url-ene. Her lenker dev og env til hele lenken, mens den siste har bare port 8082 og sender med resten i api-service

export interface EnvironmentProps {
  loginService: string;
  apiUrl: string;
  dokumentUrl: string;
  mergeDokumentUrl: string;
  port: number;
  dekoratørEnv: 'dev' | 'prod';
}

const getEnv = (): EnvironmentProps => {
  if (isProd()) {
    return {
      loginService: 'https://loginservice.nav.no/login?',
      apiUrl: 'https://www.nav.no/familie/alene-med-barn/soknad-api',
      dokumentUrl:
        'https://www.nav.no/familie/dokument/api/mapper/familievedlegg',
      mergeDokumentUrl:
        'https://www.nav.no/familie/dokument/api/mapper/merge/familievedlegg',
      port: 9000,
      dekoratørEnv: 'prod',
    };
  } else if (isDev()) {
    return {
      loginService: 'https://loginservice.dev.nav.no/login?',
      apiUrl: 'https://familie.dev.nav.no/familie/alene-med-barn/soknad-api',
      dokumentUrl:
        'https://familie-dokument.dev.nav.no/familie/dokument/api/mapper/familievedlegg',
      mergeDokumentUrl:
        'https://familie-dokument.dev.nav.no/familie/dokument/api/mapper/merge/familievedlegg',
      port: 9000,
      dekoratørEnv: 'dev',
    };
  } else {
    return {
      loginService: 'https://loginservice.dev.nav.no/login?',
      apiUrl: 'http://localhost:8091',
      dokumentUrl:
        'http://localhost:8082/familie/dokument/api/mapper/familievedlegg',
      mergeDokumentUrl:
        'http://localhost:8082/familie/dokument/api/mapper/merge/familievedlegg',
      port: 3000,
      dekoratørEnv: 'dev',
    };
  }
};

export default getEnv;
