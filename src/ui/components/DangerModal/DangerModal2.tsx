import { MouseEvent as ReactMouseEvent, MouseEventHandler } from "react";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Checkbox } from "@src/ui/components/Checkbox";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";

import "./danger-modal.scss";

export interface DangerModalProps {
  accept: MouseEventHandler;
  reject: () => void;
}

export const DangerModal2 = ({ accept, reject }: DangerModalProps): JSX.Element => {
  return (
    <FullModal className="confirm-modal" data-testid="approval-modal" onClose={reject}>
      <FullModalHeader>Danger Action</FullModalHeader>

      <FullModalContent className="flex flex-col items-center">
        <div className="font-bold mt-4">Are you absolutly sure?</div>
      </FullModalContent>

      <FullModalFooter>
        <Button buttonType={ButtonType.SECONDARY} onClick={reject}>
          No
        </Button>

        <Button className="ml-2" onClick={accept}>
          Yes
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};
