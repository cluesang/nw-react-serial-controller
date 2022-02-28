
import React, { useEffect, useState } from 'react';
import {
      Button
    , Modal
    , ModalBody
    , ModalHeader
    , ModalFooter
} from 'reactstrap';
import { iUserPrompt } from '../controllers/IPOCReaderController';

interface iCalibrationModal {
    prompt?: iUserPrompt;
    open: boolean;
    onAccept: ()=>void;
    onCancel: ()=>void;
}

const CalibrationModal = ({ prompt, open = false, onAccept, onCancel }: iCalibrationModal) => {
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);

    useEffect(() => setModal(open), [open]);

    const handleNext = () => {
        toggle();
        if (prompt) prompt.acceptAction();
        onAccept();
    }

    const handleCancel = () => {
        toggle();
        if (prompt) prompt.cancelAction();
        onCancel();
    }

    return (
        <div>
            {/* <Button 
                color= "primary" 
                onClick = { toggle } 
                disable={!prompt}
            > 
            Calibrate 
            </Button> */}
            < Modal isOpen = { modal } toggle = { toggle } backdrop={"static"}>
                <ModalHeader toggle={ toggle }> Calibartion </ModalHeader>
                < ModalBody >
                    { (prompt)?prompt.dialog:false }
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