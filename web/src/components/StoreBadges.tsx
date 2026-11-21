import Icon from "@/components/Icon";
import { appLinks } from "@/lib/site";

const stores = [
  { id: "app-store", name: "App Store", lead: "Download on the", href: appLinks.appStore },
  { id: "google-play", name: "Google Play", lead: "Get it on", href: appLinks.playStore },
] as const;

/**
 * Our own "get the app" buttons, designed to sit in the EdeBooking footer.
 * A store without a link yet (see appLinks in lib/site.ts) shows a "Soon" tag and goes nowhere.
 */
export default function StoreBadges() {
  return (
    <div className="app-buttons">
      {stores.map((store) => {
        const inner = (
          <>
            <span className="app-button-icon"><Icon name="phone" /></span>
            <span className="app-button-text">
              <small>{store.lead}</small>
              <strong>{store.name}</strong>
            </span>
            {store.href ? <span className="app-button-arrow" aria-hidden="true">↗</span> : <span className="app-button-soon">Soon</span>}
          </>
        );

        return store.href ? (
          <a key={store.id} className="app-button" href={store.href} target="_blank" rel="noopener noreferrer" aria-label={`${store.lead} ${store.name}`}>
            {inner}
          </a>
        ) : (
          <span key={store.id} className="app-button app-button-pending" role="img" aria-label={`${store.name}, coming soon`}>
            {inner}
          </span>
        );
      })}
    </div>
  );
}
