// Never use @iconify/react inside this file.
import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 180,
  height: 180
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(

    <div data-editor-id="app/apple-icon.tsx:15:7"
    style={{
      width: '100%',
      height: '100%',
      display: 'flex'
    }}>

        <img data-editor-id="app/apple-icon.tsx:22:9"
      src="https://storage.googleapis.com/cosmic-project-image-assets/images/c14a2256-a303-4bac-a5fb-bb9e62cd4f1a/favicon.png"
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