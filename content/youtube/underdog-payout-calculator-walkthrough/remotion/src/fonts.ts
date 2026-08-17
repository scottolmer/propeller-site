import {familjenGroteskDataUrl, ibmPlexMonoDataUrl, ibmPlexSansDataUrl} from "./font-data.generated";

export const displayFont = "Propeller Display";
export const sansFont = "Propeller Sans";
export const monoFont = "Propeller Mono";

export const fontCss = `
  @font-face {
    font-family: "${displayFont}";
    src: url("${familjenGroteskDataUrl}") format("woff2");
    font-style: normal;
    font-weight: 500 700;
    font-display: block;
  }
  @font-face {
    font-family: "${sansFont}";
    src: url("${ibmPlexSansDataUrl}") format("woff2");
    font-style: normal;
    font-weight: 400 600;
    font-display: block;
  }
  @font-face {
    font-family: "${monoFont}";
    src: url("${ibmPlexMonoDataUrl}") format("woff2");
    font-style: normal;
    font-weight: 500;
    font-display: block;
  }
`;
