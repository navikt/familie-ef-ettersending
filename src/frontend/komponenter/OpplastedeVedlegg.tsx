import React from 'react';
import slett from '../icons/slett.svg';
import vedlegg from '../icons/vedlegg.svg';
import { Normaltekst } from 'nav-frontend-typografi';
import { IVedlegg } from '../typer/ettersending';
import '../stil/Opplastedevedlegg.less';
import { DokumentType, StønadType } from '../typer/stønad';

interface IOpplastedeVedlegg {
  vedleggsliste: IVedlegg[];
  slettVedlegg?: (vedlegg: IVedlegg) => void;
}

const OpplastedeVedlegg: React.FC<IOpplastedeVedlegg> = ({
  vedleggsliste,
  slettVedlegg,
}: IOpplastedeVedlegg) => {
  const hentDokumentType = (dokumenttype: string): string => {
    return Object.keys(DokumentType).includes(dokumenttype)
      ? DokumentType[dokumenttype as keyof typeof DokumentType]
      : dokumenttype;
  };

  const hentStønadsType = (stønadstype: string): string => {
    return Object.keys(StønadType).includes(stønadstype)
      ? StønadType[stønadstype as keyof typeof StønadType]
      : stønadstype;
  };

  return (
    <div className="opplastede-filer">
      {vedleggsliste.map((fil: IVedlegg, index: number) => {
        return (
          <div key={index}>
            <div className="fil">
              <div className="fil">
                <img
                  className="vedleggsikon"
                  src={vedlegg}
                  alt="Vedleggsikon"
                />
                <Normaltekst className="filnavn">
                  <b>Navn: </b>
                  {fil.navn}
                  {fil.dato && (
                    <>
                      <br />
                      <span>
                        <b>Dato: </b>
                        {new Date(fil.dato).toLocaleDateString()}
                      </span>
                    </>
                  )}
                  {fil.stønadstype && (
                    <>
                      <br />
                      <span>
                        <b>Stønadtype: </b>
                        {hentStønadsType(fil.stønadstype)}
                      </span>
                    </>
                  )}
                  {fil.dokumenttype && (
                    <>
                      <br />
                      <span>
                        <b>Dokumenttype: </b>
                        {hentDokumentType(fil.dokumenttype)}
                      </span>
                    </>
                  )}
                  {fil.beskrivelse && (
                    <>
                      <br />
                      <span>
                        <b>Kommentar: </b>
                        {fil.beskrivelse}
                      </span>
                    </>
                  )}
                </Normaltekst>
              </div>
              {slettVedlegg && (
                <div
                  className="slett"
                  onClick={() => {
                    slettVedlegg(fil);
                  }}
                >
                  <Normaltekst>slett</Normaltekst>
                  <img className="slettikon" src={slett} alt="Rødt kryss" />
                </div>
              )}
            </div>
            {index === vedleggsliste.length - 1 ? '' : <hr />}
          </div>
        );
      })}
    </div>
  );
};

export default OpplastedeVedlegg;
