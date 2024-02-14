import * as amplitude from '@amplitude/analytics-browser';
import { IDokumentasjonsbehov } from '../typer/ettersending';

amplitude.init('default', undefined, {
  serverUrl: 'https://amplitude.nav.no/collect-auto',
  defaultTracking: false,
  ingestionMetadata: {
    sourceName: window.location.toString().split('?')[0].split('#')[0],
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logEvent(eventName: string, eventProperties: any) {
  amplitude.track(eventName, eventProperties);
}

export interface FeilOpplastingProps {
  type_feil: string;
  feilmelding: string;
  filtype?: string;
  filstørrelse?: number;
}

export const logFeilFilopplasting = (props: FeilOpplastingProps) => {
  logEvent('filopplasting_feilet', {
    applikasjon: 'familie-ef-ettersending',
    ...props,
  });
};

export const logDokumentasjonsbehov = (dokBehov: IDokumentasjonsbehov[]) => {
  dokBehov.map((dok: IDokumentasjonsbehov) => {
    logEvent('dokumentasjonsbehov_ettersending', {
      applikasjon: 'familie-ef-ettersending',
      team_id: 'familie',
      dokumentBeskrivelse: dok.beskrivelse,
      dokumenttype: dok.dokumenttype,
      stønadType: dok.stønadType,
    });
  });
};

export const logSidevisning = (side: string) => {
  logEvent('besøk', {
    side,
    team_id: 'familie',
    applikasjon: 'familie-ef-ettersending',
  });
};
