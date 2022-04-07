import React from 'react';
import { Modal } from 'antd';

const ModelTempLate = (props) => {
  const { title, visible, closable } = props;
  return(
    <>
      <Modal
        title={title}
        visible={visible}
        closable={closable || false}
      >

      </Modal>
    </>
  )
};

export default ModelTempLate;
