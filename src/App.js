import logo from './logo.svg';
import './App.css';
import AppendHead from 'react-append-head';
import Page from './page.js'

function App() {
  return (
    <div className="App">
      <AppendHead>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
            href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400&family=Roboto:wght@200;300;400;500;600;800&display=swap"
            rel="stylesheet"
        />
        <link
            rel="stylesheet"
            href="https://unpkg.com/@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.css"
        />
        <script
            type="module"
            src="https://unpkg.com/@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.esm.js"
        ></script>
        <script
            type="module"
            src="app.js"
        ></script>
      </AppendHead>
      <body>
        <rux-tabs id="tabs" class="hydrated">
          <rux-tab id="Commands-Tab" class="hydrated" role="tab">
            Commands
          </rux-tab>
          <rux-tab id="Vignettes-Tab" class="hydrated" role="tab">
            Vignettes
          </rux-tab>
          <rux-tab id="Network-Tab" class="hydrated" role="tab">
            Network
          </rux-tab>
        </rux-tabs>
        <Page></Page>
    </body>
    </div>
  );
}

export default App;
