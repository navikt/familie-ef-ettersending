import React, {
  useCallback,
  useState,
  useEffect,
  SetStateAction,
  Dispatch,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { Normaltekst } from 'nav-frontend-typografi';
import opplasting from '../icons/opplasting.svg';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import OpplastedeVedlegg from './OpplastedeVedlegg';
import Modal from 'nav-frontend-modal';
import { IVedlegg } from '../typer/søknadsdata';
import '../stil/Vedleggsopplaster.less';
import { dagensDatoMedTidspunktStreng } from '../../shared-utils/dato';
import { useApp } from '../context/AppContext';
import { sendVedleggTilMellomlager } from '../api-service';
import { IDokumentasjonsbehov } from '../typer/dokumentasjonsbehov';

interface IVedleggsopplaster {
  dokumentasjonsbehovId?: string; //må gjøre denne obligatorisk for de som er knyttet til et behov
  dokumentasjonsbehovTilInnsending: IDokumentasjonsbehov[];
  settDokumentasjonsbehovTilInnsending: (
    dokumentasjonsbehov: IDokumentasjonsbehov[]
  ) => void;
}

const Vedleggsopplaster: React.FC<IVedleggsopplaster> = ({
  dokumentasjonsbehovId,
  settDokumentasjonsbehovTilInnsending,
  dokumentasjonsbehovTilInnsending,
}: IVedleggsopplaster) => {
  const [feilmeldinger, settFeilmeldinger] = useState<string[]>([]);
  const [åpenModal, settÅpenModal] = useState<boolean>(false);
  const [vedleggTilOpplasting, settVedleggTilOpplasting] = useState<IVedlegg[]>(
    []
  );
  const [laster, settLaster] = useState<boolean>(false);
  const context = useApp();

  useEffect(() => settVedleggTilOpplasting(filtrerVedleggPåBehov), []);

  //OK foreløpig. Må endre til å sjekke på søknadsid ikke bare id fra dokumentasjonsbehov sånn at jeg vet at jeg legger til for riktig søknad
  const leggTilFilTilOpplasting = (vedlegg: IVedlegg) => {
    const nyListe = dokumentasjonsbehovTilInnsending.map((behov) => {
      if (behov.id == dokumentasjonsbehovId) {
        settVedleggTilOpplasting([...behov.opplastedeVedlegg, vedlegg]);
        return {
          ...behov,
          opplastedeVedlegg: [...behov.opplastedeVedlegg, vedlegg],
        };
      } else {
        return behov;
      }
    });
    settDokumentasjonsbehovTilInnsending(nyListe);
  };

  //OK foreløpig. Må endre til å sjekke på søknadsid ikke bare id fra dokumentasjonsbehov sånn at jeg vet at jeg fjerner fra riktig søknad
  const slettFilTilOpplasting = (
    dokumentId: string,
    dokumentasjonsbehovId: string
  ) => {
    const nyListe = dokumentasjonsbehovTilInnsending.map((behov) => {
      if (behov.id == dokumentasjonsbehovId) {
        settVedleggTilOpplasting(
          behov.opplastedeVedlegg.filter((vedlegg) => vedlegg.id !== dokumentId)
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
    });
    settDokumentasjonsbehovTilInnsending(nyListe);
  };

  //OK?
  const filtrerVedleggPåBehov = () => {
    dokumentasjonsbehovTilInnsending.forEach((behov) => {
      if (dokumentasjonsbehovId === behov.id) {
        return behov.opplastedeVedlegg;
      }
    });
    return [];
  };

  //OK
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

  //OK
  const slettVedlegg = (vedlegg: IVedlegg) => {
    if (dokumentasjonsbehovId)
      slettFilTilOpplasting(vedlegg.id, dokumentasjonsbehovId);
    else {
      //TODO. skal fjerne denne muligheten
    }
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

    //TODO må fjerne om dokumentasjonsbehov eller ikke
    if (dokumentasjonsbehovId) {
      leggTilFilTilOpplasting(vedlegg);
    } else {
      // context.leggTilVedleggForÅpenEttersending(vedlegg);
    }
    leggTilFilTilOpplasting(vedlegg);
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
