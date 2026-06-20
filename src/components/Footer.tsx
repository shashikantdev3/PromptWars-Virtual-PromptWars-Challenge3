/** Site footer with methodology note and privacy assurance. */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>
          Estimates use transparent, documented emission factors (UK
          DESNZ/DEFRA, US EPA, IEA, and Our World in Data) and are intended for
          personal awareness, not certified reporting.
        </p>
        <p>
          🔒 Your data never leaves your device — everything is stored locally
          in your browser. CarbonWise is open source under the MIT license.
        </p>
      </div>
    </footer>
  );
}
