import React from 'react';
import '../stil/Vedleggsopplaster.less';
import { DokumentasjonsbehovOversikt } from './DokumentasjonsbehovOversikt';
import { useApp } from '../context/AppContext';
import { hentDokumentasjonsbehov } from '../api-service';
import { useState } from 'react';
import { useEffect } from 'react';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { ISøknadsbehov } from '../typer/søknadsdata';

const Søknadsoversikt = () => {
  const [laster, settLasterverdi] = useState(true);
  const [søknader, settSøknader] = useState<ISøknadsbehov[]>();

  const context = useApp();

  useEffect(() => {
    const hentOgSettSøknader = async () => {
      const søknadsliste = await hentDokumentasjonsbehov(context.søker.fnr);

      settSøknader(søknadsliste);

      console.log('søknadsliste:', søknadsliste);

      settLasterverdi(false);
    };
    if (context.søker != null) hentOgSettSøknader();
  }, [context.søker]);

  if (laster) return <NavFrontendSpinner />;

  return (
    <>
      {søknader.map((søknad) => {
        return (
          <>
            <h3>
              Søknad {søknad.søknadType} sendt inn {søknad.innsendingstidspunkt}
            </h3>
            <DokumentasjonsbehovOversikt søknad={søknad} />
          </>
        );
      })}
    </>
  );
};

export default Søknadsoversikt;
