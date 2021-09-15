import React from 'react';
import styled from 'styled-components/macro';
import { Normaltekst, Undertittel } from 'nav-frontend-typografi';
import { IDokumentasjonsbehovTilBackend } from '../typer/ettersending';
import { stønadTypeTilTekst, StønadType } from '../typer/stønad';
import OpplastedeVedleggOversikt from './OpplastedeVedleggOversikt';
import { formaterIsoDato } from '../../shared-utils/dato';

const StyledDiv = styled.div`
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

interface IProps {
  innsendinger: IDokumentasjonsbehovTilBackend[];
  tittel: string;
}

export const Oppsummering: React.FC<IProps> = ({
  innsendinger,
  tittel,
}: IProps) => {
  return (
    <div>
      <Undertittel>{tittel}</Undertittel>
      {innsendinger.map((innsending, index) => {
        return (
          <StyledDiv key={index}>
            <Normaltekst>
              <b>Stønadstype: </b>

              {stønadTypeTilTekst[innsending.stønadType as StønadType]}
            </Normaltekst>
            {innsending.dokumenttype && (
              <Normaltekst>
                <b>Dokumenttype: </b>
                {innsending.dokumenttype}
              </Normaltekst>
            )}
            <Normaltekst>
              <b>Dato for innsending: </b>
              {formaterIsoDato(innsending.innsendingstidspunkt)}
            </Normaltekst>
            <Normaltekst>
              <b>Dokumenter: </b>
              {innsending.vedlegg.length > 0 ? (
                <OpplastedeVedleggOversikt vedleggsliste={innsending.vedlegg} />
              ) : (
                'Du har opplyst om at du har levert dokumentasjon på en annen måte.'
              )}
            </Normaltekst>
          </StyledDiv>
        );
      })}
    </div>
  );
};
