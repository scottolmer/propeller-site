import {loadFont} from "@remotion/fonts";
import {staticFile} from "remotion";

void loadFont({family: "Familjen Grotesk", url: staticFile("assets/familjen-grotesk.woff2"), weight: "500 700", format: "woff2"});
void loadFont({family: "IBM Plex Sans", url: staticFile("assets/ibm-plex-sans.woff2"), weight: "400 600", format: "woff2"});
void loadFont({family: "IBM Plex Mono", url: staticFile("assets/ibm-plex-mono-500.woff2"), weight: "500", format: "woff2"});
