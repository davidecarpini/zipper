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
  const inputs: IInputFile[] = [
    {
      filename: 'google-image.png',
      url: 'https://www.google.it/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
    },
    {
      filename: 'war.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/25/LST-1-1.jpg'
    }
  ]
  zipper.insert('zip1.zip', inputs);
  zipper.trigger();
})
