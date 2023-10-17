interface IImportIdentityProps {
  importIdentity: () => Promise<void>;
}

export const ImportIdentity = ({ importIdentity }: IImportIdentityProps): JSX.Element => (
  <div>
    <h2>Import identity</h2>

    <div>
      <label htmlFor="trapdoor">Trapdoor</label>

      <br />

      <input id="trapdoor" placeholder="Enter trapdoor" />
    </div>

    <br />

    <div>
      <label htmlFor="nullifier">Nullifier</label>

      <br />

      <input id="nullifier" placeholder="Enter nullifier" />
    </div>

    <br />

    <button
      data-testid="import-identity"
      type="button"
      onClick={() => {
        importIdentity();
      }}
    >
      Import
    </button>
  </div>
);
