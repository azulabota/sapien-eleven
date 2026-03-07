export function WordmarkSvg({ className, height = 14 }: { className?: string; height?: number }) {
  // Inline SVG renders sharper than <img src=".svg"> on some mobile browsers.
  // viewBox is from the provided export.
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 679.74 65"
      role="img"
      aria-label="Sapien Eleven"
      style={{ height, width: 'auto', shapeRendering: 'geometricPrecision' }}
    >
      <path
        fill="#fcfcfc"
        d="m0,57.26l4.64-10.83c4.64,3.87,11.61,6.96,18.57,6.96,8.51,0,11.61-3.1,11.61-6.96,0-11.61-34.05-3.87-34.05-27.08C.77,8.51,9.29,0,25.54,0c6.96,0,14.7,1.55,20.12,5.42l-4.64,10.83c-5.42-3.1-10.83-4.64-15.48-4.64-7.74,0-10.83,3.1-10.83,6.96,0,11.61,33.27,3.87,33.27,27.08,0,10.06-8.51,19.35-24.76,19.35-9.29,0-17.8-3.09-23.22-7.74Z"
      />
      <path
        fill="#fcfcfc"
        d="m70.11,53.48l-3.7,11.48h-13.58L78.75,0h13.17l25.92,64.96h-13.99l-18.51-50.56-8.23,20.98-5.35,14.4-1.65,3.7Z"
      />
      <path
        fill="#fcfcfc"
        d="m177.36,23.64c0,13.79-9.85,23.64-25.61,23.64h-1.97v-11.82h1.97c7.88,0,11.82-5.91,11.82-11.82,0-7.88-3.94-11.82-11.82-11.82h-11.82v53.18h-13.79V0h25.61c15.76,0,25.61,9.85,25.61,23.64Z"
      />
      <path fill="#fcfcfc" d="m185.88,0h13v65h-13V0Z" />
      <path
        fill="#fcfcfc"
        d="m207.56,11.38V0h45.5v11.38h-45.5Zm45.5,40.63v13h-45.5V26h40.63v11.38h-27.63v14.62h32.5Z"
      />
      <path
        fill="#fcfcfc"
        d="m317.89,0v65h-11.3l-29.68-39.57v39.57h-14.13V0h11.31l29.68,39.57V0h14.13Z"
      />
      <path
        fill="#fcfcfc"
        d="m357.84,11.38V0h45.5v11.38h-45.5Zm45.5,40.63v13h-45.5V26h40.63v11.38h-27.63v14.62h32.5Z"
      />
      <path fill="#fcfcfc" d="m411.3,0h13.75v52.5h30v12.5h-43.75V0Z" />
      <path
        fill="#fcfcfc"
        d="m456.96,11.38V0h45.5v11.38h-45.5Zm45.5,40.63v13h-45.5V26h40.63v11.38h-27.63v14.62h32.5Z"
      />
      <path
        fill="#fcfcfc"
        d="m562.62,0l-25.58,65h-13.85L497.62,0h14.92l18.12,45.82L548.77,0h13.85Z"
      />
      <path
        fill="#fcfcfc"
        d="m569.41,11.38V0h45.5v11.38h-45.5Zm45.5,40.63v13h-45.5V26h40.63v11.38h-27.63v14.62h32.5Z"
      />
      <path
        fill="#fcfcfc"
        d="m679.74,0v65h-11.3l-29.68-39.57v39.57h-14.13V0h11.3l29.68,39.57V0h14.13Z"
      />
    </svg>
  );
}
