import { describe } from 'mocha';
import Zipper from './Zipper';
import {
  IInputFile,
  TailItemStatus,
  ITailItem,
  IZip
} from './types';
const zipper = new Zipper();
describe('Testing Zipper',() => {
  const inputs1: IInputFile[] = [
    {
      filename: 'google-image.png',
      url: 'https://www.google.it/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
    },
    {
      filename: 'war.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/25/LST-1-1.jpg'
    },
    {
      filename: 'orso.mp4',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    {
      filename: 'maltempo.mp4',
      url: 'https://secure-ds.serving-sys.com/BurstingRes/Site-65294/Type-16/7e84d740-9e97-47f4-96e1-ec7ecf8d5472.mp4'
    },
  ]
  const inputs2: IInputFile[] = [
    {
      filename: 'google-image.png',
      url: 'https://www.google.it/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
    }
  ]
  zipper.insert('zip1.zip', inputs1);
  zipper.insert('zip2.zip', inputs2);
  zipper.insert('zip3.zip', inputs1);
  zipper.insert('zip4.zip', inputs2);
  setInterval(() => {
    console.log('trigger')
    zipper.trigger();
  }, 1000)
})
