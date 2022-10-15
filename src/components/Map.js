import React, { useEffect, useState, useRef } from 'react';

import './Map.scss';

const Map = props => {

  useEffect(() => {
    ymaps.ready().then(() => {
      const myMap = new ymaps.Map('ymaps', {
        center: [props.latitude, props.longitude],
        zoom: 14,
      });
      const myGeoObject = new ymaps.GeoObject({
        geometry: {
          type: 'Point', // тип геометрии - точка
          coordinates: [props.latitude, props.longitude], // координаты точки
        },
      });
      myMap.geoObjects.add(myGeoObject);

      if (props.isClickable) {
        myMap.events.add('click', async (e) => {
          const coords = e.get('coords');
          const myGeoObject = new ymaps.GeoObject({
            geometry: {
              type: 'Point', // тип геометрии - точка
              coordinates: coords, // координаты точки
            },
          });
          myMap.geoObjects.removeAll();
          myMap.geoObjects.add(myGeoObject);
          // const response =
          //   await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=a4627984-d4ae-4e59-a89b-7c1c4d5cf56d&format=json&geocode=${coords[1].toFixed(6)},${coords[0].toFixed(6)}`);
          // /* eslint-disable  @typescript-eslint/no-unsafe-assignment */
          // const json = await response.json();
          // /* eslint-disable  @typescript-eslint/no-unsafe-member-access */
          // let data = <string>json.response.GeoObjectCollection.featureMember[0].GeoObject.
          //     metaDataProperty.GeocoderMetaData.Address.formatted;
          // const dataSliced = data.split(' ');
          // const dateSlice = dataSliced.slice(1);
          // data = dateSlice.join(' ');
          // const input = location?.childNodes[inputNum] as HTMLInputElement;
          // input.value = data;
        });
      }
    });
  }, []);

  return (
    <div className='ymaps__container'> 
      <div id="ymaps" />
    </div>
    
  )
};

export default Map;