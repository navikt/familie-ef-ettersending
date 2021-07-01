import { useState, useEffect } from 'react';
import createUseContext from 'constate';
import {
  InnloggetStatus,
  verifiserAtBrukerErAutentisert,
} from '../../shared-utils/autentisering';
import axios from 'axios';

interface ISøker {
  adresse: IAdresse;
  egenansatt: boolean;
  fnr: string;
  forkortetNavn: string;
  harAdressesperre: boolean;
  siviltilstand: string;
  statsborgerskap: string;
}

interface IAdresse {
  adresse: string;
  postnummer: string;
  poststed: string;
}

const [AppProvider, useApp] = createUseContext(() => {
  const [testVerdi, setTestVerdi] = useState('Default testverdi');
  const [innloggetStatus, setInnloggetStatus] = useState<InnloggetStatus>(
    InnloggetStatus.IKKE_VERIFISERT
  );
  const [søker, settSøker] = useState<ISøker>(null);

  const hentPersoninfo = () => {
    axios
      .get('http://localhost:8091/api/oppslag/sokerinfo', {
        withCredentials: true,
      })
      .then((response: { data: any }) => {
        settSøker(response.data.søker);
      });
    return;
  };
  useEffect(() => {
    verifiserAtBrukerErAutentisert(setInnloggetStatus);
  }, []);

  useEffect(() => {
    hentPersoninfo();
  }, []);

  return {
    testVerdi,
    setTestVerdi,
    innloggetStatus,
    søker,
  };
});

export { AppProvider, useApp };
