import axios from 'axios';
import { ISøker } from './typer/søker';
import environment from '../backend/environment';

export const hentSøkerinfo = (): Promise<ISøker> => {
  return axios
    .get(`${environment().apiUrl}/api/oppslag/sokerinfo`, {
      withCredentials: true,
    })
    .then((response: { data: any }) => {
      const søker = response.data.søker;
      return {
        adresse: søker.adresse,
        egenansatt: søker.egenansatt,
        fnr: søker.fnr,
        forkortetNavn: søker.forkortetNavn,
        harAdressesperre: søker.harAdressesperre,
        siviltilstand: søker.siviltilstand,
        statsborgerskap: søker.statsborgerskap,
      };
    });
};

export const hentDokumentasjonsbehov = () => {
  return axios
    .get(
      `${
        environment().apiUrl
      }/api/dokumentasjonsbehov/e0c4a9cf-8422-4385-aa4b-409f5a718da3`,
      {
        withCredentials: true,
      }
    )
    .then((response: { data: any }) => {
      return response.data;
    });
};
