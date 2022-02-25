
import React, { useEffect, useState } from 'react';
import {
      Button
    , Modal
    , ModalBody
    , ModalHeader
    , ModalFooter
} from 'reactstrap';

interface iCalibrationModal {
    prompt: string;
    onNext: () => void;
    onCancel: () => void;
    open: boolean;
}

const CalibrationModal = ({ prompt, onNext, onCancel, open = false }: iCalibrationModal) => {
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);

    useEffect(() => setModal(open), [open]);

    const handleNext = () => {
        toggle();
        onNext();
    }

    const handleCancel = () => {
        toggle();
        onCancel();
    }

    return (
        <div>
            <Button color= "primary" onClick = { toggle } > Calibrate </Button>
            < Modal isOpen = { modal } toggle = { toggle } >
                <ModalHeader toggle={ toggle }> Calibartion </ModalHeader>
                < ModalBody >
                    { prompt }
                </ModalBody>
                < ModalFooter >
                    <Button color="primary" onClick = { handleNext } > Next </Button>{' '}
                    < Button color = "secondary" onClick = { handleCancel } > Cancel </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
  }

  export default CalibrationModal