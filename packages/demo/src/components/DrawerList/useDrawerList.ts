import { useState, type MouseEvent, useCallback } from "react";

interface featureList {
  title: string;
  features: { label: string }[];
}

interface IUserDocsDrawerData {}

interface IUserDrawerListOutput {
  isShowGetStarted: boolean;
  isShowIdentityManagement: boolean;
  isShowZkpManagement: boolean;
  getStartedData: featureList;
  identityManagementData: featureList;
  zkpManagementData: featureList;
  handleGetStartedList: (event: MouseEvent) => void;
  handleIdentityManagementList: (event: MouseEvent) => void;
  handleZkpManagementList: (event: MouseEvent) => void;
}

export const useDrawerList = (): IUserDrawerListOutput => {
  const [isShowGetStarted, setIsShowGetStarted] = useState(false);
  const [isShowIdentityManagement, setIsShowIdentityManagement] = useState(false);
  const [isShowZkpManagement, setIsShowZkpManagement] = useState(false);

  const getStartedData: featureList = {
    title: "Get Started",
    features: [{ label: "Connect Identity" }],
  };

  const identityManagementData: featureList = {
    title: "Identity Management",
    features: [
      { label: "Get Identity Metadata" },
      { label: "Import Identity" },
      { label: "Reveal Identity Commitment" },
    ],
  };

  const zkpManagementData: featureList = {
    title: "Zero-Knowledge Proofs Management",
    features: [{ label: "Semaphore" }, { label: "Rate-Limiting Nullifier" }, { label: "Bandada" }],
  };

  const handleGetStartedList = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      setIsShowGetStarted((isShow) => !isShow);
    },
    [setIsShowGetStarted],
  );

  const handleIdentityManagementList = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      setIsShowIdentityManagement((isShow) => !isShow);
    },
    [setIsShowIdentityManagement],
  );

  const handleZkpManagementList = useCallback(
    (event: MouseEvent) => {
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
    handleGetStartedList,
    handleIdentityManagementList,
    handleZkpManagementList,
  };
};
