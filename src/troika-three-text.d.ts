declare module 'troika-three-text' {
  import * as T from 'troika-three-text';
  export class Text extends THREE.Object3D<THREE.Event> {
    new(): T.Text;
    [propName: string]: any;
  }
}
