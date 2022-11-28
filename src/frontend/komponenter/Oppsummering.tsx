import React from 'react';
import styled from 'styled-components';
import { IDokumentasjonsbehov } from '../typer/ettersending';
import { stønadTypeTilTekst } from '../typer/stønad';
import VedleggListe from './VedleggListe';
import { formaterIsoDato } from '../../shared-utils/dato';
import { BodyShort, Heading, Label } from '@navikt/ds-react';

const Tittel = styled(Heading)`
  margin-top: 1rem;
`;

const Container = styled.div`
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

interface IProps {
  innsendinger: IDokumentasjonsbehov[];
  tittel: string;
}

export const Oppsummering: React.FC<IProps> = ({
  innsendinger,
  tittel,
}: IProps) => {
  return (
    <div>
      <Tittel level={'2'} size={'medium'}>
        {tittel}
      </Tittel>
      {innsendinger.map((innsending, index) => {
        return (
          <Container key={index}>
            <BodyShort>
              <Label as={'p'}>Stønadstype: </Label>
              {innsending.stønadType &&
                stønadTypeTilTekst[innsending.stønadType]}
            </BodyShort>
            <BodyShort>
              <Label as={'p'}>Dokumenttype: </Label>
              {innsending.beskrivelse}
            </BodyShort>
            <BodyShort>
              <Label as={'p'}>Dato for innsending: </Label>
              {formaterIsoDato(innsending.innsendingstidspunkt)}
            </BodyShort>
            {innsending.vedlegg.length > 0 ? (
              <VedleggListe vedleggsliste={innsending.vedlegg} />
            ) : (
              'Du har opplyst om at du har levert dokumentasjon på en annen måte.'
            )}
          </Container>
        );
      })}
    </div>
  );
};
