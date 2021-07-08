import React from 'react';
import { useState } from 'react';
import Krav from './Dokumentasjonsbehov';
import { useEffect } from 'react';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Hovedknapp } from 'nav-frontend-knapper';
import { useApp } from '../context/AppContext';
import { IVedleggMedKrav } from '../typer/søknadsdata';
import { hentDokumentasjonsbehov } from '../api-service';
import { IDokumentasjonsbehovListe } from '../typer/dokumentasjonsbehov';

export const DokumentasjonsbehovOversikt: React.FC = () => {
  const [dokumentasjonsbehov, settDokumentasjonsbehov] =
    useState<IDokumentasjonsbehovListe[]>(null);
  const [laster, settLasterverdi] = useState(true);

  const context = useApp();

  const sendInnVedlegg = (dokumenter: IVedleggMedKrav[]) => {
    console.log(dokumenter);
  };
  useEffect(() => {
    const hentOgSettDokumentasjonsbehov = async () => {
      const dokumenter = await hentDokumentasjonsbehov(context.søker.fnr);
      settDokumentasjonsbehov(dokumenter);
      settLasterverdi(false);
    };
    if (context.søker != null) hentOgSettDokumentasjonsbehov();
  }, [context.søker]);

  if (laster) {
    return <NavFrontendSpinner />;
  }

  return (
    <div>
      <div>
        {dokumentasjonsbehov &&
          dokumentasjonsbehov.map((behovPerSøknad) => {
            return behovPerSøknad.dokumentasjonsbehov.map((behov) => {
              return <Krav key={behov.id} dokumentasjonsbehov={behov} />;
            });
          })}
      </div>
      <div>
        <Hovedknapp onClick={() => sendInnVedlegg(context.vedleggMedKrav)}>
          Send inn
        </Hovedknapp>
      </div>
    </div>
  );
};
