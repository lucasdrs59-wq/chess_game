export default function Home() {
  return (
    <section className="home" aria-labelledby="home-title">
      <p className="eyebrow">Coach personnel post-partie</p>
      <h1 id="home-title">Transformez vos erreurs en séances utiles.</h1>
      <p className="lead">
        Importez vos parties publiques Chess.com, repérez les moments pédagogiques et
        entraînez les thèmes qui reviennent — sans compte, sans serveur et sans analyse live.
      </p>
      <div className="feature-grid">
        <article>
          <span>01</span>
          <h2>Importer</h2>
          <p>Récupération des parties terminées depuis l'API publique Chess.com.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Comprendre</h2>
          <p>Heuristiques explicables pour identifier des thèmes de progression.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Répéter</h2>
          <p>Entraînement ciblé et rappels espacés stockés dans votre navigateur.</p>
        </article>
      </div>
    </section>
  );
}
