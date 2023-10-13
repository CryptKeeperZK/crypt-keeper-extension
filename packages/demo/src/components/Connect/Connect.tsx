interface IConnectProps {
  title: string;
  isChangeIdentity: boolean;
  connect: (isChangeIdentity: boolean) => void;
}

export const Connect = ({ title, isChangeIdentity, connect }: IConnectProps): JSX.Element => (
  <div>
    <h2>{title}</h2>

    <button
      type="button"
      onClick={() => {
        connect(isChangeIdentity);
      }}
    >
      Connect Identity
    </button>
  </div>
);
