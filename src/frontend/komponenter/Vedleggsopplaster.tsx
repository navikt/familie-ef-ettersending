import React, { useState } from 'react';
import OpplastedeVedlegg from './OpplastedeVedlegg';
import Modal from 'nav-frontend-modal';
import {
  IDokumentasjonsbehov,
  IVedleggForEttersending,
} from '../typer/ettersending';
import '../stil/Vedleggsopplaster.less';
import VedleggsopplasterModal from './VedleggsopplasterModal';
import { Knapp } from 'nav-frontend-knapper';
import styled from 'styled-components';

const Filopplaster = styled.div<{ visSkillelinje: boolean }>`
    text-align: center;
    border-bottom: ${(props) =>
      props.visSkillelinje ? '2px dashed #59514b' : ''};
    height: 64px;
  }
`;

const FilopplasterWrapper = styled.div`
  max-width: 775px;
  min-height: 68px;
`;

interface IProps {
  oppdaterInnsending: (innsending: IDokumentasjonsbehov) => void;
  innsending: IDokumentasjonsbehov;
  maxFilstørrelse?: number;
}

const Vedleggsopplaster: React.FC<IProps> = ({
  innsending,
  oppdaterInnsending,
  maxFilstørrelse,
}: IProps) => {
  const [åpenModal, settÅpenModal] = useState<boolean>(false);

  const slettVedlegg = (vedlegg: IVedleggForEttersending): void => {
    oppdaterInnsending({
      ...innsending,
      vedlegg: [...innsending.vedlegg].filter(
        (v: IVedleggForEttersending) => v.id !== vedlegg.id
      ),
    });
  };

  const visVedleggTilOpplasting = (): IVedleggForEttersending[] => {
    return innsending.vedlegg;
  };

  return (
    <>
      <Modal
        isOpen={åpenModal}
        onRequestClose={() => settÅpenModal(false)}
        closeButton={true}
        contentLabel="Modal"
      >
        <VedleggsopplasterModal
          oppdaterInnsending={oppdaterInnsending}
          innsending={innsending}
          lukkModal={() => settÅpenModal(false)}
          maxFilstørrelse={maxFilstørrelse}
        />
      </Modal>
      <FilopplasterWrapper>
        <Filopplaster visSkillelinje={innsending.vedlegg.length > 0}>
          <Knapp onClick={() => settÅpenModal(true)}>Last opp fil(er)</Knapp>
        </Filopplaster>
        <OpplastedeVedlegg
          vedleggsliste={visVedleggTilOpplasting()}
          slettVedlegg={slettVedlegg}
        />
      </FilopplasterWrapper>
    </>
  );
};

export default Vedleggsopplaster;
