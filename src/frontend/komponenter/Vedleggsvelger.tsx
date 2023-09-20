import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import OpplastedeVedlegg from './OpplastedeVedlegg';
import {
  IDokumentasjonsbehov,
  IVedleggForEttersending,
} from '../typer/ettersending';
import { sendVedleggTilMellomlager, slåSammenVedlegg } from '../api-service';
import styled from 'styled-components';
import AlertStripe, { alertMelding } from './AlertStripe';
import { logFeilFilopplasting } from '../utils/amplitude';
import {
  erFiltypeHeic,
  formaterFilstørrelse,
  sjekkTillatFiltype,
  støtterFiltypeHeic,
} from '../utils/filer';
import heic2any from 'heic2any';
import { DokumentType, StønadType, stønadTypeTilTekst } from '../typer/stønad';
import axios from 'axios';
import KnappMedPadding from '../felles/Knapp';
import { Upload } from '@navikt/ds-icons';
import { BodyShort, Heading, Label, Loader } from '@navikt/ds-react';

const Filvelger = styled.div`
  margin-top: 1rem;
  text-align: center;
  font-weight: bold;
  border: 2px dashed var(--a-border-strong);
  border-radius: 4px;
  background-color: var(--a-gray-200);
  height: 4rem;
  line-height: 4rem;
  color: var(--a-blue-700);
  cursor: pointer;
`;

const OpplastingIkon = styled(Upload)`
  display: inline-block;
  margin-right: 0.5rem;
`;

const OpplastingTekst = styled(BodyShort)`
  display: inline-block;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledAlertStripe = styled(AlertStripe)`
  margin-bottom: 1rem;
`;

const Container = styled.div`
  margin-top: 3rem;
  margin-bottom: 2rem;
`;

const StyledSentrertTekst = styled(BodyShort)`
  padding-top: 1rem;
  text-align: center;
`;

const SentrertTekst = styled(BodyShort)`
  text-align: center;
`;

const KnappContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 1rem;
`;

const FlexBox = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
`;

const StyledBodyShort = styled(BodyShort)`
  margin-left: 0.25rem;
  align-self: baseline;
`;

const StyledLabel = styled(Label)`
  align-self: baseline;
`;

interface IProps {
  oppdaterInnsending: (innsending: IDokumentasjonsbehov) => void;
  innsending: IDokumentasjonsbehov;
  maxFilstørrelse?: number;
  lukkModal: () => void;
  stønadType?: StønadType;
  beskrivelse: string;
}

const Vedleggsvelger: React.FC<IProps> = ({
  innsending,
  oppdaterInnsending,
  maxFilstørrelse,
  lukkModal,
  stønadType,
  beskrivelse,
}: IProps) => {
  const [alertStripeMelding, settAlertStripeMelding] = useState<alertMelding>(
    alertMelding.TOM,
  );
  const [laster, settLaster] = useState<boolean>(false);
  const [vedleggForSammenslåing, settVedleggForSammenslåing] = useState<
    IVedleggForEttersending[]
  >([]);
  const [harTrykketLastOpp, settHarTrykketLastOpp] = useState<boolean>(false);

  const leggTilVedleggPåInnsending = (
    nyeVedlegg: IVedleggForEttersending[],
  ): IDokumentasjonsbehov => {
    return {
      ...innsending,
      vedlegg: [...innsending.vedlegg, ...nyeVedlegg],
    };
  };

  const skalDokumenttypeSlåsSammen = (dokumentType: string | undefined) =>
    dokumentType !== DokumentType.ANNET;

  const dokumenterSkalSammenslås = (
    dokumentType: string | undefined,
    antallVedlegg: number,
  ) => {
    return skalDokumenttypeSlåsSammen(dokumentType) && antallVedlegg > 1;
  };

  const slåSammenVedleggOgOppdaterInnsending = async () => {
    settHarTrykketLastOpp(true);
    settAlertStripeMelding(alertMelding.TOM);

    if (
      dokumenterSkalSammenslås(
        innsending.dokumenttype,
        vedleggForSammenslåing.length,
      )
    ) {
      try {
        const dokumentId = await slåSammenVedlegg(
          vedleggForSammenslåing.map((v) => v.id),
        );
        const nyInnsending = leggTilVedleggPåInnsending([
          {
            navn: innsending.dokumenttype
              ? innsending.dokumenttype.toLowerCase() + '.pdf'
              : vedleggForSammenslåing[0].navn,
            tittel: vedleggForSammenslåing[0].tittel,
            id: dokumentId,
          },
        ]);
        oppdaterInnsending({ ...nyInnsending, erSammenslått: true });
        settHarTrykketLastOpp(false);
        lukkModal();
      } catch (error: unknown) {
        settAlertStripeMelding(alertMelding.FEIL_SAMMENSLÅING_DOKUMENT);
      }
    } else {
      const nyInnsending = leggTilVedleggPåInnsending(vedleggForSammenslåing);
      oppdaterInnsending({ ...nyInnsending, erSammenslått: false });
      lukkModal();
    }
  };

  const slettVedlegg = (vedlegg: IVedleggForEttersending): void => {
    settVedleggForSammenslåing((prevState) => {
      return prevState.filter(
        (v: IVedleggForEttersending) => v.id !== vedlegg.id,
      );
    });
  };

  const lastOppVedlegg = async (filer: File[]) => {
    settLaster(true);
    settAlertStripeMelding(alertMelding.TOM);

    const vedleggListe: IVedleggForEttersending[] = [];

    await Promise.all(
      filer.map(async (fil) => {
        try {
          const formData = new FormData();
          formData.append('file', fil);
          const respons = await sendVedleggTilMellomlager(formData);
          const vedlegg: IVedleggForEttersending = {
            id: respons,
            navn: fil.name,
            tittel: innsending.beskrivelse || 'Ukjent tittel',
          };
          vedleggListe.push(vedlegg);
        } catch (error: unknown) {
          const feilmelding =
            axios.isAxiosError(error) &&
            error?.response?.data?.melding === 'CODE=IMAGE_DIMENSIONS_TOO_SMALL'
              ? alertMelding.FEIL_FOR_LITEN_FIL
              : alertMelding.FEIL;
          settAlertStripeMelding(feilmelding);

          logFeilFilopplasting({
            type_feil: 'Generisk feil',
            feilmelding: feilmelding,
            filtype: fil.type,
            filstørrelse: fil.size,
          });
        }
      }),
    );
    settVedleggForSammenslåing((prevState) => [...prevState, ...vedleggListe]);
    settLaster(false);
  };

  const onDrop = async (filerForOpplasting: File[]) => {
    const feilmeldingsliste: string[] = [];
    settAlertStripeMelding(alertMelding.TOM);

    const filer: File[] = await Promise.all(
      filerForOpplasting.map(async (fil: File): Promise<File> => {
        if (maxFilstørrelse && fil.size > maxFilstørrelse) {
          const maks = formaterFilstørrelse(maxFilstørrelse);

          const feilmelding = `${fil.name} er for stor (maksimal filstørrelse er ${maks})`;

          feilmeldingsliste.push(feilmelding);
          settAlertStripeMelding(alertMelding.FEIL_STØRRELSE_INNSENDING);

          logFeilFilopplasting({
            type_feil: 'For stor fil',
            feilmelding: feilmelding,
            filstørrelse: fil.size,
          });

          return fil;
        }

        if (!sjekkTillatFiltype(fil.type)) {
          if (erFiltypeHeic(fil) && støtterFiltypeHeic()) {
            const nyBlob = await heic2any({
              blob: fil,
              toType: 'image/jpg',
              quality: 1,
            });

            return await new File([nyBlob as Blob], fil.name + '.jpg');
          }

          const feilmelding = fil.name + ' - Ugyldig filtype';
          feilmeldingsliste.push(feilmelding);
          settAlertStripeMelding(alertMelding.FEIL_FILTYPE_INNSENDING);

          logFeilFilopplasting({
            type_feil: 'Feil filtype',
            feilmelding: feilmelding,
            filtype: fil.type,
          });

          return fil;
        }

        return fil;
      }),
    );
    if (feilmeldingsliste.length <= 0) {
      lastOppVedlegg(filer);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  const visLastOppKnapp = () => {
    return (
      <KnappContainer>
        <KnappMedPadding
          onClick={
            harTrykketLastOpp ? undefined : slåSammenVedleggOgOppdaterInnsending
          }
          disabled={
            harTrykketLastOpp || vedleggForSammenslåing.length < 1 || laster
          }
          loading={harTrykketLastOpp}
        >
          Last Opp
        </KnappMedPadding>
      </KnappContainer>
    );
  };

  return (
    <Container>
      <Heading level={'1'} size={'xsmall'}>
        {beskrivelse}
      </Heading>
      <FlexBox>
        <StyledLabel>Stønadstype:</StyledLabel>
        <StyledBodyShort>
          {stønadTypeTilTekst[stønadType as StønadType]}
        </StyledBodyShort>
      </FlexBox>
      <Filvelger>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <OpplastingIkon title={'Last opp'} />
          <OpplastingTekst>Velg filer</OpplastingTekst>
        </div>
      </Filvelger>
      <OpplastedeVedlegg
        vedleggsliste={vedleggForSammenslåing}
        slettVedlegg={slettVedlegg}
      />
      {laster && (
        <SpinnerWrapper>
          <Loader
            size={'large'}
            title={'venter på at valgte filer skal lastes opp'}
          />
        </SpinnerWrapper>
      )}
      <StyledSentrertTekst size={'small'}>
        Hvis dokumentet du skal sende inn består av flere filer, kan du legge
        til alle filene her.
      </StyledSentrertTekst>
      {skalDokumenttypeSlåsSammen(innsending.dokumenttype) && (
        <SentrertTekst size={'small'}>
          Filene blir slått sammen til ett dokument.
        </SentrertTekst>
      )}
      <StyledAlertStripe melding={alertStripeMelding} />
      {visLastOppKnapp()}
    </Container>
  );
};

export default Vedleggsvelger;
