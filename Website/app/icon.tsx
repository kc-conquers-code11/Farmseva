// Never use @iconify/react inside this file.
import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(

    <div data-editor-id="app/icon.tsx:13:7"
    style={{
      width: '100%',
      height: '100%',
      display: 'flex'
    }}>

        <img data-editor-id="app/icon.tsx:20:9"
      src="https://storage.googleapis.com/cosmic-project-image-assets/images/c14a2256-a303-4bac-a5fb-bb9e62cd4f1a/favicon.png" // Replace with your public image URL
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain'
      }} />

      </div>,

    {
      ...size
    }
  );
}