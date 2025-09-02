import {ClaimedSignature, StrokeStyle} from '@/types/signature';

export const downloadSignatureByPNG = (signature: ClaimedSignature) => {
  const height = signature.include_numbers ? 260 : 200;
  const canvas = document.createElement('canvas');
  canvas.width = 1300;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(2, 2);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 650, height);
  ctx.lineWidth = signature.stroke_config.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (signature.stroke_config.style === 'solid') {
    ctx.strokeStyle = signature.stroke_config.color;
  } else if (signature.stroke_config.style === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, 650, 0);
    gradient.addColorStop(0, signature.stroke_config.gradientStart);
    gradient.addColorStop(1, signature.stroke_config.gradientEnd);
    ctx.strokeStyle = gradient;
  }

  const path = new Path2D(signature.signature_path);
  ctx.stroke(path);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${signature.name}-signature.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
};

export const downloadSVG = (signature: ClaimedSignature) => {
  if (!signature.signature_path || !signature.name) return;

  const height = signature.include_numbers ? 260 : 200;
  const gradients =
    signature.stroke_config.style === StrokeStyle.GRADIENT
      ? `<linearGradient id='pathGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
           <stop offset='0%' style='stop-color:${signature.stroke_config.gradientStart};stop-opacity:1' />
           <stop offset='100%' style='stop-color:${signature.stroke_config.gradientEnd};stop-opacity:1' />
         </linearGradient>`
      : "";
  const strokeColor =
    signature.stroke_config.style === StrokeStyle.SOLID
      ? signature.stroke_config.color
      : 'url(#pathGradient)';

  const svgContent = `<svg width='650' height='${height}' xmlns='http://www.w3.org/2000/svg'>
          <defs>${gradients}</defs>
          <path d='${signature.signature_path}' stroke='${strokeColor}' stroke-width='${signature.stroke_config.width}' fill='none' stroke-linecap='round' stroke-linejoin='round'/>
        </svg>`;

  const blob = new Blob([svgContent], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${signature.name.toLowerCase()}-signature.svg`;
  a.click();
  URL.revokeObjectURL(url);
};