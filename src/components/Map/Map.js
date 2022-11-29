import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Input, FormItem, Group, Div, Spacing } from '@vkontakte/vkui';

import './Map.scss';

const Map = ({ address, setAddress, setCoords, latitude, longitude, isClickable, showAddress = true }) => {
  const user = useSelector(state => state.user.value);
  const [yMap, setYMap] = useState(null);
  const [isClicked, setIsClicked] = useState(false);

  const handleType = (e) => {
    setIsClicked(true);
    setAddress(e.target.value);
  };

  const handlePlaceMark = (e) => {
    setIsClicked(false);
    setAddress(e.target.value);
  };

  const transformCoords = async (coords) => {
    const response =
      await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=a4627984-d4ae-4e59-a89b-7c1c4d5cf56d&format=json&geocode=${coords[1].toFixed(6)},${coords[0].toFixed(6)}`);

    const json = await response.json();
    let data = json.response.GeoObjectCollection.featureMember[0].GeoObject
      .metaDataProperty.GeocoderMetaData.Address.formatted;
    const dataSliced = data.split(' ');
    const dateSlice = dataSliced.slice(1);
    data = dateSlice.join(' ');
    setAddress(data);
  };

  const handleClick = map => {
    map.events.add('click', async (e) => {
      const coords = e.get('coords');
      const myGeoObject = new ymaps.GeoObject({
        geometry: {
          type: 'Point', // тип геометрии - точка
          coordinates: coords // координаты точки
        }
      });
      setIsClicked(true);
      setCoords(coords);
      map.geoObjects.removeAll();
      map.geoObjects.add(myGeoObject);
      await transformCoords(coords);
    });
  };

  useEffect(() => {
    ymaps.ready().then(() => {
      const myMap = new ymaps.Map('ymaps', {
        center: [latitude ?? 55.796931, longitude ?? 37.537847],
        zoom: 14,
        controls: ['zoomControl', 'fullscreenControl'],
      }, {
        autoFitToViewport: 'always'
      });
      setYMap(myMap);

      const suggestView = new ymaps.SuggestView(
        'address', // ID input'а
        {
          results: 3 // Максимальное количество показываемых подсказок.
        });

      suggestView.events.add('select', ({ originalEvent }) => {
        setIsClicked(false);
        setAddress(originalEvent.item.value);
      });

      if (isClickable) {
        handleClick(myMap);
      }
    });
  }, []);

  useEffect(async () => {
    if (!yMap || !latitude || !longitude) return;
    const myGeoObject = new ymaps.GeoObject({
      geometry: {
        type: 'Point', // тип геометрии - точка
        coordinates: [latitude ?? 55.796931, longitude ?? 37.537847], // координаты точки
      }
    });
    yMap.geoObjects.add(myGeoObject);
    yMap.setCenter([latitude, longitude]);
    await transformCoords([latitude ?? 55.796931, longitude ?? 37.537847]);
  }, [latitude, longitude, yMap])

  useEffect(() => {
    if (!isClicked && isClickable) {
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

          setCoords(coords);
          // Добавляем первый найденный геообъект на карту.
          yMap.geoObjects.add(firstGeoObject);
          // Масштабируем карту на область видимости геообъекта.
          yMap.setBounds(bounds, {
            // Проверяем наличие тайлов на данном масштабе.
            checkZoomRange: true
          });
        });
      });
    }
  }, [address, isClicked]);

  return (
    <Group>
      <Div className='ymaps__container'>
        {
          showAddress &&
          <FormItem top='Место' className='ymaps__input'>
            <Input type='text' title='Адрес' maxLength={512} label='Название события' id='address' value={address} onInput={(e) => handleType(e)} onBlur={(e) => handlePlaceMark(e)} disabled={!isClickable} />
          </FormItem>

        }

        {
          showAddress &&
          <Spacing size={16} />
        }

        <div id='ymaps' className={user.platform === 'web' ? 'ymaps-web' : 'ymaps-mobile'} />
      </Div>
    </Group>
  );
};

export default Map;
