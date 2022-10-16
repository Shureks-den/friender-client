import React, { useEffect, useState, useRef } from 'react';

import { Input, FormItem } from '@vkontakte/vkui';


import './Map.scss';

const Map = props => {
  const [yMap, setYMap] = useState(null);
  const [address, setAdress] = useState('');
  const [isClicked, setIsClicked] = useState(false);

  const handleType = (e) => {
    setIsClicked(true);
    setAdress(e.target.value);
  }

  const handlePlaceMark = (e) => {
    setIsClicked(false);
    setAdress(e.target.value);
  }

  const transformCoords = async (coords) => {
    const response =
      await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=a4627984-d4ae-4e59-a89b-7c1c4d5cf56d&format=json&geocode=${coords[1].toFixed(6)},${coords[0].toFixed(6)}`);

    const json = await response.json();
    let data = json.response.GeoObjectCollection.featureMember[0].GeoObject.
      metaDataProperty.GeocoderMetaData.Address.formatted;
    const dataSliced = data.split(' ');
    const dateSlice = dataSliced.slice(1);
    data = dateSlice.join(' ');
    setAdress(data);
  }

  const handleClick = map => {
    map.events.add('click', async (e) => {
      const coords = e.get('coords');
      const myGeoObject = new ymaps.GeoObject({
        geometry: {
          type: 'Point', // тип геометрии - точка
          coordinates: coords, // координаты точки
        },
      });
      setIsClicked(true);
      props.setCoords(coords);
      map.geoObjects.removeAll();
      map.geoObjects.add(myGeoObject);
      await transformCoords(coords);
    });
  }

  useEffect(() => {
    ymaps.ready().then(() => {
      const myMap = new ymaps.Map('ymaps', {
        center: [props.latitude ?? 55.796931, props.longitude ?? 37.537847],
        zoom: 14,
        controls: ['zoomControl', 'fullscreenControl']
      });
      setYMap(myMap);

      const suggestView = new ymaps.SuggestView(
        'address', // ID input'а
        {
          results: 3, // Максимальное количество показываемых подсказок.
        });

      suggestView.events.add('select', ({ originalEvent }) => {
        setIsClicked(false);
        setAdress(originalEvent.item.value);
      });

      if (props.isClickable) {
        handleClick(myMap);
      } else {
        const myGeoObject = new ymaps.GeoObject({
          geometry: {
            type: 'Point', // тип геометрии - точка
            coordinates: [props.latitude, props.longitude], // координаты точки
          },
        });
        myMap.geoObjects.add(myGeoObject);
        transformCoords([props.latitude, props.longitude]);
      }
    });
  }, []);

  useEffect(() => {
    if (!isClicked)
    ymaps.ready().then(() => {
      ymaps?.geocode(address, {
        results: 1
      }).then(res => {
        // Выбираем первый результат геокодирования.
        yMap?.geoObjects.removeAll();
        const firstGeoObject = res.geoObjects.get(0);
        // Координаты геообъекта.
        const coords = firstGeoObject.geometry.getCoordinates();
        // Область видимости геообъекта.
        const bounds = firstGeoObject.properties.get('boundedBy');

        props.setCoords(coords);
        // Добавляем первый найденный геообъект на карту.
        yMap.geoObjects.add(firstGeoObject);
        // Масштабируем карту на область видимости геообъекта.
        yMap.setBounds(bounds, {
          // Проверяем наличие тайлов на данном масштабе.
          checkZoomRange: true
        });
      });
    });
  }, [address, isClicked])

  return (
    <div className='ymaps__container'>
      <FormItem top='Адрес' width={500}>
        <Input type='text' title='Адрес' label='Название события' id="address" value={address} onInput={(e) => handleType(e)} onBlur={(e) => handlePlaceMark(e)} style={{width: '500px'}}/>
      </FormItem>
      <div id="ymaps" />
    </div>

  )
};

export default Map;