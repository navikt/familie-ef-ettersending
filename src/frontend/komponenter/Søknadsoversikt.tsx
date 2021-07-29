import React from 'react';
import { DokumentasjonsbehovOversikt } from './DokumentasjonsbehovOversikt';
import { useApp } from '../context/AppContext';
import {
  hentDokumentasjonsbehov,
  hentEttersendinger,
  sendEttersending,
} from '../api-service';
import { useState } from 'react';
import { useEffect } from 'react';
import NavFrontendSpinner from 'nav-frontend-spinner';
import {
  IEttersendingUtenSøknad,
  tomEttersendingUtenSøknad,
  IVedlegg,
  IEttersendingTilInnsending,
  ISøknadMedEttersendinger,
  IInnsending,
  IEttersendingMedDato,
  ISøknadsbehov,
} from '../typer/ettersending';
import { Hovedknapp } from 'nav-frontend-knapper';
import styled from 'styled-components';
import AlertStripe, { alertMelding } from './AlertStripe';
import ÅpenEttersendingUtenSøknad from './ÅpenEttersendingUtenSøknad';
import { IDokumentasjonsbehov } from '../typer/dokumentasjonsbehov';

const SoknadContainer = styled.div`
  margin-bottom: 5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid lightgray;
`;

const StyledAlertStripe = styled(AlertStripe)`
  margin-top: 1rem;
`;

const Søknadsoversikt: React.FC = () => {
  const [laster, settLasterverdi] = useState(true);
  const [søknaderMedEttersendinger, settSøknaderMedEttersendinger] = useState<
    ISøknadMedEttersendinger[]
  >([]);
  const [ettersendingUtenSøknad, settEttersendingUtenSøknad] =
    useState<IEttersendingUtenSøknad>(tomEttersendingUtenSøknad);
  const [senderEttersending, settSenderEttersending] = useState<boolean>(false);
  const [alertStripeMelding, settAlertStripeMelding] = useState<alertMelding>(
    alertMelding.TOM
  );
  const [innsendingVedleggSendtInn, settInnsendingVedleggSendtInn] = useState<
    IVedlegg[]
  >([]);

  const context = useApp();

  useEffect(() => {
    if (context.søker != null) hentOgSettSøknaderOgEttersendinger();
  }, [context.søker]);

  const leggTilDatoPåInnsendingVedlegg = (
    innsendinger: IInnsending[],
    dato: string
  ): IInnsending[] => {
    return innsendinger.flatMap((innsending) => {
      if (innsending.vedlegg) {
        return {
          ...innsending,
          vedlegg: {
            ...innsending.vedlegg,
            dato: dato,
          },
        };
      }
      return { ...innsending, vedlegg: null };
    });
  };

  const leggTilDatoPåEttersendingVedlegg = (
    ettersendinger: IEttersendingMedDato[]
  ): IEttersendingMedDato[] => {
    return ettersendinger.map((ettersending) => {
      const ettersendingDato = ettersending.mottattTidspunkt;
      if (ettersending.ettersendingDto.ettersendingForSøknad) {
        const dokumentasjonsbehov: IDokumentasjonsbehov[] =
          ettersending.ettersendingDto.ettersendingForSøknad.dokumentasjonsbehov.flatMap(
            (behov) => {
              return {
                ...behov,
                opplastedeVedlegg: behov.opplastedeVedlegg.map((vedlegg) => {
                  return { ...vedlegg, dato: ettersendingDato };
                }),
              };
            }
          );
        const innsending: IInnsending[] = leggTilDatoPåInnsendingVedlegg(
          ettersending.ettersendingDto.ettersendingForSøknad.innsending,
          ettersendingDato
        );
        return {
          ...ettersending,
          ettersendingDto: {
            ...ettersending.ettersendingDto,
            ettersendingForSøknad: {
              ...ettersending.ettersendingDto.ettersendingForSøknad,
              dokumentasjonsbehov: dokumentasjonsbehov,
              innsending: innsending,
            },
          },
        };
      } else if (ettersending.ettersendingDto.ettersendingUtenSøknad) {
        const innsending: IInnsending[] = leggTilDatoPåInnsendingVedlegg(
          ettersending.ettersendingDto.ettersendingUtenSøknad.innsending,
          ettersendingDato
        );
        return {
          ...ettersending,
          ettersendingDto: {
            ...ettersending.ettersendingDto,
            ettersendingUtenSøknad: {
              ...ettersending.ettersendingDto.ettersendingUtenSøknad,
              innsending: innsending,
            },
          },
        };
      }
      return ettersending;
    });
  };

  const leggTilDatoPåEttersendingUtenSøknadVedlegg = (
    ettersendinger: IEttersendingMedDato[]
  ): IVedlegg[] => {
    return ettersendinger
      .filter(
        (ettersendingMedDato) =>
          ettersendingMedDato.ettersendingDto.ettersendingUtenSøknad !== null
      )
      .flatMap((ettersendingMedDato) => {
        const dato = ettersendingMedDato.mottattTidspunkt;
        return ettersendingMedDato.ettersendingDto
          .ettersendingUtenSøknad!.innsending.filter(
            (innsending) => innsending.vedlegg !== null
          )
          .flatMap((innsending) => {
            return { ...innsending.vedlegg!, dato: dato };
          });
      });
  };

  const slåSammenSøknadOgEttersendinger = (
    søknad: ISøknadsbehov,
    ettersendinger: IEttersendingMedDato[],
    søknadDato: string
  ): ISøknadMedEttersendinger => {
    const ettersendingForSøknad = ettersendinger.filter(
      (ettersendingMedDato) =>
        ettersendingMedDato.ettersendingDto.ettersendingForSøknad &&
        ettersendingMedDato.ettersendingDto.ettersendingForSøknad.søknadId ===
          søknad.søknadId
    );
    const ettersendingDokumentasjonsbehov = ettersendingForSøknad.flatMap(
      (ettersendingMedDato) =>
        ettersendingMedDato.ettersendingDto.ettersendingForSøknad!
          .dokumentasjonsbehov
    );
    const ettersendingInnsending = ettersendingForSøknad.flatMap(
      (ettersendingMedDato) =>
        ettersendingMedDato.ettersendingDto.ettersendingForSøknad!.innsending
    );
    const dokumentasjonsbehov =
      søknad.dokumentasjonsbehov.dokumentasjonsbehov.map((behov) => {
        const ettersendingBehov = ettersendingDokumentasjonsbehov.filter(
          (ettersendingBehov) => ettersendingBehov.id === behov.id
        );
        const ettersendingBehovVedlegg = ettersendingBehov.flatMap(
          (behov) => behov.opplastedeVedlegg
        );
        const ettersenidngHarSendtInnTidligere = ettersendingBehov.some(
          (behov) => behov.harSendtInn
        );
        const søknadVedleggMedDato = behov.opplastedeVedlegg.map((vedlegg) => {
          return { ...vedlegg, dato: søknadDato };
        });

        if (ettersendingBehov.length > 0) {
          return {
            ...behov,
            harSendtInn: behov.harSendtInn || ettersenidngHarSendtInnTidligere,
            opplastedeVedlegg: [
              ...søknadVedleggMedDato,
              ...ettersendingBehovVedlegg,
            ],
            innsending: [],
          };
        }
        return { ...behov, opplastedeVedlegg: søknadVedleggMedDato };
      });

    return {
      ...søknad,
      dokumentasjonsbehov: dokumentasjonsbehov,
      innsending: ettersendingInnsending,
    };
  };

  const hentOgSettSøknaderOgEttersendinger = async () => {
    const søknadsliste = await hentDokumentasjonsbehov();
    const ettersendinger = await hentEttersendinger();

    const søknaderMedEttersendinger: ISøknadMedEttersendinger[] =
      søknadsliste.map((søknad) => {
        const søknadDato = søknad.søknadDato;
        const ettersendingerMedVedleggDato =
          leggTilDatoPåEttersendingVedlegg(ettersendinger);
        return slåSammenSøknadOgEttersendinger(
          søknad,
          ettersendingerMedVedleggDato,
          søknadDato
        );
      });

    const innsendingVedleggSendtInn: IVedlegg[] =
      leggTilDatoPåEttersendingUtenSøknadVedlegg(ettersendinger);

    settSøknaderMedEttersendinger(søknaderMedEttersendinger);
    settInnsendingVedleggSendtInn(innsendingVedleggSendtInn);
    settLasterverdi(false);
  };

  const sendEttersendingUtenSøknad = async () => {
    if (!senderEttersending && ettersendingUtenSøknad.innsending[0].vedlegg) {
      settSenderEttersending(true);

      let ettersending: IEttersendingTilInnsending = {
        fnr: context.søker!.fnr,
        ettersendingUtenSøknad: ettersendingUtenSøknad,
        ettersendingForSøknad: null,
      };

      if (ettersendingUtenSøknad.stønadstype === '') {
        ettersending = { ...ettersending, ettersendingUtenSøknad: null };
      }

      settAlertStripeMelding(alertMelding.TOM);
      try {
        await sendEttersending(ettersending);
        settInnsendingVedleggSendtInn([
          ...innsendingVedleggSendtInn,
          ettersendingUtenSøknad.innsending[0].vedlegg,
        ]);
        settEttersendingUtenSøknad(tomEttersendingUtenSøknad);
        settAlertStripeMelding(alertMelding.SENDT_INN);
      } catch {
        settAlertStripeMelding(alertMelding.FEIL);
      } finally {
        settSenderEttersending(false);
      }
    }
  };

  if (laster) return <NavFrontendSpinner />;

  return (
    <>
      <SoknadContainer>
        <ÅpenEttersendingUtenSøknad
          ettersendingUtenSøknad={ettersendingUtenSøknad}
          settEttersendingUtenSøknad={settEttersendingUtenSøknad}
          tidligereOpplastedeVedlegg={innsendingVedleggSendtInn}
        />
        <Hovedknapp
          spinner={senderEttersending}
          onClick={() => sendEttersendingUtenSøknad()}
        >
          {senderEttersending ? 'Sender...' : 'Send inn'}
        </Hovedknapp>
        <StyledAlertStripe melding={alertStripeMelding} />
      </SoknadContainer>
      {søknaderMedEttersendinger.map((søknad, index) => {
        return (
          <SoknadContainer key={index}>
            <h2>
              Søknad om {søknad.stønadType.toLocaleLowerCase()} sendt inn{' '}
              {new Date(søknad.søknadDato).toLocaleDateString()}
            </h2>
            <DokumentasjonsbehovOversikt søknad={søknad} />
          </SoknadContainer>
        );
      })}
    </>
  );
};

export default Søknadsoversikt;
