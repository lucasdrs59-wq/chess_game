export default function PolicyPanel() {
  return (
    <section className="content-page" aria-labelledby="policy-title">
      <p className="eyebrow">Contrat produit</p>
      <h1 id="policy-title">Règles et confidentialité</h1>
      <p className="lead">Le fair-play n'est pas une option : il structure le produit.</p>
      <ul className="rule-list">
        <li><strong>Post-partie uniquement.</strong> Une partie doit être terminée avant import.</li>
        <li><strong>Aucune position arbitraire.</strong> Pas de moteur de « meilleur coup » à la demande.</li>
        <li><strong>Aucune surveillance.</strong> Pas de capture, overlay ou lecture de fenêtre.</li>
        <li><strong>Données locales.</strong> L'historique reste dans le navigateur de l'utilisateur.</li>
      </ul>
    </section>
  );
}
