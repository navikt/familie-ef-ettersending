import { useState, useEffect } from 'react';
import createUseContext from 'constate';
import {
  InnloggetStatus,
  verifiserAtBrukerErAutentisert,
} from '../../shared-utils/autentisering';
import { IVedleggMedKrav } from '../typer/søknadsdata';
import axios from 'axios';
import { ISøker } from '../typer/person';

const [AppProvider, useApp] = createUseContext(() => {
  const [vedleggMedKrav, settVedleggMedKrav] = useState<IVedleggMedKrav[]>([]);
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

  const leggTilVedleggMedKrav = (vedleggMedKrav: IVedleggMedKrav) => {
    console.log('setter vedlegg emd krav');
    settVedleggMedKrav((søknadsdataNy) => [...søknadsdataNy, vedleggMedKrav]);
  };

  useEffect(() => {
    if (innloggetStatus === InnloggetStatus.AUTENTISERT) {
      hentPersoninfo();
    }
  }, [innloggetStatus]);

  return {
    leggTilVedleggMedKrav,
    vedleggMedKrav,
    innloggetStatus,
    søker,
  };
});

export { AppProvider, useApp };
