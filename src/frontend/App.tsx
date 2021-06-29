import React, { useState } from 'react';
import './app.less';
import Filopplasting from './komponenter/Filopplasting';
import DisplayContext from './komponenter/DisplayContext';
import InputForm from './komponenter/InputForm';
import { Knapp } from 'nav-frontend-knapper';
import axios from 'axios';
import { response } from 'express';

const App = () => {
  const [navn, settNavn] = useState('');

  const hentData = () => {
    return axios
      .get('http://localhost:8091/api/oppslag/sokerinfo', {
        withCredentials: true,
      })
      .then((response: { data: any }) => {
        console.log(response.data);
      });
  };

  const hentPerson = () => {
    return axios
      .get('http://localhost:8091/api/oppslag/sokerinfo', {
        withCredentials: true,
      })
      .then((response: { data: any }) => {
        console.log(response.data.søker.forkortetNavn);
        settNavn(response.data.søker.forkortetNavn);
      });
  };

  hentData();
  hentPerson();

  return (
    <div className="bakgrunn">
      <div className="app-konteiner">
        <h1>Ettersending av dokumentasjon for {navn}</h1>
        <Filopplasting />
        <Knapp className="innsendingsknapp" type={'standard'}>
          Send inn
        </Knapp>
      </div>
    </div>
  );
};

export default App;
