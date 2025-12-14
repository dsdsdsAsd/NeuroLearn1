import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ВАШ ID СЧЕТЧИКА
const YM_COUNTER_ID = 105825624;

// Функция для инициализации Яндекс.Метрики
const initMetrika = () => {
  // Проверяем, был ли уже инициализирован скрипт
  if (window.ym) {
    return;
  }

  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  window.ym(YM_COUNTER_ID, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true
  });
};

export const YandexMetrika = () => {
  const location = useLocation();

  // Инициализируем Метрику при первом рендере
  useEffect(() => {
    initMetrika();
  }, []);

  // Отслеживаем смену URL и отправляем данные в Метрику
  useEffect(() => {
    // Ждем, пока `ym` станет доступна
    if (window.ym) {
      // Отправляем 'hit' при смене страницы
      window.ym(YM_COUNTER_ID, 'hit', location.pathname + location.search);
    }
  }, [location]);

  return null; // Компонент ничего не рендерит
};
