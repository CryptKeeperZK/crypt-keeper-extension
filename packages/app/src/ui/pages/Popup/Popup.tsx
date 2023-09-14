import { Navigate, RouteObject, useRoutes } from "react-router-dom";

import { Paths } from "@src/constants";
import ConfirmRequestModal from "@src/ui/components/ConfirmRequestModal";
import AddVerifiableCredential from "@src/ui/pages/AddVerifiableCredential";
import ConnectIdentity from "@src/ui/pages/ConnectIdentity";
import CreateIdentity from "@src/ui/pages/CreateIdentity";
import DownloadBackup from "@src/ui/pages/DownloadBackup";
import GenerateMnemonic from "@src/ui/pages/GenerateMnemonic";
import GroupMerkleProof from "@src/ui/pages/GroupMerkleProof";
import Home from "@src/ui/pages/Home";
import Identity from "@src/ui/pages/Identity";
import JoinGroup from "@src/ui/pages/JoinGroup";
import Login from "@src/ui/pages/Login";
import Onboarding from "@src/ui/pages/Onboarding";
import OnboardingBackup from "@src/ui/pages/OnboardingBackup";
import Recover from "@src/ui/pages/Recover";
import ResetPassword from "@src/ui/pages/ResetPassword";
import RevealIdentityCommitment from "@src/ui/pages/RevealIdentityCommitment";
import RevealMnemonic from "@src/ui/pages/RevealMnemonic";
import Settings from "@src/ui/pages/Settings";
import UploadBackup from "@src/ui/pages/UploadBackup";

import "../../styles.scss";

import { usePopup } from "./usePopup";

const routeConfig: RouteObject[] = [
  { path: Paths.HOME, element: <Home /> },
  { path: Paths.IDENTITY, element: <Identity /> },
  { path: Paths.CREATE_IDENTITY, element: <CreateIdentity /> },
  { path: Paths.REVEAL_IDENTITY_COMMITMENT, element: <RevealIdentityCommitment /> },
  { path: Paths.LOGIN, element: <Login /> },
  { path: Paths.ONBOARDING, element: <Onboarding /> },
  { path: Paths.ONBOARDING_BACKUP, element: <OnboardingBackup /> },
  { path: Paths.REQUESTS, element: <ConfirmRequestModal /> },
  { path: Paths.SETTINGS, element: <Settings /> },
  { path: Paths.DOWNLOAD_BACKUP, element: <DownloadBackup /> },
  { path: Paths.UPLOAD_BACKUP, element: <UploadBackup /> },
  { path: Paths.GENERATE_MNEMONIC, element: <GenerateMnemonic /> },
  { path: Paths.REVEAL_MNEMONIC, element: <RevealMnemonic /> },
  { path: Paths.CONNECT_IDENTITY, element: <ConnectIdentity /> },
  { path: Paths.RECOVER, element: <Recover /> },
  { path: Paths.RESET_PASSWORD, element: <ResetPassword /> },
  { path: Paths.ADD_VERIFIABLE_CREDENTIAL, element: <AddVerifiableCredential /> },
  { path: Paths.JOIN_GROUP, element: <JoinGroup /> },
  { path: Paths.GROUP_MERKLE_PROOF, element: <GroupMerkleProof /> },
  {
    path: "*",
    element: <Navigate to={Paths.HOME} />,
  },
];

const Popup = (): JSX.Element | null => {
  const routes = useRoutes(routeConfig);
  const { isLoading } = usePopup();

  if (isLoading) {
    return null;
  }

  return <div className="popup">{routes}</div>;
};

export default Popup;
