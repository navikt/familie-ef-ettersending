import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Normaltekst } from 'nav-frontend-typografi';
import opplasting from '../icons/opplasting.svg';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import OpplastedeVedlegg from './OpplastedeVedlegg';
import Modal from 'nav-frontend-modal';
import {
  IVedlegg,
  IÅpenEttersending,
  IÅpenEttersendingMedStønadstype,
} from '../typer/søknadsdata';
import '../stil/Vedleggsopplaster.less';
import { dagensDatoMedTidspunktStreng } from '../../shared-utils/dato';
import { sendVedleggTilMellomlager } from '../api-service';
import { IDokumentasjonsbehov } from '../typer/dokumentasjonsbehov';
import ÅpenEttersending from './ÅpenEttersending';

interface IVedleggsopplaster {
  dokumentasjonsbehovId?: string;
  dokumentasjonsbehovTilInnsending?: IDokumentasjonsbehov[];
  settDokumentasjonsbehovTilInnsending?: (
    dokumentasjonsbehov: IDokumentasjonsbehov[]
  ) => void;
  åpenEttersendingFelt?: IÅpenEttersending;
  settÅpenEttersendingFelt?: (dokumentasjonsbehov: IÅpenEttersending) => void;

  åpenEttersendingMedStønadstype?: IÅpenEttersendingMedStønadstype;
  settÅpenEttersendingMedStønadstype?: (
    dokumentasjonsbehov: IÅpenEttersendingMedStønadstype
  ) => void;
}

const Vedleggsopplaster: React.FC<IVedleggsopplaster> = ({
  dokumentasjonsbehovId,
  settDokumentasjonsbehovTilInnsending,
  dokumentasjonsbehovTilInnsending,
  settÅpenEttersendingFelt,
  åpenEttersendingFelt,
  settÅpenEttersendingMedStønadstype,
  åpenEttersendingMedStønadstype,
}: IVedleggsopplaster) => {
  const [feilmeldinger, settFeilmeldinger] = useState<string[]>([]);
  const [åpenModal, settÅpenModal] = useState<boolean>(false);
  const [vedleggTilOpplasting, settVedleggTilOpplasting] = useState<IVedlegg[]>(
    []
  );
  const [laster, settLaster] = useState<boolean>(false);

  useEffect(() => settVedleggTilOpplasting(filtrerVedleggPåBehov), []);

  const leggTilFilTilOpplasting = (vedlegg: IVedlegg) => {
    const oppdatertDokumentasjonsbehov = dokumentasjonsbehovTilInnsending.map(
      (behov) => {
        if (behov.id == dokumentasjonsbehovId) {
          settVedleggTilOpplasting([...behov.opplastedeVedlegg, vedlegg]);
          return {
            ...behov,
            opplastedeVedlegg: [...behov.opplastedeVedlegg, vedlegg],
          };
        } else {
          return behov;
        }
      }
    );
    settDokumentasjonsbehovTilInnsending(oppdatertDokumentasjonsbehov);
  };

  const leggTilVedleggForÅpenEttersending = (vedlegg: IVedlegg) => {
    settÅpenEttersendingFelt({
      ...åpenEttersendingFelt,
      vedlegg: [...åpenEttersendingFelt.vedlegg, vedlegg],
    });
    settVedleggTilOpplasting([...vedleggTilOpplasting, vedlegg]);
  };

  const leggTilVedleggForÅpenEttersendingMedStønadstype = (
    vedlegg: IVedlegg
  ) => {
    settÅpenEttersendingMedStønadstype({
      ...åpenEttersendingMedStønadstype,
      åpenEttersending: {
        ...åpenEttersendingMedStønadstype.åpenEttersending,
        vedlegg: [
          ...åpenEttersendingMedStønadstype.åpenEttersending.vedlegg,
          vedlegg,
        ],
      },
    });
    settVedleggTilOpplasting([...vedleggTilOpplasting, vedlegg]);
  };

  const slettFilTilOpplasting = (
    dokumentId: string,
    dokumentasjonsbehovId: string
  ) => {
    const oppdatertDokumentasjonsbehov = dokumentasjonsbehovTilInnsending.map(
      (behov) => {
        if (behov.id == dokumentasjonsbehovId) {
          settVedleggTilOpplasting(
            behov.opplastedeVedlegg.filter(
              (vedlegg) => vedlegg.id !== dokumentId
            )
          );
          return {
            ...behov,
            opplastedeVedlegg: behov.opplastedeVedlegg.filter(
              (vedlegg) => vedlegg.id !== dokumentId
            ),
          };
        } else {
          return behov;
        }
      }
    );
    settDokumentasjonsbehovTilInnsending(oppdatertDokumentasjonsbehov);
  };

  const slettVedleggForÅpenEttersending = (vedlegg: IVedlegg) => {
    settÅpenEttersendingFelt({
      ...åpenEttersendingFelt,
      vedlegg: åpenEttersendingFelt.vedlegg.filter(
        (vedleggTilOpplasting) => vedleggTilOpplasting.id != vedlegg.id
      ),
    });
    settVedleggTilOpplasting(
      vedleggTilOpplasting.filter(
        (vedleggTilOpplasting) => vedleggTilOpplasting.id != vedlegg.id
      )
    );
  };

  const slettVedleggForÅpenEttersendingMedStønadstype = (vedlegg: IVedlegg) => {
    settÅpenEttersendingMedStønadstype({
      ...åpenEttersendingMedStønadstype,
      åpenEttersending: {
        ...åpenEttersendingMedStønadstype.åpenEttersending,
        vedlegg: åpenEttersendingMedStønadstype.åpenEttersending.vedlegg.filter(
          (vedleggEttersending) => vedlegg.id != vedleggEttersending.id
        ),
      },
    });
    settVedleggTilOpplasting(
      vedleggTilOpplasting.filter(
        (vedleggTilOpplasting) => vedleggTilOpplasting.id != vedlegg.id
      )
    );
  };

  const filtrerVedleggPåBehov = () => {
    if (dokumentasjonsbehovId) {
      dokumentasjonsbehovTilInnsending.forEach((behov) => {
        if (dokumentasjonsbehovId === behov.id) {
          return behov.opplastedeVedlegg;
        }
      });
      return [];
    } else return [];
  };

  const sjekkTillatFiltype = (filtype: string) => {
    const tillateFilTyper = ['pdf', 'jpg', 'svg', 'png', 'jpeg', 'gif', 'ico'];
    let godkjentFiltype = false;
    tillateFilTyper.forEach((tillatFilType) => {
      if (filtype.includes(tillatFilType)) {
        godkjentFiltype = true;
      }
    });
    return godkjentFiltype;
  };

  //
  const slettVedlegg = (vedlegg: IVedlegg) => {
    if (dokumentasjonsbehovId)
      slettFilTilOpplasting(vedlegg.id, dokumentasjonsbehovId);
    else if (åpenEttersendingFelt) slettVedleggForÅpenEttersending(vedlegg);
    else slettVedleggForÅpenEttersendingMedStønadstype(vedlegg);
  };

  const lastOppVedlegg = async (fil) => {
    settLaster(true);
    const formData = new FormData();
    formData.append('file', fil);
    const respons = await sendVedleggTilMellomlager(formData);
    const vedlegg: IVedlegg = {
      id: respons,
      // id: '122', Må brukes for at det skal kunne kjøre lokalt
      navn: fil.name,
      størrelse: fil.size,
      tidspunkt: dagensDatoMedTidspunktStreng,
    };
    if (dokumentasjonsbehovId) leggTilFilTilOpplasting(vedlegg);
    else if (åpenEttersendingFelt) leggTilVedleggForÅpenEttersending(vedlegg);
    else leggTilVedleggForÅpenEttersendingMedStønadstype(vedlegg);
    settLaster(false);
  };

  const onDrop = useCallback(
    (vedlegg) => {
      const feilmeldingsliste: string[] = [];

      vedlegg.forEach((fil) => {
        if (!sjekkTillatFiltype(fil.type)) {
          feilmeldingsliste.push(fil.name + ' - Ugyldig filtype');
          settFeilmeldinger(feilmeldingsliste);
          settÅpenModal(true);
          return;
        }

        lastOppVedlegg(fil);
      });
    },
    [vedleggTilOpplasting]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="filopplaster-wrapper">
      <div className="opplastede-filer">
        <p>Nye filer:</p>
        {laster ? (
          <NavFrontendSpinner />
        ) : (
          <OpplastedeVedlegg
            vedleggsliste={vedleggTilOpplasting}
            kanSlettes={true}
            slettVedlegg={slettVedlegg}
          />
        )}
      </div>

      <div className="filopplaster">
        <Modal
          isOpen={åpenModal}
          onRequestClose={() => settÅpenModal(false)}
          closeButton={true}
          contentLabel="Modal"
        >
          <div className="feilmelding">
            {feilmeldinger.map((feilmelding) => (
              <AlertStripeFeil key={feilmelding} className="feilmelding-alert">
                {feilmelding}
              </AlertStripeFeil>
            ))}
          </div>
        </Modal>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <img
            src={opplasting}
            className="opplastingsikon"
            alt="Opplastingsikon"
          />
          <Normaltekst className="tekst">
            {isDragActive ? 'Last opp dokumentasjon' : 'Slipp filen her..'}
          </Normaltekst>
        </div>
      </div>
    </div>
  );
};

export default Vedleggsopplaster;
