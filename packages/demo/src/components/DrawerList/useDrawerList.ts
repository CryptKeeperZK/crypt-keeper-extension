import { useState, type MouseEvent as ReactMouseEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { replaceUrlParams } from "@src/utils";

interface featureList {
  title: string;
  features: {
    label: string;
    path?: string;
  }[];
}

interface IUserDrawerListOutput {
  isShowGetStarted: boolean;
  isShowIdentityManagement: boolean;
  isShowZkpManagement: boolean;
  getStartedData: featureList;
  identityManagementData: featureList;
  zkpManagementData: featureList;
  goToPage: (path?: string) => void;
  goToConnectPage: (isChangeIdentity: string) => void;
  handleGetStartedList: (event: ReactMouseEvent) => void;
  handleIdentityManagementList: (event: ReactMouseEvent) => void;
  handleZkpManagementList: (event: ReactMouseEvent) => void;
}

export const useDrawerList = (): IUserDrawerListOutput => {
  const navigate = useNavigate();

  const [isShowGetStarted, setIsShowGetStarted] = useState(false);
  const [isShowIdentityManagement, setIsShowIdentityManagement] = useState(false);
  const [isShowZkpManagement, setIsShowZkpManagement] = useState(false);

  const getStartedData: featureList = {
    title: "Get Started",
    features: [{ label: "Connect to CryptKeeper", path: Paths.CONNECT }],
  };

  const identityManagementData: featureList = {
    title: "Identity Management",
    features: [
      { label: "Get Identity Metadata", path: Paths.GET_IDENTITY_METADATA },
      { label: "Import Identity", path: Paths.IMPORT_IDENTITY },
      { label: "Reveal Identity Commitment", path: Paths.REVEAL_IDENTITY_COMMITMENT },
    ],
  };

  const zkpManagementData: featureList = {
    title: "Zero-Knowledge Proofs Management",
    features: [
      { label: "Semaphore", path: Paths.SEMAPHORE },
      { label: "Rate-Limiting Nullifier", path: Paths.RLN },
      { label: "Bandada", path: Paths.BANDADA },
    ],
  };

  const goToPage = useCallback(
    (path?: string) => {
      if (path) {
        navigate(path);
      }
    },
    [navigate],
  );

  const goToConnectPage = useCallback(
    (isChangeIdentityParam: string) => {
      navigate(replaceUrlParams(Paths.CONNECT, { isChangeIdentityParam }));
    },
    [navigate],
  );

  const handleGetStartedList = useCallback(
    (event: ReactMouseEvent) => {
      event.stopPropagation();
      setIsShowGetStarted((isShow) => !isShow);
    },
    [setIsShowGetStarted],
  );

  const handleIdentityManagementList = useCallback(
    (event: ReactMouseEvent) => {
      event.stopPropagation();
      setIsShowIdentityManagement((isShow) => !isShow);
    },
    [setIsShowIdentityManagement],
  );

  const handleZkpManagementList = useCallback(
    (event: ReactMouseEvent) => {
      event.stopPropagation();
      setIsShowZkpManagement((isShow) => !isShow);
    },
    [setIsShowZkpManagement],
  );

  return {
    isShowGetStarted,
    isShowIdentityManagement,
    isShowZkpManagement,
    getStartedData,
    identityManagementData,
    zkpManagementData,
    goToPage,
    goToConnectPage,
    handleGetStartedList,
    handleIdentityManagementList,
    handleZkpManagementList,
  };
};
