import "@/styles/globals.css";
import "@/styles/PagePrincipale.css";
import "@/styles/ProjetPro.css";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <div className={outfit.className}>
      <Component {...pageProps} />
    </div>
  );
}