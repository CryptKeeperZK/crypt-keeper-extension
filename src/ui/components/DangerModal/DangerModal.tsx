import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { MouseEvent as ReactMouseEvent, MouseEventHandler } from "react";

import { ButtonType, Button } from "@src/ui/components/Button";
import { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#000000",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export interface BasicModalProps {
  openModal: boolean;
  reject: (e: ReactMouseEvent) => void;
  accept: MouseEventHandler;
}

export const DangerModal = ({ openModal, reject, accept }: BasicModalProps): JSX.Element => (
  <div>
    <Modal
      aria-describedby="modal-modal-description"
      aria-labelledby="modal-modal-title"
      data-testid="danger-modal"
      open={openModal}
      onClose={reject}
    >
      <Box className="modal__wrapper" sx={style}>
        <FullModalHeader>Danger Action</FullModalHeader>

        <FullModalContent className="flex flex-col items-center">
          <div className="font-bold mt-4">Are you absolutly sure?</div>
        </FullModalContent>

        <FullModalFooter>
          <Button buttonType={ButtonType.SECONDARY} data-testid="danger-modal-reject" onClick={reject}>
            No
          </Button>

          <Button className="ml-2 " data-testid="danger-modal-accept" onClick={accept}>
            Yes
          </Button>
        </FullModalFooter>
      </Box>
    </Modal>
  </div>
);
